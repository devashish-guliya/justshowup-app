import { toZonedTime } from 'date-fns-tz';
import { differenceInDays, startOfDay, format } from 'date-fns';

/**
 * JustShowUp Calendar Logic
 * 
 * Core concept: Everything is based on DAY NUMBER (1-365).
 * - Day 1 = User's first journal entry
 * - Week N = Days [(N-1)*7 + 1, N*7] → Week 1 = Days 1-7, Week 2 = Days 8-14, etc.
 */

// =============================================================================
// FORGE LEVELS
// =============================================================================

/** Forge percentages for each level (0-7 completed days) */
export const FORGE_FILL = [0, 14, 28, 42, 57, 71, 85, 100] as const;

// =============================================================================
// DAY/WEEK CALCULATIONS
// =============================================================================

/**
 * Get the current day number for a user based on when they started.
 * Returns 0 if user hasn't started yet (journeyStartDate is null).
 * 
 * @param journeyStartDate - The DATE (string 'YYYY-MM-DD') of Day 1, or null if not started
 * @param timezone - User's IANA timezone
 */
export function getCurrentDayNumber(
  journeyStartDate: string | null,
  timezone: string
): number {
  if (!journeyStartDate) return 0;

  // Get current time in user's timezone
  const nowInUserTz = toZonedTime(new Date(), timezone);
  const todayStart = startOfDay(nowInUserTz);

  // Parse journey start date (it's a DATE string like '2024-12-30')
  const journeyStartDay = new Date(journeyStartDate + 'T00:00:00');

  // Day number = days elapsed + 1 (so first day = Day 1)
  const daysElapsed = differenceInDays(todayStart, journeyStartDay);
  const dayNumber = daysElapsed + 1;

  // Clamp to 1-365
  return Math.min(Math.max(dayNumber, 1), 365);
}

/**
 * Get week number from day number (1-52).
 * Week 1 = Days 1-7, Week 2 = Days 8-14, etc.
 */
export function getWeekNumber(dayNumber: number): number {
  if (dayNumber <= 0) return 0;
  return Math.ceil(dayNumber / 7);
}

/**
 * Get day position within week (1-7).
 * Day 1 → Position 1, Day 7 → Position 7, Day 8 → Position 1, etc.
 */
export function getDayInWeek(dayNumber: number): number {
  if (dayNumber <= 0) return 0;
  const pos = dayNumber % 7;
  return pos === 0 ? 7 : pos;
}

/**
 * Get the day number range for a given week.
 * Week 1 → [1, 7], Week 2 → [8, 14], etc.
 */
export function getWeekDayRange(weekNumber: number): { start: number; end: number } {
  const start = (weekNumber - 1) * 7 + 1;
  const end = weekNumber * 7;
  return { start, end };
}

// =============================================================================
// QUARTER CALCULATIONS
// =============================================================================

/**
 * Get quarter number from week number (1-4).
 * Q1 = Weeks 1-13, Q2 = Weeks 14-26, etc.
 */
export function getQuarterNumber(weekNumber: number): number {
  if (weekNumber <= 0) return 0;
  return Math.ceil(weekNumber / 13);
}

/**
 * Get week position within its quarter (1-13).
 * Week 1 → 1, Week 13 → 13, Week 14 → 1, etc.
 */
export function getWeekInQuarter(weekNumber: number): number {
  if (weekNumber <= 0) return 0;
  const pos = (weekNumber - 1) % 13;
  return pos + 1;
}

// =============================================================================
// RARITY CALCULATION
// =============================================================================

/**
 * Get rarity for a week based on its position in the quarter.
 * Weeks 1,2,5,6,9,10 = Common
 * Weeks 3,7,11 = Uncommon  
 * Weeks 4,8,12 = Rare
 * Week 13 = Ace
 */
export function getRarityForWeek(weekInQuarter: number): 'Common' | 'Uncommon' | 'Rare' | 'Ace' {
  if (weekInQuarter === 13) return 'Ace';
  if ([4, 8, 12].includes(weekInQuarter)) return 'Rare';
  if ([3, 7, 11].includes(weekInQuarter)) return 'Uncommon';
  return 'Common';
}

// =============================================================================
// USER POSITION HELPER
// =============================================================================

/**
 * Get user's complete position in their journey.
 * Returns all relevant day/week/quarter info.
 */
export function getUserPosition(journeyStartDate: string | null, timezone: string) {
  const dayNumber = getCurrentDayNumber(journeyStartDate, timezone);

  if (dayNumber === 0) {
    return {
      hasStarted: false,
      dayNumber: 0,
      weekNumber: 0,
      dayInWeek: 0,
      quarterNumber: 0,
      weekInQuarter: 0,
    };
  }

  const weekNumber = getWeekNumber(dayNumber);
  const dayInWeek = getDayInWeek(dayNumber);
  const quarterNumber = getQuarterNumber(weekNumber);
  const weekInQuarter = getWeekInQuarter(weekNumber);

  return {
    hasStarted: true,
    dayNumber,
    weekNumber,
    dayInWeek,
    quarterNumber,
    weekInQuarter,
  };
}

// =============================================================================
// JOURNEY INITIALIZATION
// =============================================================================

/**
 * Get the date string for when a user's journey should start.
 * Called when user makes their FIRST journal entry.
 * Returns a DATE string in 'YYYY-MM-DD' format.
 */
export function getJourneyStartDate(timezone: string): string {
  // Get current date in user's timezone
  const nowInUserTz = toZonedTime(new Date(), timezone);
  const todayStart = startOfDay(nowInUserTz);
  return format(todayStart, 'yyyy-MM-dd');
}

/**
 * Get today's date in the user's timezone as 'YYYY-MM-DD'.
 * Used for entry_date when saving journal entries.
 */
export function getTodayDateString(timezone: string): string {
  const nowInUserTz = toZonedTime(new Date(), timezone);
  return format(nowInUserTz, 'yyyy-MM-dd');
}
