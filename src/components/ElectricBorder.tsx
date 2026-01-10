'use client';

import { useMemo } from 'react';

interface ElectricBorderProps {
    forgeLevel: number; // 0-7
    artifactId?: string;
}

export function ElectricBorder({ forgeLevel, artifactId }: ElectricBorderProps) {
    // No effect at level 0
    if (forgeLevel === 0) return null;

    // Scale intensity based on forge level (1-7)
    const intensity = forgeLevel / 7;

    // Use specific WebP if artifactId is present (format: artifact_001)
    const borderSrc = useMemo(() => {
        if (artifactId && artifactId.includes('_')) {
            const id = artifactId.split('_')[1];
            return `/effects/electric-border-${id}.webp`;
        }
        return "/effects/electric-border.webp";
    }, [artifactId]);

    // Calculate dynamic styles based on forge level
    const styles = useMemo(() => {
        // Base opacity
        const opacity = 0.5 + (intensity * 0.5);

        // Brightness increases with level
        const brightness = 0.8 + (intensity * 0.7); // 0.8 to 1.5

        return {
            opacity,
            filter: `brightness(${brightness})`,
        };
    }, [intensity]);

    return (
        <>
            {/* Pre-rendered Animated WebP - 90fps for smooth fire fill look */}
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
                    zIndex: 1, // Sits behind the weapon-image but on the card face
                }}
            />
        </>
    );
}
