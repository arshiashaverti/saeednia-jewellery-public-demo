import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Product } from '../types';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Eye,
  Gem,
  Award,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface LatestWorksMarqueeProps {
  products: Product[];
}

export const LatestWorksMarquee: React.FC<LatestWorksMarqueeProps> = ({ products }) => {
  const { lang, settings } = useApp();
  const navigate = useNavigate();

  // Settings from admin with safe defaults
  const latestSettings = settings?.latestCreations || {
    enabled: true,
    autoScroll: true,
    direction: 'rtl' as const,
    speed: 'medium' as const,
    gap: 24,
    desktopCount: 3,
    mobileCount: 1,
    titleFa: 'جدیدترین آثار سعیدنیا',
    titleEn: 'Latest Masterworks',
    pauseOnHover: true,
    pauseOnTouch: true,
  };

  // Strictly filter products that have showInLatest === true and are visible and not test
  const latestProducts = products
    .filter((p) => p.showInLatest === true && p.visibility && !p.isTest)
    .sort((a, b) => (a.latestOrder ?? a.displayOrder) - (b.latestOrder ?? b.displayOrder));

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [offset, setOffset] = useState<number>(0);
  const [trackWidth, setTrackWidth] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Speed calculation
  const getSpeedPixelsPerSecond = (): number => {
    const s = latestSettings.speed;
    if (typeof s === 'number') return s;
    if (s === 'slow') return 20;
    if (s === 'fast') return 60;
    return 35; // medium default
  };

  // Drag tracking refs
  const dragRef = useRef<{
    isDown: boolean;
    startX: number;
    startOffset: number;
    hasMoved: boolean;
  }>({
    isDown: false,
    startX: 0,
    startOffset: 0,
    hasMoved: false,
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const measureTrack = useCallback(() => {
    if (trackRef.current) {
      const width = trackRef.current.scrollWidth;
      if (width > 0) {
        setTrackWidth(width);
      }
    }
  }, []);

  useEffect(() => {
    measureTrack();
    window.addEventListener('resize', measureTrack);
    return () => window.removeEventListener('resize', measureTrack);
  }, [measureTrack, latestProducts.length, latestSettings.gap]);

  // Direction: 'rtl' moves offset forward (translate3d(-offset)), 'ltr' moves backwards
  const isRtl = latestSettings.direction === 'rtl';

  useEffect(() => {
    if (
      prefersReducedMotion ||
      !latestSettings.autoScroll ||
      latestProducts.length <= 1 ||
      trackWidth <= 0
    ) {
      return;
    }

    let animId: number;
    let lastTime = performance.now();
    const speed = getSpeedPixelsPerSecond();

    const step = (now: number) => {
      const deltaMs = now - lastTime;
      lastTime = now;

      const pauseOnHoverActive = latestSettings.pauseOnHover && isHovered;
      const pauseOnTouchActive = latestSettings.pauseOnTouch && dragRef.current.isDown;

      if (!pauseOnHoverActive && !pauseOnTouchActive && !dragRef.current.isDown && trackWidth > 0) {
        const movement = (speed * deltaMs) / 1000;
        setOffset((prev) => {
          let next = isRtl ? prev + movement : prev - movement;
          while (next >= trackWidth) next -= trackWidth;
          while (next < 0) next += trackWidth;
          return next;
        });
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [
    isHovered,
    trackWidth,
    prefersReducedMotion,
    latestSettings.autoScroll,
    latestSettings.speed,
    latestSettings.direction,
    latestSettings.pauseOnHover,
    latestSettings.pauseOnTouch,
    latestProducts.length,
    isRtl,
  ]);

  const handleProductClick = (id: string) => {
    if (dragRef.current.hasMoved) return;
    navigate(`/products/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      startOffset: offset,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDown) return;
    const deltaX = e.clientX - dragRef.current.startX;
    if (Math.abs(deltaX) > 5) {
      dragRef.current.hasMoved = true;
    }

    if (trackWidth > 0) {
      let nextOffset = dragRef.current.startOffset - deltaX;
      while (nextOffset < 0) nextOffset += trackWidth;
      while (nextOffset >= trackWidth) nextOffset -= trackWidth;
      setOffset(nextOffset);
    }
  };

  const handlePointerUp = () => {
    dragRef.current.isDown = false;
    setIsDragging(false);
    setTimeout(() => {
      dragRef.current.hasMoved = false;
    }, 100);
  };

  // Render Horizontal Rectangular Card
  const renderCard = (prod: Product, isClone: boolean = false) => {
    const cardTitle = lang === 'fa' ? prod.titleFa : (prod.titleEn || prod.titleFa);
    const cardId = `latest-card-${prod.id}${isClone ? '-clone' : ''}`;

    return (
      <article
        key={`${prod.id}-${isClone ? 'clone' : 'original'}`}
        id={cardId}
        role={isClone ? 'presentation' : 'button'}
        aria-hidden={isClone ? 'true' : undefined}
        tabIndex={isClone ? -1 : 0}
        onClick={() => !isClone && handleProductClick(prod.id)}
        onKeyDown={(e) => {
          if (!isClone && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleProductClick(prod.id);
          }
        }}
        className={`flex-shrink-0 w-[340px] sm:w-[420px] md:w-[460px] h-[190px] sm:h-[210px] p-3 sm:p-4 bg-[#FAF8F3] dark:bg-[#0A0A0E] border border-[#D7C3A0]/70 dark:border-[#C5A059]/25 hover:border-[#B69A65] dark:hover:border-[#D4AF37] rounded-sm transition-all duration-300 flex flex-row items-center gap-3.5 sm:gap-4 select-none cursor-pointer group shadow-[0_6px_24px_rgba(73,58,48,0.06)] hover:shadow-[0_16px_36px_rgba(182,154,101,0.22)] dark:shadow-none hover:-translate-y-1 relative overflow-hidden focus:outline-none focus:ring-1 focus:ring-[#B69A65] dark:focus:ring-[#D4AF37] ${
          isDragging ? 'cursor-grabbing' : 'cursor-pointer'
        }`}
      >
        {/* Top Gold Specular Accent */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#B69A65]/40 dark:via-[#C5A059]/50 to-transparent group-hover:via-[#D4AF37] transition-all z-10" />

        {/* 1. Square Image Frame (Left or Right side depending on layout) */}
        <div className="relative w-36 sm:w-44 h-full aspect-square flex-shrink-0 rounded-sm overflow-hidden bg-[#F3EEE5] dark:bg-[#060608] border border-[#D7C3A0]/60 dark:border-[#C5A059]/15 flex items-center justify-center p-2.5">
          {prod.mainImage ? (
            <img
              src={prod.mainImage}
              alt={cardTitle}
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(73,58,48,0.12)] dark:drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] transition-transform duration-700 ease-out group-hover:scale-108"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#8F7444] dark:text-[#C5A059]">
              <Gem className="w-8 h-8 opacity-70 mb-1" />
              <span className="text-[10px] font-persian-nav">
                {lang === 'fa' ? 'اثر فاخر' : 'Masterwork'}
              </span>
            </div>
          )}

          {prod.productCode && (
            <div className="absolute top-2 start-2 z-10">
              <span className="font-mono text-[9px] text-[#292521] dark:text-[#C5A059] px-1.5 py-0.5 bg-[#FAF8F3]/95 dark:bg-[#0A0A0D]/90 border border-[#D7C3A0] dark:border-[#C5A059]/25 rounded-sm backdrop-blur-sm">
                {prod.productCode}
              </span>
            </div>
          )}
        </div>

        {/* 2. Content & Information Section */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1 text-start">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-[#B69A65] dark:text-[#D4AF37]" />
              <span className="font-cinzel text-[9px] sm:text-[10px] text-[#8F7444] dark:text-[#C5A059] tracking-wider uppercase font-medium">
                HAUTE JOAILLERIE
              </span>
            </div>

            <h3 className="font-persian-heading text-xs sm:text-sm md:text-base font-semibold text-[#292521] dark:text-[#EDE8DF] group-hover:text-[#8F7444] dark:group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug">
              {cardTitle}
            </h3>

            {/* Gold Carat & Gemstone specs badge */}
            <div className="mt-2 space-y-1">
              {prod.specifications?.goldCarat && (
                <div className="text-[10px] sm:text-[11px] text-[#493A30] dark:text-[#A8A49C] font-persian-body truncate">
                  <span className="text-[#8F7444] dark:text-[#C5A059] font-medium">عیار: </span>
                  {prod.specifications.goldCarat}
                </div>
              )}
              {prod.specifications?.gemstones && (
                <div className="text-[10px] sm:text-[11px] text-[#493A30] dark:text-[#A8A49C] font-persian-body truncate">
                  <span className="text-[#8F7444] dark:text-[#C5A059] font-medium">گوهر: </span>
                  {prod.specifications.gemstones}
                </div>
              )}
            </div>
          </div>

          {/* Action Link at Bottom */}
          <div className="pt-2 border-t border-[#D7C3A0]/50 dark:border-[#C5A059]/15 flex items-center justify-between text-xs text-[#8F7444] dark:text-[#C5A059]">
            <span className="font-cinzel text-[10px] sm:text-[11px] tracking-wider uppercase group-hover:underline">
              {lang === 'fa' ? 'مشاهده اثر' : 'View Piece'}
            </span>
            {lang === 'fa' ? (
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            )}
          </div>
        </div>
      </article>
    );
  };

  // If latest creations section is disabled by admin in settings
  if (latestSettings.enabled === false) {
    return null;
  }

  // If no products have been flagged for latest creations yet
  if (latestProducts.length === 0) {
    return null;
  }

  const sectionTitle = lang === 'fa'
    ? (latestSettings.titleFa || 'جدیدترین آثار سعیدنیا')
    : (latestSettings.titleEn || 'Latest Masterworks');

  const gapValue = latestSettings.gap || 24;

  return (
    <section
      id="section-latest-works"
      className="py-20 sm:py-28 w-full overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-[#D7C3A0]/70 dark:border-[#C5A059]/15 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B69A65] dark:text-[#D4AF37]" />
              <span className="font-cinzel text-xs text-[#8F7444] dark:text-[#C5A059] tracking-[0.3em] uppercase font-medium">
                NEW REVELATIONS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-persian-heading text-[#292521] dark:text-[#EDE8DF]">
              {sectionTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              navigate('/categories');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 text-xs font-persian-nav text-[#8F7444] dark:text-[#C5A059] hover:text-[#292521] dark:hover:text-[#EDE8DF] tracking-wider uppercase transition-colors"
          >
            <span>{lang === 'fa' ? 'مشاهده همه آثار' : 'View All Works'}</span>
            {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Continuous Horizontal Marquee Container */}
      <div
        ref={containerRef}
        id="latest-creations-marquee-container"
        className="relative w-full overflow-hidden py-4 select-none touch-pan-y"
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => {
          setIsHovered(false);
          if (dragRef.current.isDown) {
            dragRef.current.isDown = false;
            setIsDragging(false);
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label={sectionTitle}
      >
        {/* Gradient Blur Masks on edges */}
        <div className="absolute inset-y-0 start-0 w-12 sm:w-28 bg-gradient-to-r from-[var(--bg-main)] via-[var(--bg-main)]/80 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 end-0 w-12 sm:w-28 bg-gradient-to-l from-[var(--bg-main)] via-[var(--bg-main)]/80 to-transparent pointer-events-none z-10" />

        {/* Marquee Track */}
        <div
          className="flex will-change-transform"
          style={{
            gap: `${gapValue}px`,
            transform: `translate3d(-${offset}px, 0, 0)`,
            transition: isDragging ? 'none' : 'transform 0.05s linear',
          }}
        >
          {/* Main Measured Track */}
          <div ref={trackRef} className="flex flex-shrink-0" style={{ gap: `${gapValue}px` }}>
            {latestProducts.map((prod) => renderCard(prod, false))}
          </div>

          {/* Duplicate Track 1 for seamless infinite loop */}
          <div aria-hidden="true" className="flex flex-shrink-0" style={{ gap: `${gapValue}px` }}>
            {latestProducts.map((prod) => renderCard(prod, true))}
          </div>

          {/* Duplicate Track 2 for wide displays */}
          <div aria-hidden="true" className="flex flex-shrink-0" style={{ gap: `${gapValue}px` }}>
            {latestProducts.map((prod) => renderCard(prod, true))}
          </div>
        </div>
      </div>
    </section>
  );
};
