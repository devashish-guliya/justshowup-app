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
        <>
            {/* Border Outer - subtle static border */}
            <div
                className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 10,
                }}
            />

            {/* Electric Border - EXTENDS OUTSIDE card, gets turbulent filter */}
            <div
                className="absolute rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    inset: '-4px',
                    border: '2px solid #dd8448',
                    filter: 'url(#turbulent-displace)',
                    opacity: opacity,
                    zIndex: 11,
                }}
            />

            {/* Glow Layer 1 - sharp glow */}
            <div
                className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    border: '2px solid #dd8448',
                    filter: 'blur(1px)',
                    opacity: opacity * 0.6,
                    zIndex: 12,
                }}
            />

            {/* Glow Layer 2 - diffuse glow */}
            <div
                className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    border: '2px solid #dd8448',
                    filter: 'blur(8px)',
                    opacity: opacity * 0.8,
                    zIndex: 9,
                }}
            />

            {/* Background Glow - ambient light behind card */}
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
