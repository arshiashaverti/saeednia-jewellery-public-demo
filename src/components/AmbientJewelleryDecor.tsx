import React from 'react';

interface AmbientJewelleryDecorProps {
  position?: 'hero-flanks' | 'collections-flanks' | 'latest-flanks' | 'heritage-backdrop' | 'boutique-flanks';
}

/**
 * AmbientJewelleryDecor
 * Luxury decorative background ambient lighting and abstract jewellery geometric motifs.
 * Features:
 * - Ultra-thin gold diamond facet wireframes
 * - Interlocking gold rings and delicate arcs
 * - Soft multi-stop radial light halos (Caramel, Champagne Gold, Antique Gold)
 * - Zero interference with text or buttons (pointer-events-none, strictly background z-0)
 * - Responsive: subtle on mobile, majestic on desktop
 */
export const AmbientJewelleryDecor: React.FC<AmbientJewelleryDecorProps> = ({
  position = 'hero-flanks',
}) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* -------------------------------------------------------------
          HERO FLANKS AMBIENT LIGHT & FACET MOTIFS
         ------------------------------------------------------------- */}
      {position === 'hero-flanks' && (
        <>
          {/* Top-Right Ambient Halo */}
          <div className="absolute -top-24 -end-24 w-[380px] sm:w-[550px] h-[380px] sm:h-[550px] rounded-full bg-gradient-to-br from-[#906D2D]/8 via-[#C8B696]/12 to-transparent dark:from-[#C5A059]/12 dark:via-[#A9874F]/8 dark:to-transparent blur-3xl" />

          {/* Top-Left Ambient Halo */}
          <div className="absolute top-1/4 -start-28 w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] rounded-full bg-gradient-to-tr from-[#C8B696]/10 via-[#E4DBCB]/25 to-transparent dark:from-[#A9874F]/10 dark:via-[#211E1A]/20 dark:to-transparent blur-3xl" />

          {/* Abstract Diamond Facet Geometry — Right Flank */}
          <div className="hidden lg:block absolute top-28 end-8 w-44 h-44 opacity-35 dark:opacity-20 animate-ambient-drift">
            <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
              {/* Brilliant cut facet wireframe with champagne strokes */}
              <polygon
                points="80,10 140,45 140,115 80,150 20,115 20,45"
                stroke="currentColor"
                strokeWidth="1"
                className="text-[#906D2D]/60 dark:text-[#D8BD8A]"
              />
              <polygon
                points="80,35 120,60 120,100 80,125 40,100 40,60"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="2 3"
                className="text-[#C8B696]/70 dark:text-[#C5A059]"
              />
              <line x1="80" y1="10" x2="80" y2="35" stroke="currentColor" strokeWidth="0.8" className="text-[#C8B696]/70 dark:text-[#C5A059]" />
              <line x1="140" y1="45" x2="120" y2="60" stroke="currentColor" strokeWidth="0.8" className="text-[#C8B696]/70 dark:text-[#C5A059]" />
              <line x1="140" y1="115" x2="120" y2="100" stroke="currentColor" strokeWidth="0.8" className="text-[#C8B696]/70 dark:text-[#C5A059]" />
              <line x1="80" y1="150" x2="80" y2="125" stroke="currentColor" strokeWidth="0.8" className="text-[#C8B696]/70 dark:text-[#C5A059]" />
              <line x1="20" y1="115" x2="40" y2="100" stroke="currentColor" strokeWidth="0.8" className="text-[#C8B696]/70 dark:text-[#C5A059]" />
              <line x1="20" y1="45" x2="40" y2="60" stroke="currentColor" strokeWidth="0.8" className="text-[#C8B696]/70 dark:text-[#C5A059]" />
            </svg>
          </div>

          {/* Interlocking Golden Arcs with champagne strokes — Left Flank */}
          <div className="hidden lg:block absolute bottom-12 start-8 w-48 h-48 opacity-35 dark:opacity-20 animate-ambient-breathe">
            <svg viewBox="0 0 180 180" fill="none" className="w-full h-full">
              <circle
                cx="80"
                cy="90"
                r="55"
                stroke="currentColor"
                strokeWidth="1"
                className="text-[#906D2D]/60 dark:text-[#E1C58F]"
              />
              <circle
                cx="100"
                cy="90"
                r="55"
                stroke="currentColor"
                strokeWidth="1"
                className="text-[#C8B696]/70 dark:text-[#A9874F]"
              />
              {/* Center marquise intersection highlight */}
              <ellipse
                cx="90"
                cy="90"
                rx="15"
                ry="38"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                className="text-[#906D2D]/50 dark:text-[#D8BD8A]"
              />
            </svg>
          </div>
        </>
      )}

      {/* -------------------------------------------------------------
          COLLECTIONS SECTION AMBIENT LIGHT & GEOMETRY
         ------------------------------------------------------------- */}
      {position === 'collections-flanks' && (
        <>
          {/* Subtle Warm Amber Center Bloom */}
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-radial from-[#906D2D]/6 via-[#C8B696]/8 to-transparent dark:from-[#FFE8A3]/7 dark:via-[#F6DF95]/3 dark:to-transparent blur-3xl" />

          {/* Thin Decorative Guilloché Wave Motif at Left Edge */}
          <div className="hidden xl:block absolute top-12 start-4 w-32 h-64 opacity-30 dark:opacity-15">
            <svg viewBox="0 0 120 240" fill="none" className="w-full h-full">
              <path
                d="M 10 10 C 60 40, 60 80, 10 120 C 60 160, 60 200, 10 230"
                stroke="currentColor"
                strokeWidth="1"
                className="text-[#906D2D]/60 dark:text-[#D8BD8A]"
              />
              <path
                d="M 25 10 C 75 40, 75 80, 25 120 C 75 160, 75 200, 25 230"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="2 3"
                className="text-[#C8B696]/50 dark:text-[#C5A059]"
              />
            </svg>
          </div>

          {/* Thin Decorative Guilloché Wave Motif at Right Edge */}
          <div className="hidden xl:block absolute bottom-12 end-4 w-32 h-64 opacity-30 dark:opacity-15">
            <svg viewBox="0 0 120 240" fill="none" className="w-full h-full">
              <path
                d="M 110 10 C 60 40, 60 80, 110 120 C 60 160, 60 200, 110 230"
                stroke="currentColor"
                strokeWidth="1"
                className="text-[#906D2D]/60 dark:text-[#D8BD8A]"
              />
              <path
                d="M 95 10 C 45 40, 45 80, 95 120 C 45 160, 45 200, 95 230"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="2 3"
                className="text-[#C8B696]/50 dark:text-[#C5A059]"
              />
            </svg>
          </div>
        </>
      )}

      {/* -------------------------------------------------------------
          LATEST CREATIONS (3D SHOWCASE) AMBIENT FLANKS
         ------------------------------------------------------------- */}
      {position === 'latest-flanks' && (
        <>
          {/* Broad Luminous Amber/Caramel Halo behind 3D Stage */}
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-gradient-to-r from-[#906D2D]/6 via-[#C8B696]/10 to-[#906D2D]/6 dark:from-[#C5A059]/10 dark:via-[#A9874F]/14 dark:to-[#C5A059]/10 blur-[140px]" />

          {/* Delicate Octagonal Emerald Facet Frame — Right Side */}
          <div className="hidden lg:block absolute top-16 end-12 w-48 h-48 opacity-35 dark:opacity-20 animate-ambient-drift">
            <svg viewBox="0 0 180 180" fill="none" className="w-full h-full">
              <polygon
                points="50,15 130,15 165,50 165,130 130,165 50,165 15,130 15,50"
                stroke="currentColor"
                strokeWidth="1"
                className="text-[#906D2D]/60 dark:text-[#E1C58F]"
              />
              <polygon
                points="60,35 120,35 145,60 145,120 120,145 60,145 35,120 35,60"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="2 3"
                className="text-[#C8B696]/60 dark:text-[#A9874F]"
              />
            </svg>
          </div>

          {/* Delicate Oval Facet Frame — Left Side */}
          <div className="hidden lg:block absolute bottom-20 start-12 w-48 h-48 opacity-35 dark:opacity-20 animate-ambient-breathe">
            <svg viewBox="0 0 180 180" fill="none" className="w-full h-full">
              <ellipse
                cx="90"
                cy="90"
                rx="70"
                ry="50"
                stroke="currentColor"
                strokeWidth="1"
                className="text-[#906D2D]/60 dark:text-[#C5A059]"
              />
              <ellipse
                cx="90"
                cy="90"
                rx="50"
                ry="34"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                className="text-[#C8B696]/60 dark:text-[#C6A47C]"
              />
            </svg>
          </div>
        </>
      )}

      {/* -------------------------------------------------------------
          HERITAGE SECTION AMBIENT BACKDROP
         ------------------------------------------------------------- */}
      {position === 'heritage-backdrop' && (
        <>
          {/* Subtle Warm Amber/Caramel Light Pool in Center */}
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full bg-radial from-[#906D2D]/8 via-[#C8B696]/10 to-transparent dark:from-[#C5A059]/12 dark:via-[#A9874F]/6 blur-3xl" />

          {/* Delicate Concentric Luxury Jewelry Arcs */}
          <div className="hidden md:block absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-25 dark:opacity-10 pointer-events-none">
            <svg viewBox="0 0 600 600" fill="none" className="w-full h-full">
              <circle cx="300" cy="300" r="220" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 5" className="text-[#C8B696]/60 dark:text-[#C5A059]" />
              <circle cx="300" cy="300" r="280" stroke="currentColor" strokeWidth="1" className="text-[#906D2D]/60 dark:text-[#D8BD8A]" />
            </svg>
          </div>
        </>
      )}

      {/* -------------------------------------------------------------
          BOUTIQUE SECTION AMBIENT FLANKS
         ------------------------------------------------------------- */}
      {position === 'boutique-flanks' && (
        <>
          {/* Soft Champagne Halo behind Circular Frame */}
          <div className="absolute top-1/2 end-1/4 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-radial from-[#906D2D]/8 via-[#C8B696]/10 to-transparent dark:from-[#C5A059]/10 dark:via-transparent blur-3xl" />

          {/* Subtle Golden Geometry at Bottom Left with champagne strokes */}
          <div className="hidden lg:block absolute bottom-12 start-16 w-44 h-44 opacity-30 dark:opacity-15 animate-ambient-drift">
            <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
              <circle cx="80" cy="80" r="60" stroke="currentColor" strokeWidth="1" className="text-[#906D2D]/60 dark:text-[#E1C58F]" />
              <polygon
                points="80,25 125,55 125,105 80,135 35,105 35,55"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="2 3"
                className="text-[#C8B696]/60 dark:text-[#C5A059]"
              />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};
