import { useState, useEffect, useRef } from 'react';

interface WeekSliderProps {
  currentDayNumber: number;
  weekNumber: number; // Keeping for interface compat, but we calculate view based on selection
  selectedDay: number;
  completedDays: boolean[];
  onSelectDay: (day: number) => void;
}

export function WeekSlider({
  currentDayNumber,
  selectedDay,
  completedDays,
  onSelectDay
}: WeekSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Total days to show (e.g. up to 365, or just what's relevant)
  // Let's show up to current week + maybe 1 next week if available
  const maxDayVisible = Math.ceil(currentDayNumber / 7) * 7;
  const totalWeeks = Math.ceil(maxDayVisible / 7);

  // Scroll into view whenever selectedDay changes or on mount
  useEffect(() => {
    if (scrollRef.current) {
      const pageIndex = Math.floor((selectedDay - 1) / 7);
      const pageWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: pageIndex * pageWidth,
        behavior: 'smooth'
      });
    }
  }, [selectedDay]);

  return (
    <div className="week-slider-container" ref={scrollRef}>
      {Array.from({ length: totalWeeks }, (_, weekIdx) => {
        const weekStartDay = weekIdx * 7 + 1;

        return (
          <div key={weekIdx} className="week-page">
            {Array.from({ length: 7 }, (_, dayIdx) => {
              const dayNumber = weekStartDay + dayIdx;
              const isSelected = dayNumber === selectedDay;
              const isFuture = dayNumber > currentDayNumber;

              // Simple check for completion: 
              // If it's in the CURRENT week, we can use completedDays array.
              // Otherwise, we'd need history. For now, let's derive it or mark missed.
              const isCurrentWeek = weekIdx === Math.floor((currentDayNumber - 1) / 7);
              const isDone = isCurrentWeek ? completedDays[dayIdx] : (dayNumber < currentDayNumber);
              const isMissed = dayNumber < currentDayNumber && !isDone;

              const classes = [
                'day-pill',
                isSelected && 'selected',
                isFuture && 'future',
                isDone && !isFuture && 'completed',
                isMissed && 'missed'
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={dayNumber}
                  onClick={() => !isFuture && onSelectDay(dayNumber)}
                  disabled={isFuture}
                  className={classes}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
