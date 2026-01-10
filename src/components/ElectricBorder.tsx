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

    // Always use the single black border WebP for all weapons
    // The black blends with the background, making card edges appear wavy
    // Only the GLOW color changes per weapon
    const borderSrc = "/effects/electric-border.webp";

    // Calculate dynamic styles based on forge level
    const styles = useMemo(() => {
        // Base opacity
        const opacity = 0.5 + (intensity * 0.5);

        // Brightness increases with level
        const brightness = 0.8 + (intensity * 0.7); // 0.8 to 1.5

        // Glow intensity scales with forge level
        const glowSpread = 20 + (intensity * 40); // 20px to 60px
        const glowOpacity = 0.3 + (intensity * 0.4); // 0.3 to 0.7

        return {
            opacity,
            filter: `brightness(${brightness})`,
            glowSpread,
            glowOpacity,
        };
    }, [intensity]);

    return (
        <>
            {/* Black Wavy Border - ON TOP of card (z-index: 10)
                This sits above the weapon image and "masks" the straight edges.
                Since it's black and the page BG is black, it becomes invisible
                but makes the card's edges appear wavy! */}
            <img
                src={borderSrc}
                alt=""
                className="absolute pointer-events-none"
                style={{
                    // ALIGNMENT MATH:
                    // Capture Canvas: 400x580
                    // Card Area in Capture: 360x540 (at 20px,20px)
                    // Width Ratio: 400/360 = 111.111%
                    // Height Ratio: 580/540 = 107.407%
                    // Left Offset: -20/360 = -5.555%
                    // Top Offset: -20/540 = -3.703%

                    width: '111.111%',
                    height: '107.407%',
                    maxWidth: 'none',
                    left: '-5.555%',
                    top: '-3.703%',
                    opacity: styles.opacity,
                    filter: styles.filter,
                    objectFit: 'fill',
                    imageRendering: 'auto',
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    zIndex: 10, // ON TOP of weapon image
                }}
            />

            {/* Colored Glow - ON TOP of everything (z-index: 11)
                This is just box-shadow with transparent background.
                It adds ambient light without blocking the border! */}
            <div
                className="absolute pointer-events-none"
                style={{
                    inset: 0, // Match card edge exactly
                    borderRadius: '20px', // Match card radius precisely
                    background: 'transparent', // Crucial: no background!
                    boxShadow: `
                        0 0 ${styles.glowSpread}px ${fireColor}${Math.round(styles.glowOpacity * 255).toString(16).padStart(2, '0')},
                        0 0 ${styles.glowSpread * 2}px ${fireColor}${Math.round(styles.glowOpacity * 0.5 * 255).toString(16).padStart(2, '0')},
                        0 0 ${styles.glowSpread * 3}px ${fireColor}${Math.round(styles.glowOpacity * 0.25 * 255).toString(16).padStart(2, '0')}
                    `,
                    zIndex: 11, // ON TOP of the black border
                    animation: `emberPulse ${2 - intensity}s ease-in-out infinite alternate`,
                }}
            />
        </>
    );
}

