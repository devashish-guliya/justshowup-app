'use server';

import { createClient } from '@/lib/supabase/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * Initiate Google OAuth sign-in.
 * This redirects the user to Google's consent screen.
 */
export async function signInWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get('origin') || headersList.get('host') || '';

  // Construct the full origin URL
  const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
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
