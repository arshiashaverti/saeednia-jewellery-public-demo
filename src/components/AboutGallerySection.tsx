import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import type { AboutSettings } from '../types';
import {
  clampAboutGalleryIndex,
  getAboutGalleryAspectClasses,
  getActiveAboutGalleryItems,
  getNextAboutGalleryIndex,
  getPrevAboutGalleryIndex,
  resolveAboutGalleryItemFit,
  resolveAboutGallerySettings,
} from '../utils/aboutGallery';

interface AboutGallerySectionProps {
  about?: AboutSettings | null;
  lang: 'fa' | 'en';
  isLight?: boolean;
  previewMode?: boolean;
  previewViewport?: 'desktop' | 'tablet' | 'mobile';
  className?: string;
}

const toPersianDigits = (num: number): string =>
  String(num).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)] || d);

export const AboutGallerySection: React.FC<AboutGallerySectionProps> = ({
  about,
  lang,
  isLight = false,
  previewMode = false,
  previewViewport,
  className = '',
}) => {
  const gallery = useMemo(() => resolveAboutGallerySettings(about), [about]);
  const activeItems = useMemo(() => getActiveAboutGalleryItems(gallery), [gallery]);
  const total = activeItems.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [brokenIds, setBrokenIds] = useState<Record<string, boolean>>({});
  const [announcement, setAnnouncement] = useState('');
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const isRtl = lang === 'fa';
  const showControls = total > 1;
  const safeIndex = clampAboutGalleryIndex(currentIndex, total);

  useEffect(() => {
    setCurrentIndex((prev) => clampAboutGalleryIndex(prev, total));
  }, [total]);

  const activeItem = total > 0 ? activeItems[safeIndex] : null;

  useEffect(() => {
    if (!activeItem || total <= 1) {
      setAnnouncement('');
      return;
    }
    const label = isRtl
      ? activeItem.titleFa || activeItem.altFa || `تصویر ${toPersianDigits(safeIndex + 1)}`
      : activeItem.titleEn || activeItem.altEn || activeItem.altFa || `Image ${safeIndex + 1}`;
    setAnnouncement(
      isRtl
        ? `تصویر ${toPersianDigits(safeIndex + 1)} از ${toPersianDigits(total)}: ${label}`
        : `Image ${safeIndex + 1} of ${total}: ${label}`
    );
  }, [activeItem, safeIndex, total, isRtl]);

  if (!gallery.enabled || total === 0 || !activeItem) {
    return null;
  }

  const nextIndex = getNextAboutGalleryIndex(safeIndex, total);
  const prevIndex = getPrevAboutGalleryIndex(safeIndex, total);

  const mountedIndices = new Set<number>([safeIndex]);
  if (total > 1) {
    mountedIndices.add(nextIndex);
    mountedIndices.add(prevIndex);
  }

  const goNext = () => {
    if (total <= 1) return;
    setCurrentIndex((prev) => getNextAboutGalleryIndex(prev, total));
  };

  const goPrev = () => {
    if (total <= 1) return;
    setCurrentIndex((prev) => getPrevAboutGalleryIndex(prev, total));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!showControls) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (isRtl) goNext();
      else goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (isRtl) goPrev();
      else goNext();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!showControls || e.touches.length !== 1) {
      touchStartRef.current = null;
      return;
    }
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!showControls || !touchStartRef.current || e.changedTouches.length === 0) {
      touchStartRef.current = null;
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy) * 1.15) {
      return;
    }
    if (dx > 0) {
      if (isRtl) goNext();
      else goPrev();
    } else {
      if (isRtl) goPrev();
      else goNext();
    }
  };

  const sectionTitle = isRtl
    ? gallery.titleFa || gallery.titleEn
    : gallery.titleEn || gallery.titleFa;
  const sectionSubtitle = isRtl
    ? gallery.subtitleFa || gallery.subtitleEn
    : gallery.subtitleEn || gallery.subtitleFa;

  const activeTitle = gallery.showTitles
    ? isRtl
      ? activeItem.titleFa || ''
      : activeItem.titleEn || activeItem.titleFa || ''
    : '';
  const activeCaption = gallery.showCaptions
    ? isRtl
      ? activeItem.captionFa || ''
      : activeItem.captionEn || activeItem.captionFa || ''
    : '';

  const aspectClass = getAboutGalleryAspectClasses(gallery.aspectRatio, previewViewport);

  const stageMaxWidthClass =
    previewMode && previewViewport === 'mobile'
      ? 'max-w-[340px]'
      : previewMode && previewViewport === 'tablet'
      ? 'max-w-2xl'
      : 'max-w-3xl';

  return (
    <section
      id="about-gallery-section"
      aria-label={sectionTitle || (isRtl ? 'گالری تصاویر مجموعه سعیدنیا' : 'Saeednia Collection Gallery')}
      aria-roledescription={showControls ? 'carousel' : undefined}
      dir={isRtl ? 'rtl' : 'ltr'}
      tabIndex={showControls ? 0 : undefined}
      onKeyDown={handleKeyDown}
      className={`my-12 sm:my-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/60 rounded-sm ${className}`}
    >
      {/* Editorial Section Header */}
      {(sectionTitle || sectionSubtitle) && (
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9 px-2">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-[1px] w-8 sm:w-12 bg-[#AC9262]/40 dark:bg-[#C5A059]/35" aria-hidden="true" />
            <span className="text-[10px] sm:text-[11px] font-cinzel tracking-[0.22em] uppercase text-[#906D2D] dark:text-[#C5A059]">
              {isRtl ? 'GALLERY' : 'ATELIER'}
            </span>
            <span className="h-[1px] w-8 sm:w-12 bg-[#AC9262]/40 dark:bg-[#C5A059]/35" aria-hidden="true" />
          </div>

          {sectionTitle && (
            <h2
              className={`text-xl sm:text-2xl font-medium tracking-tight ${
                isRtl ? 'font-vazir' : 'font-cinzel'
              } ${isLight ? 'text-[#1A1510]' : 'text-[#F5F2EB]'}`}
            >
              {sectionTitle}
            </h2>
          )}

          {sectionSubtitle && (
            <p
              className={`mt-2.5 text-xs sm:text-sm font-light leading-relaxed ${
                isRtl ? 'font-vazir' : 'font-sans'
              } ${isLight ? 'text-[#5A4C3C]' : 'text-[#A8A49C]'}`}
            >
              {sectionSubtitle}
            </p>
          )}
        </div>
      )}

      {/* Horizontal Framed Showcase */}
      <div className={`w-full ${stageMaxWidthClass} mx-auto`}>
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`group relative w-full ${aspectClass} max-h-[540px] rounded-sm overflow-hidden border touch-pan-y select-none transition-colors duration-300 ${
            isLight
              ? 'border-[#AC9262]/35 bg-[#F6F2EA] shadow-[0_14px_36px_-18px_rgba(90,70,35,0.28)]'
              : 'border-[#C5A059]/25 bg-[#070709] shadow-[0_18px_48px_-20px_rgba(0,0,0,0.85)]'
          }`}
        >
          {/* Subtle top gold hairline accent */}
          <div className="hero-specular-bar absolute top-0 inset-x-0 h-[1px] z-20 pointer-events-none" />

          {/* Active & Adjacent Image Layers */}
          <div className="relative w-full h-full">
            {activeItems.map((item, idx) => {
              if (!mountedIndices.has(idx)) {
                return null;
              }
              const isActive = idx === safeIndex;
              const fitMode = resolveAboutGalleryItemFit(item, gallery);
              const altText = isRtl
                ? item.altFa || item.titleFa || sectionTitle || 'تصویر گالری جواهری سعیدنیا'
                : item.altEn || item.altFa || item.titleEn || sectionTitle || 'Saeednia Jewellery Gallery';
              const isBroken = brokenIds[item.id] === true;

              return (
                <div
                  key={item.id || `${item.url}-${idx}`}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-out motion-reduce:transition-none ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {isBroken ? (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center ${
                        isLight ? 'text-[#73634F]' : 'text-[#8C8880]'
                      }`}
                    >
                      <ImageOff className="w-7 h-7 text-[#C5A059]/70" aria-hidden="true" />
                      <span className="text-xs font-vazir">
                        {isRtl ? 'بارگذاری تصویر در حال حاضر ممکن نیست' : 'Image could not be loaded'}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={altText}
                      loading={idx === 0 || isActive ? 'eager' : 'lazy'}
                      fetchPriority={idx === 0 || isActive ? 'high' : 'auto'}
                      decoding="async"
                      draggable={false}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setBrokenIds((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: true }))
                      }
                      className={`w-full h-full ${
                        fitMode === 'contain' ? 'object-contain p-2 sm:p-4' : 'object-cover'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Left & Right Navigation Arrows — rendered strictly when 2+ active images exist */}
          {showControls && (
            <>
              <button
                type="button"
                onClick={isRtl ? goNext : goPrev}
                aria-label={isRtl ? 'تصویر بعدی گالری' : 'Previous gallery image'}
                className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] opacity-95 sm:opacity-75 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 ${
                  isLight
                    ? 'bg-[#FAF8F4]/90 hover:bg-[#FAF8F4] text-[#4A3F35] hover:text-[#906D2D] border border-[#AC9262]/45 shadow-md'
                    : 'bg-[#09090C]/70 hover:bg-[#09090C]/90 text-[#EDE8DF] hover:text-[#D4AF37] border border-[#C5A059]/40 shadow-lg'
                }`}
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={isRtl ? goPrev : goNext}
                aria-label={isRtl ? 'تصویر قبلی گالری' : 'Next gallery image'}
                className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] opacity-95 sm:opacity-75 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 ${
                  isLight
                    ? 'bg-[#FAF8F4]/90 hover:bg-[#FAF8F4] text-[#4A3F35] hover:text-[#906D2D] border border-[#AC9262]/45 shadow-md'
                    : 'bg-[#09090C]/70 hover:bg-[#09090C]/90 text-[#EDE8DF] hover:text-[#D4AF37] border border-[#C5A059]/40 shadow-lg'
                }`}
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* Optional Editorial Caption & Minimal Navigation Indicator Below Frame */}
        {(activeTitle || activeCaption || showControls) && (
          <div className="mt-4 px-1 flex flex-col gap-3">
            {(activeTitle || activeCaption) && (
              <div className="text-center max-w-2xl mx-auto space-y-1">
                {activeTitle && (
                  <p
                    className={`text-sm sm:text-base font-medium ${
                      isRtl ? 'font-vazir' : 'font-cinzel'
                    } ${isLight ? 'text-[#2C241B]' : 'text-[#EDE8DF]'}`}
                  >
                    {activeTitle}
                  </p>
                )}
                {activeCaption && (
                  <p
                    className={`text-xs sm:text-sm font-light leading-relaxed ${
                      isRtl ? 'font-vazir' : 'font-sans'
                    } ${isLight ? 'text-[#5A4C3C]' : 'text-[#A8A49C]'}`}
                  >
                    {activeCaption}
                  </p>
                )}
              </div>
            )}

            {showControls && (
              <div className="flex items-center justify-center gap-3">
                {total <= 12 && (
                  <div className="flex items-center gap-1" role="tablist" aria-label={isRtl ? 'انتخاب تصویر گالری' : 'Select gallery image'}>
                    {activeItems.map((item, idx) => {
                      const selected = idx === safeIndex;
                      return (
                        <button
                          key={item.id || idx}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          aria-label={
                            isRtl
                              ? `نمایش تصویر ${toPersianDigits(idx + 1)} از ${toPersianDigits(total)}`
                              : `Show image ${idx + 1} of ${total}`
                          }
                          onClick={() => setCurrentIndex(idx)}
                          className="h-8 px-1 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-sm"
                        >
                          <span
                            className={`block h-[2px] transition-all duration-300 motion-reduce:transition-none ${
                              selected
                                ? 'w-7 bg-[#C5A059]'
                                : isLight
                                ? 'w-3 bg-[#AC9262]/35 hover:bg-[#906D2D]/70'
                                : 'w-3 bg-[#C5A059]/30 hover:bg-[#C5A059]/65'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                <span
                  className={`text-[11px] tabular-nums tracking-wider ${
                    isRtl ? 'font-vazir' : 'font-cinzel'
                  } ${isLight ? 'text-[#73634F]' : 'text-[#9E9A92]'}`}
                >
                  {isRtl
                    ? `${toPersianDigits(safeIndex + 1)} / ${toPersianDigits(total)}`
                    : `${safeIndex + 1} / ${total}`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Screen-reader live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </section>
  );
};
