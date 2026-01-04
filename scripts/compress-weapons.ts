/**
 * Weapon Asset Compression Script (High Quality)
 * 
 * Converts:
 * - PNG → WebP (static, using sharp) - ~50% smaller, same quality
 * - GIF → Animated WebP (using gif2webp) - ~50-70% smaller, same quality
 * 
 * Animated WebP is MUCH better than GIF compression because:
 * - No quality loss
 * - Better compression algorithm
 * - Supported by all modern browsers
 * 
 * Usage:
 *   npx tsx scripts/compress-weapons.ts
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { execSync, exec } from 'child_process';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SOURCE_DIR = path.join(__dirname, '../public/weapons');
const OUTPUT_DIR = path.join(__dirname, '../public/weapons-compressed');

// Compression settings
const WEBP_QUALITY = 90; // High quality static WebP
const ANIM_WEBP_QUALITY = 85; // High quality animated WebP

// =============================================================================
// HELPERS
// =============================================================================

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getSavingsPercent(before: number, after: number): string {
    return ((before - after) / before * 100).toFixed(1) + '%';
}

// =============================================================================
// CHECK FOR GIF2WEBP
// =============================================================================

function checkGif2webp(): boolean {
    try {
        execSync('gif2webp -version', { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}

// =============================================================================
// PNG → WEBP COMPRESSION (using sharp)
// =============================================================================

async function compressPng(inputPath: string, outputPath: string): Promise<{ before: number; after: number }> {
    const inputStats = fs.statSync(inputPath);

    await sharp(inputPath)
        .webp({ quality: WEBP_QUALITY, nearLossless: true })
        .toFile(outputPath);

    const outputStats = fs.statSync(outputPath);
    return { before: inputStats.size, after: outputStats.size };
}

// =============================================================================
// GIF → ANIMATED WEBP (using gif2webp)
// =============================================================================

function compressGifToWebp(inputPath: string, outputPath: string): Promise<{ before: number; after: number }> {
    return new Promise((resolve) => {
        const inputStats = fs.statSync(inputPath);

        // gif2webp options:
        // -q = quality (0-100)
        // -m = compression method (0-6, higher = slower but better)
        // -lossy = use lossy compression (smaller files)
        const cmd = `gif2webp -q ${ANIM_WEBP_QUALITY} -m 4 -lossy "${inputPath}" -o "${outputPath}"`;

        exec(cmd, { timeout: 600000 }, (error) => {
            if (error) {
                // Fallback: just copy the original GIF
                console.log('(gif2webp failed, keeping original)');
                fs.copyFileSync(inputPath, outputPath.replace('.webp', '.gif'));
                resolve({ before: inputStats.size, after: inputStats.size });
            } else {
                const outputStats = fs.statSync(outputPath);
                resolve({ before: inputStats.size, after: outputStats.size });
            }
        });
    });
}

// =============================================================================
// MAIN COMPRESSION FUNCTION
// =============================================================================

async function compressAll() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('         WEAPON ASSET COMPRESSION (HIGH QUALITY)');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    // Check for gif2webp
    const hasGif2webp = checkGif2webp();
    if (!hasGif2webp) {
        console.log('⚠️  gif2webp not found. Installing...');
        console.log('   Run: npm install -g gif2webp');
        console.log('   Or download from: https://developers.google.com/speed/webp/download');
        console.log('');
        console.log('   For now, GIFs will be kept as-is (no compression).');
        console.log('');
    } else {
        console.log('✅ gif2webp found - GIFs will be converted to Animated WebP');
        console.log('');
    }

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Get all files
    const allFiles = fs.readdirSync(SOURCE_DIR).filter(f =>
        f.endsWith('.png') || f.endsWith('.gif')
    );

    const pngFiles = allFiles.filter(f => f.endsWith('.png'));
    const gifFiles = allFiles.filter(f => f.endsWith('.gif'));

    console.log(`📊 Found ${pngFiles.length} PNG files and ${gifFiles.length} GIF files\n`);

    let totalBefore = 0;
    let totalAfter = 0;
    let processed = 0;

    // Process PNGs first (fast)
    console.log('🖼️  COMPRESSING PNGs (PNG → WebP)...\n');

    for (const file of pngFiles) {
        const outputFile = file.replace('.png', '.webp');
        const inputPath = path.join(SOURCE_DIR, file);
        const outputPath = path.join(OUTPUT_DIR, outputFile);

        process.stdout.write(`  📦 ${file} → ${outputFile}... `);

        const { before, after } = await compressPng(inputPath, outputPath);
        totalBefore += before;
        totalAfter += after;
        processed++;

        console.log(`${formatBytes(before)} → ${formatBytes(after)} (${getSavingsPercent(before, after)} smaller)`);
    }

    console.log('');

    // Process GIFs
    if (hasGif2webp) {
        console.log('🎬 CONVERTING GIFs to Animated WebP (this takes time but PRESERVES quality)...\n');

        for (let i = 0; i < gifFiles.length; i++) {
            const file = gifFiles[i];
            const outputFile = file.replace('.gif', '.webp');
            const inputPath = path.join(SOURCE_DIR, file);
            const outputPath = path.join(OUTPUT_DIR, outputFile);

            const progress = `[${i + 1}/${gifFiles.length}]`;
            process.stdout.write(`  🎬 ${progress} ${file} → ${outputFile}... `);

            const startTime = Date.now();
            const { before, after } = await compressGifToWebp(inputPath, outputPath);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

            totalBefore += before;
            totalAfter += after;
            processed++;

            console.log(`${formatBytes(before)} → ${formatBytes(after)} (${getSavingsPercent(before, after)} smaller, ${elapsed}s)`);
        }
    } else {
        console.log('⏭️  COPYING GIFs (no compression - install gif2webp for better results)...\n');

        for (const file of gifFiles) {
            const inputPath = path.join(SOURCE_DIR, file);
            const outputPath = path.join(OUTPUT_DIR, file);
            const inputStats = fs.statSync(inputPath);

            fs.copyFileSync(inputPath, outputPath);
            totalBefore += inputStats.size;
            totalAfter += inputStats.size;
            processed++;

            console.log(`  📋 ${file} (${formatBytes(inputStats.size)})`);
        }
    }

    // Summary
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                        SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  📁 Output folder: ${OUTPUT_DIR}`);
    console.log(`  ✅ Processed: ${processed} files`);
    console.log(`  📊 Total before: ${formatBytes(totalBefore)}`);
    console.log(`  📊 Total after:  ${formatBytes(totalAfter)}`);
    console.log(`  💾 Saved: ${formatBytes(totalBefore - totalAfter)} (${getSavingsPercent(totalBefore, totalAfter)})`);
    console.log('');
    console.log('🎉 Done!\n');
}

// Run
compressAll().catch(console.error);
