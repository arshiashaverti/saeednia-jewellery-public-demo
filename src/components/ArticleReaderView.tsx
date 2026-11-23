import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  List,
  MessageCircle,
  RefreshCw,
  User,
} from 'lucide-react';
import type { Article, CategoryInfo, Product, SiteSettings } from '../types';
import { ArticleSidebar } from './ArticleSidebar';
import { RichInlineToken } from '../utils/customPages';
import {
  buildCanonicalArticleUrl,
  buildWhatsAppShareUrl,
  hasDistinctUpdatedDate,
  parseArticleContentDocument,
} from '../utils/articleContent';
import {
  calculateReadingTimeMinutes,
  formatReadingTimeLabel,
  resolveActiveSocialLinks,
} from '../utils/contactAndArticles';

export interface ArticleReaderViewProps {
  article: Article;
  lang: 'fa' | 'en';
  isLight: boolean;
  products: Product[];
  categories: CategoryInfo[];
  articles: Article[];
  settings: SiteSettings | null;
  previewMode?: boolean;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  onCopyLink?: (url: string) => void;
}

function renderInlineTokens(tokens: RichInlineToken[], previewMode: boolean): React.ReactNode {
  return tokens.map((tok, i) => {
    if (tok.type === 'bold') {
      return (
        <strong key={i} className="font-semibold text-[#1F1A16] dark:text-[#EDE8DF]">
          {tok.value}
        </strong>
      );
    }
    if (tok.type === 'link') {
      if (previewMode) {
        return (
          <span
            key={i}
            className="text-[#906D2D] dark:text-[#D4AF37] underline decoration-[#C5A059]/50 underline-offset-4"
          >
            {tok.label}
          </span>
        );
      }
      const isExternal = !tok.href.startsWith('/');
      if (isExternal) {
        return (
          <a
            key={i}
            href={tok.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#906D2D] dark:text-[#D4AF37] underline decoration-[#C5A059]/60 underline-offset-4 hover:text-[#1F1A16] dark:hover:text-[#F3E5AB] transition-colors"
          >
            {tok.label}
          </a>
        );
      }
      return (
        <Link
          key={i}
          to={tok.href}
          className="text-[#906D2D] dark:text-[#D4AF37] underline decoration-[#C5A059]/60 underline-offset-4 hover:text-[#1F1A16] dark:hover:text-[#F3E5AB] transition-colors"
        >
          {tok.label}
        </Link>
      );
    }
    return <React.Fragment key={i}>{tok.value}</React.Fragment>;
  });
}

export const ArticleReaderView: React.FC<ArticleReaderViewProps> = ({
  article,
  lang,
  isLight,
  products,
  categories,
  articles,
  settings,
  previewMode = false,
  viewportMode = 'desktop',
  onCopyLink,
}) => {
  const [tocExpanded, setTocExpanded] = useState(viewportMode === 'desktop');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const title = lang === 'fa' ? article.titleFa : article.titleEn || article.titleFa;
  const excerpt = lang === 'fa' ? article.excerptFa : article.excerptEn || article.excerptFa;
  const content = lang === 'fa' ? article.contentFa : article.contentEn || article.contentFa;

  const doc = useMemo(() => parseArticleContentDocument(content || ''), [content]);

  const computedMinutes = calculateReadingTimeMinutes(content || '');
  const readingTimeStr = formatReadingTimeLabel(computedMinutes, lang);

  const publishedDateRaw = article.publishedAt || article.createdAt;
  const publishedDateStr = publishedDateRaw
    ? new Date(publishedDateRaw).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const showUpdatedDate = hasDistinctUpdatedDate(publishedDateRaw, article.updatedAt);
  const updatedDateStr =
    showUpdatedDate && article.updatedAt
      ? new Date(article.updatedAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
  const canonicalUrl = buildCanonicalArticleUrl(origin, article.slug || article.id || 'article');
  const whatsappShareUrl = buildWhatsAppShareUrl(title || '', canonicalUrl);

  const hasActiveSidebar = useMemo(() => {
    const mods = (article?.sidebarModules || []).filter((m) => m && m.isActive !== false);
    if (mods.length === 0) return false;
    return mods.some((mod) => {
      if (mod.moduleType === 'featured_product') {
        return products.some(
          (p) => !p.isDeleted && p.visibility !== false && p.status !== 'draft' && p.id === mod.referencedEntityId
        );
      }
      if (mod.moduleType === 'featured_category') {
        return categories.some(
          (c) =>
            !c.isDeleted &&
            c.enabled !== false &&
            (c.id === mod.referencedEntityId || c.key === mod.referencedEntityId)
        );
      }
      if (mod.moduleType === 'selected_article') {
        return articles.some((a) => !a.isDeleted && a.published !== false && a.id === mod.referencedEntityId);
      }
      if (mod.moduleType === 'social_links') {
        return resolveActiveSocialLinks(settings?.contact).length > 0;
      }
      return true;
    });
  }, [article?.sidebarModules, products, categories, articles, settings?.contact]);

  const relatedArticles = useMemo(() => {
    if (!article || !Array.isArray(article.relatedArticleIds) || article.relatedArticleIds.length === 0) {
      return [];
    }
    const seen = new Set<string>();
    const resolved: Article[] = [];
    for (const relId of article.relatedArticleIds) {
      if (!relId || relId === article.id || seen.has(relId)) continue;
      const found = (articles || []).find((a) => a.id === relId && !a.isDeleted && a.published !== false);
      if (found) {
        seen.add(relId);
        resolved.push(found);
      }
      if (resolved.length >= 3) break;
    }
    return resolved;
  }, [article, articles]);

  const handleCopyCanonical = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(canonicalUrl);
      }
      setCopiedLink(true);
      onCopyLink?.(canonicalUrl);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(false);
    }
  };

  const handleTocJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const useTwoColumnDesktop = hasActiveSidebar && (!previewMode || viewportMode === 'desktop');
  const outerContainerClass = previewMode
    ? viewportMode === 'mobile'
      ? 'max-w-[375px] mx-auto px-3.5 py-6'
      : viewportMode === 'tablet'
      ? 'max-w-[768px] mx-auto px-5 py-7'
      : 'max-w-7xl mx-auto px-6 py-8'
    : hasActiveSidebar
    ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    : 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8';

  const CrumbSeparator = lang === 'fa' ? ChevronLeft : ChevronRight;
  const matchedCategory = categories.find(
    (c) =>
      !c.isDeleted &&
      c.enabled !== false &&
      (c.nameFa === article.category || c.nameEn === article.category || c.key === article.category)
  );

  // Reduced desktop sidebar width (~30% narrower than old 380px 4-col track): 264-272px fixed sidebar
  const flexWrapperClass = !hasActiveSidebar
    ? ''
    : previewMode
    ? useTwoColumnDesktop
      ? 'flex flex-row gap-8 items-start'
      : 'flex flex-col gap-8 items-stretch'
    : 'flex flex-col lg:flex-row gap-8 xl:gap-10 items-start';

  const mainColClass = !hasActiveSidebar
    ? 'min-w-0'
    : previewMode
    ? useTwoColumnDesktop
      ? `flex-1 min-w-0 ${lang === 'fa' ? 'order-2' : 'order-1'}`
      : 'w-full min-w-0 order-1'
    : `flex-1 min-w-0 w-full order-1 ${lang === 'fa' ? 'lg:order-2' : 'lg:order-1'}`;

  const asideColClass = !hasActiveSidebar
    ? ''
    : previewMode
    ? useTwoColumnDesktop
      ? `w-[264px] shrink-0 min-w-0 ${lang === 'fa' ? 'order-1' : 'order-2'}`
      : 'w-full min-w-0 order-2'
    : `w-full lg:w-[264px] xl:w-[272px] lg:shrink-0 min-w-0 order-2 ${
        lang === 'fa' ? 'lg:order-1' : 'lg:order-2'
      } lg:sticky lg:top-28 lg:self-start`;

  return (
    <div className={outerContainerClass}>
      {/* Semantic Breadcrumb + Quick Actions Bar */}
      <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6E6153] dark:text-[#8C8880]">
        <nav
          aria-label={lang === 'fa' ? 'مسیر صفحه' : 'Breadcrumb'}
          className="flex flex-wrap items-center gap-1.5 min-w-0"
        >
          <ol className="flex flex-wrap items-center gap-1.5 min-w-0">
            <li>
              {previewMode ? (
                <span className="text-[#906D2D] dark:text-[#C5A059] font-persian-nav">
                  {lang === 'fa' ? 'خانه' : 'Home'}
                </span>
              ) : (
                <Link
                  to="/"
                  className="text-[#906D2D] hover:text-[#1F1A16] dark:text-[#C5A059] dark:hover:text-[#EDE8DF] font-persian-nav transition-colors"
                >
                  {lang === 'fa' ? 'خانه' : 'Home'}
                </Link>
              )}
            </li>
            <li aria-hidden="true">
              <CrumbSeparator className="w-3.5 h-3.5 opacity-60" />
            </li>
            <li>
              {previewMode ? (
                <span className="text-[#906D2D] dark:text-[#C5A059] font-persian-nav">
                  {lang === 'fa' ? 'وبلاگ' : 'Blog'}
                </span>
              ) : (
                <Link
                  to="/blog"
                  className="text-[#906D2D] hover:text-[#1F1A16] dark:text-[#C5A059] dark:hover:text-[#EDE8DF] font-persian-nav transition-colors"
                >
                  {lang === 'fa' ? 'وبلاگ' : 'Blog'}
                </Link>
              )}
            </li>
            {article.category && (
              <>
                <li aria-hidden="true">
                  <CrumbSeparator className="w-3.5 h-3.5 opacity-60" />
                </li>
                <li>
                  {matchedCategory && !previewMode ? (
                    <Link
                      to={`/categories/${encodeURIComponent(matchedCategory.slug || matchedCategory.key)}`}
                      className="text-[#906D2D] hover:text-[#1F1A16] dark:text-[#C5A059] dark:hover:text-[#EDE8DF] font-persian-nav transition-colors"
                    >
                      {article.category}
                    </Link>
                  ) : (
                    <span className="font-persian-nav text-[#6E6153] dark:text-[#A8A49C]">{article.category}</span>
                  )}
                </li>
              </>
            )}
            <li aria-hidden="true">
              <CrumbSeparator className="w-3.5 h-3.5 opacity-60" />
            </li>
            <li
              aria-current="page"
              className="font-persian-nav text-[#1F1A16] dark:text-[#EDE8DF] truncate max-w-[220px] sm:max-w-xs"
            >
              {title || (lang === 'fa' ? 'عنوان مقاله' : 'Article Title')}
            </li>
          </ol>
        </nav>

        {/* Share Toolbar: WhatsApp + Canonical Copy Link */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={previewMode ? (e) => e.preventDefault() : undefined}
            aria-label={lang === 'fa' ? 'اشتراک‌گذاری در واتس‌اپ' : 'Share on WhatsApp'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-[#AC9262]/25 dark:border-[#C5A059]/20 hover:border-[#906D2D] dark:hover:border-[#D4AF37] text-[#4A3F35] hover:text-[#906D2D] dark:text-[#C8C4BC] dark:hover:text-[#D4AF37] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#C5A059]" aria-hidden="true" />
            <span className="font-persian-nav">{lang === 'fa' ? 'واتس‌اپ' : 'WhatsApp'}</span>
          </a>

          <button
            type="button"
            onClick={handleCopyCanonical}
            aria-label={lang === 'fa' ? 'کپی پیوند استاندارد مقاله' : 'Copy canonical link'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-[#AC9262]/25 dark:border-[#C5A059]/20 hover:border-[#906D2D] dark:hover:border-[#D4AF37] text-[#4A3F35] hover:text-[#906D2D] dark:text-[#C8C4BC] dark:hover:text-[#D4AF37] transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#C5A059]" aria-hidden="true" />
            )}
            <span className="font-persian-nav">
              {copiedLink ? (lang === 'fa' ? 'کپی شد' : 'Copied') : lang === 'fa' ? 'کپی لینک' : 'Copy Link'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content + Narrower Sidebar Layout */}
      <div className={flexWrapperClass}>
        <div className={mainColClass}>
          <div className={hasActiveSidebar ? 'max-w-3xl' : ''}>
            {/* Article Header Capsule */}
            <header className="mb-8 sm:mb-10">
              <div
                className={`subpage-contrast-hero ${
                  isLight ? 'subpage-hero-light' : 'subpage-hero-dark'
                } p-5 sm:p-8 lg:p-10 relative`}
              >
                <div className="hero-specular-bar absolute top-0 inset-x-0 h-[1.5px] z-10" />
                <div className="subpage-hero-gold-halo-top pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-60 rounded-full blur-3xl opacity-80 z-0" />
                <div className="subpage-hero-gold-halo-bottom pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-48 rounded-full blur-2xl opacity-60 z-0" />

                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs mb-4 opacity-90">
                    {publishedDateStr && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="font-mono">{publishedDateStr}</span>
                      </span>
                    )}
                    {showUpdatedDate && updatedDateStr && (
                      <span className="inline-flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3" aria-hidden="true" />
                        <span className="font-persian-nav">
                          {lang === 'fa' ? `به‌روزرسانی: ${updatedDateStr}` : `Updated: ${updatedDateStr}`}
                        </span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="font-persian-nav">{readingTimeStr}</span>
                    </span>
                    {article.author && (
                      <span className="inline-flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="font-persian-nav">{article.author}</span>
                      </span>
                    )}
                    {article.category && (
                      <span className="text-[11px] font-persian-nav text-[#906D2D] dark:text-[#D4AF37]">
                        {article.category}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-persian-heading mb-4 leading-snug break-words">
                    {title}
                  </h1>

                  {excerpt && (
                    <p className="text-sm sm:text-base font-persian-body leading-relaxed border-s-2 border-[#AC9262] ps-4 my-5 italic opacity-95 break-words">
                      {excerpt}
                    </p>
                  )}

                  <div className="hero-gold-divider w-16 h-[1px] mt-5" />
                </div>
              </div>
            </header>

            {/* Above-the-fold Featured Cover Image (Explicit aspect-ratio, no lazy load) */}
            {article.coverImage && (
              <figure className="mb-8 sm:mb-10">
                <div className="rounded-sm overflow-hidden border border-[#AC9262]/30 dark:border-[#C5A059]/25 luxury-stage-depth aspect-[16/9] bg-[#0B0B0E]">
                  <img
                    src={article.coverImage}
                    alt={title}
                    fetchPriority="high"
                    className="w-full h-full object-cover"
                  />
                </div>
                {article.imageCaption && (
                  <figcaption className="mt-2.5 text-xs font-persian-body text-[#6E6153] dark:text-[#8C8880] text-center">
                    {article.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Collapsible Automatic Table of Contents (shown only if >= 2 headings) */}
            {doc.toc.length >= 2 && (
              <nav
                aria-label={lang === 'fa' ? 'فهرست مطالب مقاله' : 'Table of contents'}
                className="mb-8 rounded-sm border border-[#AC9262]/30 dark:border-[#C5A059]/20 bg-[#FAF8F4] dark:bg-[#0D0D12]"
              >
                <button
                  type="button"
                  onClick={() => setTocExpanded((prev) => !prev)}
                  aria-expanded={tocExpanded}
                  className="w-full px-4 sm:px-5 py-3 flex items-center justify-between gap-3 text-start cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                >
                  <span className="flex items-center gap-2 text-xs sm:text-sm font-persian-heading text-[#906D2D] dark:text-[#D4AF37]">
                    <List className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{lang === 'fa' ? 'فهرست مطالب این مقاله' : 'In This Article'}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#906D2D] dark:text-[#C5A059] transition-transform duration-200 ${
                      tocExpanded ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {tocExpanded && (
                  <ol className="px-4 sm:px-5 pb-4 pt-1 border-t border-[#AC9262]/15 dark:border-[#C5A059]/15 space-y-2 text-xs sm:text-[13px] font-persian-body">
                    {doc.toc.map((item) => (
                      <li key={item.id} className={item.level === 3 ? 'ps-4' : ''}>
                        <button
                          type="button"
                          onClick={() => handleTocJump(item.id)}
                          className={`text-start hover:underline underline-offset-4 transition-colors cursor-pointer ${
                            item.level === 2
                              ? 'text-[#1F1A16] hover:text-[#906D2D] dark:text-[#EDE8DF] dark:hover:text-[#D4AF37] font-medium'
                              : 'text-[#6E6153] hover:text-[#906D2D] dark:text-[#A8A49C] dark:hover:text-[#D4AF37]'
                          }`}
                        >
                          {item.text}
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </nav>
            )}

            {/* Safe Rich Editorial Body Content */}
            <div className="space-y-5 sm:space-y-6 text-sm sm:text-[15.5px] text-[#4A3F35] dark:text-[#D4D0C8] font-persian-body leading-[2.15] sm:leading-[2.3] text-justify break-words">
              {doc.blocks.map((block, idx) => {
                if (block.type === 'heading2') {
                  return (
                    <h2
                      key={idx}
                      id={block.id}
                      className="scroll-mt-28 text-lg sm:text-2xl font-persian-heading text-[#906D2D] dark:text-[#D4AF37] pt-5 border-b border-[#AC9262]/20 dark:border-[#C5A059]/15 pb-2 text-start"
                    >
                      {renderInlineTokens(block.tokens, previewMode)}
                    </h2>
                  );
                }
                if (block.type === 'heading3') {
                  return (
                    <h3
                      key={idx}
                      id={block.id}
                      className="scroll-mt-28 text-base sm:text-lg font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] pt-4 text-start"
                    >
                      {renderInlineTokens(block.tokens, previewMode)}
                    </h3>
                  );
                }
                if (block.type === 'blockquote') {
                  return (
                    <blockquote
                      key={idx}
                      className="border-s-2 border-[#C5A059] ps-4 py-1.5 italic text-[#5B4D3F] dark:text-[#D9C7A3]"
                    >
                      {renderInlineTokens(block.tokens, previewMode)}
                    </blockquote>
                  );
                }
                if (block.type === 'list') {
                  return (
                    <ul key={idx} className="space-y-2 list-disc list-inside text-start ps-1">
                      {block.items.map((itemTokens, lIdx) => (
                        <li key={lIdx}>{renderInlineTokens(itemTokens, previewMode)}</li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === 'ordered-list') {
                  return (
                    <ol key={idx} className="space-y-2 list-decimal list-inside text-start ps-1">
                      {block.items.map((itemTokens, lIdx) => (
                        <li key={lIdx}>{renderInlineTokens(itemTokens, previewMode)}</li>
                      ))}
                    </ol>
                  );
                }
                return <p key={idx}>{renderInlineTokens(block.tokens, previewMode)}</p>;
              })}
            </div>

            {/* Genuine FAQ Section (Only rendered when authentic FAQ pairs exist in article content) */}
            {doc.faqItems.length > 0 && (
              <section
                aria-labelledby="article-faq-heading"
                className="mt-12 pt-8 border-t border-[#AC9262]/20 dark:border-[#C5A059]/20"
              >
                <h2
                  id="article-faq-heading"
                  className="text-lg sm:text-xl font-persian-heading text-[#906D2D] dark:text-[#D4AF37] mb-5"
                >
                  {doc.faqHeadingTitle || (lang === 'fa' ? 'پرسش‌های متداول' : 'Frequently Asked Questions')}
                </h2>
                <div className="space-y-3">
                  {doc.faqItems.map((faq, idx) => {
                    const isOpen = openFaqIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-sm border border-[#AC9262]/25 dark:border-[#C5A059]/20 bg-[#FAF8F4] dark:bg-[#0D0D12]"
                      >
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-start cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                        >
                          <span className="text-sm font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF]">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#C5A059] shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 border-t border-[#AC9262]/15 dark:border-[#C5A059]/15 text-xs sm:text-sm font-persian-body text-[#4A3F35] dark:text-[#C8C4BC] leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Closing Signature */}
            <div className="mt-14 pt-8 border-t border-[#AC9262]/20 dark:border-[#C5A059]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E6153] dark:text-[#8C8880]">
              <div className="text-center sm:text-start">
                <span className="font-cinzel text-xs text-[#906D2D] dark:text-[#D4AF37] tracking-wider uppercase block font-medium">
                  SAEEDNIA JEWELLERY
                </span>
                <span className="font-persian-body text-[11px] mt-0.5 block text-[#4A3F35] dark:text-[#8C8880]">
                  {lang === 'fa' ? 'شعبه بازار بزرگ تهران (بازار زرگرها)' : 'Tehran Grand Bazaar (Zargaran Bazaar)'}
                </span>
              </div>

              {previewMode ? (
                <span className="px-5 py-2.5 bg-white dark:bg-[#0E0E14] border border-[#AC9262]/35 dark:border-[#C5A059]/30 text-xs font-persian-nav text-[#1F1A16] dark:text-[#EDE8DF] rounded-sm">
                  {lang === 'fa' ? 'مشاهده مجموعه جواهرات' : 'Explore Creations'}
                </span>
              ) : (
                <Link
                  to="/categories"
                  className="px-5 py-2.5 bg-white hover:bg-[#FAF9F6] dark:bg-[#0E0E14] dark:hover:bg-[#151520] border border-[#AC9262]/35 hover:border-[#906D2D] dark:border-[#C5A059]/30 dark:hover:border-[#D4AF37] text-xs font-persian-nav text-[#1F1A16] hover:text-[#906D2D] dark:text-[#EDE8DF] dark:hover:text-[#D4AF37] rounded-sm transition-all shadow-sm"
                >
                  {lang === 'fa' ? 'مشاهده مجموعه جواهرات' : 'Explore Creations'}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Reduced-Width Desktop Sidebar (~264-272px, ~30% narrower than previous 4-col width) */}
        {hasActiveSidebar && (
          <aside
            aria-label={lang === 'fa' ? 'ستون کناری مقاله' : 'Article Sidebar'}
            className={asideColClass}
          >
            <ArticleSidebar
              modules={article.sidebarModules || []}
              lang={lang}
              products={products}
              categories={categories}
              articles={articles}
              settings={settings}
              previewMode={previewMode}
            />
          </aside>
        )}
      </div>

      {/* Related Articles Section at End of Article */}
      {relatedArticles.length > 0 && (
        <section
          aria-labelledby="related-articles-heading"
          className="mt-16 pt-12 border-t border-[#AC9262]/25 dark:border-[#C5A059]/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
            <div>
              <h2
                id="related-articles-heading"
                className="text-xl sm:text-2xl font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF]"
              >
                {lang === 'fa' ? 'مطالب پیشنهادی برای مطالعه' : 'Recommended Reading'}
              </h2>
              <p className="text-xs font-persian-body text-[#6E6153] dark:text-[#8C8880] mt-1">
                {lang === 'fa'
                  ? 'ادامه روایت‌ها و مقالات منتخب جواهری سعیدنیا'
                  : 'Curated editorial stories from Saeednia Jewellery'}
              </p>
            </div>
            {!previewMode && (
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-persian-nav text-[#906D2D] hover:text-[#1F1A16] dark:text-[#C5A059] dark:hover:text-[#D4AF37] transition-colors"
              >
                <span>{lang === 'fa' ? 'مشاهده همه مقالات' : 'View All Articles'}</span>
                {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </Link>
            )}
          </div>

          <div
            className={`grid grid-cols-1 ${
              previewMode && viewportMode === 'mobile'
                ? ''
                : `md:grid-cols-2 ${relatedArticles.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`
            } gap-6`}
          >
            {relatedArticles.map((rel) => {
              const relTitle = lang === 'fa' ? rel.titleFa : rel.titleEn || rel.titleFa;
              const relExcerpt = lang === 'fa' ? rel.excerptFa : rel.excerptEn || rel.excerptFa;
              const relDate = new Date(rel.publishedAt || rel.createdAt).toLocaleDateString(
                lang === 'fa' ? 'fa-IR' : 'en-US',
                { year: 'numeric', month: 'short', day: 'numeric' }
              );
              const cardContent = (
                <>
                  <div className="aspect-[16/10] w-full bg-[#FAF8F4] dark:bg-[#08080A] overflow-hidden border-b border-[#AC9262]/15 dark:border-[#C5A059]/15">
                    {rel.coverImage ? (
                      <img
                        src={rel.coverImage}
                        alt={relTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-[#906D2D]/35 dark:text-[#C5A059]/35" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-[#6E6153] dark:text-[#8C8880] font-mono mb-2">
                        <Calendar className="w-3 h-3 text-[#906D2D] dark:text-[#C5A059]" />
                        <span>{relDate}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] group-hover:text-[#906D2D] dark:group-hover:text-[#D4AF37] transition-colors leading-snug mb-2">
                        {relTitle}
                      </h3>
                      {relExcerpt && (
                        <p className="text-xs font-persian-body text-[#4A3F35] dark:text-[#A8A49C] leading-relaxed line-clamp-2">
                          {relExcerpt}
                        </p>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-persian-nav text-[#906D2D] dark:text-[#C5A059] pt-2">
                      <span>{lang === 'fa' ? 'مطالعه مقاله' : 'Read Article'}</span>
                      {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </>
              );

              return previewMode ? (
                <div
                  key={rel.id}
                  className="group rounded-sm border border-[#AC9262]/25 dark:border-[#C5A059]/20 bg-white dark:bg-[#0D0D12] overflow-hidden flex flex-col"
                >
                  {cardContent}
                </div>
              ) : (
                <Link
                  key={rel.id}
                  to={`/blog/${encodeURIComponent(rel.slug)}`}
                  className="group rounded-sm border border-[#AC9262]/25 dark:border-[#C5A059]/20 hover:border-[#906D2D] dark:hover:border-[#D4AF37] bg-white dark:bg-[#0D0D12] overflow-hidden flex flex-col transition-all duration-300"
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
