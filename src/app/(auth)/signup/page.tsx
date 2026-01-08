import { redirect } from 'next/navigation';

// With Google OAuth, signup and login are the same flow
// Redirect to login page
export default function SignupPage() {
  redirect('/login');
}
