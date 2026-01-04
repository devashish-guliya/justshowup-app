/**
 * Weapon Asset Upload Script (Sequential Version)
 * 
 * Uploads organized assets from public/weapons-organized to Supabase Storage.
 * Structure: q{quarter}/artifact_{id}/...
 * 
 * Usage:
 *   npx tsx scripts/upload-weapons.ts
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { glob } from 'glob';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// =============================================================================
// CONFIGURATION
// =============================================================================

const ORGANIZED_DIR = path.join(__dirname, '../public/weapons-organized');
const SUPABASE_BUCKET = 'weapons';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// =============================================================================
// HELPERS
// =============================================================================

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fileExists(supabase: any, path: string): Promise<boolean> {
    const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .list(path.split('/').slice(0, -1).join('/'), {
            search: path.split('/').pop()
        });

    if (error || !data) return false;
    return data.some((f: any) => f.name === path.split('/').pop());
}

// =============================================================================
// MAIN
// =============================================================================

async function uploadAll() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('         WEAPON ASSET UPLOAD SCRIPT (ROBUST)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!fs.existsSync(ORGANIZED_DIR)) {
        console.error(`❌ Organized directory not found: ${ORGANIZED_DIR}`);
        process.exit(1);
    }

    // Get all files recursively from q1 directory
    const files = await glob('**/*', {
        cwd: ORGANIZED_DIR,
        nodir: true,
        posix: true
    });

    console.log(`📊 Total files found: ${files.length}\n`);

    let uploaded = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < files.length; i++) {
        const relativePath = files[i];
        const filePath = path.join(ORGANIZED_DIR, relativePath);
        const progress = `[${i + 1}/${files.length}]`;

        // Check if file already exists to skip successfully uploaded ones
        try {
            const exists = await fileExists(supabase, relativePath);
            if (exists) {
                console.log(`🚀 ${progress} Skipping ${relativePath} (Already exists)`);
                skipped++;
                continue;
            }
        } catch (err) {
            // If check fails, try to upload anyway
        }

        let attempts = 0;
        const maxAttempts = 3;
        let success = false;

        while (attempts < maxAttempts && !success) {
            attempts++;
            if (attempts > 1) {
                process.stdout.write(`   🔄 Retry ${attempts}/${maxAttempts}... `);
            } else {
                process.stdout.write(`🚀 ${progress} Uploading ${relativePath}... `);
            }

            try {
                const fileBuffer = fs.readFileSync(filePath);
                const contentType = relativePath.endsWith('.webp') ? 'image/webp' : 'image/gif';

                const { error } = await supabase.storage
                    .from(SUPABASE_BUCKET)
                    .upload(relativePath, fileBuffer, {
                        contentType,
                        upsert: true,
                    });

                if (error) {
                    console.log(`❌ FAILED: ${error.message}`);
                    if (attempts < maxAttempts) {
                        await delay(2000 * attempts); // Exponential delay
                    }
                } else {
                    console.log('✅ DONE');
                    success = true;
                    uploaded++;
                }
            } catch (err: any) {
                console.log(`❌ ERROR: ${err.message}`);
                if (attempts < maxAttempts) {
                    await delay(2000 * attempts);
                }
            }
        }

        if (!success) {
            failed++;
        }

        // Small breathe between files
        await delay(500);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                        SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  ✅ Successfully Uploaded: ${uploaded}`);
    console.log(`  ⏭️  Skipped (Existing):   ${skipped}`);
    console.log(`  ❌ Failed (All attempts): ${failed}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
}

uploadAll().catch(console.error);
