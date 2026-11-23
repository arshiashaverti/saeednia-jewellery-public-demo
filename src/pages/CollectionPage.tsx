import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { PageEditorialHeader } from '../components/PageEditorialHeader';
import { applyPageSeo, buildBreadcrumbSchema } from '../utils/seo';
import type { CategoryInfo } from '../types';

export const CollectionPage: React.FC = () => {
  const { lang, products, categories, selectedCategory, setSelectedCategory, pages, layoutSettings } = useApp();
  const [searchParams] = useSearchParams();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(12);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({
    rings:
      selectedCategory === 'rings' ||
      selectedCategory === 'men_rings' ||
      selectedCategory === 'women_rings',
  });

  const pageData = pages.find((p) => p.id === 'collection');
  const gridConfig = layoutSettings?.collectionPage;

  // Build dynamic hierarchical navigation categories straight from live CMS/Supabase store
  const activeNavCategories = useMemo(() => {
    return categories
      .filter((c) => !c.isDeleted && c.enabled !== false && c.showInNav !== false)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [categories]);

  const getSubcategories = (parent: CategoryInfo): CategoryInfo[] => {
    return activeNavCategories.filter(
      (sub) =>
        sub.key !== parent.key &&
        (sub.parentId === parent.id ||
          sub.parentId === parent.key ||
          (parent.key === 'rings' && (sub.key === 'men_rings' || sub.key === 'women_rings')))
    );
  };

  const topLevelCategories = useMemo(() => {
    const childKeys = new Set<string>();
    activeNavCategories.forEach((c) => {
      if (c.parentId || c.key === 'men_rings' || c.key === 'women_rings') {
        childKeys.add(c.key);
      }
    });
    const list = activeNavCategories.filter((c) => !childKeys.has(c.key));
    if (!list.some((c) => c.key === 'rings') && (childKeys.has('men_rings') || childKeys.has('women_rings'))) {
      list.unshift({
        id: 'cat-rings',
        key: 'rings',
        slug: 'rings',
        nameFa: 'انگشتر',
        nameEn: 'Rings',
        descriptionFa: 'مجموعه انگشترهای فاخر دست‌ساز با طلای ۱۸ عیار، الماس‌های شناسنامه‌دار و برلیان',
        descriptionEn: 'Curated handcrafted rings set with certified diamonds and precious gems',
        order: 1,
        enabled: true,
        showOnHome: true,
        showInNav: true,
      });
    }
    return list;
  }, [activeNavCategories]);

  const isUnknownCategorySlug = useMemo(() => {
    if (!categorySlug || categories.length === 0) return false;
    const lower = categorySlug.toLowerCase();
    if (lower === 'rings') return false;
    return !categories.some(
      (c) =>
        !c.isDeleted &&
        c.enabled !== false &&
        ((c.slug || '').toLowerCase() === lower || c.key.toLowerCase() === lower)
    );
  }, [categorySlug, categories]);

  // Synchronize URL slug or ?cat= query param with selectedCategory
  useEffect(() => {
    if (categorySlug) {
      const lower = categorySlug.toLowerCase();
      const matched = categories.find(
        (c) =>
          !c.isDeleted &&
          ((c.slug || '').toLowerCase() === lower || c.key.toLowerCase() === lower)
      );
      if (matched) {
        setSelectedCategory(matched.key);
      } else if (lower === 'rings') {
        setSelectedCategory('rings');
      }
    } else {
      const catParam = searchParams.get('cat');
      setSelectedCategory(catParam || 'all');
    }
  }, [categorySlug, searchParams, categories, setSelectedCategory]);

  // Reset pagination on filter/search changes
  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(gridConfig?.itemsPerPage || 12);
  }, [selectedCategory, searchQuery, gridConfig?.itemsPerPage]);

  // Auto-expand parent category when a child category is active
  useEffect(() => {
    topLevelCategories.forEach((parent) => {
      const subs = getSubcategories(parent);
      if (
        selectedCategory === parent.key ||
        subs.some((s) => s.key === selectedCategory)
      ) {
        setExpandedParents((prev) => (prev[parent.key] ? prev : { ...prev, [parent.key]: true }));
      }
    });
  }, [selectedCategory, topLevelCategories]);

  const getCategoryPath = (cat: CategoryInfo): string => {
    const slug = (cat.slug || cat.key.replace(/_/g, '-')).trim();
    return `/categories/${encodeURIComponent(slug)}`;
  };

  const getCategoryCount = (catKey: string) => {
    const publicProducts = products.filter((p) => p.visibility && p.status !== 'draft' && !p.isDeleted && !p.isTest);
    if (catKey === 'all') {
      return publicProducts.length;
    }
    const matchedCatObj = categories.find((c) => !c.isDeleted && c.key === catKey);
    const subKeys = matchedCatObj ? getSubcategories(matchedCatObj).map((s) => s.key) : [];

    if (catKey === 'rings') {
      const validKeys = new Set(['rings', 'men_rings', 'women_rings', ...subKeys]);
      return publicProducts.filter((p) => {
        const cats = (p.category || '').split(',').map((c) => c.trim());
        return cats.some((c) => validKeys.has(c));
      }).length;
    }
    if (catKey === 'wedding_bands') {
      return publicProducts.filter((p) => {
        const cats = (p.category || '').split(',').map((c) => c.trim());
        return cats.includes('wedding_bands') || cats.includes('bracelets') || cats.some((c) => subKeys.includes(c));
      }).length;
    }
    return publicProducts.filter((p) => {
      const cats = (p.category || '').split(',').map((c) => c.trim());
      return cats.includes(catKey) || (matchedCatObj?.id && p.categoryId === matchedCatObj.id) || cats.some((c) => subKeys.includes(c));
    }).length;
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        if (!item.visibility || item.status === 'draft' || item.isDeleted || item.isTest) return false;

        if (selectedCategory !== 'all') {
          const cats = (item.category || '').split(',').map((c) => c.trim());
          const matchedCatObj = categories.find((c) => !c.isDeleted && c.key === selectedCategory);
          const subKeys = matchedCatObj ? getSubcategories(matchedCatObj).map((s) => s.key) : [];

          if (selectedCategory === 'rings') {
            const validKeys = new Set(['rings', 'men_rings', 'women_rings', ...subKeys]);
            if (!cats.some((c) => validKeys.has(c))) return false;
          } else if (selectedCategory === 'wedding_bands') {
            if (!cats.includes('wedding_bands') && !cats.includes('bracelets') && !cats.some((c) => subKeys.includes(c))) {
              return false;
            }
          } else if (
            !cats.includes(selectedCategory) &&
            !(matchedCatObj?.id && item.categoryId === matchedCatObj.id) &&
            !cats.some((c) => subKeys.includes(c))
          ) {
            return false;
          }
        }

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitleFa = item.titleFa?.toLowerCase().includes(query);
          const matchTitleEn = item.titleEn?.toLowerCase().includes(query);
          const matchDescFa = item.descriptionFa?.toLowerCase().includes(query);
          const matchDescEn = item.descriptionEn?.toLowerCase().includes(query);

          if (!matchTitleFa && !matchTitleEn && !matchDescFa && !matchDescEn) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [products, selectedCategory, searchQuery, categories]);

  // Prioritize live DB/CMS category data before any static fallback
  const activeCategoryInfo = useMemo(() => {
    if (selectedCategory === 'all') return null;
    const fromStore = categories.find(
      (c) =>
        !c.isDeleted &&
        (c.key === selectedCategory || c.slug?.toLowerCase() === selectedCategory.toLowerCase())
    );
    if (fromStore) return fromStore;

    if (selectedCategory === 'rings') {
      return {
        id: 'cat-rings',
        key: 'rings',
        slug: 'rings',
        nameFa: 'انگشتر',
        nameEn: 'Rings',
        descriptionFa: 'مجموعه انگشترهای فاخر دست‌ساز با طلای ۱۸ عیار، الماس‌های شناسنامه‌دار و برلیان',
        descriptionEn: 'Curated handcrafted rings set with certified diamonds and precious gems',
        image: '/images/saeednia_ring_solitaire_1788961908989.jpg',
        order: 1,
        enabled: true,
      };
    }
    if (selectedCategory === 'wedding_bands') {
      return {
        id: 'cat-5',
        key: 'wedding_bands',
        slug: 'wedding-bands',
        nameFa: 'حلقه و پشت حلقه',
        nameEn: 'Wedding & Guard Bands',
        descriptionFa: 'حلقه‌های ست، سولیتر و پشت‌حلقه‌های فاخر با الماس‌های شناسنامه‌دار و برلیان',
        descriptionEn: 'Eternity bands, solitaires, and bridal guard rings set with certified diamonds',
        image: '/images/saeednia_ring_solitaire_1788961908989.jpg',
        order: 2,
        enabled: true,
      };
    }
    return null;
  }, [categories, selectedCategory]);

  const activeCategoryTitle =
    selectedCategory === 'all'
      ? lang === 'fa'
        ? 'تمام مجموعه جواهرات'
        : 'All Works'
      : activeCategoryInfo
      ? lang === 'fa'
        ? activeCategoryInfo.nameFa
        : activeCategoryInfo.nameEn
      : lang === 'fa'
      ? 'مجموعه جواهرات'
      : 'Jewellery';

  // Dynamic Document Title, Canonical, Robots, OpenGraph & Schema.org JSON-LD
  useEffect(() => {
    if (isUnknownCategorySlug) {
      applyPageSeo({
        browserTitle: lang === 'fa' ? 'دسته‌بندی یافت نشد | جواهری سعیدنیا' : 'Category Not Found | Saeednia Jewellery',
        metaDescription: 'دسته‌بندی مورد نظر یافت نشد.',
        robots: 'noindex, nofollow',
        canonicalPath: '/categories',
      });
      return;
    }

    const browserTitle = activeCategoryInfo
      ? lang === 'fa'
        ? `${activeCategoryInfo.nameFa} | جواهری سعیدنیا`
        : `${activeCategoryInfo.nameEn} | Saeednia Jewellery`
      : lang === 'fa'
      ? pageData?.browserTitleFa || 'دسته‌بندی جواهرات | جواهری سعیدنیا'
      : pageData?.browserTitleEn || 'Jewellery Categories | Saeednia Jewellery';

    const seoTitle = activeCategoryInfo
      ? lang === 'fa'
        ? activeCategoryInfo.seoTitleFa || activeCategoryInfo.nameFa
        : activeCategoryInfo.seoTitleEn || activeCategoryInfo.nameEn
      : lang === 'fa'
      ? pageData?.seoTitleFa
      : pageData?.seoTitleEn;

    const metaDesc = activeCategoryInfo
      ? lang === 'fa'
        ? activeCategoryInfo.metaDescriptionFa || activeCategoryInfo.descriptionFa
        : activeCategoryInfo.metaDescriptionEn || activeCategoryInfo.descriptionEn
      : lang === 'fa'
      ? pageData?.metaDescriptionFa
      : pageData?.metaDescriptionEn;

    const canonicalPath = activeCategoryInfo
      ? getCategoryPath(activeCategoryInfo)
      : '/categories';

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const collectionSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: activeCategoryInfo
        ? lang === 'fa'
          ? activeCategoryInfo.nameFa
          : activeCategoryInfo.nameEn
        : lang === 'fa'
        ? pageData?.h1Fa || 'دسته‌بندی جواهرات'
        : pageData?.h1En || 'Jewellery Categories',
      description: metaDesc || '',
      url: `${origin}${canonicalPath}`,
    };

    const crumbs = activeCategoryInfo
      ? [
          { name: lang === 'fa' ? 'خانه' : 'Home', path: '/' },
          { name: lang === 'fa' ? 'دسته‌بندی جواهرات' : 'Categories', path: '/categories' },
          {
            name: lang === 'fa' ? activeCategoryInfo.nameFa : activeCategoryInfo.nameEn,
            path: canonicalPath,
          },
        ]
      : [
          { name: lang === 'fa' ? 'خانه' : 'Home', path: '/' },
          { name: lang === 'fa' ? 'دسته‌بندی جواهرات' : 'Categories', path: '/categories' },
        ];

    applyPageSeo({
      browserTitle,
      seoTitle,
      metaDescription: metaDesc,
      canonicalPath,
      robots: 'index, follow',
      ogType: 'website',
      ogImage: activeCategoryInfo?.image || pageData?.featuredImage,
      jsonLd: [collectionSchema, buildBreadcrumbSchema(crumbs)],
    });
  }, [pageData, activeCategoryInfo, lang, isUnknownCategorySlug]);

  const heroH1 =
    lang === 'fa' ? pageData?.h1Fa || 'دسته‌بندی جواهرات' : pageData?.h1En || 'Jewellery Categories';
  const heroSubtitle = lang === 'fa' ? pageData?.subtitleFa : pageData?.subtitleEn;
  const heroDescription = activeCategoryInfo
    ? lang === 'fa'
      ? activeCategoryInfo.descriptionFa
      : activeCategoryInfo.descriptionEn
    : lang === 'fa'
    ? pageData?.descriptionFa || ''
    : pageData?.descriptionEn || '';

  const itemsPerPage = gridConfig?.itemsPerPage || 12;
  const paginationMode = gridConfig?.paginationMode || 'pagination';
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const displayedProducts = useMemo(() => {
    if (paginationMode === 'view_all') return filteredProducts;
    if (paginationMode === 'infinite') return filteredProducts.slice(0, visibleCount);
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, paginationMode, currentPage, itemsPerPage, visibleCount]);

  const gapClass =
    gridConfig?.cardGap === 16 ? 'gap-4' : gridConfig?.cardGap === 32 ? 'gap-8 sm:gap-10' : 'gap-6 sm:gap-8';

  const colsDesktopClass =
    gridConfig?.columnsDesktop === 5
      ? 'xl:grid-cols-5'
      : gridConfig?.columnsDesktop === 4
      ? 'xl:grid-cols-4'
      : gridConfig?.columnsDesktop === 2
      ? 'xl:grid-cols-2'
      : 'xl:grid-cols-3';

  const colsTabletClass =
    gridConfig?.columnsTablet === 3
      ? 'sm:grid-cols-3'
      : gridConfig?.columnsTablet === 1
      ? 'sm:grid-cols-1'
      : 'sm:grid-cols-2';

  const colsMobileClass = gridConfig?.columnsMobile === 2 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div id="page-collection" className="min-h-screen bg-white dark:bg-[#070709] text-[#1F1A16] dark:text-[#EDE8DF] pt-32 sm:pt-40 pb-32">
      {/* Top Editorial Header with Engineered Contrast Capsule (CMS Powered) */}
      <PageEditorialHeader
        eyebrow="Saeedniajewellerygrandbazar"
        title={heroH1}
        subtitle={heroSubtitle}
        description={heroDescription}
      />

      {/* Main Content Layout: Vertical Luxury Editorial Nav + Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Vertical Category Accordion (Responsive Touch-Friendly Vertical Stack) */}
        <div className="lg:hidden mb-8">
          <div className="bg-white dark:bg-[#0B0B0F] border border-[#AC9262]/30 dark:border-[#C5A059]/20 rounded-sm overflow-hidden shadow-lg shadow-[rgba(74,63,53,0.06)] dark:shadow-black/60">
            <button
              id="btn-toggle-mobile-categories"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full px-5 py-4 flex items-center justify-between text-start bg-[#FAF8F5] hover:bg-[#F4EFE6] dark:bg-[#0E0E14] dark:hover:bg-[#12121A] transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-cinzel text-[10px] text-[#906D2D] dark:text-[#C5A059] tracking-[0.2em] uppercase font-semibold">
                  {lang === 'fa' ? 'دسته‌بندی آثار' : 'Collection Category'}
                </span>
                <span className="text-base font-light text-[#1F1A16] dark:text-[#EDE8DF] font-vazir mt-0.5">
                  {activeCategoryTitle}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#906D2D] dark:text-[#C5A059]">
                <span className="text-xs font-mono">({getCategoryCount(selectedCategory)})</span>
                {mobileMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {/* Mobile Vertical Category Stack (Top to Bottom, Generous Spacing) */}
            {mobileMenuOpen && (
              <div className="p-3 border-t border-[#AC9262]/20 dark:border-[#C5A059]/15 flex flex-col space-y-1 bg-white dark:bg-[#09090C] animate-fade-in">
                {/* All Works */}
                <Link
                  id="mobile-cat-all"
                  to="/categories"
                  onClick={() => {
                    setSelectedCategory('all');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full py-3 px-4 rounded-sm flex items-center justify-between text-start transition-all min-h-[48px] ${
                    selectedCategory === 'all'
                      ? 'bg-[#906D2D] dark:bg-[#14141C] text-white dark:text-[#D4AF37] border-s-2 border-[#906D2D] dark:border-[#D4AF37]'
                      : 'text-[#4A3F35] dark:text-[#9E9A92] hover:text-[#1F1A16] dark:hover:text-[#EDE8DF] hover:bg-[#FAF8F5] dark:hover:bg-[#0E0E12]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-base font-light font-vazir">
                      {lang === 'fa' ? 'همه آثار' : 'All Works'}
                    </span>
                    <span className="text-[10px] font-cinzel tracking-widest text-[#6E6153] dark:text-[#6E6A62]">
                      Complete Haute Joaillerie
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#89642F] dark:text-[#8C8880]">
                    {getCategoryCount('all')}
                  </span>
                </Link>

                {/* Dynamic Top-Level Categories & Nested Subcategories */}
                {topLevelCategories.map((cat) => {
                  const subcats = getSubcategories(cat);
                  const hasSubcats = subcats.length > 0;
                  const isExpanded = Boolean(expandedParents[cat.key]);
                  const isParentOrChildSelected =
                    selectedCategory === cat.key || subcats.some((s) => s.key === selectedCategory);
                  const count = getCategoryCount(cat.key);

                  return (
                    <div key={cat.id || cat.key} className="flex flex-col">
                      <Link
                        id={`mobile-cat-${cat.key}`}
                        to={getCategoryPath(cat)}
                        onClick={() => {
                          if (hasSubcats) {
                            setExpandedParents((prev) => ({ ...prev, [cat.key]: !prev[cat.key] }));
                          } else {
                            setMobileMenuOpen(false);
                          }
                          setSelectedCategory(cat.key);
                        }}
                        className={`w-full py-3 px-4 rounded-sm flex items-center justify-between text-start transition-all min-h-[48px] ${
                          isParentOrChildSelected
                            ? 'bg-[#211D18] dark:bg-[#14141C] text-[#F8F3E9] dark:text-[#D4AF37] border-s-2 border-[#B18A4A] dark:border-[#D4AF37]'
                            : 'text-[#62594E] dark:text-[#9E9A92] hover:text-[#25211D] dark:hover:text-[#EDE8DF]'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-base font-light font-vazir">
                            {lang === 'fa' ? cat.nameFa : cat.nameEn}
                          </span>
                          <span className="text-[10px] font-cinzel tracking-widest text-[#6E6A62]">
                            {cat.nameEn}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#8C8880]">{count}</span>
                          {hasSubcats && (
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-[#C5A059] transition-transform duration-300 ${
                                isExpanded ? 'rotate-180 text-[#D4AF37]' : 'rotate-0'
                              }`}
                            />
                          )}
                        </div>
                      </Link>

                      {hasSubcats && isExpanded && (
                        <div className="pe-2 ps-4 py-1.5 ms-3 border-s border-[#C5A059]/30 flex flex-col space-y-1 animate-fade-in">
                          {subcats.map((sub) => (
                            <Link
                              key={sub.id || sub.key}
                              id={`mobile-cat-${sub.key}`}
                              to={getCategoryPath(sub)}
                              onClick={() => {
                                setSelectedCategory(sub.key);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full py-2.5 px-3 rounded-sm flex items-center justify-between text-start transition-all min-h-[44px] ${
                                selectedCategory === sub.key
                                  ? 'bg-[#211D18] dark:bg-[#181824] text-[#F8F3E9] dark:text-[#D4AF37] font-normal'
                                  : 'text-[#62594E] dark:text-[#8C8880] hover:text-[#25211D] dark:hover:text-[#EDE8DF]'
                              }`}
                            >
                              <span className="text-sm font-light font-vazir">
                                {lang === 'fa' ? sub.nameFa : sub.nameEn}
                              </span>
                              <span className="text-xs font-mono text-[#89642F] dark:text-[#8C8880]">
                                {getCategoryCount(sub.key)}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 12-Column Grid for Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* DESKTOP VERTICAL LUXURY EDITORIAL CATEGORY NAVIGATION */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-36">
            <div className="bg-white dark:bg-[#09090C] border border-[#AC9262]/30 dark:border-[#C5A059]/15 rounded-sm p-6 xl:p-8 shadow-[0_4px_24px_rgba(31,26,22,0.05)] dark:shadow-2xl relative overflow-hidden transition-colors">
              {/* Top subtle 3D metallic specular line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#AC9262]/50 dark:via-[#D4AF37]/50 to-transparent pointer-events-none" />

              {/* Editorial Section Label */}
              <div className="mb-6 pb-4 border-b border-[#AC9262]/20 dark:border-[#C5A059]/10">
                <span className="font-cinzel text-[11px] tracking-[0.25em] text-[#906D2D] dark:text-[#C5A059] uppercase font-bold block">
                  {lang === 'fa' ? 'دسته‌بندی آثار' : 'Collections'}
                </span>
                <span className="text-[11px] text-[#6E6153] dark:text-[#7C7870] font-light mt-1 block">
                  {lang === 'fa' ? 'شعبه بازار بزرگ تهران' : 'Grand Bazaar Tehran'}
                </span>
              </div>

              {/* Vertical Category Stack: Top to Bottom with Generous Spacing */}
              <nav aria-label="Collection Categories" className="flex flex-col space-y-2">
                {/* 0. All Works Item */}
                <Link
                  id="cat-vertical-all"
                  to="/categories"
                  onClick={() => setSelectedCategory('all')}
                  className={`group relative w-full py-3.5 px-4 text-start transition-all duration-300 rounded-sm flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-[#906D2D] dark:bg-[#121218] text-white dark:text-[#EDE8DF]'
                      : 'text-[#4A3F35] dark:text-[#8C8880] hover:text-[#1F1A16] dark:hover:text-[#EDE8DF] hover:bg-[#FAF8F5] dark:hover:bg-[#0E0E12]'
                  }`}
                >
                  {selectedCategory === 'all' && (
                    <span className="absolute start-0 inset-y-2 w-[2.5px] bg-gradient-to-b from-[#906D2D] to-[#AC9262] dark:from-[#D4AF37] dark:to-[#C5A059] rounded-full shadow-[0_0_8px_rgba(144,109,45,0.6)]" />
                  )}

                  <div className="flex flex-col">
                    <span
                      className={`text-base xl:text-lg font-light tracking-wide font-vazir transition-colors duration-300 ${
                        selectedCategory === 'all'
                          ? 'text-white dark:text-[#EDE8DF] font-medium'
                          : 'text-[#4A3F35] dark:text-[#8C8880] group-hover:text-[#1F1A16] dark:group-hover:text-[#EDE8DF]'
                      }`}
                    >
                      {lang === 'fa' ? 'همه آثار' : 'All Works'}
                    </span>
                    <span
                      className={`text-[10px] font-cinzel tracking-[0.16em] uppercase transition-colors duration-300 mt-0.5 ${
                        selectedCategory === 'all'
                          ? 'text-white/90 dark:text-[#D4AF37]'
                          : 'text-[#6E6153] dark:text-[#5C5852] group-hover:text-[#1F1A16] dark:group-hover:text-[#8C8880]'
                      }`}
                    >
                      Complete Atelier
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono transition-colors ${
                      selectedCategory === 'all'
                        ? 'text-white dark:text-[#D4AF37]'
                        : 'text-[#6E6153] dark:text-[#5C5852] group-hover:text-[#1F1A16] dark:group-hover:text-[#8C8880]'
                    }`}
                  >
                    {getCategoryCount('all')}
                  </span>
                </Link>

                {/* Dynamic Top-Level & Subcategory Items */}
                {topLevelCategories.map((cat) => {
                  const subcats = getSubcategories(cat);
                  const hasSubcats = subcats.length > 0;
                  const isExpanded = Boolean(expandedParents[cat.key]);
                  const isSelected = selectedCategory === cat.key;
                  const isParentOrChildSelected =
                    isSelected || subcats.some((s) => s.key === selectedCategory);
                  const count = getCategoryCount(cat.key);

                  return (
                    <div key={cat.id || cat.key} className="flex flex-col">
                      <Link
                        id={`cat-vertical-${cat.key}`}
                        to={getCategoryPath(cat)}
                        onClick={() => {
                          if (hasSubcats) {
                            setExpandedParents((prev) => ({ ...prev, [cat.key]: !prev[cat.key] }));
                          }
                          setSelectedCategory(cat.key);
                        }}
                        className={`group relative w-full py-3.5 px-4 text-start transition-all duration-300 rounded-sm flex items-center justify-between ${
                          isParentOrChildSelected
                            ? 'bg-[#211D18] dark:bg-[#121218] text-[#F8F3E9] dark:text-[#EDE8DF]'
                            : 'text-[#62594E] dark:text-[#8C8880] hover:text-[#25211D] dark:hover:text-[#EDE8DF] hover:bg-[#FAF7F2] dark:hover:bg-[#0E0E12]'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute start-0 inset-y-2 w-[2.5px] bg-gradient-to-b from-[#B18A4A] to-[#89642F] dark:from-[#D4AF37] dark:to-[#C5A059] rounded-full shadow-[0_0_8px_rgba(177,138,74,0.6)]" />
                        )}

                        <div className="flex flex-col">
                          <span
                            className={`text-base xl:text-lg font-light tracking-wide font-vazir transition-colors duration-300 ${
                              isParentOrChildSelected
                                ? 'text-[#F8F3E9] dark:text-[#EDE8DF] font-normal'
                                : 'text-[#62594E] dark:text-[#8C8880] group-hover:text-[#25211D] dark:group-hover:text-[#EDE8DF]'
                            }`}
                          >
                            {lang === 'fa' ? cat.nameFa : cat.nameEn}
                          </span>
                          <span
                            className={`text-[10px] font-cinzel tracking-[0.16em] uppercase transition-colors duration-300 mt-0.5 ${
                              isParentOrChildSelected
                                ? 'text-[#B18A4A] dark:text-[#D4AF37]'
                                : 'text-[#847A6E] dark:text-[#5C5852] group-hover:text-[#25211D] dark:group-hover:text-[#8C8880]'
                            }`}
                          >
                            {cat.nameEn}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-mono transition-colors ${
                              isSelected
                                ? 'text-[#B18A4A] dark:text-[#D4AF37]'
                                : 'text-[#847A6E] dark:text-[#5C5852] group-hover:text-[#25211D] dark:group-hover:text-[#8C8880]'
                            }`}
                          >
                            {count}
                          </span>
                          {hasSubcats && (
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-[#C5A059] transition-transform duration-300 ${
                                isExpanded ? 'rotate-180 text-[#D4AF37]' : 'rotate-0'
                              }`}
                            />
                          )}
                        </div>
                      </Link>

                      {hasSubcats && isExpanded && (
                        <div
                          id={`cat-vertical-${cat.key}-sub`}
                          className="pe-2 ps-4 py-1.5 my-1 ms-4 border-s border-[#C5A059]/30 flex flex-col space-y-1 animate-fade-in"
                        >
                          {subcats.map((sub) => (
                            <Link
                              key={sub.id || sub.key}
                              id={`cat-vertical-${sub.key}`}
                              to={getCategoryPath(sub)}
                              onClick={() => setSelectedCategory(sub.key)}
                              className={`group relative w-full py-2.5 px-3 text-start transition-all duration-300 rounded-sm flex items-center justify-between ${
                                selectedCategory === sub.key
                                  ? 'bg-[#211D18] dark:bg-[#161622] text-[#F8F3E9] dark:text-[#D4AF37]'
                                  : 'text-[#62594E] dark:text-[#8C8880] hover:text-[#25211D] dark:hover:text-[#EDE8DF] hover:bg-[#FAF7F2] dark:hover:bg-[#0E0E12]'
                              }`}
                            >
                              {selectedCategory === sub.key && (
                                <span className="absolute start-0 inset-y-1.5 w-[2px] bg-[#B18A4A] dark:bg-[#D4AF37] rounded-full shadow-[0_0_6px_rgba(177,138,74,0.6)]" />
                              )}
                              <span className="text-sm font-light font-vazir tracking-wide">
                                {lang === 'fa' ? sub.nameFa : sub.nameEn}
                              </span>
                              <span
                                className={`text-xs font-mono ${
                                  selectedCategory === sub.key
                                    ? 'text-[#B18A4A] dark:text-[#D4AF37]'
                                    : 'text-[#847A6E] dark:text-[#6C6860]'
                                }`}
                              >
                                {getCategoryCount(sub.key)}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Refined Divider */}
              <div className="w-full h-[1px] bg-gradient-to-r from-[#AC9262]/30 via-[#AC9262]/10 to-transparent dark:from-[#C5A059]/30 dark:via-[#C5A059]/10 dark:to-transparent my-6" />

              {/* Minimal Search & Filter Reset */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#6E6153] dark:text-[#8C8880] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-collection-search-desktop"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'fa' ? 'جستجوی نام اثر...' : 'Search masterworks...'}
                    className="w-full ps-8 pe-7 py-2 text-xs bg-white dark:bg-[#060608] border border-[#AC9262]/30 dark:border-[#C5A059]/20 focus:border-[#906D2D] dark:focus:border-[#D4AF37] text-[#1F1A16] dark:text-[#EDE8DF] placeholder-[#6E6153] dark:placeholder-[#64605A] rounded-sm focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute end-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6E6153] dark:text-[#8C8880] hover:text-[#1F1A16] dark:hover:text-[#EDE8DF]"
                    >
                      ×
                    </button>
                  )}
                </div>

                {(selectedCategory !== 'all' || searchQuery) && (
                  <Link
                    to="/categories"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="w-full py-2 px-3 text-[11px] text-[#906D2D] dark:text-[#C5A059] hover:text-[#7D5E26] dark:hover:text-[#D4AF37] border border-[#AC9262]/30 dark:border-[#C5A059]/25 hover:border-[#906D2D] dark:hover:border-[#D4AF37] rounded-sm transition-colors flex items-center justify-center gap-1.5 bg-white dark:bg-[#060608]"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{lang === 'fa' ? 'مشاهده تمام آثار' : 'Reset to All Works'}</span>
                  </Link>
                )}
              </div>
            </div>
          </aside>

          {/* PRODUCT GALLERY SHOWCASE COLUMN (8 / 9 Cols) */}
          <section aria-label={activeCategoryTitle} className="lg:col-span-8 xl:col-span-9">
            {/* Gallery Control & Header Bar */}
            <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-[#AC9262]/20 dark:border-[#C5A059]/15">
              <div>
                <h2 className="text-xl sm:text-2xl font-light text-[#1F1A16] dark:text-[#EDE8DF] font-vazir">
                  {activeCategoryTitle}
                </h2>
                <span className="text-xs text-[#6E6153] dark:text-[#8C8880] font-light mt-0.5 block">
                  {lang === 'fa'
                    ? `${filteredProducts.length} اثر نفیس آماده نمایش`
                    : `${filteredProducts.length} creations available`}
                </span>
              </div>
            </div>

            {/* Products Grid */}
            {displayedProducts.length > 0 ? (
              <>
                <div className={`grid ${gapClass} ${colsMobileClass} ${colsTabletClass} ${colsDesktopClass}`}>
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      imageAspect={gridConfig?.imageAspectRatio || 'portrait'}
                      showProductName={gridConfig?.showProductName !== false}
                      showProductCode={Boolean(gridConfig?.showProductCode)}
                      showShortDescription={Boolean(gridConfig?.showShortDescription)}
                    />
                  ))}
                </div>

                {/* Pagination or Load More Controls */}
                {paginationMode === 'pagination' && totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 260, behavior: 'smooth' });
                          }}
                          className={`w-9 h-9 rounded-sm text-xs font-mono transition-all border ${
                            isActive
                              ? 'bg-[#906D2D] dark:bg-[#C5A059] text-white dark:text-[#0A0A0B] border-[#906D2D] dark:border-[#D4AF37] font-bold shadow'
                              : 'bg-white dark:bg-[#0D0D10] text-[#4A3F35] dark:text-[#C8C4BC] border-[#AC9262]/30 dark:border-[#C5A059]/20 hover:border-[#906D2D] dark:hover:border-[#C5A059]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                )}

                {paginationMode === 'infinite' && visibleCount < filteredProducts.length && (
                  <div className="mt-12 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + itemsPerPage)}
                      className="px-7 py-2.5 bg-white dark:bg-[#0D0D10] border border-[#AC9262]/40 dark:border-[#C5A059]/30 hover:border-[#906D2D] dark:hover:border-[#D4AF37] text-[#1F1A16] dark:text-[#EDE8DF] text-xs font-persian-nav rounded-sm transition-colors shadow-sm"
                    >
                      {lang === 'fa' ? 'مشاهده آثار بیشتر' : 'Load More Creations'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="py-20 text-center bg-white dark:bg-[#09090C] border border-[#AC9262]/30 dark:border-[#C5A059]/15 rounded-sm p-8 max-w-lg mx-auto shadow-md">
                <Filter className="w-8 h-8 text-[#906D2D] dark:text-[#C5A059] mx-auto mb-3 opacity-80" />
                <h3 className="text-lg font-light text-[#1F1A16] dark:text-[#EDE8DF] mb-2 font-vazir">
                  {lang === 'fa' ? 'اثری با معیارهای انتخابی یافت نشد' : 'No jewellery found matching criteria'}
                </h3>
                <p className="text-xs text-[#4A3F35] dark:text-[#8C8880] max-w-md mx-auto mb-6 leading-relaxed">
                  {lang === 'fa'
                    ? 'می‌توانید فیلترها را بازنشانی فرمایید یا جهت سفارش ساخت اختصاصی با ما تماس بگیرید.'
                    : 'Try resetting your filter or contact our atelier directly.'}
                </p>
                <Link
                  to="/categories"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="inline-block px-6 py-2.5 bg-[#906D2D] hover:bg-[#7D5E26] dark:bg-[#C5A059] dark:hover:bg-[#D4AF37] text-white dark:text-[#0A0A0D] text-xs font-medium rounded-sm tracking-wide transition-colors"
                >
                  {lang === 'fa' ? 'مشاهده تمام مجموعه' : 'View All Works'}
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
