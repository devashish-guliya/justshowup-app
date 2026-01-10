'use client';

import { useMemo } from 'react';

interface ElectricBorderProps {
    forgeLevel: number; // 0-7
    artifactId?: string;
}

export function ElectricBorder({ forgeLevel, artifactId }: ElectricBorderProps) {
    // No effect at level 0
    if (forgeLevel === 0) return null;

    // Scale intensity based on forge level (1-7)
    const intensity = forgeLevel / 7;
    const opacity = 0.5 + (intensity * 0.5);
    const brightness = 0.8 + (intensity * 0.7);

    return (
        <img
            src="/effects/electric-border.webp"
            alt=""
            className="absolute pointer-events-none"
            style={{
                // Alignment to match card edges
                width: '111.111%',
                height: '107.407%',
                maxWidth: 'none',
                left: '-5.555%',
                top: '-3.703%',
                opacity: opacity,
                filter: `brightness(${brightness})`,
                objectFit: 'fill',
                imageRendering: 'auto',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                zIndex: 10, // ON TOP of weapon image
            }}
        />
    );
}


