'use client';

interface HeaderProps {
  dayNumber: number;
  maxDays?: number;
}

export function Header({ dayNumber, maxDays = 365 }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <span className="header-label">YOUR JOURNEY</span>
        <div className="header-day">
          DAY {dayNumber}<span className="header-max">/ {maxDays}</span>
        </div>
      </div>
    </header>
  );
}



