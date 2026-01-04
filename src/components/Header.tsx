'use client';

interface HeaderProps {
  dayNumber: number;
  maxDays?: number;
}

export function Header({ dayNumber, maxDays = 365 }: HeaderProps) {
  return (
    <header className="header">
      <div className="brand">
        JUSTSHOW<span>UP</span>
      </div>
      <div className="day-counter">
        DAY {dayNumber}<span>/{maxDays}</span>
      </div>
    </header>
  );
}


