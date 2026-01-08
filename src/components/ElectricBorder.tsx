'use client';

import { useMemo } from 'react';

interface ElectricBorderProps {
    forgeLevel: number; // 0-7
    color?: string;
}

export function ElectricBorder({ forgeLevel, color = '#dd8448' }: ElectricBorderProps) {
    // No effect at level 0
    if (forgeLevel === 0) return null;

    // Scale intensity based on forge level (1-7)
    const intensity = forgeLevel / 7;

    // Memoize all calculations
    const styles = useMemo(() => ({
        borderOpacity: 0.3 + (intensity * 0.7), // 0.3 to 1.0
        glowOpacity: 0.2 + (intensity * 0.4),   // 0.2 to 0.6
        bgGlowOpacity: 0.1 + (intensity * 0.2), // 0.1 to 0.3
    }), [intensity]);

    return (
        <>
            {/* Border Outer - static subtle border */}
            <div
                className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    border: `2px solid rgba(221, 132, 72, 0.5)`,
                    zIndex: 8,
                }}
            />

            {/* Main Electric Card - THIS gets the turbulent filter */}
            <div
                className="absolute rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    inset: '-4px',
                    border: `2px solid ${color}`,
                    filter: 'url(#turbulent-displace)',
                    opacity: styles.borderOpacity,
                    zIndex: 9,
                }}
            />

            {/* Glow Layer 1 - subtle blur, NO filter */}
            <div
                className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    border: `2px solid rgba(221, 132, 72, 0.6)`,
                    filter: 'blur(1px)',
                    opacity: styles.glowOpacity,
                    zIndex: 10,
                }}
            />

            {/* Glow Layer 2 - more blur, NO filter */}
            <div
                className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    border: `2px solid ${color}`,
                    filter: 'blur(4px)',
                    opacity: styles.glowOpacity * 0.8,
                    zIndex: 11,
                }}
            />

            {/* Background Glow - ambient light */}
            <div
                className="absolute pointer-events-none"
                style={{
                    inset: '0',
                    borderRadius: 'var(--radius-lg)',
                    filter: 'blur(32px)',
                    transform: 'scale(1.1)',
                    opacity: styles.bgGlowOpacity,
                    zIndex: -1,
                    background: `linear-gradient(-30deg, ${color}, transparent, ${color})`,
                }}
            />
        </>
    );
}
