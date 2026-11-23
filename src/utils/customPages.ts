export const CORE_SYSTEM_PAGE_IDS = new Set([
  'home',
  'collection',
  'fine-jewelry',
  'about',
  'contact',
  'blog',
]);

export const RESERVED_SYSTEM_SLUGS = new Set([
  '',
  'home',
  'admin',
  'api',
  'categories',
  'collection',
  'collections',
  'fine-jewelry',
  'blog',
  'about',
  'contact',
  'products',
  'product',
  'uploads',
  'images',
  'assets',
  'videos',
  'fonts',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'theme-init.js',
  'health',
  '404',
  'not-found',
]);

export function normalizeCustomPageSlug(rawSlug: string): string {
  return String(rawSlug || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isReservedSystemSlug(rawSlug: string): boolean {
  const cleaned = String(rawSlug || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '');
  if (!cleaned) return true;
  const firstSegment = cleaned.split('/')[0];
  if (RESERVED_SYSTEM_SLUGS.has(cleaned) || RESERVED_SYSTEM_SLUGS.has(firstSegment)) {
    return true;
  }
  const normalized = normalizeCustomPageSlug(cleaned);
  return RESERVED_SYSTEM_SLUGS.has(normalized);
}

/**
 * Validates href links inside rich text content. Allows only safe relative
 * paths (`/...` excluding `//`) and HTTPS/HTTP/mailto/tel links.
 */
export function isSafeRichTextHref(rawHref: string): boolean {
  const clean = String(rawHref || '').trim();
  if (!clean || /[\x00-\x1f\x7f]/.test(clean)) return false;
  if (clean.startsWith('/') && !clean.startsWith('//')) {
    return true;
  }
  if (/^(javascript|data|vbscript|file):/i.test(clean)) {
    return false;
  }
  if (/^(https?:\/\/|mailto:|tel:)/i.test(clean)) {
    try {
      const parsed = new URL(clean);
      return ['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Strips raw HTML tags/scripts/event attributes cleanly so rich-text fields
 * never allow XSS injection even if HTML tags were pasted into the CMS editor.
 */
export function sanitizeRichTextInput(raw: string): string {
  let text = String(raw || '');
  // Remove complete dangerous blocks first
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  text = text.replace(/<object[\s\S]*?<\/object>/gi, '');
  text = text.replace(/<embed[\s\S]*?>/gi, '');

  // Convert common editorial block tags into clean line breaks before stripping tags
  text = text.replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|blockquote|tr)>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Strip remaining HTML tags safely
  text = text.replace(/<[^>]*>/g, '');

  // Decode safe basic entities without re-introducing executable HTML
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // Strip dangerous URI schemes if injected bare in markdown links
  text = text.replace(/\]\(\s*(javascript|data|vbscript)\s*:[^)]*\)/gi, '](#)');

  return text.replace(/\r\n/g, '\n').trim();
}

export type InlineRichToken =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'link'; label: string; href: string };

export type RichInlineToken = InlineRichToken;

export type RichTextBlock =
  | { type: 'heading2'; tokens: InlineRichToken[] }
  | { type: 'heading3'; tokens: InlineRichToken[] }
  | { type: 'blockquote'; tokens: InlineRichToken[] }
  | { type: 'list'; items: InlineRichToken[][] }
  | { type: 'ordered-list'; items: InlineRichToken[][] }
  | { type: 'paragraph'; tokens: InlineRichToken[] };

export function tokenizeRichInline(line: string): InlineRichToken[] {
  const tokens: InlineRichToken[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: line.slice(lastIndex, match.index) });
    }
    const tokenStr = match[0];
    if (tokenStr.startsWith('**') && tokenStr.endsWith('**') && tokenStr.length > 4) {
      tokens.push({ type: 'bold', value: tokenStr.slice(2, -2) });
    } else if (tokenStr.startsWith('[')) {
      const m = tokenStr.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        const label = m[1].trim();
        const href = m[2].trim();
        if (label && isSafeRichTextHref(href)) {
          tokens.push({ type: 'link', label, href });
        } else {
          tokens.push({ type: 'text', value: label || tokenStr });
        }
      } else {
        tokens.push({ type: 'text', value: tokenStr });
      }
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({ type: 'text', value: line.slice(lastIndex) });
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', value: line }];
}

export function parseSanitizedRichTextBlocks(raw: string): RichTextBlock[] {
  const clean = sanitizeRichTextInput(raw);
  if (!clean) return [];

  const lines = clean.split('\n').map((l) => l.trim());
  const blocks: RichTextBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line) {
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push({ type: 'heading3', tokens: tokenizeRichInline(line.slice(4).trim()) });
      i++;
      continue;
    }

    if (line.startsWith('## ') || line.startsWith('# ')) {
      const text = line.startsWith('## ') ? line.slice(3).trim() : line.slice(2).trim();
      blocks.push({ type: 'heading2', tokens: tokenizeRichInline(text) });
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      blocks.push({ type: 'blockquote', tokens: tokenizeRichInline(line.slice(2).trim()) });
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: InlineRichToken[][] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(tokenizeRichInline(lines[i].replace(/^[-*]\s+/, '').trim()));
        i++;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: InlineRichToken[][] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(tokenizeRichInline(lines[i].replace(/^\d+\.\s+/, '').trim()));
        i++;
      }
      blocks.push({ type: 'ordered-list', items });
      continue;
    }

    blocks.push({ type: 'paragraph', tokens: tokenizeRichInline(line) });
    i++;
  }

  return blocks;
}
