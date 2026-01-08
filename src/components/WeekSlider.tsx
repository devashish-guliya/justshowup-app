'use client';

import { getWeekStartDayNumber } from '@/lib/calendar';

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

  return (
    <div className="week-slider">
      {Array.from({ length: 7 }, (_, i) => {
        const dayNumber = weekStartDay + i;
        const dayOfWeek = i + 1;
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
            className={classes}
            onClick={() => !isFuture && onSelectDay(dayNumber)}
            disabled={isFuture}
          >
            {dayOfWeek}
          </button>
        );
      })}
    </div>
  );
}


