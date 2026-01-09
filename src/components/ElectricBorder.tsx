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

    // Calculate dynamic styles based on forge level
    const styles = useMemo(() => {
        // Base opacity
        const opacity = 0.5 + (intensity * 0.5);

        // Brightness increases with level
        const brightness = 0.8 + (intensity * 0.7); // 0.8 to 1.5

        // Drop shadow glow - stronger at higher levels
        const glowBlur = 10 + (intensity * 20); // 10px to 30px
        const glowOpacity = 0.3 + (intensity * 0.4); // 0.3 to 0.7

        return {
            opacity,
            filter: `brightness(${brightness}) drop-shadow(0 0 ${glowBlur}px rgba(221, 132, 72, ${glowOpacity}))`,
        };
    }, [intensity]);

    return (
        <>
            {/* Pre-rendered Animated WebP - 20fps for heavy dramatic look */}
            {/* Position extends outside card to match the glow overflow */}
            <img
                src="/effects/electric-border.webp"
                alt=""
                className="absolute pointer-events-none z-10"
                style={{
                    // The webp was captured with 20px padding
                    // Inner content 360x540 (2:3), Outer 400x580
                    // To align inner content with card edge:
                    // We need -20px offset on all sides
                    // The webp is 400x580 with 360x540 inner content
                    // Width ratio: 400/360 = 1.1111 (111.11%)
                    // Height ratio: 580/540 = 1.0741 (107.41%)
                    // This ensures the inner content aligns perfectly with the card edge
                    width: '111.12%',
                    height: '107.41%',
                    maxWidth: 'none', // Override global img max-width: 100%
                    left: '-5.56%',
                    top: '-3.7%',
                    right: 'auto',
                    bottom: 'auto',
                    opacity: styles.opacity,
                    filter: styles.filter,
                    objectFit: 'fill',
                    mixBlendMode: 'screen',
                }}
            />

            {/* Background ambient glow - intensifies with level */}
            <div
                className="absolute pointer-events-none"
                style={{
                    inset: '-30px',
                    filter: `blur(${30 + (intensity * 20)}px)`,
                    opacity: intensity * 0.3,
                    zIndex: -1,
                    background: 'linear-gradient(-30deg, #dd8448, transparent, #dd8448)',
                }}
            />
        </>
    );
}
