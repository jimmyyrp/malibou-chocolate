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
      badge: 30,
      titleClass: 'text-base sm:text-lg',
      subClass: 'text-[8px] sm:text-[9px]',
    },
    md: {
      badge: 42,
      titleClass: 'text-lg sm:text-xl',
      subClass: 'text-[9px] sm:text-[10px]',
    },
    lg: {
      badge: 62,
      titleClass: 'text-xl sm:text-2xl',
      subClass: 'text-xs',
    },
    xl: {
      badge: 88,
      titleClass: 'text-2xl sm:text-3xl',
      subClass: 'text-xs sm:text-sm',
    },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Logo resmi Malibou Chocolate */}
      <div
        className="relative flex-shrink-0 transition-transform duration-300 hover:scale-102"
        style={{ width: current.badge, height: current.badge }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Logo Malibou Chocolate"
          width={current.badge}
          height={current.badge}
          draggable={false}
          className="w-full h-full object-contain drop-shadow-[0_2px_6px_rgba(42,20,10,0.18)]"
        />
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