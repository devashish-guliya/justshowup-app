'use client';

import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { WeekSlider } from '@/components/WeekSlider';
import { ForgeCard } from '@/components/ForgeCard';
import { useJournalStore } from '@/stores/journal-store';
import { submitJournalEntry } from '@/app/actions/journal';

interface DashboardState {
  user: {
    id: string;
    email: string;
    timezone: string;
    currentStreak: number;
    totalEntries: number;
    totalWords: number;
  };
  position: {
    dayNumber: number;
    weekNumber: number;
    dayOfWeek: number;
    quarterNumber: number;
    weekInQuarter: number;
  };
  today: {
    content: string;
    wordCount: number;
    isComplete: boolean;
  } | null;
  weapon: {
    artifactId: string;
    name: string;
    category: string;
    rarity: string;
    forgeLevel: number;
    completedDays: boolean[];
    currentImage: string;
  };
}

interface JournalClientProps {
  initialState: DashboardState;
}

export function JournalClient({ initialState }: JournalClientProps) {
  const { 
    selectedDay, 
    setSelectedDay,
    setDraft,
    clearDraft,
  } = useJournalStore();
  
  // Initialize selected day to current day
  useEffect(() => {
    setSelectedDay(initialState.position.dayNumber);
    if (initialState.today?.content) {
      setDraft(initialState.today.content);
    } else {
      clearDraft();
    }
  }, [initialState, setSelectedDay, setDraft, clearDraft]);
  
  const isToday = selectedDay === initialState.position.dayNumber;
  
  const handleSubmit = async (content: string) => {
    const result = await submitJournalEntry(content);
    if (!result.success) {
      throw new Error(result.message);
    }
    // Page will revalidate automatically
  };
  
  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    // Reset draft when changing days
    if (day === initialState.position.dayNumber && initialState.today?.content) {
      setDraft(initialState.today.content);
    } else {
      clearDraft();
    }
  };
  
  return (
    <div className="app">
      <Header 
        dayNumber={initialState.position.dayNumber} 
        maxDays={365}
      />
      
      <WeekSlider
        currentDayNumber={initialState.position.dayNumber}
        weekNumber={initialState.position.weekNumber}
        selectedDay={selectedDay || initialState.position.dayNumber}
        completedDays={initialState.weapon.completedDays}
        onSelectDay={handleSelectDay}
      />
      
      <ForgeCard
        isToday={isToday}
        entryContent={initialState.today?.content || ''}
        isComplete={initialState.today?.isComplete || false}
        weaponImageUrl={initialState.weapon.currentImage}
        weaponName={initialState.weapon.name}
        forgeLevel={initialState.weapon.forgeLevel}
        onSubmit={handleSubmit}
      />
    </div>
  );
}


