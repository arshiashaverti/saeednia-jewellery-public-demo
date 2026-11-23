import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Gem, Award, ShieldCheck } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { PageEditorialHeader } from '../components/PageEditorialHeader';
import { applyPageSeo, buildBreadcrumbSchema } from '../utils/seo';

export const FineJewelryPage: React.FC = () => {
  const { lang, products, settings, pages, layoutSettings } = useApp();
  const pageData = (pages || []).find((p) => p.id === 'fine-jewelry');
  const gridConfig = layoutSettings?.fineJewelryPage;

  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(gridConfig?.itemsPerPage || 9);

  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(gridConfig?.itemsPerPage || 9);
  }, [gridConfig?.itemsPerPage]);

  // Update dynamic document title, canonical URL, OpenGraph, and JSON-LD schema
  useEffect(() => {
    const browserTitle = lang === 'fa'
      ? (pageData?.browserTitleFa || 'جواهرات فاخر | جواهری سعیدنیا')
      : (pageData?.browserTitleEn || 'Fine & High Jewellery | Saeednia Jewellery');
    const seoTitle = lang === 'fa'
      ? (pageData?.seoTitleFa || pageData?.h1Fa || settings?.fineJewelryPageSettings?.titleFa || 'جواهرات فاخر سعیدنیا')
      : (pageData?.seoTitleEn || pageData?.h1En || settings?.fineJewelryPageSettings?.titleEn || 'Fine & High Jewellery');
    const metaDesc = lang === 'fa'
      ? (pageData?.metaDescriptionFa || pageData?.descriptionFa || 'کلکسیون جواهرات فاخر سعیدنیا شامل برلیان‌های شناسنامه‌دار و آثار تک زرگری.')
      : (pageData?.metaDescriptionEn || pageData?.descriptionEn || 'Curated high jewellery pieces crafted with certified natural diamonds.');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    applyPageSeo({
      browserTitle,
      seoTitle,
      metaDescription: metaDesc,
      canonicalPath: '/fine-jewelry',
      robots: 'index, follow',
      ogType: 'website',
      ogImage: pageData?.featuredImage,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: seoTitle,
          description: metaDesc,
          url: `${origin}/fine-jewelry`,
        },
        buildBreadcrumbSchema([
          { name: lang === 'fa' ? 'خانه' : 'Home', path: '/' },
          { name: lang === 'fa' ? 'جواهرات فاخر' : 'Fine Jewellery', path: '/fine-jewelry' },
        ]),
      ],
    });
  }, [pageData, lang, settings]);

  // Curated Fine Jewelry / Haute Joaillerie items (published, non-test, non-deleted)
  const fineJewelryPieces = useMemo(
    () =>
      products
        .filter(
          (p) =>
            p.visibility &&
            p.status !== 'draft' &&
            !p.isTest &&
            !p.isDeleted &&
            (Boolean(p.showInFineJewelry) ||
              p.featured ||
              p.category.includes('sets') ||
              p.category.includes('colored_gemstone_rings'))
        )
        .sort((a, b) => (a.fineJewelryOrder || a.displayOrder || 1) - (b.fineJewelryOrder || b.displayOrder || 1)),
    [products]
  );

  const itemsPerPage = gridConfig?.itemsPerPage || 9;
  const paginationMode = gridConfig?.paginationMode || 'view_all';
  const totalPages = Math.max(1, Math.ceil(fineJewelryPieces.length / itemsPerPage));
  const displayedPieces = useMemo(() => {
    if (paginationMode === 'view_all') return fineJewelryPieces;
    if (paginationMode === 'infinite') return fineJewelryPieces.slice(0, visibleCount);
    const start = (currentPage - 1) * itemsPerPage;
    return fineJewelryPieces.slice(start, start + itemsPerPage);
  }, [fineJewelryPieces, paginationMode, currentPage, itemsPerPage, visibleCount]);

  const gapClass =
    gridConfig?.cardGap === 16 ? 'gap-4' : gridConfig?.cardGap === 32 ? 'gap-8 sm:gap-10' : 'gap-6 sm:gap-8';

  const desktopCols = gridConfig?.columnsDesktop || settings?.fineJewelryPageSettings?.columnsDesktop || 3;
  const colsDesktopClass =
    desktopCols === 5
      ? 'lg:grid-cols-5'
      : desktopCols === 4
      ? 'lg:grid-cols-4'
      : desktopCols === 2
      ? 'lg:grid-cols-2'
      : 'lg:grid-cols-3';

  const colsTabletClass =
    gridConfig?.columnsTablet === 3
      ? 'sm:grid-cols-3'
      : gridConfig?.columnsTablet === 1
      ? 'sm:grid-cols-1'
      : 'sm:grid-cols-2';

  const colsMobileClass = gridConfig?.columnsMobile === 2 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div id="page-fine-jewelry" className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] pt-32 sm:pt-40 pb-32">
      
      {/* Engineered Contrast Header Capsule with dynamic CMS H1 */}
      <PageEditorialHeader
        eyebrow="HAUTE JOAILLERIE"
        title={
          lang === 'fa'
            ? (pageData?.h1Fa || settings?.fineJewelryPageSettings?.titleFa || 'جواهرات فاخر سعیدنیا')
            : (pageData?.h1En || settings?.fineJewelryPageSettings?.titleEn || 'Fine & High Jewellery')
        }
        subtitle={
          lang === 'fa'
            ? (pageData?.subtitleFa || settings?.fineJewelryPageSettings?.subtitleFa)
            : (pageData?.subtitleEn || settings?.fineJewelryPageSettings?.subtitleEn)
        }
        description={lang === 'fa' ? pageData?.descriptionFa : pageData?.descriptionEn}
      />

      {/* Pillars of Haute Joaillerie */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-[#09090C] border border-[#AC9262]/30 dark:border-[#C5A059]/20 rounded-sm luxury-card-depth shadow-sm">
            <Gem className="w-6 h-6 text-[#906D2D] dark:text-[#D4AF37] mb-3" />
            <h3 className="text-base font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] mb-2">
              {lang === 'fa' ? 'سنگ‌های قیمتی شناسنامه‌دار' : 'Certified Natural Gems'}
            </h3>
            <p className="text-xs text-[#4A3F35] dark:text-[#9E9A92] font-persian-body leading-relaxed">
              {lang === 'fa'
                ? 'کارشناسی دقیق الماس‌های طبیعی و گوهرهای رنگی اصیل با معتبرترین شناسنامه‌های بین‌المللی و استاندارد گوهرشناسی.'
                : 'Rigorous gemological grading of natural diamonds and rare colored gems with international certifications.'}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#09090C] border border-[#AC9262]/30 dark:border-[#C5A059]/20 rounded-sm luxury-card-depth shadow-sm">
            <Award className="w-6 h-6 text-[#906D2D] dark:text-[#D4AF37] mb-3" />
            <h3 className="text-base font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] mb-2">
              {lang === 'fa' ? 'زرگری دست‌ساز و سفارشی' : 'Bespoke Atelier Commissions'}
            </h3>
            <p className="text-xs text-[#4A3F35] dark:text-[#9E9A92] font-persian-body leading-relaxed">
              {lang === 'fa'
                ? 'آفرینش طرح‌های تک و اختصاصی متناسب با سلیقه شما با بالاترین عیار طلا و تکنیک‌های کهن مخراج‌کاری.'
                : 'Custom conceptual design and master goldsmithing tailored to private commissions.'}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#09090C] border border-[#AC9262]/30 dark:border-[#C5A059]/20 rounded-sm luxury-card-depth shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#906D2D] dark:text-[#D4AF37] mb-3" />
            <h3 className="text-base font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] mb-2">
              {lang === 'fa' ? 'تضمین اصالت و ماندگاری' : 'Generational Authenticity'}
            </h3>
            <p className="text-xs text-[#4A3F35] dark:text-[#9E9A92] font-persian-body leading-relaxed">
              {lang === 'fa'
                ? 'تداوم سی سال اعتبار و رضایت مشتریان در بازار بزرگ تهران، پشتوانه هر خرید و انتخاب شماست.'
                : 'Backed by three decades of reputation and trust in Tehran Grand Bazaar.'}
            </p>
          </div>
        </div>
      </section>

      {/* Curated Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="mb-8 pb-4 border-b border-[#AC9262]/20 dark:border-[#C5A059]/15 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF]">
            {lang === 'fa' ? 'گزیده آثار فاخر' : 'Curated Masterpieces'}
          </h2>
          <span className="text-xs text-[#6E6153] dark:text-[#8C8880] font-mono">
            {fineJewelryPieces.length} {lang === 'fa' ? 'اثر' : 'creations'}
          </span>
        </div>

        {displayedPieces.length > 0 ? (
          <>
            <div className={`grid ${gapClass} ${colsMobileClass} ${colsTabletClass} ${colsDesktopClass}`}>
              {displayedPieces.map((piece) => (
                <ProductCard
                  key={piece.id}
                  product={piece}
                  imageAspect={gridConfig?.imageAspectRatio || 'square'}
                  showProductName={gridConfig?.showProductName !== false}
                  showProductCode={Boolean(gridConfig?.showProductCode)}
                  showShortDescription={Boolean(gridConfig?.showShortDescription)}
                />
              ))}
            </div>

            {paginationMode === 'pagination' && totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 320, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-sm text-xs font-mono transition-all border ${
                        isActive
                          ? 'bg-[#906D2D] dark:bg-[#C5A059] text-white dark:text-[#0A0A0B] border-[#906D2D] dark:border-[#D4AF37] font-bold shadow'
                          : 'bg-white dark:bg-[#0D0D10] text-[#4A3F35] dark:text-[#C8C4BC] border-[#AC9262]/30 dark:border-[#C5A059]/20 hover:border-[#906D2D] dark:hover:border-[#C5A059]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}

            {paginationMode === 'infinite' && visibleCount < fineJewelryPieces.length && (
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + itemsPerPage)}
                  className="px-7 py-2.5 bg-white dark:bg-[#0D0D10] border border-[#AC9262]/40 dark:border-[#C5A059]/30 hover:border-[#906D2D] dark:hover:border-[#D4AF37] text-[#1F1A16] dark:text-[#EDE8DF] text-xs font-persian-nav rounded-sm transition-colors shadow-sm"
                >
                  {lang === 'fa' ? 'مشاهده آثار بیشتر' : 'Load More Creations'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center bg-white dark:bg-[#09090C] border border-[#AC9262]/30 dark:border-[#C5A059]/15 rounded-sm p-8 max-w-lg mx-auto shadow-md">
            <Gem className="w-8 h-8 text-[#906D2D] dark:text-[#C5A059] mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] mb-2">
              {lang === 'fa' ? 'آثار اختصاصی در کارگاه در حال آماده‌سازی هستند' : 'Atelier Masterpieces in Progress'}
            </h3>
            <p className="text-xs text-[#4A3F35] dark:text-[#8C8880] max-w-md mx-auto mb-6 font-persian-body leading-relaxed">
              {lang === 'fa'
                ? 'جهت مشاهده آثار فاخر موجود در سالن یا سفارش ساخت قطعات سفارشی با ما در تماس باشید.'
                : 'Contact our atelier in Tehran Grand Bazaar for private viewing of bespoke collections.'}
            </p>
            <Link
              to="/contact"
              className="inline-block px-6 py-2.5 bg-[#906D2D] hover:bg-[#7D5E26] dark:bg-[#C5A059] dark:hover:bg-[#D4AF37] text-white dark:text-[#0A0A0D] text-xs font-persian-nav rounded-sm tracking-wide transition-colors"
            >
              {lang === 'fa' ? 'تماس با ما' : 'Contact Atelier'}
            </Link>
          </div>
        )}
      </section>

    </div>
  );
};
