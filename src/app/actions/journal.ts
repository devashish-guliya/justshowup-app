'use server';

import { createClient } from '@/lib/supabase/server';
import { db, journalEntries, users, userWeapons } from '@/db';
import { eq, and } from 'drizzle-orm';
import {
  getCurrentDayNumber,
  getWeekNumber,
  getDayInWeek,
  getQuarterNumber,
  getWeekInQuarter,
  getJourneyStartDate,
  getTodayDateString,
  FORGE_FILL,
} from '@/lib/calendar';
import { assignWeaponForWeek, getWeaponAssetUrl } from '@/lib/weapon-assignment';
import { countWords } from '@/lib/word-count';
import { revalidatePath } from 'next/cache';

export type JournalSubmitResult = {
  success: boolean;
  wordCount: number;
  isComplete: boolean;
  message: string;
  forgeAnimation?: string;
  newForgeLevel?: number;
  isFirstEntry?: boolean;
};

/**
 * Submit a journal entry.
 * If this is the user's FIRST entry, it starts their journey (sets journey_start_date).
 */
export async function submitJournalEntry(content: string): Promise<JournalSubmitResult> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error('Unauthorized');
  }

  // Get user profile
  let user = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Count words
  const wordCount = countWords(content);
  const isComplete = wordCount >= 50;

  // Check if this is the user's first entry ever
  const isFirstEntry = !user.journeyStartDate;

  // If first entry, start the journey
  if (isFirstEntry) {
    const journeyStart = getJourneyStartDate(user.timezone);

    await db
      .update(users)
      .set({
        journeyStartDate: journeyStart,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Refresh user data
    user = (await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    }))!;
  }

  // Calculate current position
  const dayNumber = getCurrentDayNumber(user.journeyStartDate, user.timezone);
  const weekNumber = getWeekNumber(dayNumber);
  const entryDate = getTodayDateString(user.timezone);

  // Save journal entry (upsert)
  await db
    .insert(journalEntries)
    .values({
      userId: user.id,
      dayNumber,
      weekNumber,
      entryDate,
      content,
      wordCount,
      isComplete,
    })
    .onConflictDoUpdate({
      target: [journalEntries.userId, journalEntries.dayNumber],
      set: { content, wordCount, isComplete, updatedAt: new Date() },
    });

  // Update forge progress if entry is complete
  let forgeAnimation: string | undefined;
  let newForgeLevel: number | undefined;

  if (isComplete) {
    const weapon = await ensureWeaponExists(user.id, weekNumber);
    const dayInWeek = getDayInWeek(dayNumber);

    // Check if this day slot was already completed
    const completedDays = [...(weapon.completedDays as boolean[])];
    if (!completedDays[dayInWeek - 1]) {
      completedDays[dayInWeek - 1] = true;
      newForgeLevel = completedDays.filter(Boolean).length;

      await db
        .update(userWeapons)
        .set({ completedDays, forgeLevel: newForgeLevel })
        .where(eq(userWeapons.id, weapon.id));

      forgeAnimation = getWeaponAssetUrl(weapon.artifactId, newForgeLevel, 'animation');
    }

    // Update user stats
    await db
      .update(users)
      .set({
        totalEntries: (user.totalEntries || 0) + 1,
        totalWords: (user.totalWords || 0) + wordCount,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  revalidatePath('/journal');

  return {
    success: true,
    wordCount,
    isComplete,
    isFirstEntry,
    message: isComplete
      ? `🔥 Day ${dayNumber} complete! ${FORGE_FILL[newForgeLevel || 0]}% forged!`
      : `Keep writing! ${50 - wordCount} more words needed.`,
    forgeAnimation,
    newForgeLevel,
  };
}

/**
 * Get current dashboard state for the journal page.
 */
export async function getDashboardState() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
  });

  if (!user) return null;

  // Calculate position (might be 0 if journey hasn't started)
  const dayNumber = getCurrentDayNumber(user.journeyStartDate, user.timezone);
  const weekNumber = getWeekNumber(dayNumber);
  const dayInWeek = getDayInWeek(dayNumber);
  const quarterNumber = getQuarterNumber(weekNumber);
  const weekInQuarter = getWeekInQuarter(weekNumber);

  // Get today's entry (if exists)
  const todayEntry = dayNumber > 0
    ? await db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.userId, user.id),
        eq(journalEntries.dayNumber, dayNumber)
      ),
    })
    : null;

  // Get current weapon (if journey has started)
  let weapon = null;
  if (weekNumber > 0) {
    const w = await ensureWeaponExists(user.id, weekNumber);
    weapon = {
      artifactId: w.artifactId,
      name: w.artifactName,
      category: w.category,
      rarity: w.rarity,
      forgeLevel: w.forgeLevel || 0,
      completedDays: w.completedDays as boolean[],
      currentImage: getWeaponAssetUrl(w.artifactId, w.forgeLevel || 0),
    };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      timezone: user.timezone,
      hasStarted: !!user.journeyStartDate,
      totalEntries: user.totalEntries || 0,
      totalWords: user.totalWords || 0,
    },
    position: {
      dayNumber,
      weekNumber,
      dayInWeek,
      quarterNumber,
      weekInQuarter,
    },
    today: todayEntry ? {
      content: todayEntry.content,
      wordCount: todayEntry.wordCount,
      isComplete: todayEntry.isComplete || false,
    } : null,
    weapon,
  };
}

/**
 * Ensure a weapon exists for a given week, creating if needed.
 */
async function ensureWeaponExists(userId: string, weekNumber: number) {
  let weapon = await db.query.userWeapons.findFirst({
    where: and(
      eq(userWeapons.userId, userId),
      eq(userWeapons.weekNumber, weekNumber)
    ),
  });

  if (!weapon) {
    const quarterNumber = getQuarterNumber(weekNumber);
    const weekInQuarter = getWeekInQuarter(weekNumber);
    const assigned = assignWeaponForWeek(userId, weekNumber);

    const [created] = await db
      .insert(userWeapons)
      .values({
        userId,
        weekNumber,
        quarterNumber,
        weekInQuarter,
        artifactId: assigned.artifact_metadata.id,
        artifactName: assigned.artifact_metadata.name,
        category: assigned.artifact_metadata.category,
        rarity: assigned.artifact_metadata.rarity,
        palette: assigned.artifact_metadata.palette,
        shufflePool: assigned.artifact_metadata.shuffle_pool,
        forgeLevel: 0,
        completedDays: [false, false, false, false, false, false, false],
      })
      .returning();

    weapon = created;
  }

  return weapon;
}

/**
 * Get all weapons for the armory view.
 */
export async function getUserWeapons() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return [];

  const weapons = await db.query.userWeapons.findMany({
    where: eq(userWeapons.userId, authUser.id),
    orderBy: (weapons, { asc }) => [asc(weapons.weekNumber)],
  });

  return weapons.map(w => ({
    ...w,
    currentImage: getWeaponAssetUrl(w.artifactId, w.forgeLevel || 0),
    fullImage: getWeaponAssetUrl(w.artifactId, 7),
  }));
}
