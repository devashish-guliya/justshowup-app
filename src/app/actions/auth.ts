'use server';

import { createClient } from '@/lib/supabase/server';
import { db, users } from '@/db';
import { redirect } from 'next/navigation';

/**
 * Sign up a new user.
 * Note: Journey does NOT start at signup - it starts at first entry.
 * journey_start_date will be NULL until user makes their first journal entry.
 */
export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const timezone = formData.get('timezone') as string || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Create user profile
    // journey_start_date is NULL - will be set on first entry
    await db.insert(users).values({
      id: data.user.id,
      email: data.user.email!,
      timezone: timezone,
      // journeyStartDate: null - journey hasn't started yet
      // signupDate is auto-set to now via defaultNow()
    });
  }

  redirect('/journal');
}

/**
 * Sign in an existing user.
 */
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/journal');
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
