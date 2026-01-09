'use client';

import { useMemo } from 'react';
import Image from 'next/image';

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
            {/* Pre-rendered Animated WebP with transparent center */}
            <Image
                src="/effects/electric-border.webp"
                alt=""
                fill
                className="pointer-events-none z-10 object-fill"
                style={{
                    opacity: opacity,
                    margin: '-10px',
                    width: 'calc(100% + 20px)',
                    height: 'calc(100% + 20px)',
                }}
                unoptimized // Needed for animated WebP
                priority
            />

            {/* Background ambient glow */}
            <div
                className="absolute pointer-events-none"
                style={{
                    inset: '-20px',
                    filter: 'blur(32px)',
                    transform: 'scale(1.1)',
                    opacity: intensity * 0.2,
                    zIndex: -1,
                    background: 'linear-gradient(-30deg, #dd8448, transparent, #dd8448)',
                }}
            />
        </>
    );
}
