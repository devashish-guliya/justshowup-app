'use client';

import { getWeekStartDayNumber } from '@/lib/calendar';
import { useEffect } from 'react';

interface WeekSliderProps {
  currentDayNumber: number;
  weekNumber: number;
  selectedDay: number;
  completedDays: boolean[];
  onSelectDay: (day: number) => void;
}

export function WeekSlider({
  currentDayNumber,
  weekNumber,
  selectedDay,
  completedDays,
  onSelectDay
}: WeekSliderProps) {
  const weekStartDay = getWeekStartDayNumber(weekNumber);

  useEffect(() => {
    const selectedEl = document.getElementById(`day-${selectedDay}`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDay]);

  return (
    <div className="week-slider no-scrollbar">
      {Array.from({ length: 7 }, (_, i) => {
        const dayNumber = weekStartDay + i;
        const isSelected = dayNumber === selectedDay;
        const isFuture = dayNumber > currentDayNumber;
        const isCompleted = completedDays[i];

        const classes = [
          'day-pill',
          isSelected && 'selected',
          isFuture && 'future',
          isCompleted && !isSelected && 'completed',
        ].filter(Boolean).join(' ');

        return (
          <button
            key={dayNumber}
            id={`day-${dayNumber}`}
            className={classes}
            onClick={() => !isFuture && onSelectDay(dayNumber)}
            disabled={isFuture}
          >
            {dayNumber}
          </button>
        );
      })}
    </div>
  );
}

/* Scroll to center logic would be ideal here in useEffect */


