import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { OfficialLogo } from '../components/OfficialLogo';
import { CategoryMarquee } from '../components/CategoryMarquee';
import { LatestCreationsShowcase } from '../components/LatestCreationsShowcase';
import { BoutiqueVisitSection } from '../components/BoutiqueVisitSection';
import { AmbientJewelleryDecor } from '../components/AmbientJewelleryDecor';
import { LuxuryLightDecor } from '../components/LuxuryLightDecor';
import { ArrowLeft, ArrowRight, Sparkles, Eye, ShieldCheck, Gem } from 'lucide-react';
import type { Product, CategoryInfo } from '../types';
import { applyPageSeo } from '../utils/seo';
import {
  formatTelHref,
  resolveActivePhoneNumbers,
  resolveActiveSocialLinks,
} from '../utils/contactAndArticles';

export const HomePage: React.FC = () => {
  const { lang, products, categories, settings, pages, setSelectedCategory, theme } = useApp();
  const navigate = useNavigate();

  const homePageData = (pages || []).find((p) => p.id === 'home');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const brandFa = settings?.brandNameFa || 'جواهری سعیدنیا';
    const brandEn = settings?.brandNameEn || 'Saeednia Jewellery';
    const lat = settings?.contact?.coordinates?.lat || 35.6744;
    const lng = settings?.contact?.coordinates?.lng || 51.4216;
    const phones = resolveActivePhoneNumbers(settings?.contact)
      .map((p) => formatTelHref(p).replace(/^tel:/, '') || p)
      .filter(Boolean);
    const sameAsUrls = resolveActiveSocialLinks(settings?.contact)
      .map((s) => s.url)
      .filter((u) => /^https:\/\//i.test(u));

    const storeSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': ['JewelryStore', 'LocalBusiness'],
      '@id': `${origin}/#organization`,
      name: `${brandFa} | ${brandEn}`,
      url: origin,
      logo: `${origin}${settings?.logoUrl || '/images/7.png'}`,
      description:
        (lang === 'fa' ? homePageData?.metaDescriptionFa : homePageData?.metaDescriptionEn) ||
        settings?.taglineFa ||
        'جواهری سعیدنیا بازار بزرگ تهران',
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings?.contact?.addressFa || 'بازار بزرگ تهران، بازار زرگرها، جواهری سعیدنیا',
        addressLocality: 'Tehran',
        addressCountry: 'IR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: lat,
        longitude: lng,
      },
      sameAs: sameAsUrls,
    };
    if (phones.length === 1) storeSchema.telephone = phones[0];
    else if (phones.length > 1) storeSchema.telephone = phones;

    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: origin,
      name: brandFa,
      inLanguage: ['fa-IR', 'en-US'],
      publisher: { '@id': `${origin}/#organization` },
    };

    applyPageSeo({
      browserTitle:
        (lang === 'fa' ? homePageData?.browserTitleFa : homePageData?.browserTitleEn) ||
        (lang === 'fa' ? 'جواهری سعیدنیا بازار بزرگ تهران | Saeednia Jewellery' : 'Saeednia Jewellery Grand Bazaar Tehran'),
      seoTitle: lang === 'fa' ? homePageData?.seoTitleFa : homePageData?.seoTitleEn,
      metaDescription: lang === 'fa' ? homePageData?.metaDescriptionFa : homePageData?.metaDescriptionEn,
      canonicalPath: '/',
      robots: 'index, follow',
      ogType: 'website',
      ogImage: homePageData?.featuredImage || '/images/saeednia-hero-dark-final.webp',
      jsonLd: [storeSchema, websiteSchema],
    });
  }, [homePageData, lang, settings]);

  const hero = settings?.hero;
  // Official theme-specific hero images per master specification
  const currentHeroImage = theme === 'light'
    ? '/images/saeednia-hero-light-final.webp'
    : '/images/saeednia-hero-dark-final.webp';

  const showHero = settings?.sectionsVisibility?.hero !== false;
  const showCategories = settings?.sectionsVisibility?.categories !== false;
  const showHeritage = settings?.sectionsVisibility?.heritage !== false;

  const handleCategoryClick = (catKey: string) => {
    setSelectedCategory(catKey);
    const matched = categories.find((c) => !c.isDeleted && c.key === catKey);
    const catSlug = (matched?.slug || catKey.replace(/_/g, '-')).trim();
    navigate(catSlug ? `/categories/${encodeURIComponent(catSlug)}` : `/categories?cat=${encodeURIComponent(catKey)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="page-home" className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-500 relative">
      
      {/* =========================================================================
          SECTION A — OFFICIAL SAEEDNIA JEWELLERY MASTER HERO
          Uses official Light Hero in light mode, and Dark Hero in dark mode.
          Framed master artwork with ambient flanks.
          Vertical padding reduced by ~25% for tighter rhythm.
         ========================================================================= */}
      {showHero && (
      <section
        id="section-hero-master"
        className="relative w-full pt-12 sm:pt-14 pb-5 sm:pb-7 overflow-hidden flex flex-col items-center"
      >
        {/* Ambient Decorative Jewelry Geometry & Lighting */}
        <AmbientJewelleryDecor position="hero-flanks" />
        {/* Fine Light Theme Diamond & Star Accents */}
        <LuxuryLightDecor section="hero" />

        <div className="relative w-full max-w-[1580px] mx-auto px-2 sm:px-6 lg:px-8 z-10">
          
          {/* Framed Master Artwork Stage with soft champagne gold border in light mode */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[84vh] rounded-sm overflow-hidden border-2 border-[#E8DFD0] hover:border-[#D8BD8A] dark:border-[#C5A059]/25 shadow-2xl transition-all duration-500">
            {/* Top subtle 3D metallic specular reflection line */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#C5A059]/60 dark:via-[#D4AF37]/70 to-transparent pointer-events-none z-10" />

            {/* Official Master Hero Image (Light WebP in Light mode, Dark WebP in Dark mode) */}
            <img
              key={theme}
              src={currentHeroImage}
              alt="Saeednia Jewellery GrandBazar | جواهری سعیدنیا بازار بزرگ تهران"
              className="w-full h-full object-cover object-[50%_center] select-none transition-all duration-700 ease-out"
              loading="eager"
              fetchPriority="high"
            />

            {/* Bottom Feathered Blend: Light theme blends to #FAF9F6, Dark theme blends to #090909 */}
            <div className="absolute inset-x-0 bottom-0 h-14 sm:h-20 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/40 to-transparent pointer-events-none z-10 transition-colors duration-500" />

            {/* Two Master Hero Action Buttons INSIDE the hero image frame (~10% beneath the centered logo, ~20% more compact) */}
            <div className="absolute inset-x-0 top-[55%] sm:top-[56%] flex items-center justify-center gap-2 sm:gap-3 md:gap-4 px-3 z-20 pointer-events-auto">
              
              {/* Right Button (First in RTL): «مشاهده جواهرات» */}
              <Link
                id="btn-hero-explore-jewellery"
                to="/categories"
                className="group relative inline-flex items-center justify-center px-3 sm:px-[19px] md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-sm text-[9.5px] sm:text-[10.5px] md:text-[11.5px] font-persian-nav tracking-wider whitespace-nowrap transition-all duration-300 shadow-md active:scale-95 bg-[#906D2D] hover:bg-[#7D5E26] text-white border-[1.5px] border-[#906D2D] dark:bg-gradient-to-b dark:from-[#C5A059] dark:to-[#A9874F] dark:hover:from-[#E1C58F] dark:hover:to-[#C5A059] dark:text-[#090909] dark:font-semibold dark:border-[#C5A059]/80 dark:shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(197,160,89,0.25)]"
              >
                <span>
                  {lang === 'fa'
                    ? (hero?.ctaPrimaryFa || 'مشاهده جواهرات')
                    : (hero?.ctaPrimaryEn || 'Explore Jewellery')}
                </span>
              </Link>

              {/* Left Button (Second in RTL): «تماس و نشانی گالری» */}
              <Link
                id="btn-hero-contact-gallery"
                to="/contact"
                className="group relative inline-flex items-center justify-center px-3 sm:px-[19px] md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-sm text-[9.5px] sm:text-[10.5px] md:text-[11.5px] font-persian-nav tracking-wider whitespace-nowrap transition-all duration-300 shadow-sm active:scale-95 bg-white hover:bg-[#FAF8F5] text-[#1F1A16] border-[1.5px] border-[#AC9262] hover:border-[#906D2D] backdrop-blur-sm dark:bg-[#151413]/85 dark:hover:bg-[#211E1A] dark:text-[#EDE8DF] dark:hover:text-[#E1C58F] dark:border-[#C5A059]/40 dark:hover:border-[#E1C58F] dark:shadow-[0_4px_16px_rgba(0,0,0,0.7)] font-medium"
              >
                <span>
                  {lang === 'fa'
                    ? (hero?.ctaSecondaryFa || 'تماس و نشانی گالری')
                    : (hero?.ctaSecondaryEn || 'Contact & Gallery')}
                </span>
              </Link>

            </div>
          </div>

          {/* Accessible Semantic H1 for screen readers & SEO (CMS controlled) */}
          <h1 className="sr-only">
            {lang === 'fa'
              ? (homePageData?.h1Fa || 'جواهری سعیدنیا بازار بزرگ تهران | Saeednia Jewellery GrandBazar')
              : (homePageData?.h1En || 'Saeednia Jewellery GrandBazar Tehran')}
          </h1>

        </div>
      </section>
      )}

      {/* =========================================================================
          SECTION C — JEWELRY CATEGORIES (SEAMLESS INFINITE MARQUEE)
          Warm Light Cream (#E4DBCB) with Pure White fade transitions.
          Vertical padding reduced by ~25%.
         ========================================================================= */}
      {showCategories && (
      <section
        id="section-categories"
        className="py-16 sm:py-22 md:py-26 bg-gradient-to-b from-white via-[#E4DBCB] to-white dark:from-[#090909] dark:via-[#151413] dark:to-[#090909] overflow-hidden transition-colors duration-500 relative"
      >
        {/* Ambient Jewelry Geometry and Halos */}
        <AmbientJewelleryDecor position="collections-flanks" />
        {/* Fine Light Theme Diamond & Star Accents */}
        <LuxuryLightDecor section="categories" />

        {/* =========================================================================
            TOP LIGHT HALO (حاله نور بالای بخش دسته‌بندی آثار - ملایم و نور طلایی روشن)
           ========================================================================= */}
        {/* Soft bright gold ambient halo flare at top in Dark Mode */}
        <div
          id="categories-halo-top"
          className="absolute -top-10 start-1/2 -translate-x-1/2 w-[550px] sm:w-[750px] md:w-[900px] h-[70px] sm:h-[85px] bg-gradient-to-b from-[#FFE8A3]/16 via-[#F6DF95]/8 to-transparent dark:from-[#FFE8A3]/12 dark:via-[#F6DF95]/6 dark:to-transparent rounded-full blur-2xl pointer-events-none z-10"
          aria-hidden="true"
        />
        {/* Precision hairline with soft bright gold specular glow */}
        <div
          className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFE8A3]/25 dark:via-[#F6DF95]/30 to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />
        {/* Mild top boundary fade to Hero */}
        <div
          className="absolute top-0 inset-x-0 h-16 sm:h-20 bg-gradient-to-b from-white/70 via-white/20 to-transparent dark:from-[#090909]/50 dark:via-[#090909]/15 dark:to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* =========================================================================
            BOTTOM LIGHT HALO (حاله نور پایین بخش دسته‌بندی آثار - ملایم و نور طلایی روشن)
           ========================================================================= */}
        {/* Mild bottom boundary fade to Latest Works */}
        <div
          className="absolute bottom-0 inset-x-0 h-16 sm:h-20 bg-gradient-to-t from-white/70 via-white/20 to-transparent dark:from-[#090909]/50 dark:via-[#090909]/15 dark:to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />
        {/* Precision hairline with soft bright gold specular glow */}
        <div
          className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFE8A3]/25 dark:via-[#F6DF95]/30 to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />
        {/* Soft bright gold ambient halo flare at bottom in Dark Mode */}
        <div
          id="categories-halo-bottom"
          className="absolute -bottom-10 start-1/2 -translate-x-1/2 w-[550px] sm:w-[750px] md:w-[900px] h-[70px] sm:h-[85px] bg-gradient-to-t from-[#FFE8A3]/16 via-[#F6DF95]/8 to-transparent dark:from-[#FFE8A3]/12 dark:via-[#F6DF95]/6 dark:to-transparent rounded-full blur-2xl pointer-events-none z-10"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-7 sm:mb-9 text-center relative z-20">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#E1C58F]" />
            <span className="font-cinzel text-xs text-[#906D2D] dark:text-[#C5A059] tracking-[0.3em] uppercase font-bold">
              COLLECTIONS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF]">
            {lang === 'fa' ? 'دسته‌بندی آثار جواهری سعیدنیا' : 'Jewellery Categories'}
          </h2>
        </div>

        {/* Seamless Continuous Marquee Carousel with Pointer Pause and Touch Drag */}
        <CategoryMarquee
          categories={categories}
          onSelectCategory={handleCategoryClick}
        />
      </section>
      )}

      {/* =========================================================================
          SECTION D — LATEST SAEEDNIA JEWELLERY (3D COVERFLOW SHOWCASE)
          Direction, speed, and pause settings are managed via Admin CMS.
          Only products flagged with showInLatestCreations are rendered.
         ========================================================================= */}
      <LatestCreationsShowcase
        products={products}
        settings={settings?.latestCreations}
      />

      {/* =========================================================================
          SECTION E — OUR HERITAGE AND 30 YEARS OF EXPERIENCE («اصالت و تجربه ما»)
          Warm Light Cream (#E4DBCB) & Golden Beige (#C8B696) with Pure White transitions.
          Vertical padding reduced by ~25%.
         ========================================================================= */}
      {showHeritage && (
      <section
        id="section-heritage-30-years"
        className="py-22 sm:py-28 md:py-34 bg-gradient-to-b from-white via-[#E4DBCB] to-white dark:from-[#090909] dark:via-[#151413] dark:to-[#090909] relative overflow-hidden transition-colors duration-500"
      >
        {/* Ambient Jewelry Concentric Arcs and Halos */}
        <AmbientJewelleryDecor position="heritage-backdrop" />
        {/* Fine Light Theme Diamond & Star Accents */}
        <LuxuryLightDecor section="heritage" />

        {/* =====================================================================
            1. Top Color-Gradient Halo: Seamless blend from Section D (Pure White)
           ===================================================================== */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-white via-white/50 to-transparent dark:from-[#090909] dark:via-[#151413]/50 pointer-events-none z-10" />

        {/* =====================================================================
            2. Bottom Color-Gradient Halo: Seamless blend into Section F (Pure White)
           ===================================================================== */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-[#090909] dark:via-[#151413]/50 pointer-events-none z-10" />

        {/* Central warm gold radial ambient aura */}
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-radial from-[#C8B696]/20 via-[#E4DBCB]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* =====================================================================
            3. Animated Sinusoidal Wave Ribbons: Smooth, calm flowing motion
           ===================================================================== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-55 dark:opacity-40">
          {/* Primary Flowing Sine Wave (Golden Bronze & Matte Gold) */}
          <div className="absolute top-1/3 -start-1/2 w-[200%] h-32 animate-sine-wave-glide">
            <svg
              viewBox="0 0 2400 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full preserve-3d"
            >
              <defs>
                <linearGradient id="sineGoldGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#AC9262" stopOpacity="0.2" />
                  <stop offset="25%" stopColor="#906D2D" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#C8B696" stopOpacity="0.95" />
                  <stop offset="75%" stopColor="#906D2D" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#AC9262" stopOpacity="0.2" />
                </linearGradient>
                <filter id="sineGlow1" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path
                d="M 0 60 Q 150 15 300 60 T 600 60 T 900 60 T 1200 60 T 1500 60 T 1800 60 T 2100 60 T 2400 60"
                stroke="url(#sineGoldGradient1)"
                strokeWidth="2.2"
                filter="url(#sineGlow1)"
                fill="none"
              />
            </svg>
          </div>

          {/* Secondary Counter-Flowing Sine Wave (Gentle Bronze & Beige Interplay) */}
          <div className="absolute top-2/3 -start-1/2 w-[200%] h-32 animate-sine-wave-glide-slow">
            <svg
              viewBox="0 0 2400 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full preserve-3d"
            >
              <defs>
                <linearGradient id="sineGoldGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#906D2D" stopOpacity="0.2" />
                  <stop offset="35%" stopColor="#C8B696" stopOpacity="0.75" />
                  <stop offset="65%" stopColor="#AC9262" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#906D2D" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M 0 60 Q 150 105 300 60 T 600 60 T 900 60 T 1200 60 T 1500 60 T 1800 60 T 2100 60 T 2400 60"
                stroke="url(#sineGoldGradient2)"
                strokeWidth="1.8"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center relative z-20">
          
          <div className="inline-flex items-center gap-2 mb-2.5">
            <ShieldCheck className="w-4 h-4 text-[#906D2D] dark:text-[#D4AF37]" />
            <span className="font-cinzel text-xs sm:text-sm text-[#906D2D] dark:text-[#C5A059] tracking-[0.32em] uppercase font-bold">
              HERITAGE & EXPERIENCE
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-persian-heading text-[#1F1A16] dark:text-[#FAF8F3] mb-6 tracking-tight drop-shadow-sm">
            {lang === 'fa'
              ? (settings?.about?.headlineFa || '«اصالت و تجربه ما»')
              : (settings?.about?.headlineEn || 'Our Heritage & 30 Years of Experience')}
          </h2>

          <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#906D2D] dark:via-[#D4AF37] to-transparent mx-auto mb-6 shadow-sm" />

          {/* Exact Brand Message: Deep charcoal text for maximum contrast */}
          <blockquote className="text-base sm:text-xl md:text-2xl text-[#1F1A16] dark:text-[#EDE8DF] font-persian-body font-semibold leading-[2.3] sm:leading-[2.6] max-w-3xl mx-auto mb-7 text-justify sm:text-center">
            {lang === 'fa'
              ? (settings?.about?.quoteFa ||
                '«سی سال تجربه، حاصل سال‌ها دقت، شناخت و احترام به هنر جواهرسازی است. در جواهری سعیدنیا، هر انتخاب با نگاهی به ظرافت، کیفیت و ماندگاری انجام می‌شود؛ زیرا باور داریم ارزش یک جواهر، تنها در درخشش آن نیست، بلکه در اصالتی است که با خود همراه دارد.»')
              : (settings?.about?.quoteEn ||
                '“Thirty years of experience is the result of years of precision, insight, and respect for the art of high jewelry. At Saeednia Jewellery, every selection is made with a focus on delicacy, quality, and enduring value; because we believe the true worth of a jewel lies not only in its brilliance, but in the authenticity it carries.”')}
          </blockquote>

          <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#906D2D] dark:via-[#D4AF37] to-transparent mx-auto mb-6 shadow-sm" />

          <div className="flex flex-col items-center">
            <span className="font-cinzel text-xs sm:text-sm tracking-[0.3em] uppercase text-[#906D2D] dark:text-[#D4AF37] font-bold">
              {(settings?.brandNameEn || 'SAEEDNIA JEWELLERY').toUpperCase()}
            </span>
            <span className="text-xs sm:text-sm font-persian-nav text-[#4A3F35] dark:text-[#8C8880] mt-1 font-semibold">
              {lang === 'fa'
                ? (settings?.locationIdentityFa || settings?.about?.locationIdentityFa || 'بازار بزرگ تهران • بازار زرگرها')
                : (settings?.locationIdentityEn || settings?.about?.locationIdentityEn || 'Grand Bazaar Tehran • Zargaran Bazaar')}
            </span>
          </div>

        </div>
      </section>
      )}

      {/* =========================================================================
          SECTION F — PHYSICAL BOUTIQUE VISIT INFORMATION & HOURS
          Luxury circular framed boutique view, visiting hours, and direct navigation.
         ========================================================================= */}
      <BoutiqueVisitSection settings={settings?.boutiqueSection} />

    </div>
  );
};
