import React from 'react';

interface MalibouLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'badge-only' | 'light-text';
  hideSubOnMobile?: boolean;
  className?: string;
}

export const MalibouLogo: React.FC<MalibouLogoProps> = ({
  size = 'md',
  variant = 'full',
  hideSubOnMobile = false,
  className = '',
}) => {
  const sizeMap = {
    sm: {
      badgeW: 40,
      badgeH: 28,
      titleClass: 'text-base sm:text-lg',
      subClass: 'text-[8px] sm:text-[9px]',
    },
    md: {
      badgeW: 54,
      badgeH: 38,
      titleClass: 'text-lg sm:text-xl',
      subClass: 'text-[9px] sm:text-[10px]',
    },
    lg: {
      badgeW: 80,
      badgeH: 56,
      titleClass: 'text-xl sm:text-2xl',
      subClass: 'text-xs',
    },
    xl: {
      badgeW: 110,
      badgeH: 76,
      titleClass: 'text-2xl sm:text-3xl',
      subClass: 'text-xs sm:text-sm',
    },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Authentic Malibou Cocoa Pod Emblem */}
      <div
        className="relative flex-shrink-0 transition-transform duration-300 hover:scale-102"
        style={{ width: current.badgeW, height: current.badgeH }}
      >
        <svg
          viewBox="0 0 160 110"
          className="w-full h-full drop-shadow-[0_2px_6px_rgba(42,20,10,0.18)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cocoaPodGrad" x1="15%" y1="10%" x2="85%" y2="90%">
              <stop offset="0%" stopColor="#4A2314" />
              <stop offset="50%" stopColor="#30160C" />
              <stop offset="100%" stopColor="#220E06" />
            </linearGradient>
            <linearGradient id="goldRim" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D49A4D" />
              <stop offset="50%" stopColor="#B87932" />
              <stop offset="100%" stopColor="#874E18" />
            </linearGradient>
          </defs>

          {/* Angled Cocoa Bean Silhouette */}
          <g transform="rotate(-6 80 55)">
            {/* Outer Pod Shadow/Stroke */}
            <ellipse
              cx="80"
              cy="55"
              rx="74"
              ry="45"
              fill="url(#cocoaPodGrad)"
              stroke="url(#goldRim)"
              strokeWidth="2.2"
            />

            {/* Inner Delicate Rim */}
            <ellipse
              cx="80"
              cy="55"
              rx="68"
              ry="39"
              fill="none"
              stroke="#D49A4D"
              strokeWidth="0.8"
              strokeOpacity="0.5"
              strokeDasharray="5 3"
            />

            {/* Botanical Leaf / Cocoa Vein Accent */}
            <path
              d="M 22 55 Q 80 72 138 55"
              stroke="#B87932"
              strokeWidth="1"
              strokeOpacity="0.4"
              fill="none"
            />

            {/* Arched "CHOCOLATE" script banner */}
            <text
              x="80"
              y="37"
              textAnchor="middle"
              fill="#EFE4D4"
              fontSize="12.5"
              fontWeight="600"
              letterSpacing="2.2"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              textRendering="geometricPrecision"
            >
              CHOCOLATE
            </text>

            {/* Signature "Malibou" Cursive Display */}
            <text
              x="80"
              y="74"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="34"
              fontStyle="italic"
              fontWeight="700"
              fontFamily="'Cormorant Garamond', Georgia, serif"
              letterSpacing="0.5"
            >
              Malibou
            </text>

            {/* Natural cocoa fruit highlight dots */}
            <circle cx="28" cy="55" r="1.5" fill="#B87932" opacity="0.8" />
            <circle cx="132" cy="55" r="1.5" fill="#B87932" opacity="0.8" />
          </g>
        </svg>
      </div>

      {/* Brand Typography */}
      {variant !== 'badge-only' && (
        <div className="flex flex-col text-left justify-center min-w-0">
          <span
            className={`font-serif tracking-tight font-bold text-[#2E160D] leading-none ${current.titleClass} ${
              variant === 'light-text' ? '!text-[#F7F1E7]' : ''
            }`}
          >
            Malibou
          </span>
          <span
            className={`font-sans uppercase tracking-[0.2em] sm:tracking-[0.24em] text-[#A26727] font-semibold mt-0.5 leading-none whitespace-nowrap truncate ${
              current.subClass
            } ${hideSubOnMobile ? 'hidden sm:block' : 'block'} ${
              variant === 'light-text' ? '!text-[#DDB076]' : ''
            }`}
          >
            Chocolate & Cocoa
          </span>
        </div>
      )}
    </div>
  );
};
