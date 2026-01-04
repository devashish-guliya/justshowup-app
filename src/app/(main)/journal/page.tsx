import { redirect } from 'next/navigation';
import { getDashboardState } from '@/app/actions/journal';
import { JournalClient } from './JournalClient';

export default async function JournalPage() {
  const state = await getDashboardState();
  
  if (!state) {
    redirect('/login');
  }
  
  return <JournalClient initialState={state} />;
}


