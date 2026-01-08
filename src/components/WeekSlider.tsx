'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WeekSliderProps {
  currentDayNumber: number;
  selectedDay: number;
  completedDays: boolean[];
  onSelectDay: (day: number) => void;
}

const ITEM_WIDTH = 44;
const GAP = 16;
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

  return (
    <div className="relative w-full py-4">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div
        ref={containerRef}
        className="w-full overflow-x-auto flex items-center no-scrollbar snap-x snap-mandatory"
        style={{
          gap: GAP,
          paddingLeft: `calc(50% - ${ITEM_WIDTH / 2}px)`,
          paddingRight: `calc(50% - ${ITEM_WIDTH / 2}px)`,
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
                "relative flex-shrink-0 snap-center flex flex-col items-center justify-center transition-all duration-300",
                "w-[44px] h-[60px]",
                isFuture && "opacity-30 pointer-events-none",
              )}
            >
              {/* Selected glow background */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-xl -z-10"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #f59e0b)',
                    filter: 'blur(8px)',
                    opacity: 0.6
                  }}
                />
              )}

              {/* Number */}
              <span className={cn(
                "text-xl font-bold tabular-nums transition-all",
                isSelected ? "text-white scale-125" :
                  isCompleted ? "text-emerald-400" :
                    isMissed ? "text-red-400/60" :
                      "text-white/40"
              )}>
                {day}
              </span>

              {/* Indicators */}
              <div className="h-3 flex items-center justify-center mt-1">
                {!isSelected && isCompleted && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
                {!isSelected && isMissed && (
                  <div className="w-1 h-1 rounded-full bg-red-400/60" />
                )}
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
