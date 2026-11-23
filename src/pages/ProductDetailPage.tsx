import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Phone, Instagram, MessageCircle, ArrowLeft, ArrowRight, Sparkles, Gem, Share2, ShieldCheck } from 'lucide-react';
import type { Product } from '../types';
import { applyPageSeo, buildBreadcrumbSchema } from '../utils/seo';
import { safeParseJsonResponse } from '../lib/api';
import {
  buildProductSocialEnquiryUrl,
  formatTelHref,
  resolveActivePhoneNumbers,
  resolveActiveSocialLinks,
} from '../utils/contactAndArticles';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { lang, products, categories, settings, token, showToast } = useApp();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    // 1. Try finding in loaded products first (by id, slug, or productCode)
    const local = products.find((p) => p.id === id || p.slug === id || p.productCode === id);
    if (local) {
      setProduct(local);
      setLoading(false);
      return;
    }

    // 2. Fetch directly from server API
    if (id) {
      setLoading(true);
      fetch(`/api/products/${encodeURIComponent(id)}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => safeParseJsonResponse<Product>(res))
        .then((parsed) => {
          setProduct(parsed.ok && parsed.data ? parsed.data : null);
        })
        .catch(() => {
          setProduct(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, products, token]);

  // Update dynamic document title, canonical URL, OpenGraph, and inquiry-only Product JSON-LD
  useEffect(() => {
    const brandName = settings?.brandNameFa || 'جواهری سعیدنیا';
    if (product) {
      const displayName = lang === 'fa' ? product.titleFa : (product.titleEn || product.titleFa);
      const seoTitle = lang === 'fa'
        ? (product.seoTitleFa || product.titleFa)
        : (product.seoTitleEn || product.titleEn || product.titleFa);
      const metaDesc = lang === 'fa'
        ? (product.metaDescriptionFa || product.descriptionFa || '')
        : (product.metaDescriptionEn || product.descriptionEn || product.descriptionFa || '');

      const firstCatKey = product.category ? product.category.split(',')[0].trim() : '';
      const currentCat = categories.find((c) => !c.isDeleted && (c.key === firstCatKey || c.key === product.category));
      const catSlug = currentCat?.slug || firstCatKey.replace(/_/g, '-');
      const prodSlug = product.slug || product.productCode || product.id;
      const canonicalPath =
        catSlug && product.slug
          ? `/${encodeURIComponent(catSlug)}/${encodeURIComponent(prodSlug)}`
          : `/products/${encodeURIComponent(prodSlug)}`;
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const rawImgs =
        product.images && product.images.length > 0
          ? product.images
          : product.mainImage
          ? [product.mainImage]
          : [];
      const absImgs = rawImgs.map((img) =>
        /^https?:\/\//i.test(img) ? img : `${origin}${img.startsWith('/') ? img : `/${img}`}`
      );

      // Inquiry-only Product JSON-LD: STRICTLY no fake Offer/price/AggregateRating
      const productSchema: Record<string, any> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: displayName,
        description: metaDesc,
        sku: product.productCode,
        mpn: product.productCode,
        url: `${origin}${canonicalPath}`,
        image: absImgs.length > 0 ? absImgs : [`${origin}/images/saeednia-hero-dark-final.webp`],
        brand: { '@type': 'Brand', name: brandName },
      };
      if (currentCat) productSchema.category = lang === 'fa' ? currentCat.nameFa : currentCat.nameEn;
      if (product.specifications?.goldCarat) productSchema.material = product.specifications.goldCarat;

      const crumbs = [
        { name: lang === 'fa' ? 'خانه' : 'Home', path: '/' },
        { name: lang === 'fa' ? 'دسته‌بندی جواهرات' : 'Categories', path: '/categories' },
      ];
      if (currentCat && catSlug) {
        crumbs.push({
          name: lang === 'fa' ? currentCat.nameFa : currentCat.nameEn,
          path: `/categories/${encodeURIComponent(catSlug)}`,
        });
      }
      crumbs.push({ name: displayName, path: canonicalPath });

      applyPageSeo({
        browserTitle: `${displayName} | ${brandName}`,
        seoTitle,
        metaDescription: metaDesc,
        canonicalPath,
        robots: 'index, follow',
        ogType: 'product',
        ogImage: product.mainImage || absImgs[0],
        jsonLd: [productSchema, buildBreadcrumbSchema(crumbs)],
      });
    } else if (!loading) {
      applyPageSeo({
        browserTitle: `${lang === 'fa' ? 'اثر یافت نشد' : 'Creation Not Found'} | ${brandName}`,
        metaDescription: 'اثر مورد نظر در کاتالوگ جواهری سعیدنیا یافت نشد.',
        robots: 'noindex, nofollow',
      });
    }
  }, [product, loading, lang, settings, categories]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('پیوند اثر در حافظه کپی شد', 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070709] text-[#1F1A16] dark:text-[#EDE8DF] flex items-center justify-center pt-32 pb-32">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#906D2D] dark:text-[#C5A059] animate-spin" />
          <span className="text-xs font-persian-nav text-[#6E6153] dark:text-[#8C8880]">در حال فراخوانی مشخصات اثر...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070709] text-[#1F1A16] dark:text-[#EDE8DF] flex flex-col items-center justify-center px-4 pt-32 pb-32 text-center">
        <Gem className="w-12 h-12 text-[#906D2D]/40 dark:text-[#C5A059]/40 mb-4" />
        <h1 className="text-2xl font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] mb-3">اثر مورد نظر یافت نشد</h1>
        <p className="text-xs text-[#4A3F35] dark:text-[#8C8880] font-persian-body mb-6">
          ممکن است کد اثر تغییر یافته یا در وضعیت نمایش خصوصی قرار داشته باشد.
        </p>
        <Link
          to="/categories"
          className="px-6 py-2.5 bg-[#906D2D] hover:bg-[#7D5E26] text-white dark:bg-[#C5A059] dark:hover:bg-[#D4AF37] dark:text-[#0A0A0D] text-xs font-persian-nav rounded-sm transition-colors"
        >
          مشاهده کاتالوگ جواهرات
        </Link>
      </div>
    );
  }

  const title = lang === 'fa' ? product.titleFa : (product.titleEn || product.titleFa);
  const description = lang === 'fa' ? product.descriptionFa : (product.descriptionEn || product.descriptionFa);
  const firstCatKey = product.category ? product.category.split(',')[0].trim() : '';
  const currentCat = categories.find((c) => c.key === firstCatKey || c.key === product.category);
  const categoryName = currentCat ? (lang === 'fa' ? currentCat.nameFa : currentCat.nameEn) : '';

  const images = product.images && product.images.length > 0 ? product.images : (product.mainImage ? [product.mainImage] : []);
  const activeImage = images[activeImageIndex] || product.mainImage || '';

  const phoneNumbers = resolveActivePhoneNumbers(settings?.contact);
  const primaryPhone = phoneNumbers[0] || '';
  const primaryTelHref = primaryPhone ? formatTelHref(primaryPhone) : '';

  const activeSocials = resolveActiveSocialLinks(settings?.contact);
  const igSocial = activeSocials.find((s) => s.platform === 'whatsapp' || s.platform === 'instagram') || activeSocials[0];
  const rawSocialUrl = igSocial?.url || settings?.contact?.instagramUrl || '';
  const primarySocialUrl = buildProductSocialEnquiryUrl(
    rawSocialUrl,
    igSocial?.platform || 'instagram',
    {
      productTitle: title,
      productCode: product.productCode,
      lang,
      defaultMsgFa: settings?.contact?.whatsappDefaultMessageFa,
      defaultMsgEn: settings?.contact?.whatsappDefaultMessageEn,
    }
  );

  return (
    <article id="product-detail-page" className="min-h-screen bg-white dark:bg-[#070709] text-[#1F1A16] dark:text-[#EDE8DF] pt-32 sm:pt-40 pb-36">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between text-xs text-[#6E6153] dark:text-[#8C8880]">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-[#906D2D] hover:text-[#1F1A16] dark:text-[#C5A059] dark:hover:text-[#EDE8DF] font-persian-nav transition-colors"
          >
            {lang === 'fa' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{lang === 'fa' ? 'بازگشت به مجموعه جواهرات' : 'Back to Collection'}</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-[#6E6153] hover:text-[#906D2D] dark:text-[#8C8880] dark:hover:text-[#D4AF37] transition-colors"
            title="کپی لینک اختصاصی"
          >
            <Share2 className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#C5A059]" />
            <span className="font-persian-nav">{lang === 'fa' ? 'اشتراک‌گذاری' : 'Share'}</span>
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Gallery Stage (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative w-full aspect-square bg-[#FAF9F6] dark:bg-[#060608] border border-[#AC9262]/35 dark:border-[#C5A059]/25 rounded-sm flex items-center justify-center p-6 sm:p-10 overflow-hidden luxury-stage-depth shadow-md dark:shadow-2xl dark:shadow-black">
              <div className="absolute inset-0 bg-radial from-[#AC9262]/10 dark:from-[#C5A059]/10 via-transparent to-transparent pointer-events-none" />
              
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={title}
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#786F62] dark:text-[#736E67]">
                  <Gem className="w-16 h-16 text-[#906D2D]/30 dark:text-[#C5A059]/30 mb-3" />
                  <span className="text-xs font-persian-nav text-[#4A3F35] dark:text-[#8C8880]">
                    {lang === 'fa' ? 'تصویر اثر در حال آماده‌سازی است' : 'Image arriving soon'}
                  </span>
                </div>
              )}

              <div className="absolute top-3 start-3 bg-white/90 dark:bg-[#0A0A0D]/85 px-2.5 py-1 border border-[#AC9262]/30 dark:border-[#C5A059]/20 rounded-sm text-[10px] text-[#906D2D] dark:text-[#D4AF37] font-cinzel tracking-wider backdrop-blur-sm">
                GRAND BAZAAR TEHRAN
              </div>
            </div>

            {/* Thumbnails if multiple images exist */}
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
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Category & Code */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-cinzel text-xs text-[#906D2D] dark:text-[#C5A059] tracking-widest uppercase font-medium">
                  {categoryName}
                </span>
                {product.productCode && (
                  <span className="font-mono text-xs text-[#906D2D] dark:text-[#C5A059] px-2 py-0.5 bg-[#E4DBCB]/30 dark:bg-[#0D0D12] border border-[#AC9262]/30 dark:border-[#C5A059]/25 rounded-sm">
                    {product.productCode}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] mb-3 leading-snug">
                {title}
              </h1>

              {product.titleEn && lang === 'fa' && (
                <p className="font-cinzel text-xs text-[#906D2D] dark:text-[#C5A059] tracking-wider mb-6">
                  {product.titleEn}
                </p>
              )}

              {/* Specifications Box */}
              {product.specifications && (
                <div className="p-5 bg-[#FAF9F6] dark:bg-[#0A0A0E] border border-[#AC9262]/30 dark:border-[#C5A059]/20 rounded-sm mb-6 space-y-3">
                  <h3 className="text-xs font-cinzel text-[#906D2D] dark:text-[#D4AF37] tracking-wider uppercase font-semibold border-b border-[#AC9262]/20 dark:border-[#C5A059]/15 pb-2 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#C5A059]" />
                    <span>{lang === 'fa' ? 'شناسنامه و مشخصات اثر' : 'Specifications'}</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {product.specifications.goldCarat && (
                      <div>
                        <span className="text-[#6E6153] dark:text-[#8C8880] block text-[11px] font-persian-body">{lang === 'fa' ? 'عیار طلا:' : 'Gold Carat:'}</span>
                        <span className="text-[#1F1A16] dark:text-[#EDE8DF] font-persian-heading">{product.specifications.goldCarat}</span>
                      </div>
                    )}
                    {product.specifications.approxWeight && (
                      <div>
                        <span className="text-[#6E6153] dark:text-[#8C8880] block text-[11px] font-persian-body">{lang === 'fa' ? 'وزن تقریبی:' : 'Approx Weight:'}</span>
                        <span className="text-[#1F1A16] dark:text-[#EDE8DF] font-persian-heading">{product.specifications.approxWeight}</span>
                      </div>
                    )}
                    {product.specifications.gemstones && (
                      <div className="col-span-2">
                        <span className="text-[#6E6153] dark:text-[#8C8880] block text-[11px] font-persian-body">{lang === 'fa' ? 'گوهرها و سنگ‌ها:' : 'Gemstones:'}</span>
                        <span className="text-[#1F1A16] dark:text-[#EDE8DF] font-persian-heading">{product.specifications.gemstones}</span>
                      </div>
                    )}
                    {product.specifications.finish && (
                      <div className="col-span-2">
                        <span className="text-[#6E6153] dark:text-[#8C8880] block text-[11px] font-persian-body">{lang === 'fa' ? 'پرداخت و زرگری:' : 'Finish:'}</span>
                        <span className="text-[#1F1A16] dark:text-[#EDE8DF] font-persian-heading">{product.specifications.finish}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="mb-8">
                  <h4 className="text-xs font-persian-heading text-[#906D2D] dark:text-[#C5A059] mb-2">{lang === 'fa' ? 'توضیحات و جزئیات اثر:' : 'Description:'}</h4>
                  <p className="text-xs sm:text-sm text-[#4A3F35] dark:text-[#C8C4BC] font-persian-body leading-relaxed text-justify">
                    {description}
                  </p>
                </div>
              )}

              {/* Availability Notice */}
              <div className="p-5 bg-[#FAF9F6] dark:bg-[#0E0E12] border border-[#AC9262]/35 dark:border-[#C5A059]/25 rounded-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#AC9262]/40 dark:via-[#C5A059]/40 to-transparent pointer-events-none" />
                <p className="text-xs sm:text-sm text-[#1F1A16] dark:text-[#EDE8DF] font-persian-body mb-3 leading-relaxed">
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

            {/* Direct Contact Buttons */}
            <div className={`grid grid-cols-1 ${primarySocialUrl ? 'sm:grid-cols-2' : ''} gap-3 pt-6 border-t border-[#AC9262]/20 dark:border-[#C5A059]/15`}>
              {primaryTelHref ? (
                <a
                  href={primaryTelHref}
                  className="w-full py-3.5 bg-[#906D2D] hover:bg-[#7D5E26] dark:bg-[#C5A059] dark:hover:bg-[#D4AF37] text-white dark:text-[#0A0A0D] text-xs font-persian-nav tracking-wide rounded-sm flex items-center justify-center gap-2 luxury-btn-tactile-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-white dark:text-[#0A0A0D]" />
                  <span>{lang === 'fa' ? 'تماس با ما' : 'Contact Us'}</span>
                </a>
              ) : (
                <Link
                  to="/contact"
                  className="w-full py-3.5 bg-[#906D2D] hover:bg-[#7D5E26] dark:bg-[#C5A059] dark:hover:bg-[#D4AF37] text-white dark:text-[#0A0A0D] text-xs font-persian-nav tracking-wide rounded-sm flex items-center justify-center gap-2 luxury-btn-tactile-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-white dark:text-[#0A0A0D]" />
                  <span>{lang === 'fa' ? 'تماس با ما' : 'Contact Us'}</span>
                </Link>
              )}

              {primarySocialUrl && (
                <a
                  href={primarySocialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 border border-[#AC9262]/35 hover:border-[#906D2D] dark:border-[#C5A059]/30 dark:hover:border-[#D4AF37] text-[#1F1A16] hover:text-[#906D2D] dark:text-[#EDE8DF] dark:hover:text-[#D4AF37] text-xs font-persian-nav tracking-wide rounded-sm flex items-center justify-center gap-2 bg-white hover:bg-[#E4DBCB]/30 dark:bg-[#0E0E12] dark:hover:bg-[#141418] group luxury-btn-tactile-secondary transition-all"
                >
                  {igSocial?.platform === 'whatsapp' ? (
                    <MessageCircle className="w-4 h-4 text-[#906D2D] dark:text-[#C5A059] group-hover:text-[#7D5E26] dark:group-hover:text-[#D4AF37] transition-colors" />
                  ) : (
                    <Instagram className="w-4 h-4 text-[#906D2D] dark:text-[#C5A059] group-hover:text-[#7D5E26] dark:group-hover:text-[#D4AF37] transition-colors" />
                  )}
                  <span>{lang === 'fa' ? 'استعلام در شبکه اجتماعی' : 'Social Enquiry'}</span>
                </a>
              )}
            </div>

          </div>

        </div>

      </div>
    </article>
  );
};
