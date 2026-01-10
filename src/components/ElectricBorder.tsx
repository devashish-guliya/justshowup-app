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
                    // The webp is 400x580. The card area it covers should be centered.
                    // We need to match the generation script's offsets.
                    // Generation: top: -10, left: -10, right: -6, bottom: -6
                    // This means the border container is slightly wider/taller than the card.
                    width: 'calc(100% + 16px)', // -10 left + -6 right = 16px extra width
                    height: 'calc(100% + 16px)', // -10 top + -6 bottom = 16px extra height
                    maxWidth: 'none',
                    left: '-10px',
                    top: '-10px',
                    opacity: styles.opacity,
                    filter: styles.filter,
                    objectFit: 'fill',
                    imageRendering: 'auto',
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    zIndex: 1, // Behind the weapon-image but on the card face
                }}
            />
        </>
    );
}
