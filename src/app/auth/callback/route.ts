import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    if (code) {
        const supabase = await createClient();

        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('Auth callback error:', error);
            return NextResponse.redirect(`${origin}/login?error=auth_failed`);
        }

        if (data.user) {
            // Check if user profile exists, if not create it
            const existingUser = await db.query.users.findFirst({
                where: eq(users.id, data.user.id),
            });

            if (!existingUser) {
                // New user - create profile
                // Get timezone from browser (will be passed via state or default)
                const timezone = requestUrl.searchParams.get('timezone') ||
                    Intl.DateTimeFormat().resolvedOptions().timeZone ||
                    'UTC';

                await db.insert(users).values({
                    id: data.user.id,
                    email: data.user.email!,
                    timezone: timezone,
                    // journeyStartDate is null - starts on first entry
                });
            }
        }

        // Redirect to journal after successful auth
        return NextResponse.redirect(`${origin}/journal`);
    }

    // No code, redirect to login
    return NextResponse.redirect(`${origin}/login`);
}
