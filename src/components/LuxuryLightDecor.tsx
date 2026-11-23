import React from 'react';
import { useApp } from '../context/AppContext';

interface LuxuryLightDecorProps {
  section: 'hero' | 'categories' | 'latest' | 'heritage' | 'boutique';
}

/**
 * LuxuryLightDecor
 * Exclusively active in Light Theme to elevate the aesthetic with:
 * - Delicate golden diamond rhombuses (resembling fine cut diamonds)
 * - Ultra-slow twinkling micro-stars (subtle opacity breathing 0.25 <-> 0.85)
 * - Scattered warm luminous micro-points
 * - Subtle geometric jewellery blueprint wireframes
 * - Zero interference with text, buttons, or product images (pointer-events-none, strictly background)
 * - Fully paused when prefers-reduced-motion is enabled
 */
export const LuxuryLightDecor: React.FC<LuxuryLightDecorProps> = ({ section }) => {
  const { theme } = useApp();

  // Strictly only rendered in Light Theme — Dark Theme (Obsidian Gold) is 100% unaffected
  if (theme !== 'light') {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* =========================================================================
          HERO DECOR: Golden micro-diamonds and calm twinkling stars on the flanks
         ========================================================================= */}
      {section === 'hero' && (
        <>
          {/* Subtle warm champagne light aura top-right */}
          <div className="absolute top-10 end-[8%] w-80 h-80 rounded-full bg-gradient-to-br from-[#E4DBCB]/40 via-[#C8B696]/20 to-transparent blur-3xl luxury-decor-pulse-slow" />

          {/* Subtle warm champagne light aura bottom-left */}
          <div className="absolute bottom-16 start-[6%] w-72 h-72 rounded-full bg-gradient-to-tr from-[#C8B696]/30 via-[#E4DBCB]/25 to-transparent blur-3xl luxury-decor-pulse-slow" style={{ animationDelay: '3s' }} />

          {/* Tiny Diamond 1 (Top-Left Flank) */}
          <svg
            className="absolute top-24 start-[4%] w-4 h-4 text-[#906D2D]/60 luxury-decor-float"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L22 12L12 22L2 12Z" />
          </svg>

          {/* Tiny 4-point Star 1 (Top-Right Flank) */}
          <svg
            className="absolute top-32 end-[5%] w-5 h-5 text-[#AC9262]/75 luxury-decor-twinkle"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '1.2s' }}
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
          </svg>

          {/* Tiny Diamond 2 (Mid-Right Flank) */}
          <svg
            className="absolute top-1/2 end-[3%] w-3 h-3 text-[#AC9262]/70 luxury-decor-twinkle"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '4s' }}
          >
            <path d="M12 2L22 12L12 22L2 12Z" />
          </svg>

          {/* Tiny 4-point Star 2 (Lower-Left Flank) */}
          <svg
            className="absolute bottom-28 start-[5%] w-4 h-4 text-[#906D2D]/65 luxury-decor-twinkle"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '2.5s' }}
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
          </svg>

          {/* Luminous micro-points (ambient gold dust) */}
          <div className="absolute top-1/3 start-[10%] w-1.5 h-1.5 rounded-full bg-[#AC9262] shadow-[0_0_8px_#906D2D] luxury-decor-twinkle" style={{ animationDelay: '0.8s' }} />
          <div className="absolute top-2/3 end-[9%] w-1.5 h-1.5 rounded-full bg-[#AC9262] shadow-[0_0_8px_#906D2D] luxury-decor-twinkle" style={{ animationDelay: '3.2s' }} />
          <div className="absolute bottom-1/4 start-[14%] w-1 h-1 rounded-full bg-[#906D2D] shadow-[0_0_6px_#C8B696] luxury-decor-twinkle" style={{ animationDelay: '5s' }} />
        </>
      )}

      {/* =========================================================================
          CATEGORIES DECOR: Elegant golden facets and calm shimmering stars
         ========================================================================= */}
      {section === 'categories' && (
        <>
          {/* Ambient warm champagne radial glow */}
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-radial from-[#C8B696]/20 via-[#E4DBCB]/15 to-transparent blur-3xl pointer-events-none" />

          {/* Small Gold Diamond (Start side) */}
          <svg
            className="absolute top-16 start-[3%] w-4 h-4 text-[#AC9262]/80 luxury-decor-twinkle"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '0.5s' }}
          >
            <path d="M12 2L22 12L12 22L2 12Z" />
          </svg>

          {/* Small 4-point Star (End side) */}
          <svg
            className="absolute top-20 end-[4%] w-4 h-4 text-[#AC9262]/85 luxury-decor-twinkle"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '2.8s' }}
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
          </svg>

          {/* Tiny Diamond (Bottom End) */}
          <svg
            className="absolute bottom-12 end-[6%] w-3.5 h-3.5 text-[#906D2D]/75 luxury-decor-float"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '1.5s' }}
          >
            <path d="M12 2L22 12L12 22L2 12Z" />
          </svg>

          {/* Tiny 4-point Star (Bottom Start) */}
          <svg
            className="absolute bottom-16 start-[7%] w-3.5 h-3.5 text-[#AC9262]/75 luxury-decor-twinkle"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '4.2s' }}
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
          </svg>

          {/* Luminous micro-points */}
          <div className="absolute top-10 end-[12%] w-1.5 h-1.5 rounded-full bg-[#AC9262] shadow-[0_0_8px_#906D2D] luxury-decor-twinkle" style={{ animationDelay: '1.8s' }} />
          <div className="absolute bottom-10 start-[15%] w-1.5 h-1.5 rounded-full bg-[#AC9262] shadow-[0_0_8px_#906D2D] luxury-decor-twinkle" style={{ animationDelay: '3.6s' }} />
        </>
      )}

      {/* =========================================================================
          LATEST CREATIONS DECOR: Symmetrical jewelry stars and light halos
         ========================================================================= */}
      {section === 'latest' && (
        <>
          {/* Soft ambient champagne glow */}
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[450px] rounded-full bg-radial from-[#E4DBCB]/30 via-[#C8B696]/15 to-transparent blur-3xl pointer-events-none" />

          {/* Tiny 4-point Star Top Left */}
          <svg
            className="absolute top-14 start-[5%] w-4.5 h-4.5 text-[#AC9262]/85 luxury-decor-twinkle"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '0.9s' }}
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
          </svg>

          {/* Tiny Diamond Top Right */}
          <svg
            className="absolute top-16 end-[5%] w-4 h-4 text-[#906D2D]/80 luxury-decor-float"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '2.1s' }}
          >
            <path d="M12 2L22 12L12 22L2 12Z" />
          </svg>

          {/* Tiny Diamond Bottom Left */}
          <svg
            className="absolute bottom-20 start-[4%] w-3.5 h-3.5 text-[#AC9262]/70 luxury-decor-twinkle"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '3.8s' }}
          >
            <path d="M12 2L22 12L12 22L2 12Z" />
          </svg>

          {/* Tiny 4-point Star Bottom Right */}
          <svg
            className="absolute bottom-24 end-[4%] w-4 h-4 text-[#AC9262]/80 luxury-decor-twinkle"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '5s' }}
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
          </svg>

          {/* Micro gold points */}
          <div className="absolute top-1/4 start-[12%] w-1.5 h-1.5 rounded-full bg-[#AC9262] shadow-[0_0_8px_#906D2D] luxury-decor-twinkle" style={{ animationDelay: '1.4s' }} />
          <div className="absolute top-3/4 end-[11%] w-1.5 h-1.5 rounded-full bg-[#AC9262] shadow-[0_0_8px_#906D2D] luxury-decor-twinkle" style={{ animationDelay: '4.4s' }} />
        </>
      )}

      {/* =========================================================================
          HERITAGE DECOR: Flowing jewelry stars along sine waves
         ========================================================================= */}
      {section === 'heritage' && (
        <>
          {/* Subtle gold diamond and star accents */}
          <svg
            className="absolute top-14 start-[8%] w-4 h-4 text-[#AC9262]/85 luxury-decor-twinkle"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '1.1s' }}
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
          </svg>

          <svg
            className="absolute top-14 end-[8%] w-4 h-4 text-[#AC9262]/85 luxury-decor-twinkle"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '3.3s' }}
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
          </svg>

          <svg
            className="absolute bottom-16 start-[10%] w-3.5 h-3.5 text-[#906D2D]/75 luxury-decor-float"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '2.4s' }}
          >
            <path d="M12 2L22 12L12 22L2 12Z" />
          </svg>

          <svg
            className="absolute bottom-16 end-[10%] w-3.5 h-3.5 text-[#906D2D]/75 luxury-decor-float"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '4.8s' }}
          >
            <path d="M12 2L22 12L12 22L2 12Z" />
          </svg>

          {/* Micro points */}
          <div className="absolute top-1/2 start-[6%] w-1.5 h-1.5 rounded-full bg-[#AC9262] shadow-[0_0_8px_#906D2D] luxury-decor-twinkle" style={{ animationDelay: '0.6s' }} />
          <div className="absolute top-1/2 end-[6%] w-1.5 h-1.5 rounded-full bg-[#AC9262] shadow-[0_0_8px_#906D2D] luxury-decor-twinkle" style={{ animationDelay: '2.6s' }} />
        </>
      )}

      {/* =========================================================================
          BOUTIQUE DECOR: Elegant light halos and diamond specks
         ========================================================================= */}
      {section === 'boutique' && (
        <>
          {/* Subtle warm halo */}
          <div className="absolute top-1/3 start-[10%] w-72 h-72 rounded-full bg-radial from-[#C8B696]/20 via-[#E4DBCB]/15 to-transparent blur-3xl pointer-events-none" />

          {/* Tiny Star */}
          <svg
            className="absolute top-16 start-[6%] w-4 h-4 text-[#906D2D]/60 luxury-decor-twinkle"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '1.7s' }}
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
          </svg>

          {/* Tiny Diamond */}
          <svg
            className="absolute bottom-20 end-[8%] w-3.5 h-3.5 text-[#AC9262]/65 luxury-decor-float"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animationDelay: '3.1s' }}
          >
            <path d="M12 2L22 12L12 22L2 12Z" />
          </svg>

          {/* Micro point */}
          <div className="absolute top-1/2 end-[5%] w-1.5 h-1.5 rounded-full bg-[#906D2D] shadow-[0_0_8px_#C8B696] luxury-decor-twinkle" style={{ animationDelay: '2.2s' }} />
        </>
      )}
    </div>
  );
};
