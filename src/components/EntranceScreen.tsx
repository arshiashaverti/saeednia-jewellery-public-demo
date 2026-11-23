import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

interface EntranceScreenProps {
  onStartTransition: () => void;
  onComplete: () => void;
}

export const EntranceScreen: React.FC<EntranceScreenProps> = ({
  onStartTransition,
  onComplete,
}) => {
  const { lang, settings } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);

  const customVideoUrl = settings?.landingPage?.videoUrl?.trim();
  const hasCustomVideo = Boolean(customVideoUrl);

  const [hasVideoError, setHasVideoError] = useState(!hasCustomVideo);
  const [isVideoEnded, setIsVideoEnded] = useState(!hasCustomVideo);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [isLightActive, setIsLightActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const transitionTimersRef = useRef<number[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    return () => {
      transitionTimersRef.current.forEach((id) => window.clearTimeout(id));
      transitionTimersRef.current = [];
    };
  }, []);

  const logoUrl = settings?.logoUrl || '/images/7.png';
  const customPosterUrl = settings?.landingPage?.posterUrl?.trim();
  const backgroundImageSrc = customPosterUrl || '/images/entrance_emerald_gold.png';
  const configuredBg = (settings?.landingPage?.backgroundColor || '').trim();
  const effectiveBackgroundColor =
    /^#[0-9a-fA-F]{6}$/.test(configuredBg) && configuredBg.toLowerCase() !== '#050507'
      ? configuredBg
      : '#02130e';

  // Video Autoplay & Lifecycle management (only if a real custom video URL was configured)
  useEffect(() => {
    if (!hasCustomVideo) {
      setHasVideoError(true);
      setIsVideoEnded(true);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const fastFallbackTimer = setTimeout(() => {
      if (!video.videoWidth) {
        setHasVideoError(true);
        setIsVideoEnded(true);
      }
    }, 800);

    const handleLoaded = () => {
      clearTimeout(fastFallbackTimer);
      const durationMs =
        (video.duration && Number.isFinite(video.duration) ? video.duration : 4.5) * 1000 + 400;
      setTimeout(() => {
        setIsVideoEnded(true);
      }, durationMs);
    };

    video.addEventListener('loadedmetadata', handleLoaded);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setHasVideoError(true);
        setIsVideoEnded(true);
      });
    }

    return () => {
      clearTimeout(fastFallbackTimer);
      video.removeEventListener('loadedmetadata', handleLoaded);
    };
  }, [hasCustomVideo, customVideoUrl]);

  const handleVideoEnded = () => {
    setIsVideoEnded(true);
  };

  const handleVideoError = () => {
    setHasVideoError(true);
    setIsVideoEnded(true);
  };

  const buttonText =
    lang === 'fa'
      ? settings?.landingPage?.buttonTextFa || 'مشاهده مجموعه'
      : settings?.landingPage?.buttonTextEn || 'View Collection';

  const handleEnter = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsButtonActive(true);

    onStartTransition();

    if (prefersReducedMotion) {
      const reducedTimer = window.setTimeout(() => {
        onComplete();
      }, 420);
      transitionTimersRef.current.push(reducedTimer);
      return;
    }

    const lightTimer = window.setTimeout(() => {
      setIsLightActive(true);
    }, 50);

    // Fires cleanly after both luxuryEntranceExit (1220ms) and luxuryPageReveal (1240ms) settle
    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, 1280);

    transitionTimersRef.current.push(lightTimer, completeTimer);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleEnter();
    }
  };

  return (
    <div
      id="luxury-entrance-screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden ${
        isTransitioning ? 'animate-luxury-entrance-exit pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ backgroundColor: effectiveBackgroundColor }}
      role="region"
      aria-label="صفحه ورودی جواهری سعیدنیا"
    >
      {/* Emerald & Gold Luxury Background with Serene Depth Glide */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <img
          src={backgroundImageSrc}
          alt="Saeednia Jewellery Luxury Emerald Background"
          className={`w-full h-full object-cover filter blur-[3px] transition-transform duration-[1300ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
            isTransitioning ? 'scale-[1.09]' : 'scale-[1.04]'
          }`}
        />

        {/* Soft emerald atmospheric depth vignette for dream-like elegance & high center contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(3, 26, 19, 0.42) 0%, rgba(2, 14, 10, 0.72) 65%, rgba(1, 8, 6, 0.94) 100%)',
          }}
        />

        {/* Fine champagne-gold ambient light glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.08) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* Whisper-Soft Architectural Champagne-Gold Threshold Aura & Parting Light Lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className={`w-[85vw] h-[85vw] max-w-[850px] max-h-[850px] rounded-full pointer-events-none ${
            isLightActive ? 'animate-luxury-champagne-light' : 'opacity-0 scale-50'
          }`}
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(245, 222, 158, 0.2) 0%, rgba(212, 175, 55, 0.12) 32%, rgba(10, 71, 54, 0.1) 58%, rgba(2, 14, 10, 0) 78%)',
          }}
        />
        {isLightActive && (
          <>
            <span
              aria-hidden="true"
              className="absolute h-[54vh] w-[1px] bg-gradient-to-b from-transparent via-[#F5DE9E]/45 to-transparent animate-luxury-threshold-left"
            />
            <span
              aria-hidden="true"
              className="absolute h-[54vh] w-[1px] bg-gradient-to-b from-transparent via-[#F5DE9E]/45 to-transparent animate-luxury-threshold-right"
            />
          </>
        )}
      </div>

      {/* Main Presentation Container (Lifted ~10% higher per request) */}
      <div
        className={`relative z-10 w-full max-w-[1040px] px-4 sm:px-8 flex flex-col items-center justify-center ${
          isTransitioning
            ? 'animate-luxury-centerpiece-exit'
            : '-translate-y-[6%] sm:-translate-y-[10%]'
        }`}
      >
        {/* If custom video is configured and not in error, show video canvas; otherwise show brand centerpiece */}
        {hasCustomVideo && !hasVideoError ? (
          <div className="relative w-full max-w-[960px] aspect-video max-h-[66vh] flex items-center justify-center overflow-hidden rounded-[2px] shadow-[0_16px_50px_rgba(0,0,0,0.9)] border border-[#D4AF37]/30">
            <video
              ref={videoRef}
              src={customVideoUrl}
              poster={backgroundImageSrc}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              className="w-full h-full object-contain pointer-events-none select-none"
              aria-label="ویدیو ورودی جواهری سعیدنیا"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center animate-fade-in text-center">
            {/* Official Brand Emblem (Golden halo around logo removed per instruction) */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center">
              <img
                src={logoUrl}
                alt="Saeednia Jewellery"
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-[1.02] drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]"
              />
            </div>
          </div>
        )}

        {/* Physical 3D Entrance CTA Button */}
        <div
          className={`relative w-full flex items-center justify-center pt-5 sm:pt-6 transition-all duration-500 ease-out ${
            isVideoEnded || hasVideoError
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <button
            id="btn-entrance-view-collection"
            type="button"
            onClick={handleEnter}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            disabled={isTransitioning}
            aria-label={buttonText}
            className={`group relative overflow-hidden px-6 py-2 sm:px-8 sm:py-2.5 min-w-[145px] sm:min-w-[175px] rounded-full focus:outline-none select-none luxury-3d-entrance-cta transition-all duration-500 ${
              isButtonActive
                ? 'scale-[0.985] translate-y-[1px] border-[#F5DE9E]'
                : 'focus:ring-1 focus:ring-[#D4AF37]/60'
            }`}
          >
            {/* Top bevel glint */}
            <span
              className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5DE9E]/60 to-transparent pointer-events-none"
              aria-hidden="true"
            />

            {/* Ambient gold sheen moving quietly */}
            <span className="absolute inset-0 overflow-hidden pointer-events-none rounded-full">
              <span
                className="absolute inset-y-0 w-20 -translate-x-full bg-gradient-to-r from-transparent via-[#F5DE9E]/20 to-transparent animate-ambient-gold-sheen pointer-events-none"
                aria-hidden="true"
              />
            </span>

            {/* Button Content: Rich Authentic Gold (#D4AF37) */}
            <div className="relative z-10 flex items-center justify-center gap-1.5">
              <span
                className={`block font-persian-heading text-[11px] sm:text-xs tracking-[0.2em] whitespace-nowrap transition-colors duration-300 select-none ${
                  isButtonActive
                    ? 'text-white'
                    : 'text-[#D4AF37] group-hover:text-[#F3DE9A] drop-shadow-[0_1px_3px_rgba(212,175,55,0.4)]'
                }`}
              >
                {buttonText}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Subtle Faded English Brand Tag at Bottom Center */}
      <div
        className={`absolute bottom-6 sm:bottom-8 inset-x-0 flex items-center justify-center z-10 pointer-events-none px-4 text-center select-none ${
          isTransitioning ? 'animate-luxury-brandtag-exit' : ''
        }`}
      >
        <span className="font-cinzel text-[10px] sm:text-xs tracking-[0.38em] sm:tracking-[0.45em] text-[#E5C378]/35 sm:text-[#E5C378]/40 uppercase font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
          saeedniajewellerygrandbazar
        </span>
      </div>
    </div>
  );
};
