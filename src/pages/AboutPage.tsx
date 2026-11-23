import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageEditorialHeader } from '../components/PageEditorialHeader';
import { AboutGallerySection } from '../components/AboutGallerySection';
import { resolveAboutGallerySettings } from '../utils/aboutGallery';
import { applyPageSeo, buildBreadcrumbSchema } from '../utils/seo';

export const AboutPage: React.FC = () => {
  const { lang, settings, pages, theme } = useApp();
  const isLight = theme === 'light';
  const pageData = (pages || []).find((p) => p.id === 'about');
  const about = settings?.about;
  const gallerySettings = resolveAboutGallerySettings(about);
  const galleryPlacement = gallerySettings.placement;

  // Dynamic document title, canonical URL & AboutPage JSON-LD
  useEffect(() => {
    const browserTitle = lang === 'fa'
      ? (pageData?.browserTitleFa || 'درباره ما | جواهری سعیدنیا')
      : (pageData?.browserTitleEn || 'About Us | Saeednia Jewellery');
    const seoTitle = lang === 'fa'
      ? (pageData?.seoTitleFa || pageData?.h1Fa || about?.titleFa || 'درباره ما')
      : (pageData?.seoTitleEn || pageData?.h1En || about?.titleEn || 'About Us');
    const metaDesc = lang === 'fa'
      ? (pageData?.metaDescriptionFa || about?.descriptionFa || '')
      : (pageData?.metaDescriptionEn || about?.descriptionEn || '');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    applyPageSeo({
      browserTitle,
      seoTitle,
      metaDescription: metaDesc,
      canonicalPath: '/about',
      robots: 'index, follow',
      ogType: 'website',
      ogImage: pageData?.featuredImage || about?.imageUrl,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: seoTitle,
          description: metaDesc,
          url: `${origin}/about`,
        },
        buildBreadcrumbSchema([
          { name: lang === 'fa' ? 'خانه' : 'Home', path: '/' },
          { name: lang === 'fa' ? 'درباره ما' : 'About Us', path: '/about' },
        ]),
      ],
    });
  }, [pageData, about, lang, settings]);

  const titleFa = pageData?.h1Fa || about?.titleFa || 'درباره ما';
  const titleEn = pageData?.h1En || about?.titleEn || 'About Us';
  const headlineFa = pageData?.subtitleFa || about?.headlineFa;
  const headlineEn = pageData?.subtitleEn || about?.headlineEn;
  const descFa = pageData?.descriptionFa || about?.descriptionFa || 'جواهری سعیدنیا در بازار بزرگ تهران، ارائه‌دهنده آثار فاخر و دست‌سازه‌های زرگری با تکیه بر اصالت، زیبایی و هنر گوهرشناسی.';
  const descEn = pageData?.descriptionEn || about?.descriptionEn || 'Saeedniajewellerygrandbazar presents a curated collection of fine jewelry rooted in authentic craftsmanship in Tehran Grand Bazaar.';
  const storyFa = about?.storyFa && about.storyFa.length > 0 ? about.storyFa : [descFa];
  const storyEn = about?.storyEn && about.storyEn.length > 0 ? about.storyEn : [descEn];
  const quoteFa = about?.quoteFa;
  const quoteEn = about?.quoteEn;
  const hasQuote = Boolean((lang === 'fa' && quoteFa) || (lang === 'en' && quoteEn));

  return (
    <article id="page-about" className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] pt-36 sm:pt-48 pb-36 selection:bg-[#906D2D]/25">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Engineered Contrast Header Capsule */}
        <PageEditorialHeader
          eyebrow="Saeedniajewellerygrandbazar"
          title={lang === 'fa' ? titleFa : titleEn}
          subtitle={headlineFa || headlineEn ? (lang === 'fa' ? headlineFa : (headlineEn || headlineFa)) : undefined}
          maxWidthClass="max-w-3xl"
        />

        {galleryPlacement === 'before_story' && (
          <AboutGallerySection about={about} lang={lang} isLight={isLight} />
        )}

        {/* Narrative Paragraphs with Generous Editorial Negative Space */}
        <div className="space-y-8 sm:space-y-10 max-w-2xl mx-auto">
          {lang === 'fa' ? (
            <div className="space-y-7" dir="rtl">
              {storyFa.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-base sm:text-lg font-light text-[#4A3F35] dark:text-[#C8C4BC] leading-[2.3] sm:leading-[2.5] font-vazir text-justify"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <div className="space-y-7" dir="ltr">
              {storyEn.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-sm sm:text-base font-light text-[#4A3F35] dark:text-[#C8C4BC] leading-relaxed font-sans tracking-wide text-justify"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>

        {galleryPlacement === 'after_story' && (
          <AboutGallerySection about={about} lang={lang} isLight={isLight} />
        )}

        {/* Luxury Restrained Quote */}
        {hasQuote && (
          <div className="my-16 sm:my-24 py-8 text-center max-w-xl mx-auto">
            <div className="w-12 h-[1px] bg-[#AC9262]/30 dark:bg-[#C5A059]/30 mx-auto mb-8" />
            <blockquote className="text-lg sm:text-xl font-extralight text-[#906D2D] dark:text-[#D4AF37] font-vazir leading-loose tracking-wide italic">
              {lang === 'fa' ? quoteFa : quoteEn}
            </blockquote>
            <div className="w-12 h-[1px] bg-[#AC9262]/30 dark:bg-[#C5A059]/30 mx-auto mt-8" />
          </div>
        )}

        {(galleryPlacement === 'after_quote' || galleryPlacement === 'bottom') && (
          <AboutGallerySection about={about} lang={lang} isLight={isLight} />
        )}

      </div>
    </article>
  );
};

