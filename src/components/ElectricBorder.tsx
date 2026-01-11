'use client';

import { useMemo } from 'react';

// Fire colors matched to each artifact
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

    // Get the fire color for this artifact
    const fireColor = '#ff5500'; // Orange electric current

    // Universal border for all weapons
    const borderSrc = "/effects/electric-border-orange.webp";

    // Calculate dynamic styles based on forge level
    const styles = useMemo(() => {
        // Base opacity
        const opacity = 0.6 + (intensity * 0.4); // 0.6 to 1.0

        // Brightness increases with level
        const brightness = 1.0 + (intensity * 0.3); // 1.0 to 1.3

        // Glow intensity scales with forge level
        const glowSpread = 15 + (intensity * 25); // 15px to 40px
        const glowOpacity = 0.3 + (intensity * 0.3); // 0.3 to 0.6

        return {
            opacity,
            filter: `brightness(${brightness})`,
            glowSpread,
            glowOpacity,
        };
    }, [intensity]);

    return (
        <>
            {/* Ember Glow - Subtle ambient light */}
            <div
                className="absolute pointer-events-none"
                style={{
                    inset: 0,
                    borderRadius: '20px',
                    boxShadow: `
                        0 0 ${styles.glowSpread}px ${fireColor}${Math.round(styles.glowOpacity * 255).toString(16).padStart(2, '0')},
                        0 0 ${styles.glowSpread * 2}px ${fireColor}${Math.round(styles.glowOpacity * 0.5 * 255).toString(16).padStart(2, '0')}
                    `,
                    zIndex: -1,
                    animation: `emberPulse ${2 - intensity}s ease-in-out infinite alternate`,
                    transform: 'translateZ(-10px)',
                    opacity: 0.5,
                }}
            />

            {/* Thin animated electric current border */}
            <img
                src={borderSrc}
                alt=""
                className="absolute pointer-events-none"
                style={{
                    width: '110.35%',
                    height: '106.954%',
                    maxWidth: 'none',
                    left: '-5.555%',
                    top: '-3.703%',
                    opacity: styles.opacity,
                    filter: styles.filter,
                    objectFit: 'fill',
                    imageRendering: 'auto',
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    zIndex: 1,
                    transform: 'translateZ(-5px)', // Parallax depth
                }}
            />
        </>
    );
}
