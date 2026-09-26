import React from 'react';

interface HKIconProps {
  className?: string;
  size?: number | string;
  glow?: boolean;
  withText?: boolean;
}

export const HKIcon: React.FC<HKIconProps> = ({
  className = 'h-10 w-10',
  size,
  glow = true,
  withText = false,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={style}
    >
      <svg
        viewBox="0 0 512 512"
        className="w-full h-full drop-shadow-md select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="hk-bg-grad" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#142247" />
            <stop offset="50%" stopColor="#0a1226" />
            <stop offset="100%" stopColor="#040814" />
          </radialGradient>

          <linearGradient id="hk-gold-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCEBA6" />
            <stop offset="25%" stopColor="#DCA22B" />
            <stop offset="50%" stopColor="#FFF2B8" />
            <stop offset="75%" stopColor="#9E6D10" />
            <stop offset="100%" stopColor="#ECC65F" />
          </linearGradient>

          <linearGradient id="hk-gold-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF5C2" />
            <stop offset="20%" stopColor="#E5AF36" />
            <stop offset="45%" stopColor="#FFF9D6" />
            <stop offset="70%" stopColor="#B57F14" />
            <stop offset="85%" stopColor="#8F5E05" />
            <stop offset="100%" stopColor="#F2D179" />
          </linearGradient>

          <linearGradient id="hk-bevel-light" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#FDE89C" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#9C6B08" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="hk-bevel-dark" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A3102" />
            <stop offset="100%" stopColor="#1A1100" />
          </linearGradient>

          {glow && (
            <filter id="hk-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#D4A029" floodOpacity="0.38" />
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          )}
        </defs>

        {/* Base Squircle Container */}
        <rect width="512" height="512" rx="120" fill="url(#hk-bg-grad)" />

        {/* Outer Decorative Concentric Gold Rings */}
        <circle cx="256" cy="256" r="226" fill="none" stroke="url(#hk-gold-ring)" strokeWidth="4.5" opacity="0.95" />
        <circle cx="256" cy="256" r="214" fill="none" stroke="url(#hk-gold-ring)" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.7" />
        <circle cx="256" cy="256" r="202" fill="none" stroke="#ECC65F" strokeWidth="0.8" opacity="0.35" />

        {/* Central Ambient Glow */}
        <circle cx="256" cy="256" r="140" fill="#DCA22B" opacity="0.12" />

        {/* Mini Top Crown / Emblem Accents */}
        <g transform="translate(256, 105)" filter={glow ? 'url(#hk-gold-glow)' : undefined}>
          <polygon points="0,-16 -12,2 0,-4 12,2" fill="url(#hk-gold-metallic)" />
          <circle cx="0" cy="-22" r="4.5" fill="#FFF8D6" />
          <circle cx="-16" cy="-14" r="3.5" fill="url(#hk-gold-ring)" />
          <circle cx="16" cy="-14" r="3.5" fill="url(#hk-gold-ring)" />
        </g>

        {/* The Monogram 'HK' in High-Relief Beveled Gold */}
        <g filter={glow ? 'url(#hk-gold-glow)' : undefined}>
          {/* LEFT PILLAR OF 'H' */}
          <path d="M 124 150 L 172 150 L 172 362 L 124 362 Z" fill="url(#hk-gold-metallic)" />
          <path d="M 124 150 L 136 160 L 136 352 L 124 362 Z" fill="url(#hk-bevel-light)" />
          <path d="M 160 160 L 172 150 L 172 362 L 160 352 Z" fill="url(#hk-bevel-dark)" opacity="0.4" />

          {/* CROSSBAR OF 'H' */}
          <path d="M 172 232 L 274 232 L 274 278 L 172 278 Z" fill="url(#hk-gold-metallic)" />
          <path d="M 172 232 L 274 232 L 264 242 L 172 242 Z" fill="url(#hk-bevel-light)" />
          <path d="M 172 268 L 264 268 L 274 278 L 172 278 Z" fill="url(#hk-bevel-dark)" opacity="0.45" />

          {/* CENTRAL SPINE OF 'H' & BACKBONE OF 'K' */}
          <path d="M 226 150 L 274 150 L 274 362 L 226 362 Z" fill="url(#hk-gold-metallic)" />
          <path d="M 226 150 L 238 160 L 238 352 L 226 362 Z" fill="url(#hk-bevel-light)" />
          <path d="M 262 160 L 274 150 L 274 362 L 262 352 Z" fill="url(#hk-bevel-dark)" opacity="0.4" />

          {/* UPPER DIAGONAL WING OF 'K' */}
          <path d="M 262 254 L 358 150 L 408 150 L 302 264 Z" fill="url(#hk-gold-metallic)" />
          <path d="M 262 254 L 358 150 L 372 150 L 282 250 Z" fill="url(#hk-bevel-light)" />
          <path d="M 288 266 L 392 162 L 408 150 L 302 264 Z" fill="url(#hk-bevel-dark)" opacity="0.4" />

          {/* LOWER DIAGONAL LEG OF 'K' */}
          <path d="M 284 246 L 404 362 L 350 362 L 246 258 Z" fill="url(#hk-gold-metallic)" />
          <path d="M 284 246 L 350 362 L 334 362 L 272 252 Z" fill="url(#hk-bevel-light)" />
          <path d="M 390 350 L 404 362 L 350 362 L 374 340 Z" fill="url(#hk-bevel-dark)" opacity="0.4" />
        </g>

        {/* Metallic Diamond Highlights */}
        <polygon points="124,150 134,142 144,150 134,158" fill="#FFFFFF" opacity="0.9" />
        <polygon points="408,150 416,144 424,150 416,156" fill="#FFFFFF" opacity="0.95" />
        <polygon points="404,362 412,356 420,362 412,368" fill="#FFFFFF" opacity="0.9" />

        {/* Optional Subtext inside SVG */}
        {withText && (
          <g transform="translate(256, 422)">
            <text
              textAnchor="middle"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="24"
              fontWeight="900"
              letterSpacing="8"
              fill="url(#hk-gold-ring)"
            >
              HISAB KITAB
            </text>
            <text
              y="22"
              textAnchor="middle"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="12"
              fontWeight="700"
              letterSpacing="3"
              fill="#94A3B8"
            >
              SMART BILLING
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
