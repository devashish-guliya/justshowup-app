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
    <div className="week-slider" id="week-slider">
      <div className="ruler-track">
        {Array.from({ length: 7 }, (_, i) => {
          const dayNumber = weekStartDay + i;
          const dayOfWeek = i + 1;
          const isSelected = dayNumber === selectedDay;
          const isFuture = dayNumber > currentDayNumber;
          const isCompleted = completedDays[i];

          const classes = [
            'ruler-tick',
            isSelected && 'selected',
            isFuture && 'future',
            isCompleted && !isSelected && 'completed',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={dayNumber}
              className={classes}
              onClick={() => !isFuture && onSelectDay(dayNumber)}
              id={`day-${dayNumber}`}
            >
              <div className="tick-label">{dayOfWeek}</div>
              <div className="tick-mark"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Scroll to center logic would be ideal here in useEffect */


