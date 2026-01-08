'use server';

import { createClient } from '@/lib/supabase/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * Get the base URL for redirects
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

/**
 * Initiate Google OAuth sign-in.
 * @param timezone - User's timezone from client (e.g., 'Asia/Kolkata')
 */
export async function signInWithGoogle(timezone: string = 'UTC') {
  const supabase = await createClient();

  let baseUrl = getBaseUrl();

  // Ensure only origin (strip any path like /login)
  try {
    const url = new URL(baseUrl);
    baseUrl = url.origin;
  } catch {
    baseUrl = baseUrl.replace(/\/$/, '');
  }

  // Encode timezone in the redirect URL so callback can read it
  const redirectTo = `${baseUrl}/auth/callback?timezone=${encodeURIComponent(timezone)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google OAuth error:', error);
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: 'Failed to get OAuth URL' };
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * Get the current authenticated user from Supabase Auth.
 */
export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current user's profile from our database.
 */
export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return null;

  const profile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
  });

  return profile;
}
