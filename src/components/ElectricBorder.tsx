'use client';

interface ElectricBorderProps {
    forgeLevel: number; // 0-7
    color?: string;
}

export function ElectricBorder({ forgeLevel, color = '#f59e0b' }: ElectricBorderProps) {
    // No effect at level 0
    if (forgeLevel === 0) return null;

    // Scale intensity based on forge level (1-7)
    const intensity = forgeLevel / 7;
    const opacity = 0.3 + (intensity * 0.7); // 0.3 to 1.0
    const glowSpread = 2 + (intensity * 8); // 2px to 10px
    const borderOpacity = 0.4 + (intensity * 0.6); // 0.4 to 1.0

    return (
        <>
            {/* SVG Filter Definition */}
            <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
                <defs>
                    <filter
                        id="electric-turbulence"
                        colorInterpolationFilters="sRGB"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                    >
                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.02"
                            numOctaves="10"
                            result="noise1"
                            seed="1"
                        />
                        <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                            <animate
                                attributeName="dy"
                                values="700; 0"
                                dur="6s"
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </feOffset>

                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.02"
                            numOctaves="10"
                            result="noise2"
                            seed="1"
                        />
                        <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                            <animate
                                attributeName="dy"
                                values="0; -700"
                                dur="6s"
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </feOffset>

                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.02"
                            numOctaves="10"
                            result="noise3"
                            seed="2"
                        />
                        <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
                            <animate
                                attributeName="dx"
                                values="490; 0"
                                dur="6s"
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </feOffset>

                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.02"
                            numOctaves="10"
                            result="noise4"
                            seed="2"
                        />
                        <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
                            <animate
                                attributeName="dx"
                                values="0; -490"
                                dur="6s"
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </feOffset>

                        <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
                        <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
                        <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />

                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="combinedNoise"
                            scale={10 + (intensity * 20)} // 10-30 based on level
                            xChannelSelector="R"
                            yChannelSelector="B"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Glow Layer 2 (outer, more diffuse) */}
            <div
                className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    border: `2px solid ${color}`,
                    filter: `blur(${glowSpread}px)`,
                    opacity: opacity * 0.6,
                    zIndex: 9,
                }}
            />

            {/* Glow Layer 1 (inner, sharper) */}
            <div
                className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    border: `2px solid ${color}`,
                    filter: 'blur(1px)',
                    opacity: opacity * 0.8,
                    zIndex: 12,
                }}
            />

            {/* Electric Border (animated displacement) */}
            <div
                className="absolute rounded-[var(--radius-lg)] pointer-events-none"
                style={{
                    inset: '-4px',
                    border: `2px solid ${color}`,
                    filter: 'url(#electric-turbulence)',
                    opacity: borderOpacity,
                    zIndex: 11,
                }}
            />

            {/* Background Glow */}
            <div
                className="absolute pointer-events-none -z-10"
                style={{
                    inset: '-20px',
                    filter: `blur(${20 + (intensity * 12)}px)`,
                    transform: 'scale(1.1)',
                    opacity: intensity * 0.25,
                    background: `linear-gradient(-30deg, ${color}, transparent, ${color})`,
                }}
            />
        </>
    );
}
