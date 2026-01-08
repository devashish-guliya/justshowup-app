'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WeekSliderProps {
  currentDayNumber: number;
  selectedDay: number;
  completedDays: boolean[];
  onSelectDay: (day: number) => void;
}

// Compact Item Width
const ITEM_WIDTH = 50;
const GAP = 8;
const SNAP_WIDTH = ITEM_WIDTH + GAP;

export function WeekSlider({
  currentDayNumber,
  selectedDay,
  completedDays,
  onSelectDay
}: WeekSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on selection change
  useEffect(() => {
    if (containerRef.current) {
      const index = selectedDay - 1;
      const container = containerRef.current;

      container.scrollTo({
        left: index * SNAP_WIDTH,
        behavior: 'smooth'
      });
    }
  }, [selectedDay]);

  const days = Array.from({ length: 365 }, (_, i) => i + 1);

  return (
    <div className="relative w-full h-20 overflow-hidden group mb-4">
      {/* Fade Masks - Softer/Narrower */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />

      {/* Center Indicator (Optional Helper) */}
      {/* <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500/20 -translate-x-1/2 z-0 pointer-events-none" /> */}

      <div
        ref={containerRef}
        className="w-full h-full overflow-x-auto flex items-center no-scrollbar snap-x snap-mandatory"
        style={{
          scrollBehavior: 'smooth',
          gap: GAP,
          // Precise centering: 50% of container - 50% of item width
          paddingLeft: `calc(50% - ${ITEM_WIDTH / 2}px)`,
          paddingRight: `calc(50% - ${ITEM_WIDTH / 2}px)`,
        }}
      >
        {days.map((day) => {
          const isFuture = day > currentDayNumber;
          const isSelected = day === selectedDay;

          // Status Logic
          const isCurrentWeek = Math.ceil(day / 7) === Math.ceil(currentDayNumber / 7);
          const weekDayIndex = (day - 1) % 7;

          const isCompleted = isCurrentWeek ? completedDays[weekDayIndex] : (day < currentDayNumber);
          // "Missed" if in past and NOT completed.
          const isMissed = !isFuture && !isCompleted;

          // Color Logic
          let textColor = "text-gray-400"; // Default / Future
          if (isCompleted) textColor = "text-emerald-600";
          else if (isMissed) textColor = "text-red-500";
          else if (isSelected) textColor = "text-gray-900"; // Current Day (Today) active

          // If selected, maybe drag darker? 
          // User said: "Selected number should be dark... for done days, number should be green"
          // So Status Color > Selected Color usually. 
          // But if Today is selected (and not done yet), it should be dark.
          if (isSelected && !isCompleted && !isMissed) textColor = "text-gray-900";

          return (
            <button
              key={day}
              onClick={() => !isFuture && onSelectDay(day)}
              disabled={isFuture}
              className={cn(
                "relative flex-shrink-0 snap-center flex flex-col items-center justify-center transition-all duration-300",
                isSelected ? "scale-110 opacity-100" : "scale-100 opacity-50 hover:opacity-80",
                isFuture && "opacity-30 pointer-events-none",
              )}
              style={{ width: ITEM_WIDTH, height: ITEM_WIDTH }}
            >
              {/* Number */}
              <span className={cn(
                "text-lg font-bold tabular-nums",
                textColor
              )}>
                {day}
              </span>

              {/* Indicators (Absolute positioned below) */}
              <div className="absolute -bottom-1 flex justify-center items-center h-4">
                {isCompleted && (
                  // Green Tick
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-500 stroke-[3]">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}

                {isMissed && (
                  // Red Dot
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
