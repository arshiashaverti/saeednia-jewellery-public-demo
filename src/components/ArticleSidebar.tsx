import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ExternalLink, MapPin, Phone, Sparkles } from 'lucide-react';
import type {
  Article,
  ArticleSidebarModule,
  CategoryInfo,
  Product,
  SiteSettings,
} from '../types';
import {
  formatTelHref,
  resolveActiveSocialLinks,
  resolvePhoneItemsFromContact,
  SOCIAL_PLATFORM_CATALOG,
} from '../utils/contactAndArticles';
import { SocialPlatformIcon } from './SocialPlatformIcon';

interface ArticleSidebarProps {
  modules: ArticleSidebarModule[];
  lang: 'fa' | 'en';
  products: Product[];
  categories: CategoryInfo[];
  articles: Article[];
  settings: SiteSettings | null;
  previewMode?: boolean;
}

function isSafeLinkTarget(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//') && !trimmed.includes('\\');
  }
  return /^https:\/\//i.test(trimmed);
}

export const ArticleSidebar: React.FC<ArticleSidebarProps> = ({
  modules,
  lang,
  products,
  categories,
  articles,
  settings,
  previewMode = false,
}) => {
  const activeModules = [...(modules || [])]
    .filter((m) => m && m.isActive !== false)
    .sort((a, b) => (a.displayOrder ?? 1) - (b.displayOrder ?? 1));

  if (activeModules.length === 0) return null;

  const BackIcon = lang === 'fa' ? ArrowLeft : ArrowRight;

  const renderModuleActionLink = (
    href: string | undefined,
    label: string,
    openInNewTab?: boolean
  ) => {
    if (!href || !isSafeLinkTarget(href)) return null;
    const isExternal = /^https:\/\//i.test(href);
    if (previewMode) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-persian-nav text-[#906D2D] dark:text-[#D4AF37] mt-2">
          <span>{label}</span>
          {isExternal ? <ExternalLink className="w-3 h-3" /> : <BackIcon className="w-3 h-3" />}
        </span>
      );
    }
    if (isExternal) {
      return (
        <a
          href={href}
          target={openInNewTab !== false ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-persian-nav text-[#906D2D] hover:text-[#1F1A16] dark:text-[#D4AF37] dark:hover:text-[#EDE8DF] transition-colors mt-2"
        >
          <span>{label}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    return (
      <Link
        to={href}
        className="inline-flex items-center gap-1.5 text-[11px] font-persian-nav text-[#906D2D] hover:text-[#1F1A16] dark:text-[#D4AF37] dark:hover:text-[#EDE8DF] transition-colors mt-2"
      >
        <span>{label}</span>
        <BackIcon className="w-3 h-3" />
      </Link>
    );
  };

  const renderedItems = activeModules
    .map((mod) => {
      const styleClass =
        mod.displayStyle === 'highlight'
          ? 'border-[#C5A059]/45 bg-[#FAF7F0] dark:bg-[#111015]'
          : mod.displayStyle === 'compact'
          ? 'border-[#AC9262]/20 dark:border-[#C5A059]/15 bg-white/80 dark:bg-[#0B0B0F] p-4'
          : 'border-[#AC9262]/25 dark:border-[#C5A059]/20 bg-white dark:bg-[#0D0D12] p-5';

      // 1. Featured Product
      if (mod.moduleType === 'featured_product') {
        const product = products.find(
          (p) => !p.isDeleted && p.visibility !== false && p.status !== 'draft' && p.id === mod.referencedEntityId
        );
        if (!product) return null;
        const prodTitle = lang === 'fa' ? product.titleFa : product.titleEn || product.titleFa;
        const imgSrc = mod.imageUrl || product.mainImage;
        const targetHref =
          mod.destinationUrl && isSafeLinkTarget(mod.destinationUrl)
            ? mod.destinationUrl
            : `/products/${encodeURIComponent(product.slug || product.id)}`;

        return (
          <section
            key={mod.id}
            className={`rounded-sm border transition-colors hover:border-[#906D2D] dark:hover:border-[#C5A059]/50 ${styleClass}`}
          >
            <span className="text-[10px] font-persian-nav uppercase tracking-wider text-[#906D2D] dark:text-[#C5A059] block mb-2">
              {mod.title}
            </span>
            {imgSrc && (
              <div className="aspect-[4/3] w-full rounded-sm overflow-hidden border border-[#AC9262]/20 dark:border-[#C5A059]/15 mb-3 bg-[#09090C]">
                <img src={imgSrc} alt={prodTitle} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <h3 className="text-sm font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] leading-snug">
              {prodTitle}
            </h3>
            {product.productCode && (
              <span className="text-[11px] font-mono text-[#6E6153] dark:text-[#8C8880] block mt-0.5" dir="ltr">
                {product.productCode}
              </span>
            )}
            {mod.description && (
              <p className="text-xs font-persian-body text-[#4A3F35] dark:text-[#A8A49C] mt-2 leading-relaxed">
                {mod.description}
              </p>
            )}
            {renderModuleActionLink(
              targetHref,
              lang === 'fa' ? 'مشاهده اثر' : 'View Creation',
              mod.openInNewTab
            )}
          </section>
        );
      }

      // 2. Featured Category
      if (mod.moduleType === 'featured_category') {
        const category = categories.find(
          (c) => !c.isDeleted && c.enabled !== false && (c.id === mod.referencedEntityId || c.key === mod.referencedEntityId)
        );
        if (!category) return null;
        const catName = lang === 'fa' ? category.nameFa : category.nameEn || category.nameFa;
        const imgSrc = mod.imageUrl || category.image;
        const targetHref =
          mod.destinationUrl && isSafeLinkTarget(mod.destinationUrl)
            ? mod.destinationUrl
            : `/categories/${encodeURIComponent(category.slug || category.key)}`;

        return (
          <section
            key={mod.id}
            className={`rounded-sm border transition-colors hover:border-[#906D2D] dark:hover:border-[#C5A059]/50 ${styleClass}`}
          >
            <span className="text-[10px] font-persian-nav uppercase tracking-wider text-[#906D2D] dark:text-[#C5A059] block mb-2">
              {mod.title}
            </span>
            {imgSrc && (
              <div className="aspect-[16/9] w-full rounded-sm overflow-hidden border border-[#AC9262]/20 dark:border-[#C5A059]/15 mb-3 bg-[#09090C]">
                <img src={imgSrc} alt={catName} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <h3 className="text-sm font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF]">{catName}</h3>
            {(mod.description || category.descriptionFa) && (
              <p className="text-xs font-persian-body text-[#4A3F35] dark:text-[#A8A49C] mt-1.5 leading-relaxed line-clamp-3">
                {mod.description || (lang === 'fa' ? category.descriptionFa : category.descriptionEn)}
              </p>
            )}
            {renderModuleActionLink(
              targetHref,
              lang === 'fa' ? 'مشاهده مجموعه' : 'Explore Collection',
              mod.openInNewTab
            )}
          </section>
        );
      }

      // 3. Selected Article
      if (mod.moduleType === 'selected_article') {
        const linkedArticle = articles.find(
          (a) => !a.isDeleted && a.published !== false && a.id === mod.referencedEntityId
        );
        if (!linkedArticle) return null;
        const artTitle = lang === 'fa' ? linkedArticle.titleFa : linkedArticle.titleEn || linkedArticle.titleFa;
        const imgSrc = mod.imageUrl || linkedArticle.coverImage;
        const targetHref =
          mod.destinationUrl && isSafeLinkTarget(mod.destinationUrl)
            ? mod.destinationUrl
            : `/blog/${encodeURIComponent(linkedArticle.slug)}`;

        return (
          <section
            key={mod.id}
            className={`rounded-sm border transition-colors hover:border-[#906D2D] dark:hover:border-[#C5A059]/50 ${styleClass}`}
          >
            <span className="text-[10px] font-persian-nav uppercase tracking-wider text-[#906D2D] dark:text-[#C5A059] block mb-2">
              {mod.title}
            </span>
            {imgSrc && (
              <div className="aspect-[16/9] w-full rounded-sm overflow-hidden border border-[#AC9262]/20 dark:border-[#C5A059]/15 mb-3 bg-[#09090C]">
                <img src={imgSrc} alt={artTitle} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <h3 className="text-sm font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] leading-snug">
              {artTitle}
            </h3>
            {(mod.description || linkedArticle.excerptFa) && (
              <p className="text-xs font-persian-body text-[#4A3F35] dark:text-[#A8A49C] mt-1.5 leading-relaxed line-clamp-3">
                {mod.description || (lang === 'fa' ? linkedArticle.excerptFa : linkedArticle.excerptEn)}
              </p>
            )}
            {renderModuleActionLink(
              targetHref,
              lang === 'fa' ? 'مطالعه مقاله' : 'Read Article',
              mod.openInNewTab
            )}
          </section>
        );
      }

      // 4. Promotional Banner
      if (mod.moduleType === 'promo_banner') {
        return (
          <section
            key={mod.id}
            className={`rounded-sm border border-[#C5A059]/35 bg-[#FAF7F0] dark:bg-gradient-to-b dark:from-[#141210] dark:to-[#0A0A0D] p-5 space-y-2.5`}
          >
            {mod.imageUrl && (
              <div className="aspect-[16/10] w-full rounded-sm overflow-hidden border border-[#C5A059]/20 mb-2 bg-[#09090C]">
                <img src={mod.imageUrl} alt={mod.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[#906D2D] dark:text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <h3 className="text-sm font-persian-heading font-medium text-[#1F1A16] dark:text-[#EDE8DF]">
                {mod.title}
              </h3>
            </div>
            {mod.description && (
              <p className="text-xs font-persian-body text-[#4A3F35] dark:text-[#C8C4BC] leading-relaxed">
                {mod.description}
              </p>
            )}
            {renderModuleActionLink(
              mod.destinationUrl,
              lang === 'fa' ? 'مشاهده جزئیات' : 'Discover More',
              mod.openInNewTab
            )}
          </section>
        );
      }

      // 5. Dynamic Social Media Links
      if (mod.moduleType === 'social_links') {
        const socials = resolveActiveSocialLinks(settings?.contact);
        if (socials.length === 0) return null;
        return (
          <section key={mod.id} className={`rounded-sm border ${styleClass} space-y-3`}>
            <h3 className="text-xs font-persian-heading font-semibold text-[#906D2D] dark:text-[#D4AF37]">
              {mod.title}
            </h3>
            {mod.description && (
              <p className="text-xs font-persian-body text-[#4A3F35] dark:text-[#A8A49C] leading-relaxed">
                {mod.description}
              </p>
            )}
            <div className="space-y-2">
              {socials.map((s) => {
                const label = lang === 'fa' ? s.displayNameFa : s.displayNameEn || s.displayNameFa;
                const platLabel = SOCIAL_PLATFORM_CATALOG[s.platform]?.labelFa || s.platform;
                return previewMode ? (
                  <div
                    key={s.id}
                    className="flex items-center gap-2.5 p-2 rounded-sm border border-[#AC9262]/20 dark:border-[#C5A059]/15"
                  >
                    <SocialPlatformIcon
                      platform={s.platform}
                      customIconKey={s.customIconKey}
                      className="w-4 h-4 text-[#906D2D] dark:text-[#C5A059]"
                    />
                    <span className="text-xs text-[#1F1A16] dark:text-[#EDE8DF] truncate">{label}</span>
                  </div>
                ) : (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${platLabel} — ${label}`}
                    className="flex items-center justify-between gap-2.5 p-2.5 rounded-sm border border-[#AC9262]/20 dark:border-[#C5A059]/15 hover:border-[#906D2D] dark:hover:border-[#C5A059]/50 transition-colors"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <SocialPlatformIcon
                        platform={s.platform}
                        customIconKey={s.customIconKey}
                        className="w-4 h-4 text-[#906D2D] dark:text-[#C5A059] shrink-0"
                      />
                      <span className="text-xs font-persian-nav text-[#1F1A16] dark:text-[#EDE8DF] truncate">
                        {label}
                      </span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#8C8880] shrink-0" />
                  </a>
                );
              })}
            </div>
          </section>
        );
      }

      // 6. Custom Internal / Safe Navigation Link
      if (mod.moduleType === 'custom_internal_link') {
        return (
          <section
            key={mod.id}
            className={`rounded-sm border transition-colors hover:border-[#906D2D] dark:hover:border-[#C5A059]/50 ${styleClass}`}
          >
            {mod.imageUrl && (
              <div className="aspect-[16/9] w-full rounded-sm overflow-hidden border border-[#AC9262]/20 dark:border-[#C5A059]/15 mb-3 bg-[#09090C]">
                <img src={mod.imageUrl} alt={mod.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <h3 className="text-sm font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF]">{mod.title}</h3>
            {mod.description && (
              <p className="text-xs font-persian-body text-[#4A3F35] dark:text-[#A8A49C] mt-1.5 leading-relaxed">
                {mod.description}
              </p>
            )}
            {renderModuleActionLink(
              mod.destinationUrl,
              lang === 'fa' ? 'مشاهده مسیر' : 'Open Link',
              mod.openInNewTab
            )}
          </section>
        );
      }

      // 7. Image + Caption
      if (mod.moduleType === 'image_caption') {
        return (
          <section key={mod.id} className={`rounded-sm border ${styleClass}`}>
            <figure className="space-y-2.5">
              {mod.imageUrl && (
                <div className="aspect-[4/3] w-full rounded-sm overflow-hidden border border-[#AC9262]/20 dark:border-[#C5A059]/15 bg-[#09090C]">
                  <img src={mod.imageUrl} alt={mod.caption || mod.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <figcaption className="space-y-1">
                <h3 className="text-xs font-persian-heading font-medium text-[#1F1A16] dark:text-[#EDE8DF]">
                  {mod.title}
                </h3>
                {(mod.caption || mod.description) && (
                  <p className="text-[11px] font-persian-body text-[#6E6153] dark:text-[#A8A49C] leading-relaxed">
                    {mod.caption || mod.description}
                  </p>
                )}
              </figcaption>
            </figure>
            {renderModuleActionLink(
              mod.destinationUrl,
              lang === 'fa' ? 'مشاهده مرتبط' : 'View Related',
              mod.openInNewTab
            )}
          </section>
        );
      }

      // 8. Contact Info Module
      if (mod.moduleType === 'contact_info') {
        const activePhones = resolvePhoneItemsFromContact(settings?.contact).filter((p) => p.enabled !== false);
        const addr = lang === 'fa' ? settings?.contact?.addressFa : settings?.contact?.addressEn || settings?.contact?.addressFa;

        return (
          <section key={mod.id} className={`rounded-sm border ${styleClass} space-y-3`}>
            <h3 className="text-xs font-persian-heading font-semibold text-[#906D2D] dark:text-[#D4AF37]">
              {mod.title}
            </h3>
            {mod.description && (
              <p className="text-xs font-persian-body text-[#4A3F35] dark:text-[#A8A49C] leading-relaxed">
                {mod.description}
              </p>
            )}
            {activePhones.length > 0 && (
              <div className="space-y-1.5">
                {activePhones.map((p) => {
                  const href = formatTelHref(p.number);
                  return (
                    <a
                      key={p.id}
                      href={href || undefined}
                      onClick={previewMode ? (e) => e.preventDefault() : undefined}
                      className="flex items-center justify-between gap-2 p-2 rounded-sm bg-[#FAF9F6] dark:bg-[#14141B] border border-[#AC9262]/20 dark:border-[#C5A059]/15 text-xs hover:border-[#906D2D] dark:hover:border-[#C5A059]/45 transition-colors"
                    >
                      <span className="flex items-center gap-1.5 text-[#6E6153] dark:text-[#A8A49C] text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#C5A059]" />
                        <span>{p.displayLabelFa || (p.type === 'mobile' ? 'همراه' : 'تلفن')}</span>
                      </span>
                      <span className="font-mono text-[#1F1A16] dark:text-[#EDE8DF]" dir="ltr">
                        {p.number}
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
            {addr && (
              <p className="text-[11px] font-persian-body text-[#6E6153] dark:text-[#8C8880] flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#C5A059] shrink-0 mt-0.5" />
                <span>{addr}</span>
              </p>
            )}
            {renderModuleActionLink('/contact', lang === 'fa' ? 'صفحه تماس با ما' : 'Contact Page', false)}
          </section>
        );
      }

      return null;
    })
    .filter(Boolean);

  if (renderedItems.length === 0) return null;

  return <div className="space-y-5">{renderedItems}</div>;
};
