import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { CategoryInfo } from '../types';
import {
  Gem,
  Sparkles,
  Crown,
  Watch,
  Layers,
  Heart,
  Shield,
  CircleDot,
  Flame,
} from 'lucide-react';

interface CategoryMarqueeProps {
  categories: CategoryInfo[];
  onSelectCategory?: (key: string) => void;
}

// Icon dictionary matching category icon identifiers
export const getCategoryIcon = (iconName?: string, categoryKey?: string) => {
  const iconKey = (iconName || '').toLowerCase().trim();
  const key = (categoryKey || '').toLowerCase().trim();

  if (iconKey === 'ring' || key.includes('ring')) {
    return CircleDot;
  }
  if (iconKey === 'gem' || key.includes('gem') || key.includes('diamond')) {
    return Gem;
  }
  if (iconKey === 'crown' || key.includes('set') || key.includes('bridal')) {
    return Crown;
  }
  if (iconKey === 'sparkles' || key.includes('band')) {
    return Sparkles;
  }
  if (iconKey === 'watch' || key.includes('bracelet') || key.includes('cuff')) {
    return Watch;
  }
  if (iconKey === 'flame' || key.includes('pendant') || key.includes('earring')) {
    return Flame;
  }
  if (iconKey === 'heart') {
    return Heart;
  }
  if (iconKey === 'shield') {
    return Shield;
  }
  if (iconKey === 'layers') {
    return Layers;
  }

  return Gem;
};

export const CategoryMarquee: React.FC<CategoryMarqueeProps> = ({
  categories,
  onSelectCategory,
}) => {
  const { lang, setSelectedCategory } = useApp();
  const navigate = useNavigate();

  // Filter to active non-deleted categories configured for homepage showcase
  const activeCategories = categories
    .filter((c) => !c.isDeleted && c.enabled !== false && c.showOnHome !== false)
    .sort((a, b) => a.order - b.order);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [offset, setOffset] = useState<number>(0);
  const [trackWidth, setTrackWidth] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

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
  }, [measureTrack, activeCategories.length]);

  useEffect(() => {
    if (prefersReducedMotion || activeCategories.length === 0) return;

    let animId: number;
    let lastTime = performance.now();
    const speedPixelsPerSecond = 34;

    const step = (now: number) => {
      const deltaMs = now - lastTime;
      lastTime = now;

      if (!isHovered && !dragRef.current.isDown && trackWidth > 0) {
        setOffset((prev) => {
          const next = prev + (speedPixelsPerSecond * deltaMs) / 1000;
          return next >= trackWidth ? next - trackWidth : next;
        });
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isHovered, trackWidth, prefersReducedMotion, activeCategories.length]);

  const getCatUrl = (cat: CategoryInfo) => {
    const slug = (cat.slug || cat.key.replace(/_/g, '-')).trim();
    return slug ? `/categories/${encodeURIComponent(slug)}` : `/categories?cat=${encodeURIComponent(cat.key)}`;
  };

  const handleCardClick = (e: React.MouseEvent, cat: CategoryInfo) => {
    if (dragRef.current.hasMoved) {
      e.preventDefault();
      return;
    }
    setSelectedCategory(cat.key);
    if (onSelectCategory) {
      e.preventDefault();
      onSelectCategory(cat.key);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const renderCardContent = (cat: CategoryInfo, displayName: string) => {
    const IconComponent = getCategoryIcon(cat.icon, cat.key);
    return (
      <>
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#AC9262] dark:via-[#C5A059]/40 to-transparent group-hover:via-[#906D2D] transition-all mb-2.5" />

        <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-[#FAF8F5] dark:bg-[#070709] border border-[#C8B696]/40 dark:border-[#C5A059]/20 flex items-center justify-center group-hover:border-[#AC9262] dark:group-hover:border-[#D4AF37] transition-colors">
          {cat.image ? (
            <img
              src={cat.image}
              alt={displayName}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out select-none"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#906D2D] dark:text-[#7C7870] p-4 text-center">
              <IconComponent className="w-10 h-10 text-[#906D2D] dark:text-[#C5A059] mb-2 group-hover:scale-110 transition-transform" strokeWidth={1.3} />
            </div>
          )}
        </div>

        <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="pt-3 pb-1 text-center flex flex-col items-center justify-center">
          <h3 className="font-persian-heading font-bold text-sm sm:text-base text-[#1F1A16] dark:text-[#EDE8DF] group-hover:text-[#906D2D] dark:group-hover:text-[#D4AF37] transition-colors truncate w-full">
            {displayName}
          </h3>

          <div className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-persian-nav text-[#906D2D] dark:text-[#C5A059] opacity-90 group-hover:opacity-100 transition-opacity font-bold">
            <span>{lang === 'fa' ? 'مشاهده مجموعه' : 'View Collection'}</span>
            <span className="text-xs transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px] ltr:group-hover:translate-x-[2px]">
              {lang === 'fa' ? '←' : '→'}
            </span>
          </div>
        </div>
      </>
    );
  };

  const renderCard = (cat: CategoryInfo, index: number, isClone: boolean = false) => {
    const cardId = `category-card-${cat.key}${isClone ? '-clone' : ''}`;
    const displayName = lang === 'fa' ? cat.nameFa : cat.nameEn;
    const sharedClass = `category-card-item flex-shrink-0 w-56 sm:w-64 md:w-72 p-3.5 sm:p-4 bg-[#FFFFFF] dark:bg-[#0A0A0D] hover:bg-[#FFFFFF] dark:hover:bg-[#121217] border border-[#AC9262] hover:border-[#906D2D] dark:border-[#C5A059]/20 dark:hover:border-[#D4AF37] rounded-sm transition-all duration-300 flex flex-col select-none cursor-pointer group shadow-[0_6px_20px_rgba(74,63,53,0.08)] hover:shadow-[0_14px_32px_rgba(144,109,45,0.16)] dark:shadow-none hover:-translate-y-1.5 focus:outline-none focus:ring-1 focus:ring-[#906D2D] dark:focus:ring-[#D4AF37] ${
      isDragging ? 'cursor-grabbing' : 'cursor-pointer'
    }`;

    if (isClone) {
      return (
        <div
          key={`${cat.id}-${index}-clone`}
          id={cardId}
          role="presentation"
          aria-hidden="true"
          onClick={() => {
            if (!dragRef.current.hasMoved) {
              setSelectedCategory(cat.key);
              if (onSelectCategory) onSelectCategory(cat.key);
              else navigate(getCatUrl(cat));
            }
          }}
          className={sharedClass}
        >
          {renderCardContent(cat, displayName)}
        </div>
      );
    }

    return (
      <Link
        key={`${cat.id}-${index}-original`}
        id={cardId}
        to={getCatUrl(cat)}
        onClick={(e) => handleCardClick(e, cat)}
        className={sharedClass}
      >
        {renderCardContent(cat, displayName)}
      </Link>
    );
  };

  if (prefersReducedMotion) {
    return (
      <div className="w-full overflow-x-auto py-4">
        <div className="flex items-center gap-3 sm:gap-4 px-4 w-max mx-auto">
          {activeCategories.map((cat, idx) => renderCard(cat, idx, false))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="category-marquee-container"
      dir="ltr"
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
      aria-label={lang === 'fa' ? 'دسته‌بندی‌های پیوسته جواهرات سعیدنیا' : 'Saeednia Jewellery Categories Carousel'}
    >
      <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#E4DBCB] dark:from-[#060608] via-[#E4DBCB]/80 dark:via-[#060608]/80 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#E4DBCB] dark:from-[#060608] via-[#E4DBCB]/80 dark:via-[#060608]/80 to-transparent pointer-events-none z-10" />

      <div
        className="flex gap-3 sm:gap-4 will-change-transform"
        style={{
          transform: `translate3d(-${offset}px, 0, 0)`,
          transition: isDragging ? 'none' : 'transform 0.05s linear',
        }}
      >
        <div ref={trackRef} className="flex gap-3 sm:gap-4 flex-shrink-0">
          {activeCategories.map((cat, idx) => renderCard(cat, idx, false))}
        </div>

        <div aria-hidden="true" className="flex gap-3 sm:gap-4 flex-shrink-0">
          {activeCategories.map((cat, idx) => renderCard(cat, idx, true))}
        </div>

        <div aria-hidden="true" className="flex gap-3 sm:gap-4 flex-shrink-0">
          {activeCategories.map((cat, idx) => renderCard(cat, idx, true))}
        </div>
      </div>
    </div>
  );
};
