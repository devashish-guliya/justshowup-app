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
    // Universal White Glow
    const fireColor = '#FFFFFF';

    // Universal White Border for all weapons
    // We reuse the '001' file which was generated as Pure White
    const borderSrc = "/effects/electric-border-001.webp";

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
            {/* Ember Glow - Pulsing ambient light matching fire color */}
            <div
                className="absolute pointer-events-none transition-all duration-300 ease-out"
                style={{
                    inset: 0, // Match card edge exactly
                    borderRadius: '20px', // Match card radius precisely
                    boxShadow: `
                        0 0 ${styles.glowSpread}px ${fireColor}${Math.round(styles.glowOpacity * 255).toString(16).padStart(2, '0')},
                        0 0 ${styles.glowSpread * 2}px ${fireColor}${Math.round(styles.glowOpacity * 0.5 * 255).toString(16).padStart(2, '0')},
                        0 0 ${styles.glowSpread * 3}px ${fireColor}${Math.round(styles.glowOpacity * 0.25 * 255).toString(16).padStart(2, '0')}
                    `,
                    zIndex: -1,
                    animation: `emberPulse ${2 - intensity}s ease-in-out infinite alternate`,
                    transform: 'translateZ(-10px)', // Slight depth behind card
                    opacity: 0.8, // Constant strong visibility
                }}
            />

            {/* Wrapper for Positioning & Parallax Depth */}
            <div
                className="absolute pointer-events-none"
                style={{
                    width: '111.111%',
                    height: '107.407%',
                    left: '-5.555%',
                    top: '-3.703%',
                    zIndex: 1,
                    transform: 'translateZ(-5px)', // Stable Parallax Depth
                }}
            >
                {/* Visual Border Image - Handles Scaling & Filters */}
                <img
                    src={borderSrc}
                    alt=""
                    className="w-full h-full object-fill transition-all duration-300 ease-out scale-[0.96] group-hover:scale-[1.02]"
                    style={{
                        // MAX BRIGHTNESS SETTINGS
                        opacity: 1,
                        filter: `
                            drop-shadow(0 0 0 white) 
                            drop-shadow(0 0 0 white) 
                            drop-shadow(0 0 8px white)
                            brightness(2)
                        `,
                        mixBlendMode: 'normal',
                        imageRendering: 'auto',
                        WebkitBackfaceVisibility: 'hidden',
                        backfaceVisibility: 'hidden',
                    }}
                />
            </div>
        </>
    );
}
