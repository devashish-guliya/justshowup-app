'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { countWords } from '@/lib/word-count';
import { FORGE_FILL } from '@/lib/calendar';

// Demo state without database
const DEMO_WEAPONS = [
  { id: 'artifact_001', name: 'The Iron Wayfarer', category: 'Sword', rarity: 'Common' },
  { id: 'artifact_002', name: 'The River Guide', category: 'Staff', rarity: 'Common' },
  { id: 'artifact_003', name: "The Wind's Reach", category: 'Bow', rarity: 'Uncommon' },
];

const TARGET_WORDS = 50;
const CIRCUMFERENCE = 2 * Math.PI * 22;

export default function DemoPage() {
  // State
  const [journeyDay, setJourneyDay] = useState(1);
  const [weekNumber, setWeekNumber] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [forgeLevel, setForgeLevel] = useState(0);
  const [completedDays, setCompletedDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [entries, setEntries] = useState<Record<number, { text: string; completed: boolean }>>({});
  const [draft, setDraft] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentWeapon = DEMO_WEAPONS[0];

  // Word count
  const wordCount = countWords(draft);
  const isReady = wordCount >= TARGET_WORDS && !entries[selectedDay]?.completed;
  const isToday = selectedDay === journeyDay;

  // Calculate card size
  const updateCardSize = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const targetRatio = 2 / 3;
    let cardWidth: number, cardHeight: number;
    const widthBasedHeight = containerWidth / targetRatio;

    if (widthBasedHeight <= containerHeight) {
      cardWidth = containerWidth;
      cardHeight = widthBasedHeight;
    } else {
      cardHeight = containerHeight;
      cardWidth = containerHeight * targetRatio;
    }

    setCardSize({ width: Math.floor(cardWidth), height: Math.floor(cardHeight) });
  }, []);

  useEffect(() => {
    setMounted(true);
    updateCardSize();
    window.addEventListener('resize', updateCardSize);
    return () => window.removeEventListener('resize', updateCardSize);
  }, [updateCardSize]);

  // Load entry when day changes
  useEffect(() => {
    const entry = entries[selectedDay];
    setDraft(entry?.text || '');
    if (entry?.completed) {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [selectedDay, entries]);

  // Get week start day
  const weekStartDay = (weekNumber - 1) * 7 + 1;

  // Handle submit
  const handleSubmit = () => {
    if (!isReady || !isToday) return;

    const dayOfWeek = ((selectedDay - 1) % 7);
    const newCompletedDays = [...completedDays];
    newCompletedDays[dayOfWeek] = true;

    setCompletedDays(newCompletedDays);
    setForgeLevel(newCompletedDays.filter(Boolean).length);
    setEntries(prev => ({
      ...prev,
      [selectedDay]: { text: draft, completed: true }
    }));

    setTimeout(() => setIsFlipped(true), 200);
  };

  // Handle card click
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.closest('.word-counter')) return;
    setIsFlipped(!isFlipped);
  };

  // Progress ring
  const progress = Math.min(wordCount / TARGET_WORDS, 1);
  const strokeOffset = CIRCUMFERENCE * (1 - progress);

  // Weapon image URL
  const weaponImageUrl = `/weapons/art_001_day${forgeLevel}.png`;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="brand">JUSTSHOW<span>UP</span></div>
        <div className="day-counter">DAY {journeyDay}<span>/365</span></div>
      </header>

      {/* Week Slider */}
      <div className="week-slider">
        {Array.from({ length: 7 }, (_, i) => {
          const dayNumber = weekStartDay + i;
          const dayOfWeek = i + 1;
          const isSelected = dayNumber === selectedDay;
          const isFuture = dayNumber > journeyDay;
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
              onClick={() => !isFuture && setSelectedDay(dayNumber)}
              disabled={isFuture}
            >
              {dayOfWeek}
            </button>
          );
        })}
      </div>

      {/* Card Container */}
      <div className="card-container" ref={containerRef}>
        {mounted && cardSize.width > 0 && (
          <div
            className={`card ${isFlipped ? 'flipped' : ''}`}
            style={{ width: cardSize.width, height: cardSize.height }}
            onClick={handleCardClick}
          >
            {/* Front Face */}
            <div className="card-face card-front">
              <div className="front-header">
                <div className="entry-title">
                  {isToday ? "Today's Entry" : `Day ${selectedDay}`}
                </div>
                <div className="entry-subtitle">
                  {entries[selectedDay]?.completed
                    ? 'Entry complete! Tap to view your weapon.'
                    : 'Write 50 words to forge your weapon'}
                </div>
              </div>

              <div className="text-area-wrapper">
                <textarea
                  className="text-area"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="What's on your mind today?"
                  disabled={!isToday || entries[selectedDay]?.completed}
                />
              </div>

              <div className="front-footer">
                <button
                  className={`word-counter ${isReady ? 'ready' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubmit();
                  }}
                  disabled={!isReady}
                >
                  <svg viewBox="0 0 48 48">
                    <circle className="progress-ring" cx="24" cy="24" r="22" />
                    <circle
                      className="progress-fill"
                      cx="24"
                      cy="24"
                      r="22"
                      style={{ strokeDashoffset: strokeOffset }}
                    />
                  </svg>
                  <span className="count-text">
                    {isReady ? '🔥' : wordCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Back Face */}
            <div className="card-face card-back">
              <img
                className="weapon-image"
                src={weaponImageUrl}
                alt={currentWeapon.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/weapons/placeholder.svg';
                }}
              />
              <div className="forge-badge">
                <span>🔥</span>
                <span>{FORGE_FILL[forgeLevel]}% Forged</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="action-area">
        <div className="flip-hint">
          <span>👆</span>
          <span>{isFlipped ? 'Tap to write' : 'Tap card to flip'}</span>
        </div>
      </div>

      {/* Demo Controls */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        background: 'rgba(0,0,0,0.9)',
        padding: '8px 16px',
        borderRadius: '20px',
        zIndex: 1000,
      }}>
        <button
          onClick={() => setJourneyDay(Math.max(1, journeyDay - 1))}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ◀ Prev Day
        </button>
        <span style={{ color: 'white', padding: '0 8px' }}>|</span>
        <button
          onClick={() => {
            const newDay = journeyDay + 1;
            setJourneyDay(newDay);
            setSelectedDay(newDay);
            if (newDay > weekNumber * 7) {
              setWeekNumber(weekNumber + 1);
              setForgeLevel(0);
              setCompletedDays([false, false, false, false, false, false, false]);
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Next Day ▶
        </button>
      </div>
    </div>
  );
}

