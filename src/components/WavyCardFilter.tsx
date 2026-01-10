'use client';

/**
 * WavyCardFilter - Embeds an animated SVG turbulence filter
 * that can be applied to any element to make its edges wavy and flowing.
 * 
 * Usage: Include this component once in your app, then use
 * style={{ filter: 'url(#wavy-card-filter)' }} on any element.
 */
export function WavyCardFilter() {
    return (
        <svg
            aria-hidden="true"
            style={{
                position: 'absolute',
                width: 0,
                height: 0,
                overflow: 'hidden',
                pointerEvents: 'none'
            }}
        >
            <defs>
                <filter
                    id="wavy-card-filter"
                    colorInterpolationFilters="sRGB"
                    x="-5%"
                    y="-5%"
                    width="110%"
                    height="110%"
                >
                    {/* First turbulence layer - vertical flow */}
                    <feTurbulence
                        type="turbulence"
                        baseFrequency="0.015"
                        numOctaves="3"
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

                    {/* Second turbulence layer - opposite direction */}
                    <feTurbulence
                        type="turbulence"
                        baseFrequency="0.015"
                        numOctaves="3"
                        result="noise2"
                        seed="2"
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

                    {/* Blend both noise layers */}
                    <feComposite
                        in="offsetNoise1"
                        in2="offsetNoise2"
                        operator="arithmetic"
                        k1="0.5" k2="0.5" k3="0" k4="0"
                        result="combinedNoise"
                    />

                    {/* Apply displacement - subtle effect for card edges */}
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="combinedNoise"
                        scale="8"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </defs>
        </svg>
    );
}
