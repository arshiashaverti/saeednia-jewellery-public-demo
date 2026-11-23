import React from 'react';
import { Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PageEditorialHeaderProps {
  eyebrow?: string;
  showSparkle?: boolean;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  headerId?: string;
  maxWidthClass?: string;
  eyebrowClassName?: string;
  eyebrowWrapperClassName?: string;
}

export const PageEditorialHeader: React.FC<PageEditorialHeaderProps> = ({
  eyebrow,
  showSparkle = true,
  title,
  subtitle,
  description,
  children,
  className = '',
  headerId,
  maxWidthClass = 'max-w-4xl',
  eyebrowClassName,
  eyebrowWrapperClassName = '',
}) => {
  const { theme } = useApp();
  const isLight = theme === 'light';

  return (
    <header
      id={headerId}
      className={`w-full ${maxWidthClass} mx-auto px-4 sm:px-6 mb-12 sm:mb-16`}
    >
      <div
        className={`subpage-contrast-hero ${
          isLight ? 'subpage-hero-light' : 'subpage-hero-dark'
        } px-4 min-[375px]:px-6 sm:px-12 py-8 sm:py-12 md:py-14 text-center relative ${className}`}
      >
        {/* Top specular highlight bar */}
        <div className="hero-specular-bar absolute top-0 inset-x-0 h-[1.5px] z-10" />

        {/* Diffused pale gold light halos inside the card */}
        <div className="subpage-hero-gold-halo-top pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 sm:w-[32rem] h-64 rounded-full blur-3xl opacity-80 z-0" />
        <div className="subpage-hero-gold-halo-bottom pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 sm:w-[28rem] h-48 rounded-full blur-2xl opacity-60 z-0" />
        <div className="subpage-hero-gold-halo-left pointer-events-none absolute -left-12 sm:-left-20 top-1/2 -translate-y-1/2 w-64 sm:w-80 h-64 sm:h-80 rounded-full blur-3xl z-0" />
        <div className="subpage-hero-gold-halo-right pointer-events-none absolute -right-12 sm:-right-20 top-1/2 -translate-y-1/2 w-64 sm:w-80 h-64 sm:h-80 rounded-full blur-3xl z-0" />

        {/* Content Container (sitting crisply above halos) */}
        <div className="relative z-10 w-full">
          {/* Brand Eyebrow */}
          {eyebrow && (
            <div className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 ${eyebrowWrapperClassName}`}>
              {showSparkle && <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />}
              <span
                className={`font-cinzel hero-brand-eyebrow uppercase font-bold min-w-0 max-w-full break-words text-center leading-relaxed ${
                  eyebrowClassName ||
                  'text-[7.5px] min-[375px]:text-[8.5px] min-[430px]:text-[9.5px] sm:text-xs tracking-[0.04em] min-[375px]:tracking-[0.08em] sm:tracking-[0.3em]'
                }`}
              >
                {eyebrow}
              </span>
            </div>
          )}

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-medium sm:font-semibold tracking-tight font-vazir mb-3 sm:mb-4 leading-tight break-words">
            {title}
          </h1>

          {/* Optional Subtitle */}
          {subtitle && (
            <h2 className="text-base sm:text-xl font-light font-vazir tracking-wide max-w-2xl mx-auto mb-3 opacity-95 break-words">
              {subtitle}
            </h2>
          )}

          {/* Optional Description */}
          {description && (
            <p className="text-sm sm:text-base font-light font-vazir leading-relaxed max-w-2xl mx-auto mt-2 break-words">
              {description}
            </p>
          )}

          {/* Custom children if any */}
          {children}

          {/* Bottom Gold Hairline Divider */}
          <div className="hero-gold-divider w-16 sm:w-20 h-[1px] mx-auto mt-6 sm:mt-8" />
        </div>
      </div>
    </header>
  );
};
