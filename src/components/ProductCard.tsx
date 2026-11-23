import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Product } from '../types';
import { Eye, ArrowLeft, ArrowRight, Gem } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  imageAspect?: 'square' | 'portrait' | 'wide';
  showProductName?: boolean;
  showProductCode?: boolean;
  showShortDescription?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  imageAspect = 'square',
  showProductName = true,
  showProductCode = false,
  showShortDescription = false,
}) => {
  const { lang, setSelectedProduct, categories } = useApp();

  const title = lang === 'fa' ? product.titleFa : product.titleEn || product.titleFa;
  const shortDesc = lang === 'fa' ? product.descriptionFa : product.descriptionEn || product.descriptionFa;
  const firstCatKey = product.category ? product.category.split(',')[0].trim() : '';
  const currentCat = categories.find((c) => !c.isDeleted && (c.key === firstCatKey || c.key === product.category));
  const categoryName = currentCat ? (lang === 'fa' ? currentCat.nameFa : currentCat.nameEn) : '';
  const categorySlug = currentCat?.slug || firstCatKey.replace(/_/g, '-');

  const productSlug = product.slug || product.productCode || product.id;
  const productHref =
    categorySlug && product.slug
      ? `/${encodeURIComponent(categorySlug)}/${encodeURIComponent(productSlug)}`
      : `/products/${encodeURIComponent(productSlug)}`;

  const aspectClass =
    imageAspect === 'portrait' ? 'aspect-[4/5]' : imageAspect === 'wide' ? 'aspect-[16/10]' : 'aspect-square';

  return (
    <article
      id={`product-card-${product.id}`}
      className="group cursor-pointer bg-white dark:bg-[#0A0A0D] border border-[#AC9262]/35 dark:border-[#C5A059]/15 hover:border-[#906D2D] dark:hover:border-[#C5A059]/50 rounded-sm flex flex-col overflow-hidden relative shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-xl dark:shadow-none transition-all duration-300"
    >
      <Link
        to={productHref}
        onClick={() => setSelectedProduct(product)}
        className="flex flex-col flex-grow focus:outline-none"
      >
        {/* Top subtle 3D specular metallic highlight */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#AC9262]/50 dark:via-[#C5A059]/60 to-transparent opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Editorial Image Container */}
        <div className={`relative w-full ${aspectClass} bg-[#FAF9F6] dark:bg-[#060608] flex items-center justify-center p-6 sm:p-7 overflow-hidden`}>
          <div className="absolute inset-0 bg-radial from-[#AC9262]/10 dark:from-[#C5A059]/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {product.mainImage ? (
            <img
              src={product.mainImage}
              alt={title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain filter drop-shadow-[0_8px_18px_rgba(0,0,0,0.06)] dark:drop-shadow-[0_12px_22px_rgba(0,0,0,0.85)] group-hover:drop-shadow-[0_16px_28px_rgba(0,0,0,0.1)] dark:group-hover:drop-shadow-[0_20px_34px_rgba(0,0,0,0.95)] transition-all duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#786F62] dark:text-[#736E67]">
              <Gem className="w-12 h-12 text-[#906D2D]/30 dark:text-[#C5A059]/30 mb-2" />
              <span className="text-[11px] font-persian-nav text-[#4A3F35] dark:text-[#8C8880]">
                {lang === 'fa' ? 'تصویر اثر' : 'Jewellery piece'}
              </span>
            </div>
          )}

          {/* Top Badges: Category */}
          {categoryName && (
            <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
              <span className="font-cinzel text-[10px] tracking-wider uppercase px-2.5 py-1 bg-white/95 dark:bg-[#0A0A0D]/85 text-[#1F1A16] dark:text-[#C5A059] border border-[#AC9262]/30 dark:border-[#C5A059]/25 rounded-sm backdrop-blur-sm shadow-sm font-medium">
                {categoryName}
              </span>
            </div>
          )}

          {/* Bottom hover quick-action overlay */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="flex items-center gap-1.5 text-[11px] text-[#1F1A16] dark:text-[#EDE8DF] bg-white/95 dark:bg-[#0A0A0D]/95 px-3.5 py-1.5 border border-[#AC9262]/35 dark:border-[#C5A059]/35 rounded-sm shadow-md font-vazir font-medium">
              <Eye className="w-3 h-3 text-[#906D2D] dark:text-[#C5A059]" />
              <span>{lang === 'fa' ? 'مشاهده اثر' : 'View Piece'}</span>
            </span>
          </div>
        </div>

        {/* Product Information */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between border-t border-[#AC9262]/20 dark:border-[#C5A059]/10">
          <div>
            {showProductCode && product.productCode && (
              <span className="text-[11px] font-mono text-[#906D2D] dark:text-[#C5A059] block mb-1 tracking-wider">
                {product.productCode}
              </span>
            )}
            {showProductName && (
              <h3 className="text-sm sm:text-base font-normal text-[#1F1A16] dark:text-[#EDE8DF] group-hover:text-[#906D2D] dark:group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-relaxed mb-1 font-vazir">
                {title}
              </h3>
            )}
            {showShortDescription && shortDesc && (
              <p className="text-xs text-[#6E6153] dark:text-[#8C8880] font-persian-body line-clamp-2 leading-relaxed mt-1">
                {shortDesc}
              </p>
            )}
          </div>

          {/* View Piece footer line */}
          <div className="pt-3.5 mt-2 border-t border-[#AC9262]/20 dark:border-[#C5A059]/10 flex items-center justify-between text-xs text-[#906D2D] dark:text-[#C5A059]">
            <span className="font-cinzel text-[11px] tracking-wider uppercase font-medium">
              {lang === 'fa' ? 'مشاهده اثر' : 'View Creation'}
            </span>
            <span className="transform transition-transform group-hover:translate-x-[-4px] rtl:group-hover:translate-x-[4px]">
              {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};
