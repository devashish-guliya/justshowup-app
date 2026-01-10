'use client';

import { useMemo } from 'react';

// Fire colors matched to each artifact (for the glow effect)
const FIRE_COLORS: Record<string, string> = {
    '001': '#686673', // Iron Wayfarer - Grey Slate
    '002': '#f8f4ea', // River Guide - Warm White/Parchment
    '003': '#0c1522', // Wind's Reach - Midnight Blue
    '004': '#ffd700', // Sun Ward - Pure Gold
    '005': '#76ff03', // Forest Path - Neon Lime
    '006': '#7b8cde', // Night Watch - Silver Blue
    '007': '#ff7f6e', // Sky Beam - Coral Pink
    '008': '#cd8500', // Stone Heart - Bronze
    '009': '#9b59b6', // Silver Silence - Purple
    '010': '#5dade2', // Star Map - Ice Blue
    '011': '#48c9b0', // Tiding Arc - Turquoise
    '012': '#ffa500', // Eclipse Core - Golden Fire
    '013': '#e056fd', // Infinite Edge - Cosmic Magenta
};

interface ElectricBorderProps {
    forgeLevel: number; // 0-7
    artifactId?: string;
}

export function ElectricBorder({ forgeLevel, artifactId }: ElectricBorderProps) {
    // No effect at level 0
    if (forgeLevel === 0) return null;

    // Scale intensity based on forge level (1-7)
    const intensity = forgeLevel / 7;

    // Get the fire color for this artifact (used for glow)
    const fireColor = useMemo(() => {
        if (artifactId && artifactId.includes('_')) {
            const id = artifactId.split('_')[1];
            return FIRE_COLORS[id] || '#ff6b00';
        }
        return '#ff6b00'; // Default orange
    }, [artifactId]);

    // Calculate dynamic styles based on forge level
    const glowSpread = 30 + (intensity * 50); // 30px to 80px
    const glowOpacity = 0.4 + (intensity * 0.4); // 0.4 to 0.8

    return (
        <>
            {/* Simple ambient glow behind the card */}
            <div
                className="absolute pointer-events-none"
                style={{
                    inset: 0,
                    borderRadius: '20px',
                    background: 'transparent',
                    boxShadow: `
                        0 0 ${glowSpread}px ${fireColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')},
                        0 0 ${glowSpread * 2}px ${fireColor}${Math.round(glowOpacity * 0.5 * 255).toString(16).padStart(2, '0')}
                    `,
                    zIndex: -1,
                    animation: `emberPulse ${2 - intensity}s ease-in-out infinite alternate`,
                }}
            />
        </>
    );
}


