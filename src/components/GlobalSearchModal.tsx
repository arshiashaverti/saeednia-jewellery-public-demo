import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, X, Sparkles, BookOpen, ArrowLeft, ArrowRight, Package } from 'lucide-react';
import type { Product, Article } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function normalizePersian(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200C\u200B\uFEFF]/g, ' ') // zero-width spaces to space
    .replace(/\s+/g, ' ')
    .trim();
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { lang, products, articles } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      const prev = previousFocusRef.current;
      if (prev && prev.isConnected && typeof prev.focus === 'function') {
        prev.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const normalizedQuery = useMemo(() => normalizePersian(query), [query]);

  const matchedProducts = useMemo(() => {
    if (!normalizedQuery) return [];
    // Only search published, non-test products
    const pool = products.filter((p) => p.visibility && !p.isTest);
    return pool.filter((p) => {
      const matchTitleFa = normalizePersian(p.titleFa).includes(normalizedQuery);
      const matchTitleEn = normalizePersian(p.titleEn || '').includes(normalizedQuery);
      const matchDescFa = normalizePersian(p.descriptionFa || '').includes(normalizedQuery);
      const matchDescEn = normalizePersian(p.descriptionEn || '').includes(normalizedQuery);
      const matchCode = normalizePersian(p.productCode || '').includes(normalizedQuery);
      return matchTitleFa || matchTitleEn || matchDescFa || matchDescEn || matchCode;
    });
  }, [products, normalizedQuery]);

  const matchedArticles = useMemo(() => {
    if (!normalizedQuery) return [];
    const pool = (articles || []).filter((a) => a.published);
    return pool.filter((a) => {
      const matchTitleFa = normalizePersian(a.titleFa).includes(normalizedQuery);
      const matchTitleEn = normalizePersian(a.titleEn || '').includes(normalizedQuery);
      const matchExcerptFa = normalizePersian(a.excerptFa || '').includes(normalizedQuery);
      const matchContentFa = normalizePersian(a.contentFa || '').includes(normalizedQuery);
      return matchTitleFa || matchTitleEn || matchExcerptFa || matchContentFa;
    });
  }, [articles, normalizedQuery]);

  if (!isOpen) return null;

  const totalResults = matchedProducts.length + matchedArticles.length;

  const handleSelectProduct = (product: Product) => {
    onClose();
    navigate(`/products/${encodeURIComponent(product.id)}`);
  };

  const handleSelectArticle = (article: Article) => {
    onClose();
    navigate(`/blog/${encodeURIComponent(article.slug)}`);
  };

  return (
    <div
      id="global-search-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="جستجوی سراسری وبسایت جواهری سعیدنیا"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#09090C] border border-[#AC9262]/35 dark:border-[#C5A059]/30 rounded-sm shadow-2xl shadow-black/80 overflow-hidden luxury-surface-elevated flex flex-col max-h-[85dvh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top subtle 3D metallic specular line */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#AC9262]/50 dark:via-[#D4AF37]/60 to-transparent pointer-events-none" />

        {/* Search Input Bar (Pinned) */}
        <div className="shrink-0 relative flex items-center p-3.5 sm:p-5 border-b border-[#AC9262]/25 dark:border-[#C5A059]/20 bg-[#FAF9F6] dark:bg-[#0E0E14]">
          <Search className="w-5 h-5 text-[#906D2D] dark:text-[#C5A059] flex-shrink-0 ms-1" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'fa' ? 'جستجوی نام اثر، کد محصول یا عنوان مقاله...' : 'Search pieces, codes, or articles...'}
            className="w-full min-w-0 mx-2.5 sm:mx-3 py-2 bg-transparent text-sm sm:text-base text-[#1F1A16] dark:text-[#EDE8DF] placeholder-[#6E6153] dark:placeholder-[#736E67] focus:outline-none font-persian-nav"
            dir={lang === 'fa' ? 'rtl' : 'ltr'}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#6E6153] dark:text-[#8C8880] hover:text-[#1F1A16] dark:hover:text-[#EDE8DF] transition-colors me-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
              aria-label={lang === 'fa' ? 'پاک کردن متن جستجو' : 'Clear query'}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'fa' ? 'بستن جستجو' : 'Close search'}
            className="min-h-[36px] px-3 py-1.5 text-xs text-[#906D2D] dark:text-[#C5A059] hover:text-[#7D5E26] dark:hover:text-[#D4AF37] border border-[#AC9262]/30 dark:border-[#C5A059]/25 hover:border-[#906D2D] dark:hover:border-[#D4AF37] rounded-sm transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] cursor-pointer"
          >
            {lang === 'fa' ? 'بستن' : 'Close'}
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
          {!normalizedQuery ? (
            <div className="py-12 text-center text-[#6E6153] dark:text-[#7C7870]">
              <Search className="w-8 h-8 text-[#906D2D]/40 dark:text-[#C5A059]/40 mx-auto mb-3" />
              <p className="text-xs sm:text-sm font-persian-body text-[#4A3F35] dark:text-[#7C7870]">
                {lang === 'fa'
                  ? 'نام اثر، کد اختصاصی (مانند SN-...) یا عنوان مورد نظر خود را تایپ فرمایید.'
                  : 'Type a jewellery piece name, code, or article title to search.'}
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-[#6E6153] dark:text-[#8C8880]">
              <Sparkles className="w-8 h-8 text-[#906D2D]/40 dark:text-[#C5A059]/40 mx-auto mb-3" />
              <p className="text-sm font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] mb-1">
                {lang === 'fa' ? 'نتیجه‌ای برای جستجوی شما یافت نشد' : 'No results found'}
              </p>
              <p className="text-xs text-[#4A3F35] dark:text-[#7C7870] font-persian-body">
                {lang === 'fa'
                  ? 'لطفاً کلمات دیگری را امتحان کرده یا جهت استعلام اثر با گالری تماس حاصل فرمایید.'
                  : 'Try adjusting your search terms or contact the atelier directly.'}
              </p>
            </div>
          ) : (
            <>
              {/* Product Matches */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#AC9262]/25 dark:border-[#C5A059]/15">
                    <span className="font-cinzel text-[11px] text-[#906D2D] dark:text-[#C5A059] tracking-wider uppercase font-medium flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      <span>{lang === 'fa' ? 'آثار و جواهرات' : 'Jewellery Pieces'}</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#6E6153] dark:text-[#8C8880]">
                      ({matchedProducts.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {matchedProducts.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handleSelectProduct(p)}
                        className="w-full text-start group p-3 bg-white dark:bg-[#0E0E12] hover:bg-[#FAF9F6] dark:hover:bg-[#14141C] border border-[#AC9262]/30 dark:border-[#C5A059]/15 hover:border-[#906D2D] dark:hover:border-[#D4AF37]/50 rounded-sm cursor-pointer transition-all flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Thumbnail / Placeholder */}
                          <div className="w-12 h-12 bg-[#FAF9F6] dark:bg-[#060608] border border-[#AC9262]/25 dark:border-[#C5A059]/20 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                            {p.mainImage ? (
                              <img
                                src={p.mainImage}
                                alt={p.titleFa}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Sparkles className="w-4 h-4 text-[#906D2D]/40 dark:text-[#C5A059]/40" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] group-hover:text-[#906D2D] dark:group-hover:text-[#D4AF37] truncate transition-colors">
                              {lang === 'fa' ? p.titleFa : (p.titleEn || p.titleFa)}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#4A3F35] dark:text-[#8C8880]">
                              {p.productCode && (
                                <span className="font-mono text-[#906D2D] dark:text-[#C5A059]">{p.productCode}</span>
                              )}
                              {p.specifications?.goldCarat && (
                                <span>• {p.specifications.goldCarat}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs text-[#906D2D] dark:text-[#C5A059] group-hover:text-[#1F1A16] dark:group-hover:text-[#EDE8DF] transition-colors flex items-center gap-1 flex-shrink-0">
                          <span className="hidden sm:inline text-[11px] font-persian-nav">
                            {lang === 'fa' ? 'مشاهده' : 'View'}
                          </span>
                          {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Article Matches */}
              {matchedArticles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#AC9262]/25 dark:border-[#C5A059]/15">
                    <span className="font-cinzel text-[11px] text-[#906D2D] dark:text-[#C5A059] tracking-wider uppercase font-medium flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{lang === 'fa' ? 'مقالات و روایات' : 'Articles & Heritage'}</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#6E6153] dark:text-[#8C8880]">
                      ({matchedArticles.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {matchedArticles.map((a) => (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => handleSelectArticle(a)}
                        className="w-full text-start group p-3 bg-white dark:bg-[#0E0E12] hover:bg-[#FAF9F6] dark:hover:bg-[#14141C] border border-[#AC9262]/30 dark:border-[#C5A059]/15 hover:border-[#906D2D] dark:hover:border-[#D4AF37]/50 rounded-sm cursor-pointer transition-all flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 bg-[#FAF9F6] dark:bg-[#060608] border border-[#AC9262]/25 dark:border-[#C5A059]/20 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                            {a.coverImage ? (
                              <img
                                src={a.coverImage}
                                alt={a.titleFa}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-4 h-4 text-[#906D2D]/50 dark:text-[#C5A059]/50" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] group-hover:text-[#906D2D] dark:group-hover:text-[#D4AF37] truncate transition-colors">
                              {lang === 'fa' ? a.titleFa : (a.titleEn || a.titleFa)}
                            </h4>
                            <p className="text-[11px] text-[#4A3F35] dark:text-[#8C8880] truncate mt-0.5 font-persian-body">
                              {lang === 'fa' ? a.excerptFa : (a.excerptEn || a.excerptFa)}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs text-[#906D2D] dark:text-[#C5A059] group-hover:text-[#1F1A16] dark:group-hover:text-[#EDE8DF] transition-colors flex items-center gap-1 flex-shrink-0">
                          <span className="hidden sm:inline text-[11px] font-persian-nav">
                            {lang === 'fa' ? 'مطالعه' : 'Read'}
                          </span>
                          {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
