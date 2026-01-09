'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WeekSliderProps {
  currentDayNumber: number;
  selectedDay: number;
  completedDays: boolean[];
  onSelectDay: (day: number) => void;
}

const ITEM_WIDTH = 40;
const GAP = 8;
const SNAP_WIDTH = ITEM_WIDTH + GAP;

export function WeekSlider({
  currentDayNumber,
  selectedDay,
  completedDays,
  onSelectDay
}: WeekSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const index = selectedDay - 1;
      containerRef.current.scrollTo({
        left: index * SNAP_WIDTH,
        behavior: 'smooth'
      });
    }
  }, [selectedDay]);

  const days = Array.from({ length: 365 }, (_, i) => i + 1);

  // Helper for the tick/check icon
  const CheckMark = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <div className="relative w-full h-full">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

      <div
        ref={containerRef}
        className="w-full h-full overflow-x-auto flex items-center"
        style={{
          gap: GAP,
          paddingLeft: `calc(50% - ${ITEM_WIDTH / 2}px)`,
          paddingRight: `calc(50% - ${ITEM_WIDTH / 2}px)`,
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          overflowY: 'visible', // Don't clip the scaled selected item
        }}
      >
        {days.map((day) => {
          const isFuture = day > currentDayNumber;
          const isSelected = day === selectedDay;

          const isCurrentWeek = Math.ceil(day / 7) === Math.ceil(currentDayNumber / 7);
          const weekDayIndex = (day - 1) % 7;
          const isCompleted = isCurrentWeek ? completedDays[weekDayIndex] : (day < currentDayNumber);
          const isMissed = !isFuture && !isCompleted && day !== currentDayNumber;

          return (
            <button
              key={day}
              onClick={() => !isFuture && onSelectDay(day)}
              disabled={isFuture}
              className={cn(
                "day-pill relative flex-shrink-0 flex items-center justify-center transition-all duration-200",
                "w-10 h-10 rounded-full",
                "text-sm font-semibold tabular-nums",
                // Base state
                !isSelected && !isFuture && "bg-white/5 text-white/50 hover:bg-white/10",
                // Selected state - styles handled by .selected class in globals.css
                isSelected && "selected shadow-[0_0_20px_rgba(255,255,255,0.4)]",
                // Completed (not selected)
                !isSelected && isCompleted && "text-emerald-400 bg-emerald-400/10",
                // Missed (not selected)
                !isSelected && isMissed && "text-red-400/60 bg-red-400/5",
                // Future state
                isFuture && "opacity-30 pointer-events-none"
              )}
              style={{ scrollSnapAlign: 'center' }}
            >
              {isSelected ? (
                <div className="flex flex-col items-center justify-center -space-y-0.5 pointer-events-none">
                  <span className="text-[14px] leading-tight mt-1">{day}</span>
                  <CheckMark />
                </div>
              ) : (
                day
              )}
            </button>
          );
        })}
      </div>

      {/* Hide webkit scrollbar */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
