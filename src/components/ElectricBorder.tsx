'use client';

import { useMemo } from 'react';

interface ElectricBorderProps {
    forgeLevel: number; // 0-7
}

export function ElectricBorder({ forgeLevel }: ElectricBorderProps) {
    // No effect at level 0
    if (forgeLevel === 0) return null;

    // Scale intensity based on forge level (1-7)
    const intensity = forgeLevel / 7;
    const opacity = useMemo(() => 0.5 + (intensity * 0.5), [intensity]); // 0.5 to 1.0

    return (
        <>
            {/* Pre-rendered Animated WebP - 30fps for smooth playback */}
            {/* Position extends outside card to match the glow overflow */}
            <img
                src="/effects/electric-border.webp"
                alt=""
                className="absolute pointer-events-none z-10"
                style={{
                    // The webp was captured with 20px padding on all sides
                    // So we need to offset by that amount and stretch to fill
                    top: '-20px',
                    left: '-20px',
                    width: 'calc(100% + 40px)',
                    height: 'calc(100% + 40px)',
                    opacity: opacity,
                    objectFit: 'fill',
                }}
            />

            {/* Background ambient glow */}
            <div
                className="absolute pointer-events-none"
                style={{
                    inset: '-30px',
                    filter: 'blur(40px)',
                    opacity: intensity * 0.25,
                    zIndex: -1,
                    background: 'linear-gradient(-30deg, #dd8448, transparent, #dd8448)',
                }}
            />
        </>
    );
}
