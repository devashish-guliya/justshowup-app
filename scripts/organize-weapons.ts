/**
 * Organize Weapons Script
 * 
 * Moves files from weapons-compressed to an organized structure:
 * weapons-organized/
 *   q1/
 *     artifact_001/
 *       day0.webp
 *       day1.webp
 *       ...
 * 
 * use this to prepare for manual drag-and-drop upload.
 */

import fs from 'fs';
import path from 'path';

const SOURCE_DIR = path.join(__dirname, '../public/weapons-compressed');
const DEST_DIR = path.join(__dirname, '../public/weapons-organized');

function getArtifactId(filename: string): string {
    const match = filename.match(/art_(\d+)/);
    return match ? `artifact_${match[1]}` : 'unknown';
}

function getQuarter(artifactId: string): number {
    const num = parseInt(artifactId.replace('artifact_', ''));
    return Math.ceil(num / 13);
}

function organize() {
    console.log('📦 Organizing files for manual upload...');

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`❌ Source not found: ${SOURCE_DIR}`);
        return;
    }

    if (fs.existsSync(DEST_DIR)) {
        fs.rmSync(DEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DEST_DIR, { recursive: true });

    const files = fs.readdirSync(SOURCE_DIR).filter(f => !f.startsWith('.'));

    let count = 0;

    for (const file of files) {
        const artifactId = getArtifactId(file);
        const quarter = getQuarter(artifactId);

        // Clean filename: art_001_day0.webp -> day0.webp
        const cleanName = file.replace(/^art_\d+_/, '');

        // Create folder: weapons-organized/q1/artifact_001
        const targetFolder = path.join(DEST_DIR, `q${quarter}`, artifactId);
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
        }

        // Copy file
        fs.copyFileSync(
            path.join(SOURCE_DIR, file),
            path.join(targetFolder, cleanName)
        );

        count++;
    }

    console.log(`✅ Organized ${count} files into ${DEST_DIR}`);
    console.log('👉 You can now drag the "q1" folder into Supabase Storage!');
}

organize();
