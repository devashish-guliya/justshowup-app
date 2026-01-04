/**
 * Weapon Asset Compression & Upload Script (Fast Version)
 * 
 * This script:
 * 1. Compresses PNG images to WebP using sharp (fast, ~50% size reduction)
 * 2. Copies GIFs as-is (GIF compression is very slow for large files)
 * 3. Uploads to Supabase Storage in organized folders
 * 
 * Folder structure in Supabase Storage:
 * weapons/
 *   ├── q1/
 *   │   ├── artifact_001/
 *   │   │   ├── day0.webp
 *   │   │   ├── day1.webp
 *   │   │   ├── day1_anim.gif
 *   │   │   └── ...
 *   │   └── artifact_002/...
 * 
 * Usage:
 *   npx tsx scripts/compress-and-upload.ts [--compress-only] [--upload-only]
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SOURCE_DIR = path.join(__dirname, '../public/weapons');
const OUTPUT_DIR = path.join(__dirname, '../public/weapons-compressed');
const SUPABASE_BUCKET = 'weapons';

// Compression settings
const WEBP_QUALITY = 85; // 85 = good balance of quality and size

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// =============================================================================
// HELPERS
// =============================================================================

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getArtifactId(filename: string): string {
    const match = filename.match(/art_(\d+)/);
    return match ? `artifact_${match[1]}` : 'unknown';
}

function getQuarter(artifactId: string): number {
    const num = parseInt(artifactId.replace('artifact_', ''));
    return Math.ceil(num / 13);
}

// =============================================================================
// COMPRESSION PROCESS
// =============================================================================

async function compressAll(): Promise<Map<string, string>> {
    console.log('🔥 Starting compression...\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const files = fs.readdirSync(SOURCE_DIR).filter(f => f !== 'placeholder.svg');
    const fileMap = new Map<string, string>();

    let totalBefore = 0;
    let totalAfter = 0;
    let pngCount = 0;
    let gifCount = 0;

    for (const file of files) {
        const inputPath = path.join(SOURCE_DIR, file);
        const ext = path.extname(file).toLowerCase();
        const inputStats = fs.statSync(inputPath);

        if (ext === '.png') {
            const outputFile = file.replace('.png', '.webp');
            const outputPath = path.join(OUTPUT_DIR, outputFile);

            process.stdout.write(`  📦 ${file} → ${outputFile}... `);

            await sharp(inputPath)
                .webp({ quality: WEBP_QUALITY, nearLossless: true })
                .toFile(outputPath);

            const outputStats = fs.statSync(outputPath);
            const savings = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);
            console.log(`${formatBytes(inputStats.size)} → ${formatBytes(outputStats.size)} (${savings}% smaller)`);

            totalBefore += inputStats.size;
            totalAfter += outputStats.size;
            fileMap.set(file, outputFile);
            pngCount++;

        } else if (ext === '.gif') {
            const outputPath = path.join(OUTPUT_DIR, file);

            process.stdout.write(`  📋 ${file} (copying)... `);
            fs.copyFileSync(inputPath, outputPath);
            console.log(`${formatBytes(inputStats.size)} (no compression - consider converting to WebM for video)`);

            totalBefore += inputStats.size;
            totalAfter += inputStats.size;
            fileMap.set(file, file);
            gifCount++;
        }
    }

    console.log('\n✅ Compression complete!');
    console.log(`   PNGs: ${pngCount} files converted to WebP`);
    console.log(`   GIFs: ${gifCount} files copied (no compression)`);
    console.log(`   Total before: ${formatBytes(totalBefore)}`);
    console.log(`   Total after:  ${formatBytes(totalAfter)}`);
    console.log(`   Saved: ${formatBytes(totalBefore - totalAfter)} (${((totalBefore - totalAfter) / totalBefore * 100).toFixed(1)}%)\n`);

    return fileMap;
}

// =============================================================================  
// UPLOAD TO SUPABASE
// =============================================================================

async function uploadToSupabase(fileMap: Map<string, string>) {
    console.log('☁️ Uploading to Supabase Storage...\n');

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials.');
        console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let uploaded = 0;
    let failed = 0;

    for (const [originalFile, compressedFile] of fileMap) {
        const filePath = path.join(OUTPUT_DIR, compressedFile);
        const fileBuffer = fs.readFileSync(filePath);

        // Determine folder structure: q1/artifact_001/day0.webp
        const artifactId = getArtifactId(originalFile);
        const quarter = getQuarter(artifactId);

        // Extract filename: art_001_day0.webp -> day0.webp
        const cleanName = compressedFile.replace(/^art_\d+_/, '');
        const storagePath = `q${quarter}/${artifactId}/${cleanName}`;

        process.stdout.write(`  ☁️ ${storagePath}... `);

        const contentType = compressedFile.endsWith('.webp')
            ? 'image/webp'
            : 'image/gif';

        const { error } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .upload(storagePath, fileBuffer, {
                contentType,
                upsert: true,
            });

        if (error) {
            console.log(`❌ ${error.message}`);
            failed++;
        } else {
            console.log('✅');
            uploaded++;
        }
    }

    console.log(`\n✅ Upload complete!`);
    console.log(`   Succeeded: ${uploaded}`);
    console.log(`   Failed: ${failed}\n`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const args = process.argv.slice(2);
    const compressOnly = args.includes('--compress-only');
    const uploadOnly = args.includes('--upload-only');

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('         WEAPON ASSET COMPRESSION & UPLOAD SCRIPT');
    console.log('═══════════════════════════════════════════════════════════════\n');

    let fileMap: Map<string, string>;

    if (!uploadOnly) {
        fileMap = await compressAll();
    } else {
        // Build file map from existing compressed files
        fileMap = new Map();
        if (fs.existsSync(OUTPUT_DIR)) {
            const files = fs.readdirSync(OUTPUT_DIR);
            for (const file of files) {
                if (file.endsWith('.webp')) {
                    fileMap.set(file.replace('.webp', '.png'), file);
                } else {
                    fileMap.set(file, file);
                }
            }
        }
    }

    if (!compressOnly) {
        await uploadToSupabase(fileMap);
    }

    console.log('🎉 Done!\n');
}

main().catch(console.error);
