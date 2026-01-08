'use client';

import { useMemo } from 'react';

interface ElectricBorderProps {
    forgeLevel: number; // 0-7
    color?: string;
}

// For now, we use CSS-based glow since we need to generate the video asset
// Once we have /public/effects/electric-border.webm, we can switch to video
export function ElectricBorder({ forgeLevel, color = '#dd8448' }: ElectricBorderProps) {
    // No effect at level 0
    if (forgeLevel === 0) return null;

    const intensity = forgeLevel / 7;

    const styles = useMemo(() => ({
        glowOpacity: 0.3 + (intensity * 0.7),
        glowSpread: 4 + (intensity * 12),
        pulseSpeed: 3 - (intensity * 1.5),
    }), [intensity]);

    return (
        <>
            {/* Animated Glow Border - CSS-based, smooth */}
            <div
                className="electric-glow-ring"
                style={{
                    '--glow-color': color,
                    '--glow-opacity': styles.glowOpacity,
                    '--glow-spread': `${styles.glowSpread}px`,
                    '--pulse-speed': `${styles.pulseSpeed}s`,
                } as React.CSSProperties}
            />

            {/* Static inner glow */}
            <div
                className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none z-[12]"
                style={{
                    border: `1px solid ${color}`,
                    boxShadow: `inset 0 0 20px rgba(221, 132, 72, 0.2)`,
                    opacity: styles.glowOpacity * 0.5,
                }}
            />
        </>
    );
}
