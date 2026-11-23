import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageEditorialHeader } from '../components/PageEditorialHeader';
import { NotFoundPage } from './NotFoundPage';
import { applyPageSeo, buildBreadcrumbSchema } from '../utils/seo';
import { safeParseJsonResponse } from '../lib/api';
import {
  CORE_SYSTEM_PAGE_IDS,
  isReservedSystemSlug,
  normalizeCustomPageSlug,
  parseSanitizedRichTextBlocks,
  type InlineRichToken,
} from '../utils/customPages';
import type { PageContent } from '../types';

const renderInlineTokens = (tokens: InlineRichToken[], keyPrefix: string) =>
  tokens.map((tok, idx) => {
    const key = `${keyPrefix}-${idx}`;
    if (tok.type === 'bold') {
      return (
        <strong key={key} className="font-semibold text-[#1F1A16] dark:text-[#EDE8DF]">
          {tok.value}
        </strong>
      );
    }
    if (tok.type === 'link') {
      if (tok.href.startsWith('/')) {
        return (
          <Link
            key={key}
            to={tok.href}
            className="text-[#906D2D] dark:text-[#D4AF37] underline underline-offset-4 hover:text-[#7D5E26] dark:hover:text-[#F5DE9E] transition-colors"
          >
            {tok.label}
          </Link>
        );
      }
      return (
        <a
          key={key}
          href={tok.href}
          target={tok.href.startsWith('http') ? '_blank' : undefined}
          rel={tok.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="text-[#906D2D] dark:text-[#D4AF37] underline underline-offset-4 hover:text-[#7D5E26] dark:hover:text-[#F5DE9E] transition-colors"
        >
          {tok.label}
        </a>
      );
    }
    return <React.Fragment key={key}>{tok.value}</React.Fragment>;
  });

export const CustomPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang, pages, settings, isLoading } = useApp();
  const [fetchedPage, setFetchedPage] = useState<PageContent | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchCheckedSlug, setFetchCheckedSlug] = useState<string | null>(null);

  const rawSlug = String(slug || '').trim();
  const normalizedSlug = normalizeCustomPageSlug(rawSlug);
  const isReserved = !rawSlug || isReservedSystemSlug(rawSlug) || isReservedSystemSlug(normalizedSlug);

  const contextMatchedPage = useMemo(() => {
    if (isReserved) return null;
    const lowerRaw = rawSlug.toLowerCase();
    return (
      (pages || []).find(
        (p) =>
          !p.isDeleted &&
          p.published !== false &&
          !CORE_SYSTEM_PAGE_IDS.has(p.id) &&
          (p.slug.toLowerCase() === lowerRaw ||
            p.slug.toLowerCase() === normalizedSlug ||
            p.id.toLowerCase() === lowerRaw)
      ) || null
    );
  }, [pages, isReserved, rawSlug, normalizedSlug]);

  useEffect(() => {
    if (isReserved || contextMatchedPage || !rawSlug) {
      setFetchedPage(null);
      setFetching(false);
      return;
    }

    let cancelled = false;
    setFetching(true);
    fetch(`/api/pages/${encodeURIComponent(rawSlug)}`)
      .then((res) => {
        if (!res.ok) return { ok: false, data: null as PageContent | null };
        return safeParseJsonResponse<PageContent>(res);
      })
      .then((parsed) => {
        if (cancelled) return;
        const candidate = parsed.ok && parsed.data ? parsed.data : null;
        if (
          candidate &&
          !candidate.isDeleted &&
          candidate.published !== false &&
          !CORE_SYSTEM_PAGE_IDS.has(candidate.id)
        ) {
          setFetchedPage(candidate);
        } else {
          setFetchedPage(null);
        }
        setFetchCheckedSlug(rawSlug);
      })
      .catch(() => {
        if (!cancelled) {
          setFetchedPage(null);
          setFetchCheckedSlug(rawSlug);
        }
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isReserved, contextMatchedPage, rawSlug]);

  const resolvedPage = contextMatchedPage || fetchedPage;
  const stillWaiting = !isReserved && !resolvedPage && (isLoading || fetching || fetchCheckedSlug !== rawSlug);

  useEffect(() => {
    if (!resolvedPage) return;

    const brandName = settings?.brandNameFa || 'جواهری سعیدنیا';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const titleText =
      lang === 'fa' ? resolvedPage.h1Fa : resolvedPage.h1En || resolvedPage.h1Fa;
    const browserTitle =
      lang === 'fa'
        ? resolvedPage.browserTitleFa || resolvedPage.h1Fa
        : resolvedPage.browserTitleEn || resolvedPage.h1En || resolvedPage.h1Fa;
    const seoTitle =
      lang === 'fa'
        ? resolvedPage.seoTitleFa || resolvedPage.h1Fa
        : resolvedPage.seoTitleEn || resolvedPage.h1En || resolvedPage.h1Fa;
    const rawDesc =
      lang === 'fa'
        ? resolvedPage.metaDescriptionFa || resolvedPage.descriptionFa || ''
        : resolvedPage.metaDescriptionEn ||
          resolvedPage.descriptionEn ||
          resolvedPage.metaDescriptionFa ||
          resolvedPage.descriptionFa ||
          '';
    const metaDesc = rawDesc
      .replace(/<[^>]*>/g, ' ')
      .replace(/[#>*_`[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 165);
    const canonicalPath = `/${encodeURIComponent(resolvedPage.slug)}`;

    applyPageSeo({
      browserTitle: `${browserTitle} | ${brandName}`,
      seoTitle,
      metaDescription: metaDesc,
      canonicalPath,
      robots: 'index, follow',
      ogType: 'website',
      ogImage: resolvedPage.featuredImage,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: seoTitle,
          description: metaDesc,
          url: `${origin}${canonicalPath}`,
        },
        buildBreadcrumbSchema([
          { name: lang === 'fa' ? 'خانه' : 'Home', path: '/' },
          { name: titleText, path: canonicalPath },
        ]),
      ],
    });
  }, [resolvedPage, lang, settings]);

  const richBlocks = useMemo(() => {
    if (!resolvedPage) return [];
    const rawContent =
      lang === 'fa'
        ? resolvedPage.descriptionFa || ''
        : resolvedPage.descriptionEn || resolvedPage.descriptionFa || '';
    return parseSanitizedRichTextBlocks(rawContent);
  }, [resolvedPage, lang]);

  if (isReserved) {
    return <NotFoundPage />;
  }

  if (stillWaiting) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex items-center justify-center pt-32 pb-32">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="w-7 h-7 text-[#906D2D] dark:text-[#C5A059] animate-spin" />
          <span className="text-xs font-persian-nav text-[#6E6153] dark:text-[#8C8880]">
            {lang === 'fa' ? 'در حال بارگذاری صفحه...' : 'Loading page...'}
          </span>
        </div>
      </div>
    );
  }

  if (!resolvedPage) {
    return <NotFoundPage />;
  }

  const pageTitle = lang === 'fa' ? resolvedPage.h1Fa : resolvedPage.h1En || resolvedPage.h1Fa;
  const pageSubtitle =
    lang === 'fa'
      ? resolvedPage.subtitleFa
      : resolvedPage.subtitleEn || resolvedPage.subtitleFa;

  return (
    <article
      id={`page-custom-${resolvedPage.slug}`}
      className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] pt-32 sm:pt-40 pb-36 selection:bg-[#906D2D]/25"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageEditorialHeader
          eyebrow="Saeedniajewellerygrandbazar"
          title={pageTitle}
          subtitle={pageSubtitle}
          maxWidthClass="max-w-3xl"
        />

        {resolvedPage.featuredImage && (
          <div className="relative aspect-[16/9] mb-12 rounded-sm overflow-hidden border border-[#AC9262]/30 dark:border-[#C5A059]/25 shadow-lg">
            <img
              src={resolvedPage.featuredImage}
              alt={pageTitle}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {richBlocks.length > 0 && (
          <div
            className="max-w-3xl mx-auto space-y-6 text-[#4A3F35] dark:text-[#C8C4BC] font-persian-body text-base sm:text-lg leading-[2.15] sm:leading-[2.3]"
            dir={lang === 'fa' ? 'rtl' : 'ltr'}
          >
            {richBlocks.map((block, index) => {
              if (block.type === 'heading2') {
                return (
                  <h2
                    key={index}
                    className="text-xl sm:text-2xl font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] pt-4 pb-1 border-b border-[#AC9262]/20 dark:border-[#C5A059]/20"
                  >
                    {renderInlineTokens(block.tokens, `h2-${index}`)}
                  </h2>
                );
              }
              if (block.type === 'heading3') {
                return (
                  <h3
                    key={index}
                    className="text-lg sm:text-xl font-persian-heading text-[#906D2D] dark:text-[#D4AF37] pt-2"
                  >
                    {renderInlineTokens(block.tokens, `h3-${index}`)}
                  </h3>
                );
              }
              if (block.type === 'blockquote') {
                return (
                  <blockquote
                    key={index}
                    className="border-s-2 border-[#906D2D] dark:border-[#C5A059] ps-4 py-2 my-6 text-[#1F1A16] dark:text-[#EDE8DF] bg-[#FAF9F6] dark:bg-[#0D0D12] rounded-sm italic"
                  >
                    {renderInlineTokens(block.tokens, `bq-${index}`)}
                  </blockquote>
                );
              }
              if (block.type === 'list') {
                return (
                  <ul key={index} className="list-disc list-inside space-y-2 ps-2">
                    {block.items.map((itemTokens, liIdx) => (
                      <li key={liIdx}>{renderInlineTokens(itemTokens, `ul-${index}-${liIdx}`)}</li>
                    ))}
                  </ul>
                );
              }
              if (block.type === 'ordered-list') {
                return (
                  <ol key={index} className="list-decimal list-inside space-y-2 ps-2">
                    {block.items.map((itemTokens, liIdx) => (
                      <li key={liIdx}>{renderInlineTokens(itemTokens, `ol-${index}-${liIdx}`)}</li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={index} className="text-justify">
                  {renderInlineTokens(block.tokens, `p-${index}`)}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
};
