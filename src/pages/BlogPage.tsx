import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BookOpen, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { PageEditorialHeader } from '../components/PageEditorialHeader';
import { applyPageSeo, buildBreadcrumbSchema } from '../utils/seo';

export const BlogPage: React.FC = () => {
  const { lang, articles, settings, pages } = useApp();

  const pageData = (pages || []).find((p) => p.id === 'blog');

  // Update dynamic document title, canonical URL, OpenGraph, and Blog JSON-LD
  useEffect(() => {
    const browserTitle = lang === 'fa'
      ? (pageData?.browserTitleFa || 'وبلاگ و مقالات تخصصی | جواهری سعیدنیا')
      : (pageData?.browserTitleEn || 'The Saeednia Journal | Saeednia Jewellery');
    const seoTitle = lang === 'fa'
      ? (pageData?.seoTitleFa || pageData?.h1Fa || 'روایات زرگری و گوهرشناسی')
      : (pageData?.seoTitleEn || pageData?.h1En || 'The Saeednia Journal');
    const metaDesc = lang === 'fa'
      ? (pageData?.metaDescriptionFa || pageData?.descriptionFa || 'مقالات تخصصی گوهرشناسی، الماس طبیعی و تاریخچه زرگری اصیل در جواهری سعیدنیا.')
      : (pageData?.metaDescriptionEn || pageData?.descriptionEn || 'Insights into natural diamonds, gemological expertise, and fine goldsmithing.');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    applyPageSeo({
      browserTitle,
      seoTitle,
      metaDescription: metaDesc,
      canonicalPath: '/blog',
      robots: 'index, follow',
      ogType: 'website',
      ogImage: pageData?.featuredImage,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: seoTitle,
          description: metaDesc,
          url: `${origin}/blog`,
        },
        buildBreadcrumbSchema([
          { name: lang === 'fa' ? 'خانه' : 'Home', path: '/' },
          { name: lang === 'fa' ? 'وبلاگ' : 'Blog', path: '/blog' },
        ]),
      ],
    });
  }, [pageData, lang, settings]);

  // Only published non-deleted articles for public view
  const publishedArticles = (articles || []).filter((a) => a.published && !a.isDeleted);

  return (
    <div id="page-blog" className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] pt-32 sm:pt-40 pb-32">
      <PageEditorialHeader
        eyebrow="JOURNAL & HERITAGE"
        title={lang === 'fa' ? (pageData?.h1Fa || 'روایات زرگری و گوهرشناسی') : (pageData?.h1En || 'The Saeednia Journal')}
        subtitle={lang === 'fa' ? pageData?.subtitleFa : pageData?.subtitleEn}
        description={
          lang === 'fa'
            ? (pageData?.descriptionFa ||
                'نگاهی تخصصی به دنیای الماس‌های طبیعی، گوهرشناسی، هنر دست‌ساز زرگران اصیل و تاریخچه فاخر طلا و جواهر در بازار بزرگ تهران.')
            : (pageData?.descriptionEn ||
                'Insights into natural diamonds, gemological expertise, bespoke goldsmithing, and the heritage of fine jewelry in Tehran Grand Bazaar.')
        }
      />

      <section aria-label={lang === 'fa' ? 'فهرست مقالات' : 'Articles list'} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {publishedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedArticles.map((article) => {
              const dateStr = new Date(article.createdAt).toLocaleDateString(
                lang === 'fa' ? 'fa-IR' : 'en-US',
                { year: 'numeric', month: 'long', day: 'numeric' }
              );

              return (
                <article
                  key={article.id}
                  className="group bg-white dark:bg-[#0A0A0D] border border-[#AC9262]/30 dark:border-[#C5A059]/20 hover:border-[#906D2D] dark:hover:border-[#D4AF37] rounded-sm flex flex-col overflow-hidden luxury-card-depth shadow-sm transition-all"
                >
                  {/* Top specular highlight */}
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-[#AC9262]/40 dark:via-[#C5A059]/40 group-hover:via-[#906D2D] dark:group-hover:via-[#D4AF37] transition-all" />

                  {/* Cover Image Stage */}
                  <Link
                    to={`/blog/${encodeURIComponent(article.slug)}`}
                    className="relative w-full aspect-[16/10] bg-[#FAF9F6] dark:bg-[#060608] flex items-center justify-center overflow-hidden"
                  >
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={lang === 'fa' ? article.titleFa : (article.titleEn || article.titleFa)}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#786F62] dark:text-[#736E67]">
                        <BookOpen className="w-10 h-10 text-[#906D2D]/30 dark:text-[#C5A059]/30 mb-2" />
                        <span className="text-[11px] font-persian-nav text-[#6E6153] dark:text-[#8C8880]">
                          {lang === 'fa' ? 'مقاله تخصصی' : 'Specialist Article'}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Article Summary */}
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-[#6E6153] dark:text-[#8C8880] mb-3">
                        <Calendar className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#C5A059]" />
                        <span className="font-mono">{dateStr}</span>
                      </div>

                      <h2 className="text-base sm:text-lg font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] group-hover:text-[#906D2D] dark:group-hover:text-[#D4AF37] transition-colors line-clamp-2 mb-3 leading-snug">
                        <Link to={`/blog/${encodeURIComponent(article.slug)}`} className="hover:underline">
                          {lang === 'fa' ? article.titleFa : (article.titleEn || article.titleFa)}
                        </Link>
                      </h2>

                      <p className="text-xs text-[#4A3F35] dark:text-[#9E9A92] font-persian-body line-clamp-3 leading-relaxed mb-6">
                        {lang === 'fa' ? article.excerptFa : (article.excerptEn || article.excerptFa)}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#AC9262]/20 dark:border-[#C5A059]/10">
                      <Link
                        to={`/blog/${encodeURIComponent(article.slug)}`}
                        className="inline-flex items-center gap-2 text-xs font-persian-nav text-[#906D2D] dark:text-[#C5A059] group-hover:text-[#1F1A16] dark:group-hover:text-[#EDE8DF] transition-colors"
                      >
                        <span>{lang === 'fa' ? 'مطالعه کامل مقاله' : 'Read Full Article'}</span>
                        {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Clean Luxury Empty State When No Articles Published Yet */
          <div className="py-20 text-center bg-white dark:bg-[#09090C] border border-[#AC9262]/30 dark:border-[#C5A059]/15 rounded-sm p-8 max-w-lg mx-auto shadow-md">
            <BookOpen className="w-10 h-10 text-[#906D2D] dark:text-[#C5A059] mx-auto mb-4 opacity-80" />
            <h3 className="text-lg font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] mb-2">
              {lang === 'fa' ? 'روایات جدید به زودی منتشر خواهند شد' : 'Articles Coming Soon'}
            </h3>
            <p className="text-xs text-[#4A3F35] dark:text-[#8C8880] max-w-sm mx-auto font-persian-body leading-relaxed mb-6">
              {lang === 'fa'
                ? 'مقالات و روایات پیرامون گوهرشناسی و اصالت هنر زرگری در حال نگارش توسط اساتید جواهری سعیدنیا است.'
                : 'Curated articles and insights on Persian goldsmithing and fine gemology are currently being prepared.'}
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-2.5 bg-[#906D2D] hover:bg-[#7D5E26] dark:bg-[#C5A059] dark:hover:bg-[#D4AF37] text-white dark:text-[#0A0A0D] text-xs font-persian-nav rounded-sm tracking-wide transition-colors"
            >
              {lang === 'fa' ? 'بازگشت به صفحه اصلی' : 'Back to Home'}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};
