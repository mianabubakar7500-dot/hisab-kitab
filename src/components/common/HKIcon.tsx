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
          {/* Emerald Gradient matching user's iconHK */}
          <linearGradient id="hk-bg-grad-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0e8a5b" />
            <stop offset="35%" stopColor="#09734a" />
            <stop offset="70%" stopColor="#065436" />
            <stop offset="100%" stopColor="#023420" />
          </linearGradient>

          {/* Top Radial Highlight */}
          <radialGradient id="hk-top-glow" cx="50%" cy="20%" r="65%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
          </radialGradient>

          {/* Page White Gleam */}
          <linearGradient id="hk-page-gleam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="85%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Book Drop Shadow */}
          {glow ? (
            <filter id="hk-book-shadow" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#011910" floodOpacity="0.6" />
              <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#022a1b" floodOpacity="0.4" />
            </filter>
          ) : (
            <filter id="hk-book-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#022015" floodOpacity="0.4" />
            </filter>
          )}
        </defs>

        {/* 1. Squircle Emerald Container */}
        <rect x="28" y="28" width="456" height="456" rx="114" ry="114" fill="url(#hk-bg-grad-emerald)" />
        <rect x="28" y="28" width="456" height="456" rx="114" ry="114" fill="url(#hk-top-glow)" />
        
        {/* Subtle interior border ring */}
        <rect
          x="29"
          y="29"
          width="454"
          height="454"
          rx="113"
          ry="113"
          fill="none"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeOpacity="0.25"
        />

        {/* 2. Main Open Book 'H' Emblem */}
        <g filter="url(#hk-book-shadow)">
          {/* Left outer green book flap */}
          <path
            d="M 116 160 C 116 150, 122 144, 134 146 L 145 148 L 145 304 C 133 304, 116 300, 116 290 Z"
            fill="#16a34a"
          />
          <path
            d="M 116 162 C 116 152, 122 146, 132 148 L 142 150 L 142 300 C 130 300, 116 296, 116 288 Z"
            fill="#4ade80"
          />

          {/* Right outer green book flap */}
          <path
            d="M 396 160 C 396 150, 390 144, 378 146 L 367 148 L 367 304 C 379 304, 396 300, 396 290 Z"
            fill="#16a34a"
          />
          <path
            d="M 396 162 C 396 152, 390 146, 380 148 L 370 150 L 370 300 C 382 300, 396 296, 396 288 Z"
            fill="#4ade80"
          />

          {/* Left lower green book base */}
          <path
            d="M 116 306 C 120 322, 140 336, 190 354 C 218 364, 244 374, 256 384 C 256 376, 240 364, 212 352 C 166 332, 130 318, 116 306 Z"
            fill="#0f5132"
          />
          <path
            d="M 116 322 C 126 334, 150 348, 196 364 C 222 372, 246 382, 256 392 C 254 382, 232 370, 204 358 C 158 340, 128 328, 116 322 Z"
            fill="#198754"
          />

          {/* Right lower green book base */}
          <path
            d="M 396 306 C 392 322, 372 336, 322 354 C 294 364, 268 374, 256 384 C 256 376, 272 364, 300 352 C 346 332, 382 318, 396 306 Z"
            fill="#0f5132"
          />
          <path
            d="M 396 322 C 386 334, 362 348, 316 364 C 290 372, 266 382, 256 392 C 258 382, 280 370, 308 358 C 354 340, 384 328, 396 322 Z"
            fill="#198754"
          />

          {/* Pure White Open Book forming Capital 'H' */}
          <path
            d="M 144 140 C 144 136, 148 134, 154 135 L 218 152 C 224 154, 227 158, 227 165 L 227 225 L 256 225 L 285 225 L 285 165 C 285 158, 288 154, 294 152 L 358 135 C 364 134, 368 136, 368 140 L 368 296 C 368 300, 364 304, 356 305 L 285 316 L 285 258 L 227 258 L 227 316 L 156 305 C 148 304, 144 300, 144 296 Z"
            fill="url(#hk-page-gleam)"
          />

          {/* Left Bottom Curving Page Wings */}
          <path
            d="M 116 308 C 134 308, 160 316, 202 334 C 230 346, 250 360, 256 372 C 253 360, 230 342, 198 328 C 156 310, 128 304, 116 308 Z"
            fill="#f8fafc"
          />
          <path
            d="M 116 309 L 227 296 L 227 316 L 156 322 C 138 322, 124 316, 116 309 Z"
            fill="#e2e8f0"
            opacity="0.3"
          />

          {/* Right Bottom Curving Page Wings */}
          <path
            d="M 396 308 C 378 308, 352 316, 310 334 C 282 346, 262 360, 256 372 C 259 360, 282 342, 314 328 C 356 310, 384 304, 396 308 Z"
            fill="#f8fafc"
          />

          {/* Spine crease line */}
          <path d="M 256 372 L 256 392" stroke="#022c1d" strokeWidth="2.5" strokeLinecap="round" />

          {/* Bottom Green Page Bevel Trim */}
          <path
            d="M 118 316 C 140 318, 172 328, 212 348 C 236 360, 252 372, 256 378 C 254 372, 236 356, 210 342 C 168 322, 136 314, 118 316 Z"
            fill="#22c55e"
          />
          <path
            d="M 394 316 C 372 318, 340 328, 300 348 C 276 360, 260 372, 256 378 C 258 372, 276 356, 302 342 C 344 322, 376 314, 394 316 Z"
            fill="#22c55e"
          />
        </g>

        {/* Optional Subtext inside SVG */}
        {withText && (
          <g transform="translate(256, 436)">
            <text
              textAnchor="middle"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="24"
              fontWeight="900"
              letterSpacing="6"
              fill="#ecfdf5"
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
              fill="#6ee7b7"
            >
              SMART ACCOUNTING
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
