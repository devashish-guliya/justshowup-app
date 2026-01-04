import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = 'weapons';

async function verify() {
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    console.log('--- STORAGE VERIFICATION ---');

    // First list the artifacts in q1
    const { data: artifacts, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .list('q1');

    if (error) {
        console.error('Error listing q1:', error.message);
        return;
    }

    console.log(`Found ${artifacts?.length || 0} artifacts in q1`);

    let totalFiles = 0;
    for (const art of artifacts || []) {
        const { data: files } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .list(`q1/${art.name}`);

        console.log(`  ${art.name}: ${files?.length || 0} files`);
        totalFiles += (files?.length || 0);
    }

    console.log(`\nTOTAL FILES IN Q1: ${totalFiles}`);
}

verify();
