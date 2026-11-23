import { RichInlineToken, sanitizeRichTextInput, tokenizeRichInline } from './customPages';

export type ArticleRenderBlock =
  | { type: 'heading2'; id: string; text: string; tokens: RichInlineToken[] }
  | { type: 'heading3'; id: string; text: string; tokens: RichInlineToken[] }
  | { type: 'blockquote'; tokens: RichInlineToken[] }
  | { type: 'list'; items: RichInlineToken[][] }
  | { type: 'ordered-list'; items: RichInlineToken[][] }
  | { type: 'paragraph'; tokens: RichInlineToken[] };

export interface ArticleTocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ArticleFaqItem {
  question: string;
  answer: string;
}

export interface ParsedArticleDocument {
  blocks: ArticleRenderBlock[];
  toc: ArticleTocItem[];
  faqItems: ArticleFaqItem[];
  faqHeadingTitle?: string;
}

const FAQ_HEADING_PATTERN =
  /^(?:سوالات\s*متداول|پرسش‌های\s*متداول|پرسش\s*و\s*پاسخ|faq|frequently\s+asked\s+questions)(?:\s*[:：-]?\s*.*)?$/i;

function makeHeadingAnchorId(rawText: string, usedIds: Map<string, number>, seq: number): string {
  const cleaned = rawText
    .replace(/\*\*/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);

  const base = cleaned ? `sec-${cleaned}` : `sec-${seq}`;
  const seenCount = usedIds.get(base) || 0;
  usedIds.set(base, seenCount + 1);
  return seenCount === 0 ? base : `${base}-${seenCount + 1}`;
}

function stripMarkdownFormatting(input: string): string {
  return input
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .trim();
}

function parseGenuineFaqLines(lines: string[]): ArticleFaqItem[] {
  const faqs: ArticleFaqItem[] = [];
  let currentQuestion = '';
  let currentAnswerLines: string[] = [];

  const flush = () => {
    const q = stripMarkdownFormatting(currentQuestion);
    const a = stripMarkdownFormatting(currentAnswerLines.join(' ').replace(/\s+/g, ' ').trim());
    if (q.length >= 4 && a.length >= 4) {
      faqs.push({ question: q, answer: a });
    }
    currentQuestion = '';
    currentAnswerLines = [];
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('### ')) {
      flush();
      currentQuestion = trimmed.slice(4).trim();
      continue;
    }

    const qMatch = trimmed.match(/^(?:سوال|پرسش|q|question)\s*[:：]\s*(.+)$/i);
    if (qMatch) {
      flush();
      currentQuestion = qMatch[1].trim();
      continue;
    }

    const aMatch = trimmed.match(/^(?:پاسخ|جواب|a|answer)\s*[:：]\s*(.+)$/i);
    if (aMatch && currentQuestion) {
      currentAnswerLines.push(aMatch[1].trim());
      continue;
    }

    if (currentQuestion) {
      currentAnswerLines.push(trimmed.replace(/^[-•*]\s+/, ''));
    }
  }

  flush();
  return faqs;
}

export function parseArticleContentDocument(rawContent: string): ParsedArticleDocument {
  const safe = sanitizeRichTextInput(rawContent || '');
  if (!safe) {
    return { blocks: [], toc: [], faqItems: [] };
  }

  const rawLines = safe.split('\n');

  // Identify optional explicit trailing/inline FAQ section ONLY when heading matches FAQ & genuine Q/A pairs exist
  let faqStartIdx = -1;
  let faqEndIdx = rawLines.length;
  let faqHeadingTitle: string | undefined;
  let parsedFaqs: ArticleFaqItem[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (line.startsWith('## ')) {
      const headingPlain = stripMarkdownFormatting(line.slice(3));
      if (FAQ_HEADING_PATTERN.test(headingPlain)) {
        let end = rawLines.length;
        for (let j = i + 1; j < rawLines.length; j++) {
          if (rawLines[j].trim().startsWith('## ')) {
            end = j;
            break;
          }
        }
        const candidateLines = rawLines.slice(i + 1, end);
        const candidates = parseGenuineFaqLines(candidateLines);
        if (candidates.length > 0) {
          faqStartIdx = i;
          faqEndIdx = end;
          faqHeadingTitle = headingPlain;
          parsedFaqs = candidates;
          break;
        }
      }
    }
  }

  const bodyLines =
    faqStartIdx !== -1
      ? [...rawLines.slice(0, faqStartIdx), ...rawLines.slice(faqEndIdx)]
      : rawLines;

  const blocks: ArticleRenderBlock[] = [];
  const toc: ArticleTocItem[] = [];
  const usedIds = new Map<string, number>();

  let listBuffer: RichInlineToken[][] = [];
  let orderedListBuffer: RichInlineToken[][] = [];
  let seq = 0;

  const flushLists = () => {
    if (listBuffer.length > 0) {
      blocks.push({ type: 'list', items: listBuffer });
      listBuffer = [];
    }
    if (orderedListBuffer.length > 0) {
      blocks.push({ type: 'ordered-list', items: orderedListBuffer });
      orderedListBuffer = [];
    }
  };

  for (const rawLine of bodyLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushLists();
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushLists();
      seq += 1;
      const headingRaw = trimmed.slice(3).trim();
      const plain = stripMarkdownFormatting(headingRaw);
      const id = makeHeadingAnchorId(plain, usedIds, seq);
      blocks.push({ type: 'heading2', id, text: plain, tokens: tokenizeRichInline(headingRaw) });
      toc.push({ id, text: plain, level: 2 });
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushLists();
      seq += 1;
      const headingRaw = trimmed.slice(4).trim();
      const plain = stripMarkdownFormatting(headingRaw);
      const id = makeHeadingAnchorId(plain, usedIds, seq);
      blocks.push({ type: 'heading3', id, text: plain, tokens: tokenizeRichInline(headingRaw) });
      toc.push({ id, text: plain, level: 3 });
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushLists();
      blocks.push({ type: 'blockquote', tokens: tokenizeRichInline(trimmed.slice(2).trim()) });
      continue;
    }

    if (/^[-•*]\s+/.test(trimmed)) {
      if (orderedListBuffer.length > 0) {
        blocks.push({ type: 'ordered-list', items: orderedListBuffer });
        orderedListBuffer = [];
      }
      listBuffer.push(tokenizeRichInline(trimmed.replace(/^[-•*]\s+/, '').trim()));
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (orderedMatch) {
      if (listBuffer.length > 0) {
        blocks.push({ type: 'list', items: listBuffer });
        listBuffer = [];
      }
      orderedListBuffer.push(tokenizeRichInline(orderedMatch[1].trim()));
      continue;
    }

    flushLists();
    blocks.push({ type: 'paragraph', tokens: tokenizeRichInline(trimmed) });
  }

  flushLists();

  return {
    blocks,
    toc,
    faqItems: parsedFaqs,
    faqHeadingTitle,
  };
}

export function buildCanonicalArticleUrl(origin: string, slugOrId: string): string {
  const cleanOrigin = (origin || '').replace(/\/+$/, '');
  const encoded = encodeURIComponent(String(slugOrId || '').trim());
  return `${cleanOrigin}/blog/${encoded}`;
}

export function buildWhatsAppShareUrl(title: string, canonicalUrl: string): string {
  const message = `${title ? `${title}\n` : ''}${canonicalUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function hasDistinctUpdatedDate(publishedAt?: string, updatedAt?: string): boolean {
  if (!updatedAt) return false;
  if (!publishedAt) return true;
  const pDay = String(publishedAt).slice(0, 10);
  const uDay = String(updatedAt).slice(0, 10);
  if (pDay && uDay && pDay !== uDay) return true;
  const pMs = Date.parse(publishedAt);
  const uMs = Date.parse(updatedAt);
  if (Number.isFinite(pMs) && Number.isFinite(uMs)) {
    return uMs - pMs > 60_000;
  }
  return publishedAt.trim() !== updatedAt.trim();
}
