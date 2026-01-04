'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { countWords } from '@/lib/word-count';

interface JournalStore {
  // Draft autosave (persisted to localStorage)
  draft: string;
  setDraft: (content: string) => void;
  clearDraft: () => void;
  
  // Derived word count
  wordCount: number;
  
  // UI state
  isSubmitting: boolean;
  setSubmitting: (val: boolean) => void;
  
  // Card state
  isFlipped: boolean;
  setFlipped: (val: boolean) => void;
  toggleFlip: () => void;
  
  // Animation trigger
  forgeAnimationUrl: string | null;
  setForgeAnimation: (url: string | null) => void;
  
  // Selected day for viewing history
  selectedDay: number;
  setSelectedDay: (day: number) => void;
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      draft: '',
      setDraft: (content) => set({ 
        draft: content,
        wordCount: countWords(content),
      }),
      clearDraft: () => set({ draft: '', wordCount: 0 }),
      
      wordCount: 0,
      
      isSubmitting: false,
      setSubmitting: (val) => set({ isSubmitting: val }),
      
      isFlipped: false,
      setFlipped: (val) => set({ isFlipped: val }),
      toggleFlip: () => set({ isFlipped: !get().isFlipped }),
      
      forgeAnimationUrl: null,
      setForgeAnimation: (url) => set({ forgeAnimationUrl: url }),
      
      selectedDay: 1,
      setSelectedDay: (day) => set({ selectedDay: day }),
    }),
    {
      name: 'justshowup-journal',
      partialize: (state) => ({ draft: state.draft }), // Only persist draft
    }
  )
);


