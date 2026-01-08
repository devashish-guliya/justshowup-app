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
    const opacity = useMemo(() => 0.4 + (intensity * 0.6), [intensity]); // 0.4 to 1.0

    return (
        <iframe
            src="/effects/electric-border.html"
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            style={{
                border: 'none',
                opacity: opacity,
                borderRadius: 'var(--radius-lg)',
            }}
            title="Electric border effect"
            loading="eager"
        />
    );
}
