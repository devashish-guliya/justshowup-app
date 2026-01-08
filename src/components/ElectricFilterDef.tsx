'use client';

// This component should be rendered ONCE in layout.tsx
// It defines the SVG filter globally so it's not recreated on re-renders
export function ElectricFilterDef() {
    return (
        <svg
            className="fixed w-0 h-0 pointer-events-none"
            aria-hidden="true"
            style={{ position: 'absolute', top: 0, left: 0 }}
        >
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
                        numOctaves="6"
                        result="noise1"
                        seed="1"
                    />
                    <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                        <animate
                            attributeName="dy"
                            values="500; 0"
                            dur="8s"
                            repeatCount="indefinite"
                            calcMode="linear"
                        />
                    </feOffset>

                    <feTurbulence
                        type="turbulence"
                        baseFrequency="0.02"
                        numOctaves="6"
                        result="noise2"
                        seed="1"
                    />
                    <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                        <animate
                            attributeName="dy"
                            values="0; -500"
                            dur="8s"
                            repeatCount="indefinite"
                            calcMode="linear"
                        />
                    </feOffset>

                    <feTurbulence
                        type="turbulence"
                        baseFrequency="0.02"
                        numOctaves="6"
                        result="noise3"
                        seed="2"
                    />
                    <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
                        <animate
                            attributeName="dx"
                            values="350; 0"
                            dur="8s"
                            repeatCount="indefinite"
                            calcMode="linear"
                        />
                    </feOffset>

                    <feTurbulence
                        type="turbulence"
                        baseFrequency="0.02"
                        numOctaves="6"
                        result="noise4"
                        seed="2"
                    />
                    <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
                        <animate
                            attributeName="dx"
                            values="0; -350"
                            dur="8s"
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
                        scale="20"
                        xChannelSelector="R"
                        yChannelSelector="B"
                    />
                </filter>
            </defs>
        </svg>
    );
}
