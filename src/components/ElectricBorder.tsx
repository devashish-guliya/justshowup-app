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

    // Memoize style calculations
    const styles = useMemo(() => ({
        opacity: 0.3 + (intensity * 0.7),
        glowSpread: 4 + (intensity * 16),
        borderOpacity: 0.5 + (intensity * 0.5),
        pulseSpeed: 3 - (intensity * 1.5), // Faster at higher levels
    }), [intensity]);

    return (
        <>
            {/* Animated Glow - uses CSS animation for smooth performance */}
            <div
                className="electric-glow"
                style={{
                    '--glow-color': color,
                    '--glow-opacity': styles.opacity,
                    '--glow-spread': `${styles.glowSpread}px`,
                    '--pulse-speed': `${styles.pulseSpeed}s`,
                } as React.CSSProperties}
            />

            {/* Static Inner Border */}
            <div
                className="electric-border-static"
                style={{
                    borderColor: color,
                    opacity: styles.borderOpacity,
                }}
            />

            {/* Background Ambient Glow */}
            <div
                className="electric-ambient"
                style={{
                    '--glow-color': color,
                    '--ambient-opacity': intensity * 0.3,
                } as React.CSSProperties}
            />
        </>
    );
}
