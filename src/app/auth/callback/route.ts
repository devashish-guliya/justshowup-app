import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const timezone = requestUrl.searchParams.get('timezone') || 'UTC';
    const origin = requestUrl.origin;

    if (!code) {
        return NextResponse.redirect(`${origin}/login`);
    }

    try {
        const supabase = await createClient();

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('Auth callback error:', error);
            return NextResponse.redirect(`${origin}/login?error=auth_failed`);
        }

        if (data.user) {
            try {
                const existingUser = await db.query.users.findFirst({
                    where: eq(users.id, data.user.id),
                });

                if (!existingUser) {
                    // New user - create profile with detected timezone
                    await db.insert(users).values({
                        id: data.user.id,
                        email: data.user.email!,
                        timezone: timezone,
                    });
                }
            } catch (dbError) {
                console.error('Database error in callback:', dbError);
            }
        }

        return NextResponse.redirect(`${origin}/journal`);
    } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        return NextResponse.redirect(`${origin}/login?error=unexpected`);
    }
}
