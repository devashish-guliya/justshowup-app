'use client';

import { useEffect, useState, useTransition } from 'react';
import { Header } from '@/components/Header';
import { WeekSlider } from '@/components/WeekSlider';
import { ForgeCard } from '@/components/ForgeCard';
import { useJournalStore } from '@/stores/journal-store';
import { submitJournalEntry, getDayData } from '@/app/actions/journal';

interface DashboardState {
  user: {
    id: string;
    email: string;
    timezone: string;
    hasStarted: boolean;
    totalEntries: number;
    totalWords: number;
  };
  position: {
    dayNumber: number;
    weekNumber: number;
    dayInWeek: number;
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
  } | null;
}

interface DayData {
  dayNumber: number;
  weekNumber: number;
  isToday: boolean;
  isFuture: boolean;
  entry: {
    content: string;
    wordCount: number;
    isComplete: boolean;
  } | null;
  weapon: {
    artifactId: string;
    name: string;
    category: string;
    rarity: string;
  } | null;
  forgeLevel: number;
  weaponImageUrl: string;
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

  const [isPending, startTransition] = useTransition();
  const [dayData, setDayData] = useState<DayData | null>(null);

  // Initialize selected day to current day
  useEffect(() => {
    setSelectedDay(initialState.position.dayNumber);
  }, [initialState.position.dayNumber, setSelectedDay]);

  // Fetch day-specific data when selectedDay changes
  useEffect(() => {
    if (!selectedDay) return;

    startTransition(async () => {
      const data = await getDayData(selectedDay);
      if (data) {
        setDayData(data);
        if (data.entry?.content) {
          setDraft(data.entry.content);
        } else {
          clearDraft();
        }
      }
    });
  }, [selectedDay, setDraft, clearDraft]);

  const handleSubmit = async (content: string) => {
    const result = await submitJournalEntry(content);
    if (!result.success) {
      throw new Error(result.message);
    }
    return result.forgeAnimation;
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
  };

  // Use dayData if available, fallback to initial state for first render
  const isToday = dayData?.isToday ?? (selectedDay === initialState.position.dayNumber);
  const entryContent = dayData?.entry?.content ?? initialState.today?.content ?? '';
  const isComplete = dayData?.entry?.isComplete ?? initialState.today?.isComplete ?? false;
  const weaponImageUrl = dayData?.weaponImageUrl ?? initialState.weapon?.currentImage ?? '';
  const weaponName = dayData?.weapon?.name ?? initialState.weapon?.name ?? 'Unknown Artifact';
  const forgeLevel = dayData?.forgeLevel ?? initialState.weapon?.forgeLevel ?? 0;

  return (
    <div className="app">
      <Header
        dayNumber={initialState.position.dayNumber}
        maxDays={365}
      />

      <WeekSlider
        currentDayNumber={initialState.position.dayNumber}
        selectedDay={selectedDay || initialState.position.dayNumber}
        completedDays={initialState.weapon?.completedDays || []}
        onSelectDay={handleSelectDay}
      />

      <div className="spacer-2" />

      <ForgeCard
        isToday={isToday}
        entryContent={entryContent}
        isComplete={isComplete}
        weaponImageUrl={weaponImageUrl}
        weaponName={weaponName}
        forgeLevel={forgeLevel}
        artifactId={dayData?.weapon?.artifactId}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
}



