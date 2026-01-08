-- ============================================================
-- FORGE JOURNEY FILLER SCRIPT (TESTING)
-- Target User: a80f0a9e-e390-46b0-a60f-82358ffd8d5f
-- Date: Jan 9, 2026
-- Goal: 
-- 1. Fill Journal Entries for Days 1-34 (Weeks 1, 2, 3, 4, and start of 5).
-- 2. Create User Weapons for Weeks 1, 2, 3, 4, 5.
-- 3. Leave Day 35 (Today) empty.
-- ============================================================

-- Variables (Substitute these manually if running in a simpler client)
-- User ID: 'a80f0a9e-e390-46b0-a60f-82358ffd8d5f'
-- Signup Date: '2026-01-08'... actually user date says 2026-01-08, but you want to simulate 5 weeks?
-- If today is Jan 9, 2026 and this is Day 35, then Day 1 was Dec 5, 2025.
-- Let's assume the "journey_start_date" or just logical day count is effectively Dec 5.

DO $$
DECLARE
    target_user_id UUID := 'a80f0a9e-e390-46b0-a60f-82358ffd8d5f';
    start_date DATE := '2025-12-05'; -- Calculated so Day 35 is Jan 9, 2026
    current_day_number INTEGER := 35;
    
    -- Weapons config (assuming you have artifacts in 'artifacts' table)
    -- We need actual artifact IDs. I will insert placeholders or assumes you have them.
    -- If you don't have artifacts, insert them first? 
    -- Assuming artifacts exist for ids: 'swd-001', 'swd-002' etc. or I will generate random UUIDs if your schema allows.
    -- WAIT: I don't know your artifact table content. 
    -- Best effort: I will select random artifacts from 'artifacts' table if they exist.
    
    w_index INTEGER;
    d_index INTEGER;
    loop_date DATE;
    found_artifact_id UUID;
    
BEGIN
    -- 1. CLEANUP (Optional - clear history for this user to restart clean)
    -- DELETE FROM journal_entries WHERE user_id = target_user_id;
    -- DELETE FROM user_weapons WHERE user_id = target_user_id;
    
    -- Or just be additive. Let's create helper temp function to get artifact.

    -- ========================================================
    -- LOOP THROUGH 5 WEEKS TO CREATE WEAPONS
    -- ========================================================
    FOR w_index IN 1..5 LOOP
        -- Attempt to find an artifact for this week (random or specific)
        -- This query assumes you have an 'artifacts' table.
        SELECT id INTO found_artifact_id FROM artifacts 
        WHERE id NOT IN (SELECT artifact_id FROM user_weapons WHERE user_id = target_user_id)
        LIMIT 1;
        
        -- If no artifact found, we can't create a weapon entry easily without creating an artifact first.
        -- Assuming for now there are artifacts. If not, this insert might fail or be skipped.
        
        IF found_artifact_id IS NOT NULL THEN
            -- Check if weapon text exists
            IF NOT EXISTS (SELECT 1 FROM user_weapons WHERE user_id = target_user_id AND week_number = w_index) THEN
                INSERT INTO user_weapons (
                    user_id, 
                    artifact_id, 
                    week_number, 
                    status, 
                    progress, 
                    created_at
                ) VALUES (
                    target_user_id,
                    found_artifact_id,
                    w_index,
                    CASE WHEN w_index < 5 THEN 'COMPLETED' ELSE 'IN_PROGRESS' END, -- Past weeks done, current active
                    CASE WHEN w_index < 5 THEN 100 ELSE 85 END, -- Arbitrary progress
                    NOW()
                );
            END IF;
        END IF;
    END LOOP;

    -- ========================================================
    -- LOOP THROUGH DAYS 1 to 34 TO CREATE ENTRIES
    -- ========================================================
    FOR d_index IN 1..34 LOOP
        loop_date := start_date + (d_index - 1);
        
        -- Insert Journal Entry if not exists
        IF NOT EXISTS (SELECT 1 FROM journal_entries WHERE user_id = target_user_id AND date(created_at) = loop_date) THEN
            INSERT INTO journal_entries (
                user_id,
                content,
                word_count,
                created_at,
                updated_at
            ) VALUES (
                target_user_id,
                'Auto-generated entry for Day ' || d_index || '. The forge burns bright on this day. We continue to hammer the steel of destiny.',
                250, -- 250 words is decent length
                loop_date + time '10:00:00', -- Set manual time 10 AM
                loop_date + time '10:00:00'
            );
        END IF;
    END LOOP;

    -- Make sure user stats are updated (if you have standard counters on user table)
    UPDATE users 
    SET total_entries = (SELECT COUNT(*) FROM journal_entries WHERE user_id = target_user_id),
        total_words = (SELECT SUM(word_count) FROM journal_entries WHERE user_id = target_user_id)
    WHERE id = target_user_id;

END $$;
