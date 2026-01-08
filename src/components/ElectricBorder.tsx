'use client';

import { useMemo } from 'react';

interface ElectricBorderProps {
    forgeLevel: number; // 0-7
    color?: string;
}

export function ElectricBorder({ forgeLevel, color = '#f59e0b' }: ElectricBorderProps) {
    // No effect at level 0
    if (forgeLevel === 0) return null;

    // Scale intensity based on forge level (1-7)
    const intensity = forgeLevel / 7;

    // Memoize all style calculations
    const styles = useMemo(() => ({
        opacity: 0.3 + (intensity * 0.7),
        glowSpread: 2 + (intensity * 8),
        borderOpacity: 0.4 + (intensity * 0.6),
    }), [intensity]);

    return (
        <>
            {/* Outer Glow (diffuse) */}
            <div
                className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    border: `2px solid ${color}`,
                    filter: `blur(${styles.glowSpread}px)`,
                    opacity: styles.opacity * 0.6,
                    zIndex: 9,
                }}
            />

            {/* Inner Glow (sharper) */}
            <div
                className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    border: `2px solid ${color}`,
                    filter: 'blur(1px)',
                    opacity: styles.opacity * 0.8,
                    zIndex: 12,
                }}
            />

            {/* Electric Border - uses global filter */}
            <div
                className="absolute rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    inset: '-4px',
                    border: `2px solid ${color}`,
                    filter: 'url(#electric-turbulence)',
                    opacity: styles.borderOpacity,
                    zIndex: 11,
                }}
            />

            {/* Background Ambient Glow */}
            <div
                className="absolute pointer-events-none"
                style={{
                    inset: '-20px',
                    filter: `blur(${20 + (intensity * 12)}px)`,
                    transform: 'scale(1.1)',
                    opacity: intensity * 0.25,
                    background: `linear-gradient(-30deg, ${color}, transparent, ${color})`,
                    zIndex: -1,
                }}
            />
        </>
    );
}
