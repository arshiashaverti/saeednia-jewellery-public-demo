import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Phone,
  MapPin,
  Navigation,
  LocateFixed,
  ExternalLink,
  Compass,
  X,
  Layers,
  Copy,
  Check,
  Clock,
  ArrowUpLeft,
  ArrowUpRight,
  Mail,
} from 'lucide-react';
import { PageEditorialHeader } from '../components/PageEditorialHeader';
import { SocialPlatformIcon } from '../components/SocialPlatformIcon';
import { getBalancedGridLayout } from '../components/ContactChannelsSection';
import { applyPageSeo, buildBreadcrumbSchema } from '../utils/seo';
import { resolveRenderableMapData } from '../utils/maps';
import {
  SOCIAL_PLATFORM_CATALOG,
  formatTelHref,
  isValidEmailAddress,
  resolveActivePhoneNumbers,
  resolveActiveSocialLinks,
  resolvePhoneItemsFromContact,
} from '../utils/contactAndArticles';
import type { PhoneContactType } from '../types';

export const ContactPage: React.FC = () => {
  const { lang, settings, pages, showToast } = useApp();
  const pageData = (pages || []).find((p) => p.id === 'contact');
  const contact = settings?.contact;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const navCloseBtnRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isNavModalOpen) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const rafId = window.requestAnimationFrame(() => navCloseBtnRef.current?.focus());
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsNavModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      if (prevFocusRef.current?.isConnected) {
        prevFocusRef.current.focus();
      }
    };
  }, [isNavModalOpen]);

  const phoneItems = resolvePhoneItemsFromContact(contact).filter(
    (item) => item.enabled !== false && Boolean(item.number.trim())
  );
  const activeSocialLinks = resolveActiveSocialLinks(contact);

  const address = lang === 'fa' ? contact?.addressFa : (contact?.addressEn || contact?.addressFa);
  const openingHours = lang === 'fa' ? contact?.openingHoursFa : (contact?.openingHoursEn || contact?.openingHoursFa);
  const validEmail = isValidEmailAddress(contact?.email) ? contact!.email!.trim() : '';

  const envMapsKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const mapData = resolveRenderableMapData(contact, lang, envMapsKey);

  // Verified coordinates (prefer coordinates extracted from active map URL, then stored coordinates, then Grand Bazaar default)
  const displayLat = mapData.lat ?? contact?.coordinates?.lat ?? 35.6744;
  const displayLng = mapData.lng ?? contact?.coordinates?.lng ?? 51.4216;

  // Dynamic Navigation URLs with verified coordinates
  const navProviders = [
    {
      id: 'google_maps',
      nameFa: 'گوگل مپس (Google Maps)',
      nameEn: 'Google Maps',
      icon: MapPin,
      url: contact?.googleMapsUrl?.trim() || `https://www.google.com/maps/dir/?api=1&destination=${displayLat},${displayLng}`,
    },
    {
      id: 'waze',
      nameFa: 'ویز (Waze)',
      nameEn: 'Waze',
      icon: Navigation,
      url: contact?.wazeUrl?.trim() || `https://waze.com/ul?ll=${displayLat},${displayLng}&navigate=yes`,
    },
    {
      id: 'apple_maps',
      nameFa: 'اپل مپس (Apple Maps)',
      nameEn: 'Apple Maps',
      icon: Compass,
      url: contact?.appleMapsUrl?.trim() || `https://maps.apple.com/?daddr=${displayLat},${displayLng}`,
    },
    {
      id: 'openstreetmap',
      nameFa: 'اوپن‌استریت‌مپ (OpenStreetMap)',
      nameEn: 'OpenStreetMap',
      icon: Layers,
      url: contact?.openStreetMapUrl?.trim() || `https://www.openstreetmap.org/directions?to=${displayLat}%2C${displayLng}`,
    },
    {
      id: 'neshan',
      nameFa: 'نشان (Neshan)',
      nameEn: 'Neshan',
      icon: LocateFixed,
      url: contact?.neshanUrl?.trim() || `https://neshan.org/maps/@${displayLat},${displayLng},17z`,
    },
  ];

  const enabledProviders =
    contact?.enabledNavigationProviders && contact.enabledNavigationProviders.length > 0
      ? navProviders.filter((p) => contact.enabledNavigationProviders!.includes(p.id as any))
      : navProviders;

  const phoneGrid = getBalancedGridLayout(phoneItems.length);
  const socialGrid = getBalancedGridLayout(activeSocialLinks.length);

  useEffect(() => {
    setMapLoadFailed(false);
  }, [mapData.embedUrl]);

  const contactSentence =
    lang === 'fa'
      ? contact?.contactTextFa || 'برای ارتباط مستقیم با گالری جواهری سعیدنیا، از طریق شماره‌های تماس و کانال‌های رسمی زیر با ما در ارتباط باشید.'
      : contact?.contactTextEn || 'Connect directly with Saeednia Jewellery via our official phone lines and social channels.';

  // Dynamic document title, canonical URL & ContactPage JSON-LD
  useEffect(() => {
    const browserTitle =
      lang === 'fa'
        ? pageData?.browserTitleFa || 'تماس با ما | جواهری سعیدنیا'
        : pageData?.browserTitleEn || 'Contact Us | Saeednia Jewellery';
    const seoTitle =
      lang === 'fa'
        ? pageData?.seoTitleFa || pageData?.h1Fa || 'تماس با ما'
        : pageData?.seoTitleEn || pageData?.h1En || 'Contact Us';
    const metaDesc =
      lang === 'fa'
        ? pageData?.metaDescriptionFa || contact?.contactTextFa || ''
        : pageData?.metaDescriptionEn || contact?.contactTextEn || '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const activePhones = resolveActivePhoneNumbers(contact);
    const sameAsUrls = resolveActiveSocialLinks(contact)
      .map((s) => s.url)
      .filter((u) => /^https:\/\//i.test(u));

    applyPageSeo({
      browserTitle,
      seoTitle,
      metaDescription: metaDesc,
      canonicalPath: '/contact',
      robots: 'index, follow',
      ogType: 'website',
      ogImage: pageData?.featuredImage,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: seoTitle,
          description: metaDesc,
          url: `${origin}/contact`,
          mainEntity: {
            '@type': 'JewelryStore',
            name: settings?.brandNameFa || 'جواهری سعیدنیا',
            ...(activePhones.length > 0 ? { telephone: activePhones } : {}),
            ...(validEmail ? { email: validEmail } : {}),
            ...(sameAsUrls.length > 0 ? { sameAs: sameAsUrls } : {}),
          },
        },
        buildBreadcrumbSchema([
          { name: lang === 'fa' ? 'خانه' : 'Home', path: '/' },
          { name: lang === 'fa' ? 'تماس با ما' : 'Contact Us', path: '/contact' },
        ]),
      ],
    });
  }, [pageData, contact, lang, settings, validEmail]);

  const handleCopyPhone = async (id: string, numberStr: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(numberStr);
      }
      setCopiedId(id);
      showToast(
        lang === 'fa' ? `شماره ${numberStr} در حافظه کپی شد.` : `Copied ${numberStr} to clipboard.`,
        'success'
      );
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2200);
    } catch {
      showToast(
        lang === 'fa' ? 'امکان کپی خودکار وجود نداشت؛ لطفاً شماره را لمس کنید.' : 'Could not copy automatically.',
        'info'
      );
    }
  };

  const getPhoneTypeBadge = (type: PhoneContactType) => {
    if (lang === 'fa') {
      if (type === 'mobile') return 'تلفن همراه';
      if (type === 'landline') return 'تلفن ثابت';
      return 'خط ارتباطی';
    }
    if (type === 'mobile') return 'Mobile';
    if (type === 'landline') return 'Landline';
    return 'Direct Line';
  };

  return (
    <article
      id="page-contact"
      className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] pt-32 sm:pt-40 pb-36 selection:bg-[#906D2D]/25 flex flex-col justify-center"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        {/* Engineered Contrast Header Capsule */}
        <PageEditorialHeader
          eyebrow="Saeedniajewellerygrandbazar"
          title={lang === 'fa' ? pageData?.h1Fa || 'تماس با ما' : pageData?.h1En || 'Contact Us'}
          subtitle={lang === 'fa' ? pageData?.subtitleFa : pageData?.subtitleEn}
          description={
            lang === 'fa'
              ? pageData?.descriptionFa || contactSentence
              : pageData?.descriptionEn || contactSentence
          }
        />

        {/* =====================================================================
            SECTION 1: DIRECT TELEPHONE LINES (OBSIDIAN GOLD LUXURY CARDS)
           ===================================================================== */}
        {phoneItems.length > 0 && (
          <section id="contact-phones-section" className="max-w-3xl mx-auto w-full mb-14">
            <div className="mb-6">
              <span className="font-cinzel text-xs tracking-[0.28em] text-[#906D2D] dark:text-[#C5A059] uppercase block mb-1.5 font-semibold">
                {lang === 'fa' ? 'ارتباط مستقیم تلفنی' : 'Direct Telephone'}
              </span>
              <h2 className="text-xl sm:text-2xl font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF]">
                {lang === 'fa' ? 'شماره‌های تماس' : 'Telephone Numbers'}
              </h2>
              <p className="text-xs sm:text-sm text-[#4A3F35] dark:text-[#9E9A92] font-persian-body mt-1.5 max-w-xl mx-auto leading-relaxed">
                {contactSentence}
              </p>
            </div>

            <div className={phoneGrid.containerClass}>
              {phoneItems.map((item, idx) => {
                const telHref = formatTelHref(item.number);
                const isCopied = copiedId === item.id;
                const displayLabel =
                  lang === 'fa'
                    ? item.displayLabelFa || getPhoneTypeBadge(item.type)
                    : item.displayLabelEn || item.displayLabelFa || getPhoneTypeBadge(item.type);

                return (
                  <div
                    key={item.id || idx}
                    className={`${phoneGrid.getItemClass(idx)} min-w-0 relative p-5 sm:p-6 bg-white dark:bg-[#0B0B10] border border-[#AC9262]/35 dark:border-[#C5A059]/25 hover:border-[#906D2D] dark:hover:border-[#D4AF37]/60 rounded-sm shadow-[0_6px_26px_rgba(73,58,48,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-300 text-start group`}
                  >
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#AC9262]/45 dark:via-[#D4AF37]/45 to-transparent pointer-events-none" />

                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-sm bg-[#FAF9F6] dark:bg-[#14141B] border border-[#AC9262]/30 dark:border-[#C5A059]/25 flex items-center justify-center text-[#906D2D] dark:text-[#C5A059]">
                          <Phone className="w-4 h-4" />
                        </span>
                        <span className="text-xs font-persian-nav font-medium text-[#4A3F35] dark:text-[#C8C4BC]">
                          {displayLabel}
                        </span>
                      </div>

                      <span className="text-[11px] font-persian-nav text-[#906D2D] dark:text-[#C5A059]/90 px-2 py-0.5 border border-[#AC9262]/25 dark:border-[#C5A059]/20 rounded-sm bg-[#FAF9F6] dark:bg-[#121218]">
                        {getPhoneTypeBadge(item.type)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <a
                        id={`contact-phone-link-${idx}`}
                        href={telHref || undefined}
                        dir="ltr"
                        aria-label={`${displayLabel}: ${item.number}`}
                        className="font-mono text-xl sm:text-2xl font-semibold tracking-wider text-[#906D2D] hover:text-[#1F1A16] dark:text-[#D4AF37] dark:hover:text-[#FAF8F3] transition-colors focus:outline-none focus-visible:underline"
                      >
                        {item.number}
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyPhone(item.id, item.number)}
                        aria-label={
                          lang === 'fa'
                            ? `کپی شماره ${item.number}`
                            : `Copy ${item.number}`
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#AC9262]/35 dark:border-[#C5A059]/25 bg-[#FAF9F6] hover:bg-[#E4DBCB]/45 dark:bg-[#14141B] dark:hover:bg-[#1C1C25] text-[11px] font-persian-nav text-[#4A3F35] dark:text-[#C8C4BC] hover:text-[#1F1A16] dark:hover:text-[#EDE8DF] transition-colors cursor-pointer shrink-0"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-700 dark:text-emerald-300">
                              {lang === 'fa' ? 'کپی شد' : 'Copied'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#C5A059]" />
                            <span>{lang === 'fa' ? 'کپی' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {validEmail && (
              <div className="mt-4 max-w-md mx-auto p-4 sm:p-5 bg-white dark:bg-[#0B0B10] border border-[#AC9262]/35 dark:border-[#C5A059]/25 hover:border-[#906D2D] dark:hover:border-[#D4AF37]/60 rounded-sm shadow-[0_6px_26px_rgba(73,58,48,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-sm bg-[#FAF9F6] dark:bg-[#14141B] border border-[#AC9262]/30 dark:border-[#C5A059]/25 flex items-center justify-center text-[#906D2D] dark:text-[#C5A059] shrink-0">
                    <Mail className="w-4 h-4" />
                  </span>
                  <div className="text-start min-w-0">
                    <span className="text-[11px] font-persian-nav text-[#6E6153] dark:text-[#9E9A92] block">
                      {lang === 'fa' ? 'پست الکترونیک رسمی' : 'Official Email'}
                    </span>
                    <a
                      id="contact-email-link"
                      href={`mailto:${validEmail}`}
                      dir="ltr"
                      className="font-mono text-xs sm:text-sm text-[#906D2D] hover:text-[#1F1A16] dark:text-[#D4AF37] dark:hover:text-[#FAF8F3] transition-colors truncate block"
                    >
                      {validEmail}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPhone('email', validEmail)}
                  aria-label={lang === 'fa' ? 'کپی نشانی ایمیل' : 'Copy email'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#AC9262]/35 dark:border-[#C5A059]/25 bg-[#FAF9F6] hover:bg-[#E4DBCB]/45 dark:bg-[#14141B] dark:hover:bg-[#1C1C25] text-[11px] font-persian-nav text-[#4A3F35] dark:text-[#C8C4BC] cursor-pointer shrink-0 transition-colors"
                >
                  {copiedId === 'email' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-300">
                        {lang === 'fa' ? 'کپی شد' : 'Copied'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#C5A059]" />
                      <span>{lang === 'fa' ? 'کپی' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        )}

        {/* =====================================================================
            SECTION 2: DYNAMIC SOCIAL MEDIA CHANNELS
           ===================================================================== */}
        {activeSocialLinks.length > 0 && (
          <>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#AC9262]/50 dark:via-[#C5A059]/40 to-transparent mx-auto mb-12" />

            <section id="contact-social-section" className="max-w-4xl mx-auto w-full mb-14">
              <div className="mb-7">
                <span className="font-cinzel text-xs tracking-[0.28em] text-[#906D2D] dark:text-[#C5A059] uppercase block mb-1.5 font-semibold">
                  {lang === 'fa' ? 'کانال‌های رسمی آنلاین' : 'Official Social Channels'}
                </span>
                <h2 className="text-xl sm:text-2xl font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF]">
                  {lang === 'fa'
                    ? 'ما را در شبکه‌های اجتماعی دنبال کنید'
                    : 'Follow Us on Social Media'}
                </h2>
              </div>

              <div className={socialGrid.containerClass}>
                {activeSocialLinks.map((social, idx) => {
                  const catalogMeta = SOCIAL_PLATFORM_CATALOG[social.platform];
                  const platformLabel =
                    social.platform === 'custom' && social.customPlatformName
                      ? social.customPlatformName
                      : lang === 'fa'
                      ? catalogMeta?.labelFa || social.platform
                      : catalogMeta?.labelEn || social.platform;

                  const displayName =
                    lang === 'fa'
                      ? social.displayNameFa || platformLabel
                      : social.displayNameEn || social.displayNameFa || platformLabel;

                  const shortDesc =
                    lang === 'fa'
                      ? social.shortDescriptionFa
                      : social.shortDescriptionEn || social.shortDescriptionFa;

                  return (
                    <a
                      key={social.id}
                      id={`contact-social-link-${social.id}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${platformLabel} - ${displayName}`}
                      className={`${socialGrid.getItemClass(idx)} min-w-0 group relative flex flex-col justify-between p-5 rounded-sm border text-start transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                        social.featured
                          ? 'bg-gradient-to-b from-[#FAF7F0] to-white dark:from-[#12100C] dark:to-[#0A0A0E] border-[#906D2D]/55 dark:border-[#D4AF37]/45 hover:border-[#906D2D] dark:hover:border-[#D4AF37]'
                          : 'bg-white dark:bg-[#0B0B10] border-[#AC9262]/30 dark:border-[#C5A059]/20 hover:border-[#906D2D] dark:hover:border-[#D4AF37]/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 ${
                              social.featured
                                ? 'bg-[#906D2D] text-white border-[#906D2D] dark:bg-[#C5A059] dark:text-[#0A0A0B] dark:border-[#D4AF37]'
                                : 'bg-[#FAF9F6] dark:bg-[#14141B] text-[#906D2D] dark:text-[#C5A059] border-[#AC9262]/30 dark:border-[#C5A059]/25'
                            }`}
                          >
                            <SocialPlatformIcon
                              platform={social.platform}
                              customIconKey={social.customIconKey}
                              className="w-5 h-5"
                            />
                          </div>

                          <div className="min-w-0">
                            <span className="text-[11px] font-persian-nav text-[#906D2D] dark:text-[#C5A059] block truncate">
                              {platformLabel}
                            </span>
                            <h3 className="text-sm font-semibold text-[#1F1A16] dark:text-[#EDE8DF] font-persian-heading truncate group-hover:text-[#906D2D] dark:group-hover:text-[#D4AF37] transition-colors">
                              {displayName}
                            </h3>
                          </div>
                        </div>

                        {lang === 'fa' ? (
                          <ArrowUpLeft className="w-4 h-4 text-[#AC9262] dark:text-[#8C8880] group-hover:text-[#906D2D] dark:group-hover:text-[#D4AF37] shrink-0 transition-colors" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-[#AC9262] dark:text-[#8C8880] group-hover:text-[#906D2D] dark:group-hover:text-[#D4AF37] shrink-0 transition-colors" />
                        )}
                      </div>

                      {shortDesc && (
                        <p className="text-xs text-[#4A3F35] dark:text-[#A8A49C] font-persian-body leading-relaxed line-clamp-2">
                          {shortDesc}
                        </p>
                      )}
                    </a>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* =====================================================================
            SECTION 3: BOUTIQUE ADDRESS & OPENING HOURS
           ===================================================================== */}
        {(address || openingHours) && (
          <>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#AC9262]/50 dark:via-[#C5A059]/40 to-transparent mx-auto mb-12" />

            <div className="mb-12 max-w-2xl mx-auto p-6 bg-white dark:bg-[#0A0A0D]/80 border border-[#AC9262]/35 dark:border-[#C5A059]/20 rounded-sm shadow-[0_4px_20px_rgba(73,58,48,0.06)] dark:shadow-none space-y-4">
              {address && (
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#906D2D] dark:text-[#C5A059] flex-shrink-0" />
                    <span className="font-cinzel text-xs text-[#906D2D] dark:text-[#C5A059] uppercase tracking-wider font-medium">
                      {lang === 'fa' ? 'نشانی گالری در بازار بزرگ تهران' : 'Gallery Address'}
                    </span>
                  </div>
                  <p className="font-vazir text-xs sm:text-sm text-[#4A3F35] dark:text-[#C8C4BC] leading-relaxed font-normal">
                    {address}
                  </p>
                </div>
              )}

              {openingHours && (
                <div className="pt-3 border-t border-[#AC9262]/20 dark:border-[#C5A059]/15 flex items-center justify-center gap-2 text-xs text-[#6E6153] dark:text-[#A8A49C]">
                  <Clock className="w-3.5 h-3.5 text-[#906D2D] dark:text-[#C5A059] shrink-0" />
                  <span className="font-persian-body">{openingHours}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Hairline Divider */}
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#AC9262]/50 dark:via-[#C5A059]/40 to-transparent mx-auto mb-12" />

        {/* =====================================================================
            SECTION 4: INTERACTIVE MAP & NAVIGATION CHOICES
           ===================================================================== */}
        <section id="contact-map-section" className="max-w-3xl mx-auto w-full text-center">
          <div className="mb-6">
            <span className="font-cinzel text-xs tracking-[0.25em] text-[#906D2D] dark:text-[#C5A059] uppercase block mb-1.5 font-medium">
              {lang === 'fa' ? 'نقشه و موقعیت مکانی' : 'Location & Navigation'}
            </span>
            <h2 className="text-xl sm:text-2xl font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF]">
              {lang === 'fa' ? 'مسیریابی به جواهری سعیدنیا' : 'Directions to Saeednia Jewellery'}
            </h2>
            <p className="text-xs text-[#4A3F35] dark:text-[#9E9A92] font-persian-body mt-1">
              {lang === 'fa'
                ? 'مشاهده نقشه زنده و انتخاب مسیریاب دلخواه جهت مراجعه به بازار بزرگ تهران'
                : 'Interactive map and navigation options for visiting our gallery in Tehran Grand Bazaar'}
            </p>
          </div>

          {/* Interactive Map Embed with Normalized Coordinates & Fallback */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[21/9] bg-white dark:bg-[#0A0A0E] border border-[#AC9262]/35 dark:border-[#C5A059]/25 rounded-sm overflow-hidden shadow-md mb-6 group">
            {mapData.canEmbed && !mapLoadFailed ? (
              <iframe
                title={lang === 'fa' ? 'نقشه موقعیت مکانی جواهری سعیدنیا' : 'Saeednia Jewellery Location Map'}
                src={mapData.embedUrl}
                onError={() => setMapLoadFailed(true)}
                className="w-full h-full border-0 filter contrast-105"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#FAF8F4] dark:bg-[#0D0D12] gap-3">
                <MapPin className="w-7 h-7 text-[#C5A059]" aria-hidden="true" />
                <p className="text-xs sm:text-sm font-persian-body text-[#4A3F35] dark:text-[#C8C4BC] max-w-md">
                  {mapData.error ||
                    (lang === 'fa'
                      ? 'پیش‌نمایش تعاملی نقشه در مرورگر مسدود شده است. می‌توانید موقعیت گالری را مستقیماً در Google Maps مشاهده کنید.'
                      : 'Interactive map embed could not load here. Open our gallery location directly in Google Maps.')}
                </p>
                <a
                  href={mapData.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#906D2D] hover:bg-[#7D5E26] text-white dark:bg-[#C5A059] dark:hover:bg-[#D4AF37] dark:text-[#0A0A0B] text-xs font-semibold font-persian-nav rounded-sm transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{lang === 'fa' ? 'باز کردن در Google Maps' : 'Open in Google Maps'}</span>
                </a>
              </div>
            )}

            {/* Bottom floating quick-action bar on top of map */}
            <div className="absolute bottom-2.5 sm:bottom-3 inset-x-2.5 sm:inset-x-6 flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 bg-white/95 border border-[#AC9262]/35 text-[#1F1A16] dark:bg-[#0A0A0D]/95 dark:border-[#C5A059]/30 dark:text-[#EDE8DF] rounded-sm backdrop-blur-md shadow-lg">
              <div className="text-start min-w-0 flex-1">
                <span className="font-persian-nav text-xs text-[#1F1A16] dark:text-[#EDE8DF] block truncate font-medium">
                  {lang === 'fa' ? 'بازار زرگرها • جواهری سعیدنیا' : 'Tehran Grand Bazaar Gallery'}
                </span>
                <span dir="ltr" className="text-[10px] text-[#6E6153] dark:text-[#A8A49C] block font-mono truncate">
                  {displayLat.toFixed(6)}, {displayLng.toFixed(6)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={mapData.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 border border-[#AC9262]/35 dark:border-[#C5A059]/30 text-[#1F1A16] dark:text-[#EDE8DF] hover:border-[#C5A059] text-[11px] font-persian-nav rounded-sm hidden sm:inline-flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  <span>{lang === 'fa' ? 'گوگل مپس' : 'Google Maps'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsNavModalOpen(true)}
                  className="px-3 sm:px-4 py-1.5 bg-[#906D2D] hover:bg-[#7D5E26] text-white dark:bg-[#C5A059] dark:hover:bg-[#D4AF37] dark:text-[#0A0A0B] text-xs font-semibold font-persian-nav rounded-sm flex items-center gap-1.5 shadow transition-colors flex-shrink-0 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{lang === 'fa' ? 'انتخاب مسیریاب' : 'Open Nav'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Direct Navigation Choices Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {enabledProviders.map((provider) => {
              const IconComp = provider.icon;
              return (
                <a
                  key={provider.id}
                  id={`nav-link-${provider.id}`}
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center py-3 px-2 bg-white hover:bg-[#E4DBCB]/30 border border-[#AC9262]/35 hover:border-[#906D2D] text-[#1F1A16] dark:bg-[#0A0A0D]/80 dark:hover:bg-[#121217] dark:border-[#C5A059]/20 dark:hover:border-[#D4AF37] dark:text-[#C8C4BC] dark:hover:text-[#EDE8DF] rounded-sm transition-all group shadow-sm hover:shadow-md"
                >
                  <IconComp className="w-4 h-4 text-[#906D2D] group-hover:text-[#7D5E26] dark:text-[#C5A059] dark:group-hover:text-[#D4AF37] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-persian-nav font-medium truncate">
                    {lang === 'fa' ? provider.nameFa.split(' ')[0] : provider.nameEn}
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      </div>

      {/* Navigation Choices Modal Dialog (Mobile-friendly popover) */}
      {isNavModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsNavModalOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="انتخاب نرم‌افزار مسیریابی"
            className="relative z-10 w-full max-w-md max-h-[90dvh] flex flex-col overflow-hidden bg-white dark:bg-[#0D0D12] border border-[#AC9262]/40 dark:border-[#C5A059]/40 rounded-sm shadow-2xl text-start"
          >
            <div className="flex-shrink-0 flex items-center justify-between gap-3 border-b border-[#AC9262]/30 dark:border-[#C5A059]/20 px-5 sm:px-6 py-4">
              <div className="min-w-0">
                <h3 className="text-base font-medium text-[#1F1A16] dark:text-[#EDE8DF] font-vazir truncate">
                  {lang === 'fa' ? 'انتخاب نرم‌افزار مسیریابی' : 'Select Navigation App'}
                </h3>
                <p className="text-[11px] text-[#6E6153] dark:text-[#8C8880] mt-0.5 truncate">
                  {lang === 'fa'
                    ? 'جهت هدایت مستقیم به گالری در بازار بزرگ تهران'
                    : 'Directions to the Tehran Grand Bazaar gallery'}
                </p>
              </div>

              <button
                ref={navCloseBtnRef}
                type="button"
                onClick={() => setIsNavModalOpen(false)}
                className="w-9 h-9 rounded-sm border border-[#AC9262]/25 dark:border-[#C5A059]/25 flex items-center justify-center text-[#6E6153] dark:text-[#8C8880] hover:text-[#1F1A16] dark:hover:text-[#EDE8DF] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                aria-label={lang === 'fa' ? 'بستن پنجره' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
              <div className="space-y-2.5">
              {enabledProviders.map((provider) => {
                const IconComp = provider.icon;
                return (
                  <a
                    key={provider.id}
                    href={provider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsNavModalOpen(false)}
                    className="flex items-center justify-between p-3 bg-white dark:bg-[#121218] hover:bg-[#E4DBCB]/30 dark:hover:bg-[#1A1A22] border border-[#AC9262]/30 hover:border-[#906D2D] dark:border-[#C5A059]/20 dark:hover:border-[#D4AF37] rounded-sm text-[#1F1A16] dark:text-[#EDE8DF] transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[#E4DBCB]/40 dark:bg-[#171720] border border-[#AC9262]/30 dark:border-[#C5A059]/20 flex items-center justify-center text-[#906D2D] dark:text-[#C5A059] group-hover:text-[#7D5E26] dark:group-hover:text-[#D4AF37]">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-persian-nav font-medium block">
                          {lang === 'fa' ? provider.nameFa : provider.nameEn}
                        </span>
                        <span className="text-[10px] text-[#6E6153] dark:text-[#7C7870]">
                          {provider.id === 'google_maps' ? 'اپلیکیشن یا مرورگر' : 'مسیریابی مستقیم'}
                        </span>
                      </div>
                    </div>

                    <ExternalLink className="w-4 h-4 text-[#906D2D] dark:text-[#8C8880] group-hover:text-[#7D5E26] dark:group-hover:text-[#D4AF37] transition-colors" />
                  </a>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-[#AC9262]/20 dark:border-[#C5A059]/15 text-center">
              <button
                type="button"
                onClick={() => setIsNavModalOpen(false)}
                className="text-xs text-[#6E6153] hover:text-[#906D2D] dark:text-[#8C8880] dark:hover:text-[#C5A059] transition-colors cursor-pointer"
              >
                {lang === 'fa' ? 'بستن' : 'Close'}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
