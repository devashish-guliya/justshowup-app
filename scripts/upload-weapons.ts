/**
 * Weapon Asset Upload Script
 * 
 * Uploads compressed assets from public/weapons-compressed to Supabase Storage.
 * Maintains the folder structure:
 * q{quarter}/artifact_{id}/...
 * 
 * Usage:
 *   npx tsx scripts/upload-weapons.ts
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// =============================================================================
// CONFIGURATION
// =============================================================================

const SOURCE_DIR = path.join(__dirname, '../public/weapons-compressed');
const SUPABASE_BUCKET = 'weapons';
const CONCURRENCY = 5; // Upload 5 files at a time

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// =============================================================================
// HELPERS
// =============================================================================

function getArtifactId(filename: string): string {
    // Extract number from art_001_...
    const match = filename.match(/art_(\d+)/);
    return match ? `artifact_${match[1]}` : 'unknown';
}

function getQuarter(artifactId: string): number {
    const num = parseInt(artifactId.replace('artifact_', ''));
    return Math.ceil(num / 13);
}

// =============================================================================
// MAIN
// =============================================================================

async function uploadAll() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('              WEAPON ASSET UPLOAD SCRIPT');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials.');
        console.error('   Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if source dir exists
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
        console.error('   Run compression script first!');
        process.exit(1);
    }

    const files = fs.readdirSync(SOURCE_DIR).filter(f => !f.startsWith('.'));
    console.log(`📊 Found ${files.length} files to upload\n`);

    let uploaded = 0;
    let failed = 0;
    let skipped = 0;

    // Process in batches
    for (let i = 0; i < files.length; i += CONCURRENCY) {
        const batch = files.slice(i, i + CONCURRENCY);
        console.log(`🚀 Uploading batch ${Math.floor(i / CONCURRENCY) + 1}/${Math.ceil(files.length / CONCURRENCY)}...`);

        await Promise.all(batch.map(async (file) => {
            try {
                const filePath = path.join(SOURCE_DIR, file);
                const fileBuffer = fs.readFileSync(filePath);

                // Determine storage path: q1/artifact_001/day0.webp
                // Input: art_001_day0.webp -> Output: day0.webp
                const artifactId = getArtifactId(file);
                const quarter = getQuarter(artifactId);

                // Remove prefix "art_001_" to get clean name "day0.webp"
                const cleanName = file.replace(/^art_\d+_/, '');
                const storagePath = `q${quarter}/${artifactId}/${cleanName}`;

                const contentType = file.endsWith('.webp') ? 'image/webp' : 'image/gif';

                // Check if exists (optional, but saves bandwidth)
                // For now, we prefer UPSERT=true to ensure latest version

                const { error } = await supabase.storage
                    .from(SUPABASE_BUCKET)
                    .upload(storagePath, fileBuffer, {
                        contentType,
                        upsert: true,
                    });

                if (error) {
                    console.error(`   ❌ Failed: ${file} -> ${storagePath}: ${error.message}`);
                    failed++;
                } else {
                    console.log(`   ✅ ${file} -> ${storagePath}`);
                    uploaded++;
                }
            } catch (err) {
                console.error(`   ❌ Error processing ${file}: ${err}`);
                failed++;
            }
        }));
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                        SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  ✅ Uploaded: ${uploaded}`);
    console.log(`  ❌ Failed:   ${failed}`);
    console.log(`  ⏭️  Skipped:  ${skipped}`);
    console.log('');
}

uploadAll().catch(console.error);
