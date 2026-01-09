'use client';

interface HeaderProps {
  dayNumber: number;
  maxDays?: number;
}

export function Header({ dayNumber, maxDays = 365 }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-split">
        <div className="header-brand">JUSTSHOWUP</div>
        <div className="header-day">
          DAY {dayNumber}<span className="header-max"> / {maxDays}</span>
        </div>
      </div>
    </header>
  );
}



