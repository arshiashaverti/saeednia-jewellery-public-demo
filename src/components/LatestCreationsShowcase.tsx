import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Product, LatestCreationsSettings } from '../types';
import { AmbientJewelleryDecor } from './AmbientJewelleryDecor';
import { LuxuryLightDecor } from './LuxuryLightDecor';
import {
  Sparkles,
  Gem,
  ArrowLeft,
  ArrowRight,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface LatestCreationsShowcaseProps {
  products: Product[];
  settings?: LatestCreationsSettings;
}

export const LatestCreationsShowcase: React.FC<LatestCreationsShowcaseProps> = ({
  products,
  settings,
}) => {
  const { lang, categories, setSelectedProduct } = useApp();
  const navigate = useNavigate();

  // Filter products explicitly flagged for this section (excluding soft-deleted/draft/test)
  const showcasedProducts = useMemo(() => {
    return products
      .filter((p) => p.visibility && p.status !== 'draft' && !p.isDeleted && !p.isTest && Boolean(p.showInLatestCreations))
      .sort(
        (a, b) =>
          (a.latestCreationsOrder || a.displayOrder || 1) -
          (b.latestCreationsOrder || b.displayOrder || 1)
      );
  }, [products]);

  const isEnabled = settings?.enabled !== false;
  const autoScroll = settings?.autoScroll !== false;
  const pauseOnHover = settings?.pauseOnHover !== false;
  const pauseOnInteract = settings?.pauseOnInteract !== false;
  const direction = settings?.direction || 'rtl';
  const hoverTextTheme = settings?.hoverTextTheme || 'light';

  const intervalMs = useMemo(() => {
    const sp = settings?.speed;
    if (typeof sp === 'number' && sp >= 1500) return sp;
    if (sp === 'slow') return 7500;
    if (sp === 'fast') return 3200;
    return 5500;
  }, [settings?.speed]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [centerCardHovered, setCenterCardHovered] = useState<boolean>(false);
  const [isPausedByInteraction, setIsPausedByInteraction] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const interactTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const n = showcasedProducts.length;

  const markUserInteraction = useCallback(() => {
    if (!pauseOnInteract) return;
    setIsPausedByInteraction(true);
    if (interactTimerRef.current) clearTimeout(interactTimerRef.current);
    interactTimerRef.current = setTimeout(() => {
      setIsPausedByInteraction(false);
    }, 9000);
  }, [pauseOnInteract]);

  useEffect(() => {
    return () => {
      if (interactTimerRef.current) clearTimeout(interactTimerRef.current);
    };
  }, []);

  // Safe navigation
  const goToNext = useCallback(() => {
    if (n <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % n);
  }, [n]);

  const goToPrev = useCallback(() => {
    if (n <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + n) % n);
  }, [n]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < n) {
        markUserInteraction();
        setCurrentIndex(index);
      }
    },
    [n, markUserInteraction]
  );

  // Auto-rotation timer honoring speed, direction, pauseOnHover, and pauseOnInteract
  useEffect(() => {
    if (!autoScroll || n <= 1) return;
    if (pauseOnHover && (isHovered || centerCardHovered)) return;
    if (pauseOnInteract && isPausedByInteraction) return;

    const timer = setInterval(() => {
      if (direction === 'ltr') {
        goToPrev();
      } else {
        goToNext();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoScroll, n, pauseOnHover, pauseOnInteract, isHovered, centerCardHovered, isPausedByInteraction, direction, intervalMs, goToNext, goToPrev]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      markUserInteraction();
      lang === 'fa' ? goToPrev() : goToNext();
    } else if (e.key === 'ArrowLeft') {
      markUserInteraction();
      lang === 'fa' ? goToNext() : goToPrev();
    }
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 45) {
      markUserInteraction();
      if (deltaX > 0) {
        lang === 'fa' ? goToNext() : goToPrev();
      } else {
        lang === 'fa' ? goToPrev() : goToNext();
      }
    }
    setTouchStartX(null);
  };

  const getProductHref = useCallback(
    (product: Product) => {
      const firstCatKey = product.category ? product.category.split(',')[0].trim() : '';
      const currentCat = categories.find((c) => !c.isDeleted && (c.key === firstCatKey || c.key === product.category));
      const catSlug = currentCat?.slug || firstCatKey.replace(/_/g, '-');
      const prodSlug = product.slug || product.productCode || product.id;
      return catSlug && product.slug ? `/${encodeURIComponent(catSlug)}/${encodeURIComponent(prodSlug)}` : `/products/${encodeURIComponent(prodSlug)}`;
    },
    [categories]
  );

  const handleNavigateToProduct = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedProduct(product);
    navigate(getProductHref(product));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isEnabled) {
    return null;
  }

  const sectionTitle =
    lang === 'fa'
      ? settings?.titleFa || 'جدیدترین آثار جواهری سعیدنیا'
      : settings?.titleEn || 'Latest Saeednia Masterworks';

  const sectionSubtitle =
    lang === 'fa'
      ? settings?.subtitleFa || 'شاهکارهای زرگری، الماس‌های شناسنامه‌دار و سنگ‌های قیمتی'
      : settings?.subtitleEn || 'High Jewellery Creations & Certified Natural Gems';

  return (
    <section
      id="section-latest-works"
      className="py-16 sm:py-22 md:py-26 bg-white dark:bg-gradient-to-b dark:from-[#090909] dark:via-[#151413] dark:to-[#090909] overflow-hidden transition-colors duration-500 relative"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={sectionTitle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCenterCardHovered(false);
      }}
    >
      {/* Decorative Ambient Jewellery Geometry and Light Halos */}
      <AmbientJewelleryDecor position="latest-flanks" />
      {/* Fine Light Theme Diamond & Star Accents */}
      <LuxuryLightDecor section="latest" />

      {/* Background ambient soft multi-stage glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[480px] bg-gradient-to-r from-[#C8B696]/15 via-[#E4DBCB]/20 to-[#C8B696]/15 dark:from-[#C5A059]/10 dark:via-[#A9874F]/14 dark:to-[#C5A059]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Seamless Feathering Gradient connecting to Section E below */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-[#090909]/70 dark:to-[#090909] pointer-events-none z-10" />

      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-[rgba(200,182,150,0.35)] dark:border-[#C5A059]/20 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#E1C58F]" />
              <span className="font-cinzel text-xs text-[#906D2D] dark:text-[#C5A059] tracking-[0.3em] uppercase font-bold">
                NEW REVELATIONS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF]">
              {sectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#4A3F35] dark:text-[#A9874F] mt-1 font-persian-body font-medium">
              {sectionSubtitle}
            </p>
          </div>

          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-xs font-persian-nav text-[#906D2D] hover:text-[#785922] dark:text-[#C5A059] dark:hover:text-[#EDE8DF] tracking-wider uppercase transition-colors shrink-0 font-bold"
          >
            <span>{lang === 'fa' ? 'مشاهده همه آثار' : 'View All Works'}</span>
            {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        </div>
      </div>

      {/* 3D Coverflow Perspective Stage */}
      {showcasedProducts.length > 0 ? (
        <div
          className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="sr-only" aria-live="polite">
            {showcasedProducts[currentIndex]
              ? `${lang === 'fa' ? showcasedProducts[currentIndex].titleFa : showcasedProducts[currentIndex].titleEn || showcasedProducts[currentIndex].titleFa} (${currentIndex + 1} / ${n})`
              : ''}
          </div>
          {/* Main 3D Container */}
          <div
            className="relative h-[400px] sm:h-[480px] md:h-[530px] flex items-center justify-center overflow-visible"
            style={{ perspective: '1400px', transformStyle: 'preserve-3d' }}
          >
            {showcasedProducts.map((product, idx) => {
              // Calculate circular difference from currentIndex
              let diff = idx - currentIndex;
              if (diff > n / 2) diff -= n;
              if (diff < -n / 2) diff += n;

              const isCenter = diff === 0;
              const isRight = diff === 1 || (diff === -1 && n === 2 && currentIndex === 0 && idx === 1);
              const isLeft = diff === -1;
              const isVisible = Math.abs(diff) <= 1 || (n <= 2 && Math.abs(diff) <= 1);

              const displayName =
                lang === 'fa' ? product.titleFa : product.titleEn || product.titleFa;

              // 3D Transform and layout styles
              let transformStyle = '';
              let zIndex = 10;
              let opacity = 0;
              let pointerEvents: 'auto' | 'none' = 'none';

              if (isCenter) {
                transformStyle = 'translateX(0%) translateZ(60px) scale(1) rotateY(0deg)';
                zIndex = 30;
                opacity = 1;
                pointerEvents = 'auto';
              } else if (diff === 1 || (n === 2 && idx !== currentIndex)) {
                // Right card: slanted obliquely with perspective tilt and halo
                transformStyle =
                  'translateX(66%) translateZ(-90px) scale(0.83) rotateY(-24deg)';
                zIndex = 20;
                opacity = 0.82;
                pointerEvents = 'auto';
              } else if (diff === -1) {
                // Left card: slanted obliquely with symmetrical perspective tilt and halo
                transformStyle =
                  'translateX(-66%) translateZ(-90px) scale(0.83) rotateY(24deg)';
                zIndex = 20;
                opacity = 0.82;
                pointerEvents = 'auto';
              } else {
                // Hidden cards further away
                transformStyle =
                  diff > 0
                    ? 'translateX(110%) translateZ(-180px) scale(0.68) rotateY(-32deg)'
                    : 'translateX(-110%) translateZ(-180px) scale(0.68) rotateY(32deg)';
                zIndex = 10;
                opacity = 0;
                pointerEvents = 'none';
              }

              return (
                <div
                  key={product.id}
                  id={`latest-creation-3d-card-${product.id}`}
                  onClick={() => {
                    if (isCenter) {
                      handleNavigateToProduct(product);
                    } else if (diff === 1 || (n === 2 && idx !== currentIndex)) {
                      markUserInteraction();
                      goToNext();
                    } else if (diff === -1) {
                      markUserInteraction();
                      goToPrev();
                    }
                  }}
                  onMouseEnter={() => {
                    if (isCenter) {
                      setCenterCardHovered(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (isCenter) {
                      setCenterCardHovered(false);
                    }
                  }}
                  style={{
                    transform: transformStyle,
                    zIndex,
                    opacity,
                    pointerEvents,
                    transition:
                      'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease, box-shadow 0.5s ease',
                  }}
                  className={`absolute w-[310px] sm:w-[460px] md:w-[560px] lg:w-[640px] h-[340px] sm:h-[410px] md:h-[460px] rounded-sm cursor-pointer group ${
                    isCenter
                      ? 'shadow-[0_20px_50px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)]'
                      : 'cursor-pointer hover:opacity-100'
                  }`}
                >
                  {/* Oblique Luminous Halo for Side Cards */}
                  {!isCenter && isVisible && (
                    <div className="absolute -inset-3 rounded-sm bg-gradient-to-r from-[#AC9262]/25 via-[#C8B696]/35 to-[#AC9262]/25 blur-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  )}

                  {/* Center Card Gold Aura */}
                  {isCenter && (
                    <div className="absolute -inset-1 rounded-sm bg-gradient-to-r from-[#C8B696]/20 via-[#AC9262]/30 to-[#C8B696]/20 blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  )}

                  {/* Card Main Rectangular Frame with jewel-box cream background and gold borders */}
                  <div className="relative w-full h-full rounded-sm overflow-hidden bg-[#FAF8F5] dark:bg-[#151413] border border-[#AC9262] hover:border-[#906D2D] dark:border-[#C5A059]/30 dark:group-hover:border-[#E1C58F] transition-all duration-500 flex items-center justify-center p-3 sm:p-5 shadow-[0_12px_36px_rgba(74,63,53,0.1)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
                    {/* Metallic specular top highlight line */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#AC9262] to-transparent z-10 opacity-80 group-hover:opacity-100 transition-opacity" />

                    {/* Product Image: Cleanly framed within large rectangle */}
                    <div className="relative w-full h-full rounded-sm overflow-hidden flex items-center justify-center bg-white dark:bg-[#090909]">
                      {product.mainImage ? (
                        <img
                          src={product.mainImage}
                          alt={displayName}
                          className={`w-full h-full object-cover transition-transform duration-700 ease-out select-none ${
                            isCenter ? 'group-hover:scale-105' : 'group-hover:scale-102'
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#906D2D] dark:text-[#E1C58F]">
                          <Gem className="w-16 h-16 stroke-1 mb-2 opacity-60" />
                          <span className="font-cinzel text-xs text-[#1F1A16] dark:text-[#E1C58F]">SAEEDNIA CREATION</span>
                        </div>
                      )}

                      {/* Center Card Hover Overlay (نام محصول و دکمه مشاهده) */}
                      {isCenter && (
                        <div
                          id={`hover-overlay-${product.id}`}
                          className={`absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-center transition-all duration-300 z-20 ${
                            hoverTextTheme === 'dark'
                              ? 'overlay-dark-theme bg-gradient-to-t from-white/95 via-white/80 to-white/40 backdrop-blur-[2.5px]'
                              : 'overlay-light-theme bg-gradient-to-t from-black/90 via-black/55 to-black/20 backdrop-blur-[2.5px]'
                          } ${
                            centerCardHovered
                              ? 'opacity-100 translate-y-0'
                              : 'opacity-0 translate-y-2 pointer-events-none'
                          }`}
                        >
                          <div className="max-w-md mx-auto w-full">
                            {/* Product Title */}
                            <h3
                              style={{ color: hoverTextTheme === 'dark' ? '#1F1A16' : '#FAF8F3' }}
                              className={`text-lg sm:text-2xl font-bold font-persian-heading mb-2 drop-shadow-md ${
                                hoverTextTheme === 'dark' ? 'text-[#1F1A16]' : 'text-[#FAF8F3]'
                              }`}
                            >
                              {displayName}
                            </h3>

                            {/* Specifications */}
                            {product.specifications?.goldCarat && (
                              <p
                                style={{ color: hoverTextTheme === 'dark' ? '#4A3F35' : '#D7C3A0' }}
                                className={`text-xs sm:text-sm font-persian-body mb-5 font-light ${
                                  hoverTextTheme === 'dark' ? 'text-[#4A3F35]' : 'text-[#D7C3A0]'
                                }`}
                              >
                                {product.specifications.goldCarat}
                                {product.specifications?.gemstones
                                  ? ` • ${product.specifications.gemstones}`
                                  : ''}
                              </p>
                            )}

                            {/* Action Link: «مشاهده» (Crawlable SEO Link) */}
                            <Link
                              id={`btn-view-product-${product.id}`}
                              to={getProductHref(product)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(product);
                              }}
                              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 bg-[#906D2D] hover:bg-[#785922] text-white border border-[#AC9262] text-xs sm:text-sm font-persian-nav font-semibold rounded-sm shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 mx-auto"
                            >
                              <Eye className="w-4 h-4 text-white" />
                              <span className="text-white">{lang === 'fa' ? 'مشاهده اثر' : 'View Piece'}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-70 text-white" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Subtle click indicator for side cards */}
                      {!isCenter && isVisible && (
                        <div className="absolute inset-0 bg-black/20 dark:bg-black/35 hover:bg-transparent transition-colors flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-black/70 border border-[#C5A059]/40 text-[#D4AF37] font-persian-nav text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
                            {lang === 'fa' ? 'کلیک برای مشاهده' : 'Click to Focus'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls: Left & Right Shift Arrows */}
          <div className="flex items-center justify-between max-w-lg mx-auto mt-4 sm:mt-5 px-4">
            <button
              id="btn-showcase-prev"
              type="button"
              onClick={() => {
                markUserInteraction();
                lang === 'fa' ? goToNext() : goToPrev();
              }}
              aria-label="Previous Creation"
              className="w-10 h-10 rounded-full border border-[#AC9262] hover:border-[#906D2D] dark:border-[#C5A059]/30 bg-white dark:bg-[#0A0A0D] text-[#906D2D] hover:text-white dark:text-[#C5A059] hover:bg-[#906D2D] dark:hover:bg-[#C5A059] dark:hover:text-[#0A0A0B] transition-all flex items-center justify-center shadow-md active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Indicators / Dots */}
            <div className="flex items-center gap-2">
              {showcasedProducts.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => goToIndex(dotIdx)}
                  aria-label={`Go to item ${dotIdx + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    dotIdx === currentIndex
                      ? 'w-8 h-2 bg-[#906D2D] dark:bg-[#D4AF37]'
                      : 'w-2 h-2 bg-[#C8B696]/50 dark:bg-stone-700 hover:bg-[#906D2D]/70'
                  }`}
                />
              ))}
            </div>

            <button
              id="btn-showcase-next"
              type="button"
              onClick={() => {
                markUserInteraction();
                lang === 'fa' ? goToPrev() : goToNext();
              }}
              aria-label="Next Creation"
              className="w-10 h-10 rounded-full border border-[#AC9262] hover:border-[#906D2D] dark:border-[#C5A059]/30 bg-white dark:bg-[#0A0A0D] text-[#906D2D] hover:text-white dark:text-[#C5A059] hover:bg-[#906D2D] dark:hover:bg-[#C5A059] dark:hover:text-[#0A0A0B] transition-all flex items-center justify-center shadow-md active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center bg-[#FAF8F3] dark:bg-[#09090C] border border-[#D7C3A0] dark:border-[#C5A059]/15 rounded-sm p-8 max-w-lg mx-auto shadow-xl">
          <Gem className="w-8 h-8 text-[#B69A65] dark:text-[#C5A059] mx-auto mb-3 opacity-70" />
          <h3 className="text-base font-persian-heading text-[#292521] dark:text-[#EDE8DF] mb-2">
            {lang === 'fa' ? 'آثار جدید به زودی رونمایی خواهند شد' : 'New Pieces Arriving Soon'}
          </h3>
          <p className="text-xs text-[#7A695B] dark:text-[#8C8880] max-w-sm mx-auto mb-6 font-persian-body leading-relaxed">
            {lang === 'fa'
              ? 'مجموعه جدید آثار جواهری سعیدنیا به زودی در این بخش به نمایش درمی‌آید.'
              : 'New curated pieces will be unveiled soon in this gallery.'}
          </p>
        </div>
      )}
    </section>
  );
};
