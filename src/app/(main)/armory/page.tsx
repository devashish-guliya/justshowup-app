import { redirect } from 'next/navigation';
import { getUser } from '@/app/actions/auth';
import { getUserWeapons } from '@/app/actions/journal';
import { ArmoryClient } from './ArmoryClient';

export default async function ArmoryPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const weapons = await getUserWeapons();
  
  return <ArmoryClient weapons={weapons} />;
}


