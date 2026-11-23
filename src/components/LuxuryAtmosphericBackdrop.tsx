import React from 'react';

export const LuxuryAtmosphericBackdrop: React.FC = () => {
  return (
    <div
      id="luxury-atmospheric-backdrop"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 min-h-full"
      aria-hidden="true"
    >
      {/* =====================================================================
          SHAPE 1: Faceted Jewel Rhombus Halo (Upper-End Margin)
          A soft tilted diamond light beam decorating the top-side empty space
         ===================================================================== */}
      <div className="absolute -top-16 -end-28 sm:-end-44 w-[380px] sm:w-[560px] h-[380px] sm:h-[560px] rotate-[38deg] rounded-[80px] bg-gradient-to-br from-[#C5A059]/05 via-[#EDE6D8]/10 to-transparent dark:from-[#E5C378]/14 dark:via-[#C5A059]/6 blur-[80px] sm:blur-[95px] animate-ambient-drift pointer-events-none" />

      {/* =====================================================================
          SHAPE 2: Soft Champagne Arc Glow (Mid-Start Margin)
          Curved luxury aura bringing depth to the middle-side margin
         ===================================================================== */}
      <div className="absolute top-[26%] -start-28 sm:-start-48 w-[360px] sm:w-[520px] h-[360px] sm:h-[520px] -rotate-[22deg] rounded-full bg-gradient-to-tr from-[#C5A059]/05 via-transparent to-transparent dark:from-[#0E4D38]/12 dark:via-[#C5A059]/6 blur-[85px] sm:blur-[105px] animate-ambient-breathe pointer-events-none" />

      {/* =====================================================================
          SHAPE 3: Radiant Soft Gold Facet Halo (Lower-End Flank)
          Tilted softened facet brightening the lower empty side space
         ===================================================================== */}
      <div className="absolute top-[54%] -end-32 sm:-end-52 w-[400px] sm:w-[580px] h-[400px] sm:h-[580px] rotate-[28deg] rounded-[100px] bg-gradient-to-tl from-[#C5A059]/05 via-transparent to-transparent dark:from-[#C5A059]/11 dark:via-[#F3DE9A]/5 blur-[90px] sm:blur-[115px] animate-ambient-drift pointer-events-none" />

      {/* =====================================================================
          SHAPE 4: Atmospheric Deep Oval Halo (Bottom-Start Flank)
          Soft lateral glow adding warmth to the bottom empty zone
         ===================================================================== */}
      <div className="absolute top-[78%] -start-32 sm:-start-44 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full bg-gradient-to-r from-[#C5A059]/05 via-transparent to-transparent dark:from-[#C5A059]/9 dark:via-[#E5C378]/4 blur-[80px] sm:blur-[95px] animate-ambient-breathe pointer-events-none" />

      {/* =====================================================================
          SHAPE 5: Floating Jewel Light Accent Points (Far Outer Margins)
          Subtle geometric diamond sparkles in empty side columns
         ===================================================================== */}
      <div className="hidden md:block absolute top-[14%] start-[3%] lg:start-[5%] w-1.5 h-1.5 rotate-45 bg-[#E5C378]/35 shadow-[0_0_12px_#D4AF37] animate-pulse pointer-events-none" />
      <div className="hidden md:block absolute top-[38%] end-[3%] lg:end-[5%] w-2 h-2 rotate-45 bg-[#E5C378]/30 shadow-[0_0_14px_#D4AF37] animate-pulse pointer-events-none" />
      <div className="hidden md:block absolute top-[66%] start-[4%] lg:start-[6%] w-1.5 h-1.5 rotate-45 bg-[#E5C378]/25 shadow-[0_0_10px_#D4AF37] animate-pulse pointer-events-none" />
      <div className="hidden md:block absolute top-[88%] end-[4%] lg:end-[6%] w-2 h-2 rotate-45 bg-[#E5C378]/25 shadow-[0_0_12px_#D4AF37] animate-pulse pointer-events-none" />
    </div>
  );
};
