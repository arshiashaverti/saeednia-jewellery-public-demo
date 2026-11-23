import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BookOpen, Sparkles } from 'lucide-react';
import type { Article } from '../types';
import { applyPageSeo, buildBreadcrumbSchema } from '../utils/seo';
import { safeParseJsonResponse } from '../lib/api';
import { ArticleReaderView } from '../components/ArticleReaderView';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang, articles, products, categories, settings, token, showToast, theme } = useApp();
  const isLight = theme === 'light';
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = (articles || []).find((a) => !a.isDeleted && (a.slug === slug || a.id === slug));
    if (found) {
      setArticle(found);
      setLoading(false);
      return;
    }

    if (slug) {
      setLoading(true);
      fetch(`/api/articles/${encodeURIComponent(slug)}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => safeParseJsonResponse<Article>(res))
        .then((parsed) => {
          setArticle(parsed.ok && parsed.data ? parsed.data : null);
        })
        .catch(() => {
          setArticle(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [slug, articles, token]);

  useEffect(() => {
    const brandName = settings?.brandNameFa || 'جواهری سعیدنیا';
    if (article) {
      const titleText = lang === 'fa' ? article.titleFa : article.titleEn || article.titleFa;
      const seoTitle = lang === 'fa' ? article.seoTitleFa || titleText : article.seoTitleEn || titleText;
      const metaDesc =
        lang === 'fa'
          ? article.metaDescriptionFa || article.excerptFa
          : article.metaDescriptionEn || article.excerptEn || article.excerptFa;
      const canonicalPath = `/blog/${encodeURIComponent(article.slug)}`;
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const imgUrl = article.coverImage
        ? /^https?:\/\//i.test(article.coverImage)
          ? article.coverImage
          : `${origin}${article.coverImage.startsWith('/') ? article.coverImage : `/${article.coverImage}`}`
        : `${origin}/images/saeednia-hero-dark-final.webp`;

      const matchedCat = categories.find(
        (c) =>
          !c.isDeleted &&
          c.enabled !== false &&
          (c.nameFa === article.category || c.nameEn === article.category || c.key === article.category)
      );
      const breadcrumbItems = [
        { name: lang === 'fa' ? 'خانه' : 'Home', path: '/' },
        { name: lang === 'fa' ? 'وبلاگ' : 'Blog', path: '/blog' },
        ...(article.category
          ? [
              {
                name: article.category,
                path: matchedCat
                  ? `/categories/${encodeURIComponent(matchedCat.slug || matchedCat.key)}`
                  : '/blog',
              },
            ]
          : []),
        { name: titleText, path: canonicalPath },
      ];

      applyPageSeo({
        browserTitle: `${titleText} | ${brandName}`,
        seoTitle,
        metaDescription: metaDesc,
        canonicalPath,
        robots: article.published === false ? 'noindex, nofollow' : 'index, follow',
        ogType: 'article',
        ogImage: article.coverImage,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: titleText,
            description: metaDesc,
            image: imgUrl,
            datePublished: article.publishedAt || article.createdAt,
            dateModified: article.updatedAt || article.createdAt,
            author: { '@type': 'Organization', name: article.author || brandName },
            publisher: {
              '@type': 'Organization',
              name: brandName,
              logo: { '@type': 'ImageObject', url: `${origin}${settings?.logoUrl || '/images/7.png'}` },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${origin}${canonicalPath}` },
          },
          buildBreadcrumbSchema(breadcrumbItems),
        ],
      });
    } else if (!loading) {
      applyPageSeo({
        browserTitle: `${lang === 'fa' ? 'مقاله یافت نشد' : 'Article Not Found'} | ${brandName}`,
        metaDescription: 'مقاله مورد نظر در جواهری سعیدنیا یافت نشد.',
        robots: 'noindex, nofollow',
      });
    }
  }, [article, loading, lang, settings, categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070709] text-[#1F1A16] dark:text-[#EDE8DF] flex items-center justify-center pt-32 pb-32">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#906D2D] dark:text-[#C5A059] animate-spin" />
          <span className="text-xs font-persian-nav text-[#6E6153] dark:text-[#8C8880]">در حال بارگذاری روایت...</span>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070709] text-[#1F1A16] dark:text-[#EDE8DF] flex flex-col items-center justify-center px-4 pt-32 pb-32 text-center">
        <BookOpen className="w-12 h-12 text-[#906D2D]/40 dark:text-[#C5A059]/40 mb-4" />
        <h1 className="text-2xl font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] mb-3">مقاله مورد نظر یافت نشد</h1>
        <p className="text-xs text-[#4A3F35] dark:text-[#8C8880] font-persian-body mb-6">
          ممکن است این مطلب حذف شده یا هنوز به صورت عمومی منتشر نشده باشد.
        </p>
        <Link
          to="/blog"
          className="px-6 py-2.5 bg-[#906D2D] hover:bg-[#7D5E26] text-white dark:bg-[#C5A059] dark:hover:bg-[#D4AF37] dark:text-[#0A0A0D] text-xs font-persian-nav rounded-sm transition-colors"
        >
          بازگشت به وبلاگ
        </Link>
      </div>
    );
  }

  return (
    <article
      id="page-article-detail"
      className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] pt-32 sm:pt-40 pb-32"
    >
      <ArticleReaderView
        article={article}
        lang={lang}
        isLight={isLight}
        products={products}
        categories={categories}
        articles={articles}
        settings={settings}
        onCopyLink={() => {
          showToast(lang === 'fa' ? 'پیوند مقاله در حافظه کپی شد' : 'Article link copied', 'success');
        }}
      />
    </article>
  );
};
