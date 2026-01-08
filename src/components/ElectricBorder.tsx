'use client';

import { useMemo } from 'react';

interface ElectricBorderProps {
    forgeLevel: number; // 0-7
    color?: string;
}

export function ElectricBorder({ forgeLevel }: ElectricBorderProps) {
    // No effect at level 0
    if (forgeLevel === 0) return null;

    // Scale intensity based on forge level (1-7)
    const intensity = forgeLevel / 7;

    const opacity = useMemo(() => 0.4 + (intensity * 0.6), [intensity]); // 0.4 to 1.0

    return (
        <>
            {/* Pre-rendered Electric Border Video */}
            <video
                className="absolute pointer-events-none z-10"
                style={{
                    inset: '-5px',
                    width: 'calc(100% + 10px)',
                    height: 'calc(100% + 10px)',
                    objectFit: 'fill',
                    opacity: opacity,
                    mixBlendMode: 'screen',
                }}
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/effects/electric-border.webm" type="video/webm" />
            </video>

            {/* Static inner glow for depth */}
            <div
                className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none z-[11]"
                style={{
                    boxShadow: `inset 0 0 30px rgba(221, 132, 72, ${intensity * 0.3})`,
                }}
            />
        </>
    );
}
