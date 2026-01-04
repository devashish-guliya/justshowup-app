import { pgTable, uuid, text, timestamp, integer, boolean, date, unique, index } from 'drizzle-orm/pg-core';

// =============================================================================
// USERS TABLE
// =============================================================================
// Stores user profiles linked to Supabase Auth.
// Journey starts from FIRST ENTRY (journey_start_date is NULL until then).

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Auth (linked to Supabase Auth)
  email: text('email').notNull().unique(),

  // Timezone for calculating "today" in user's local time
  timezone: text('timezone').notNull(), // IANA format: "Asia/Kolkata"

  // When user signed up (for analytics)
  signupDate: timestamp('signup_date', { withTimezone: true }).defaultNow(),

  // Journey tracking - NULL until first entry
  // This is the DATE of Day 1 (set when user makes their FIRST entry)
  journeyStartDate: date('journey_start_date'), // NULL = journey not started

  // Optional: Country for seasonal Ace detection (asked after 30 days)
  country: text('country'), // ISO 3166-1 alpha-2: "IN", "US", etc.

  // Stats (NO STREAKS per PRD philosophy - just show up!)
  totalEntries: integer('total_entries').default(0),   // Count of completed entries (50+ words)
  totalWords: integer('total_words').default(0),       // Cumulative word count

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// =============================================================================
// JOURNAL ENTRIES TABLE
// =============================================================================
// Each entry is tied to a DAY NUMBER (1-365).
// Day 1 = user's first entry. Week 1 = Days 1-7, Week 2 = Days 8-14, etc.

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Position in journey
  dayNumber: integer('day_number').notNull(), // 1-365
  weekNumber: integer('week_number').notNull(), // ceil(dayNumber / 7) → 1-52

  // The actual calendar date when entry was made (for display purposes)
  entryDate: date('entry_date').notNull(),

  // Content
  content: text('content').notNull(),
  wordCount: integer('word_count').notNull(),

  // Status
  isComplete: boolean('is_complete').default(false), // true if wordCount >= 50

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  // One entry per user per day number
  unique('journal_entries_user_day_unique').on(table.userId, table.dayNumber),
  // Index for faster user queries
  index('journal_entries_user_idx').on(table.userId),
  // Index for week-based queries
  index('journal_entries_week_idx').on(table.userId, table.weekNumber),
]);

// =============================================================================
// USER WEAPONS TABLE
// =============================================================================
// Each week (7-day block), user gets assigned a weapon.
// Forge level = number of COMPLETED entries that week (0-7).

export const userWeapons = pgTable('user_weapons', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Week identification
  weekNumber: integer('week_number').notNull(), // 1-52
  quarterNumber: integer('quarter_number').notNull(), // ceil(weekNumber / 13) → 1-4
  weekInQuarter: integer('week_in_quarter').notNull(), // ((weekNumber - 1) % 13) + 1 → 1-13

  // Weapon assignment (deterministic based on userId + weekNumber)
  artifactId: text('artifact_id').notNull(),     // "artifact_001"
  artifactName: text('artifact_name').notNull(), // "The Iron Wayfarer"
  category: text('category').notNull(),          // "Sword", "Staff", "Bow", "Polearm", "Ace"
  rarity: text('rarity').notNull(),              // "Common", "Uncommon", "Rare", "Ace"
  palette: text('palette'),                       // "Grounded", "Soft", "Epic", "Masterpiece"
  shufflePool: text('shuffle_pool').notNull(),   // "q1_common", "q1_rare", etc.

  // Forge progress
  forgeLevel: integer('forge_level').default(0), // 0-7

  // Track which day slots (1-7 within the week) have completed entries
  // Uses Postgres boolean[] array type
  completedDays: boolean('completed_days').array()
    .default([false, false, false, false, false, false, false]),

  // Finalization: locked after week ends
  isFinalized: boolean('is_finalized').default(false),
  finalForgeLevel: integer('final_forge_level'), // 0-7 at finalization

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  // One weapon per user per week
  unique('user_weapons_user_week_unique').on(table.userId, table.weekNumber),
  // Index for user queries
  index('user_weapons_user_idx').on(table.userId),
  // Index for finalization queries
  index('user_weapons_finalized_idx').on(table.userId, table.isFinalized),
]);

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type UserWeapon = typeof userWeapons.$inferSelect;
export type NewUserWeapon = typeof userWeapons.$inferInsert;
