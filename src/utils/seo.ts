/**
 * Dynamic SEO, Canonical, OpenGraph, Twitter Cards & Schema.org JSON-LD Utility
 * Keeps document head metadata synchronized with CMS pages, categories, products, and articles.
 * Inquiry-only luxury catalogue: STRICTLY no fake Offer/price/AggregateRating schemas.
 */

export interface SeoParams {
  browserTitle?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalPath?: string;
  robots?: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

function upsertMeta(attrName: 'name' | 'property', attrValue: string, content: string) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function toAbsoluteClientUrl(maybeRelative?: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const clean = (maybeRelative || '').trim();
  if (!clean) return `${origin}/images/saeednia-hero-dark-final.webp`;
  if (/^https?:\/\//i.test(clean)) return clean;
  return `${origin}${clean.startsWith('/') ? clean : `/${clean}`}`;
}

export function applyPageSeo({
  browserTitle,
  seoTitle,
  metaDescription,
  canonicalPath,
  robots,
  ogType,
  ogImage,
  jsonLd,
}: SeoParams) {
  if (typeof document === 'undefined') return;

  if (browserTitle) {
    document.title = browserTitle;
  }

  const effectiveSeoTitle = seoTitle || browserTitle;
  if (effectiveSeoTitle) {
    upsertMeta('property', 'og:title', effectiveSeoTitle);
    upsertMeta('name', 'twitter:title', effectiveSeoTitle);
  }

  if (metaDescription !== undefined) {
    upsertMeta('name', 'description', metaDescription);
    upsertMeta('property', 'og:description', metaDescription);
    upsertMeta('name', 'twitter:description', metaDescription);
  }

  if (robots) {
    upsertMeta('name', 'robots', robots);
  } else {
    upsertMeta('name', 'robots', 'index, follow');
  }

  if (canonicalPath !== undefined && typeof window !== 'undefined') {
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${window.location.origin}${cleanPath}`;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
    upsertMeta('property', 'og:url', canonicalUrl);
  }

  if (ogType) {
    upsertMeta('property', 'og:type', ogType);
  }

  if (ogImage !== undefined) {
    const absImg = toAbsoluteClientUrl(ogImage);
    upsertMeta('property', 'og:image', absImg);
    upsertMeta('name', 'twitter:image', absImg);
  }

  if (jsonLd !== undefined) {
    // Remove stale client-injected JSON-LD nodes
    document.querySelectorAll('script[data-saeednia-client-ld="true"]').forEach((n) => n.remove());
    // Also remove SSR JSON-LD once client hydrates route-specific schema so head stays deduplicated
    document.querySelectorAll('script[id^="saeednia-ssr-jsonld"]').forEach((n) => n.remove());

    const nodes = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    nodes.forEach((node) => {
      if (!node || typeof node !== 'object') return;
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-saeednia-client-ld', 'true');
      script.textContent = JSON.stringify(node)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
      document.head.appendChild(script);
    });
  }
}

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${origin}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}
