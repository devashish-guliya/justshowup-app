'use server';

import { createClient } from '@/lib/supabase/server';
import { db, journalEntries, users, userWeapons } from '@/db';
import { eq, and, lt } from 'drizzle-orm';
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

// =============================================================================
// RATE LIMITER (In-memory, per-user)
// =============================================================================
// Simple sliding window rate limiter
// Note: In production with multiple serverless instances, use Redis instead

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 submissions per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(userId) || [];

  // Remove old timestamps outside the window
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Rate limited
  }

  // Add current timestamp
  validTimestamps.push(now);
  rateLimitMap.set(userId, validTimestamps);

  return true; // Allowed
}

// =============================================================================
// TYPES
// =============================================================================

export type JournalSubmitResult = {
  success: boolean;
  wordCount: number;
  isComplete: boolean;
  message: string;
  forgeAnimation?: string;
  newForgeLevel?: number;
  isFirstEntry?: boolean;
};

// =============================================================================
// SUBMIT JOURNAL ENTRY
// =============================================================================

export async function submitJournalEntry(content: string): Promise<JournalSubmitResult> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error('Unauthorized');
  }

  // Rate limiting check
  if (!checkRateLimit(authUser.id)) {
    return {
      success: false,
      wordCount: 0,
      isComplete: false,
      message: 'Too many submissions. Please wait a moment.',
    };
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

  // Check if entry already exists for this day (to avoid double-counting)
  const existingEntry = await db.query.journalEntries.findFirst({
    where: and(
      eq(journalEntries.userId, user.id),
      eq(journalEntries.dayNumber, dayNumber)
    ),
  });

  const wasAlreadyComplete = existingEntry?.isComplete || false;
  const previousWordCount = existingEntry?.wordCount || 0;

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

    // FIX: Only update stats if this is a NEW completion (not already complete)
    if (!wasAlreadyComplete) {
      await db
        .update(users)
        .set({
          totalEntries: (user.totalEntries || 0) + 1,
          totalWords: (user.totalWords || 0) + wordCount,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    } else {
      // Entry was already complete, just update word diff if any
      const wordDiff = wordCount - previousWordCount;
      if (wordDiff !== 0) {
        await db
          .update(users)
          .set({
            totalWords: (user.totalWords || 0) + wordDiff,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
      }
    }
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

// =============================================================================
// GET DASHBOARD STATE (Optimized with parallel queries)
// =============================================================================

export async function getDashboardState() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
  });

  if (!user) return null;

  // Calculate position (might be 0 if journey hasn't started)
  let dayNumber = getCurrentDayNumber(user.journeyStartDate, user.timezone);

  // FIX: If user hasn't started (day 0), show as Day 1
  if (dayNumber === 0) {
    dayNumber = 1;
  }

  const weekNumber = getWeekNumber(dayNumber);

  // LAZY FINALIZATION: Check if any previous weeks need to be locked
  // Only run if we have previous weeks
  if (weekNumber > 1) {
    await finalizePreviousWeapons(user.id, weekNumber);
  }

  const dayInWeek = getDayInWeek(dayNumber);
  const quarterNumber = getQuarterNumber(weekNumber);
  const weekInQuarter = getWeekInQuarter(weekNumber);

  // OPTIMIZATION: Run queries in parallel
  const [todayEntry, weapon] = await Promise.all([
    // Get today's entry
    dayNumber > 0
      ? db.query.journalEntries.findFirst({
        where: and(
          eq(journalEntries.userId, user.id),
          eq(journalEntries.dayNumber, dayNumber)
        ),
      })
      : Promise.resolve(null),

    // Get current weapon
    weekNumber > 0
      ? ensureWeaponExists(user.id, weekNumber)
      : Promise.resolve(null),
  ]);

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
    weapon: weapon ? {
      artifactId: weapon.artifactId,
      name: weapon.artifactName,
      category: weapon.category,
      rarity: weapon.rarity,
      forgeLevel: weapon.forgeLevel || 0,
      completedDays: weapon.completedDays as boolean[],
      currentImage: getWeaponAssetUrl(weapon.artifactId, weapon.forgeLevel || 0),
    } : null,
  };
}

// =============================================================================
// HELPER: Ensure weapon exists for a week
// =============================================================================

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

// =============================================================================
// HELPER: Finalize previous weeks' weapons
// =============================================================================

async function finalizePreviousWeapons(userId: string, currentWeekNumber: number) {
  // Find all non-finalized weapons from past weeks
  const pendingWeapons = await db.query.userWeapons.findMany({
    where: and(
      eq(userWeapons.userId, userId),
      lt(userWeapons.weekNumber, currentWeekNumber),
      eq(userWeapons.isFinalized, false)
    ),
  });

  if (pendingWeapons.length === 0) return;

  // Process each one (could batch update, but usually just 1)
  for (const w of pendingWeapons) {
    const completedCount = (w.completedDays as boolean[]).filter(Boolean).length;

    await db
      .update(userWeapons)
      .set({
        isFinalized: true,
        finalForgeLevel: completedCount,
        forgeLevel: completedCount,
      })
      .where(eq(userWeapons.id, w.id));
  }
}

// =============================================================================
// GET USER WEAPONS (Armory)
// =============================================================================

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
