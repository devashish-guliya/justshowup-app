'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useJournalStore } from '@/stores/journal-store';
import { FORGE_FILL } from '@/lib/calendar';

// Add CSS for animation overlay
import '../app/globals.css';

interface ForgeCardProps {
  isToday: boolean;
  entryContent: string;
  isComplete: boolean;
  weaponImageUrl: string;
  weaponName: string;
  forgeLevel: number;
  onSubmit: (content: string) => Promise<string | undefined>; // Return animation URL
  placeholder?: string;
}

const CIRCUMFERENCE = 2 * Math.PI * 22;
const TARGET_WORDS = 50;

export function ForgeCard({
  isToday,
  entryContent,
  isComplete,
  weaponImageUrl,
  weaponName,
  forgeLevel,
  onSubmit,
  placeholder = "What's on your mind today?",
}: ForgeCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  const [animationUrl, setAnimationUrl] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const {
    draft,
    setDraft,
    wordCount,
    isSubmitting,
    setSubmitting,
    isFlipped,
    setFlipped,
    toggleFlip,
  } = useJournalStore();

  // Initialize draft with entry content
  useEffect(() => {
    if (entryContent && !draft) {
      setDraft(entryContent);
    }
  }, [entryContent, draft, setDraft]);

  // Auto-flip to back for completed entries (only if NOT playing animation)
  useEffect(() => {
    if (showAnimation) return;

    if (isComplete && !isToday) {
      setFlipped(true);
    } else if (isToday && !isComplete) {
      setFlipped(false);
    }
  }, [isComplete, isToday, setFlipped, showAnimation]);

  // Calculate card size to maintain 2:3 aspect ratio
  const updateCardSize = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const targetRatio = 2 / 3;
    let cardWidth: number;
    let cardHeight: number;

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
    updateCardSize();
    window.addEventListener('resize', updateCardSize);
    return () => window.removeEventListener('resize', updateCardSize);
  }, [updateCardSize]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
  };

  const handleSubmit = async () => {
    if (wordCount < TARGET_WORDS || !isToday || isComplete || isSubmitting) return;

    setSubmitting(true);
    try {
      const animUrl = await onSubmit(draft);

      if (animUrl) {
        setAnimationUrl(animUrl);
        setShowAnimation(true);

        // Play animation for 2.5s then flip
        setTimeout(() => {
          setShowAnimation(false);
          setFlipped(true);
          setAnimationUrl(null);
        }, 2500);
      } else {
        // Fallback if no animation
        setTimeout(() => {
          setFlipped(true);
        }, 200);
      }

    } catch (error) {
      console.error('Failed to submit entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.closest('.word-counter')) {
      return;
    }

    // Only allow manual flipping if the entry is complete
    if (isComplete && !showAnimation) {
      toggleFlip();
    }
  };

  const progress = Math.min(wordCount / TARGET_WORDS, 1);
  const strokeOffset = CIRCUMFERENCE * (1 - progress);
  const isReady = wordCount >= TARGET_WORDS && isToday && !isComplete && !isSubmitting;
  const forgePercent = FORGE_FILL[forgeLevel] || 0;

  return (
    <>
      <div className="card-container" ref={containerRef}>
        <div
          className={`card ${isFlipped ? 'flipped' : ''}`}
          ref={cardRef}
          style={{ width: cardSize.width, height: cardSize.height }}
          onClick={handleCardClick}
        >
          {/* Front Face - Text Entry */}
          <div className="card-face card-front">
            <div className="front-header">
              <div className="entry-title">
                {isToday ? "Today's Entry" : `Day Entry`}
              </div>
              <div className="entry-subtitle">
                {isComplete
                  ? 'Entry complete! Tap to view your weapon.'
                  : 'Write 50 words to forge your weapon'}
              </div>
            </div>

            <div className="text-area-wrapper">
              <textarea
                className="text-area"
                value={draft}
                onChange={handleInput}
                placeholder={placeholder}
                disabled={(!isToday || isComplete) && !showAnimation}
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
                  {isReady ? '🔥' : isSubmitting ? <span className="spinner" /> : wordCount}
                </span>
              </button>
            </div>
          </div>

          {/* Back Face - Weapon Reveal */}
          <div className="card-face card-back">
            <img
              className="weapon-image"
              src={weaponImageUrl}
              alt={weaponName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/weapons/placeholder.svg';
              }}
            />
            <div className="forge-badge">
              <span>🔥</span>
              <span>{forgePercent}% Forged</span>
            </div>
          </div>
        </div>

        {/* Animation Overlay */}
        {showAnimation && animationUrl && (
          <div
            className="animation-overlay"
            style={{
              width: cardSize.width,
              height: cardSize.height,
              position: 'absolute',
              zIndex: 9999,
              borderRadius: '24px',
              overflow: 'hidden',
              pointerEvents: 'none'
            }}
          >
            <img
              src={animationUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              alt="Forging..."
            />
          </div>
        )}
      </div>
    </>
  );
}
