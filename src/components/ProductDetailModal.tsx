import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Instagram, Phone } from 'lucide-react';
import {
  formatTelHref,
  resolveActivePhoneNumbers,
  resolveActiveSocialLinks,
} from '../utils/contactAndArticles';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, lang, settings, categories } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setActiveImageIndex(0);
    if (!selectedProduct) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProduct(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    const rafId = window.requestAnimationFrame(() => closeBtnRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(rafId);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      const prev = previousFocusRef.current;
      if (prev && prev.isConnected && typeof prev.focus === 'function') {
        prev.focus();
      }
    };
  }, [selectedProduct, setSelectedProduct]);

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const title = lang === 'fa' ? product.titleFa : (product.titleEn || product.titleFa);
  const description = lang === 'fa' ? product.descriptionFa : (product.descriptionEn || product.descriptionFa);
  const firstCatKey = product.category ? product.category.split(',')[0].trim() : '';
  const currentCat = categories.find((c) => c.key === firstCatKey || c.key === product.category);
  const categoryName = currentCat ? (lang === 'fa' ? currentCat.nameFa : currentCat.nameEn) : '';

  const images = product.images && product.images.length > 0 ? product.images : [product.mainImage];
  const activeImage = images[activeImageIndex] || product.mainImage;

  const phoneNumbers = resolveActivePhoneNumbers(settings?.contact);
  const primaryPhone = phoneNumbers[0] || '';
  const primaryTelHref = primaryPhone ? formatTelHref(primaryPhone) : '';

  const activeSocials = resolveActiveSocialLinks(settings?.contact);
  const igSocial = activeSocials.find((s) => s.platform === 'instagram') || activeSocials[0];
  const instagramUrl = igSocial?.url || settings?.contact?.instagramUrl || '';

  const handlePhoneCall = () => {
    if (primaryTelHref) {
      window.location.href = primaryTelHref;
    }
  };

  return (
    <div
      id="product-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={() => setSelectedProduct(null)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="relative w-full max-w-4xl bg-white dark:bg-[#0A0A0D] border border-[#AC9262]/35 dark:border-[#C5A059]/30 rounded-sm overflow-hidden my-auto max-h-[92dvh] flex flex-col luxury-surface-elevated shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top subtle 3D metallic specular line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#AC9262]/50 dark:via-[#D4AF37]/60 to-transparent pointer-events-none" />

        {/* Modal Header (Pinned) */}
        <div className="shrink-0 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#AC9262]/30 dark:border-[#C5A059]/15 bg-[#E4DBCB] dark:bg-[#0E0E12]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-cinzel text-xs text-[#906D2D] dark:text-[#C5A059] tracking-widest uppercase font-semibold truncate">
              {categoryName}
            </span>
          </div>

          <button
            ref={closeBtnRef}
            id="btn-close-product-modal"
            type="button"
            onClick={() => setSelectedProduct(null)}
            className="min-w-[36px] min-h-[36px] w-9 h-9 flex items-center justify-center text-[#1F1A16] dark:text-[#C8C4BC] hover:text-[#906D2D] dark:hover:text-[#D4AF37] transition-colors rounded-sm hover:bg-black/5 dark:hover:bg-[#16161B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] shrink-0 cursor-pointer"
            aria-label={lang === 'fa' ? 'بستن پنجره' : 'Close modal'}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Content Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Gallery Column */}
          <div className="md:col-span-6 flex flex-col gap-4">
            {/* Main Stage Display (Preserving natural proportions without crop) */}
            <div className="relative w-full aspect-square bg-[#FAF9F6] dark:bg-[#060608] border border-[#AC9262]/30 dark:border-[#C5A059]/20 flex items-center justify-center p-6 rounded-sm overflow-hidden group">
              <div className="absolute inset-0 bg-radial from-[#AC9262]/10 dark:from-[#C5A059]/10 via-transparent to-transparent pointer-events-none" />
              <img
                src={activeImage}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain filter drop-shadow-[0_8px_18px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_16px_30px_rgba(0,0,0,0.95)] transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 bg-white/95 dark:bg-[#0A0A0D]/85 px-2.5 py-1 border border-[#AC9262]/30 dark:border-[#C5A059]/20 rounded-sm text-[10px] text-[#906D2D] dark:text-[#D4AF37] font-cinzel tracking-wider backdrop-blur-sm shadow-sm">
                GRAND BAZAAR TEHRAN
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 border p-1.5 bg-[#FAF9F6] dark:bg-[#060608] transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#906D2D] dark:border-[#D4AF37] shadow-sm'
                        : 'border-[#AC9262]/25 dark:border-[#C5A059]/15 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="md:col-span-6 flex flex-col justify-between h-full">
            <div>
              {/* Category */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-cinzel text-[11px] text-[#906D2D] dark:text-[#C5A059] tracking-widest uppercase font-medium">
                  {categoryName}
                </span>
              </div>

              {/* Title */}
              <h2 id="product-modal-title" className="text-xl sm:text-2xl font-light text-[#1F1A16] dark:text-[#EDE8DF] mb-2 leading-snug font-vazir">
                {title}
              </h2>
              {product.titleEn && lang === 'fa' && (
                <p className="font-cinzel text-xs text-[#906D2D] dark:text-[#C5A059] tracking-wider mb-5 font-normal">
                  {product.titleEn}
                </p>
              )}

              {/* Description */}
              {description && (
                <p className="text-sm text-[#4A3F35] dark:text-[#C8C4BC] font-light leading-relaxed mb-8">
                  {description}
                </p>
              )}

              {/* Availability Notice */}
              <div className="p-5 bg-[#FAF9F6] dark:bg-[#0E0E12] border border-[#AC9262]/35 dark:border-[#C5A059]/25 rounded-sm mb-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#AC9262]/40 dark:via-[#C5A059]/40 to-transparent pointer-events-none" />
                <p className="text-xs sm:text-sm text-[#1F1A16] dark:text-[#EDE8DF] font-light mb-3 leading-relaxed">
                  {lang === 'fa'
                    ? 'جهت اطلاع از موجودیت این اثر با این شماره تماس بگیرید.'
                    : 'For availability information, please contact us at:'}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {phoneNumbers.map((phone, idx) => (
                    <a
                      key={idx}
                      href={formatTelHref(phone) || undefined}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#141418] hover:bg-[#E4DBCB]/30 dark:hover:bg-[#1A1A22] border border-[#AC9262]/35 hover:border-[#906D2D] dark:border-[#C5A059]/35 dark:hover:border-[#D4AF37] text-sm text-[#906D2D] dark:text-[#D4AF37] font-mono rounded-sm transition-all shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#C5A059]" />
                      <span dir="ltr">{phone}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`grid grid-cols-1 ${instagramUrl ? 'sm:grid-cols-2' : ''} gap-3 pt-6 border-t border-[#AC9262]/20 dark:border-[#C5A059]/15`}>
              <button
                id="btn-modal-phone"
                type="button"
                onClick={handlePhoneCall}
                className="w-full py-3 bg-[#906D2D] hover:bg-[#7D5E26] dark:bg-[#C5A059] dark:hover:bg-[#D4AF37] text-white dark:text-[#0A0A0D] text-xs font-semibold tracking-wide rounded-sm flex items-center justify-center gap-2 luxury-btn-tactile-primary transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-white dark:text-[#0A0A0D]" />
                <span>{lang === 'fa' ? 'تماس با ما' : 'Contact Us'}</span>
              </button>

              {instagramUrl && (
                <a
                  id="btn-modal-instagram"
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 border border-[#AC9262]/35 hover:border-[#906D2D] text-[#1F1A16] hover:text-[#906D2D] dark:border-[#C5A059]/30 dark:hover:border-[#D4AF37] dark:text-[#EDE8DF] dark:hover:text-[#D4AF37] text-xs font-medium tracking-wide rounded-sm flex items-center justify-center gap-2 bg-white hover:bg-[#E4DBCB]/30 dark:bg-[#0E0E12] dark:hover:bg-[#141418] group luxury-btn-tactile-secondary transition-all"
                >
                  <Instagram className="w-4 h-4 text-[#906D2D] dark:text-[#C5A059] group-hover:text-[#7D5E26] dark:group-hover:text-[#D4AF37] transition-colors" />
                  <span className="font-vazir">{lang === 'fa' ? 'اینستاگرام' : 'Instagram'}</span>
                </a>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
