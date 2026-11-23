import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface OfficialLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  priority?: boolean;
  showBacklight?: boolean;
}

export const OfficialLogo: React.FC<OfficialLogoProps> = ({
  className = '',
  size = 'hero',
  showBacklight = true,
}) => {
  const { settings } = useApp();
  const [hasError, setHasError] = useState(false);

  // Logo source hierarchy: Settings logoUrl -> Official /images/7.png -> fallback /7.png
  const logoSrc = settings?.logoUrl || '/images/7.png';

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-28 h-28 sm:w-36 sm:h-36',
    hero: 'w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48',
  }[size];

  return (
    <div
      id="official-saeednia-brand-logo"
      className={`relative select-none flex items-center justify-center aspect-square ${sizeClasses} ${className}`}
    >
      {/* Soft mild ambient light halo positioned behind the emblem & brand script so text is clearly legible */}
      {showBacklight && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-visible"
          aria-hidden="true"
        >
          {/* Mild diffused light pool centered behind the lower-mid region where the cursive script sits */}
          <div className="w-[86%] h-[56%] mt-3 sm:mt-4 rounded-full bg-radial from-[#FFFDF5]/40 via-[#F3DE9A]/18 to-transparent blur-lg sm:blur-xl pointer-events-none transform scale-105" />
          {/* Gentle core backlight to cleanly silhouette the cursive Saeednia text */}
          <div className="w-[66%] h-[38%] mt-3 sm:mt-4 rounded-full bg-[#FFFFFF]/25 blur-md pointer-events-none" />
        </div>
      )}

      <img
        src={hasError ? '/7.png' : logoSrc}
        alt="Saeednia JEWELLERY GrandBazar"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="relative z-10 w-full h-full object-contain transition-transform duration-500 hover:scale-[1.03] drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
      />
    </div>
  );
};
