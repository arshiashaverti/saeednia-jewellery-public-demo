import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Phone,
  MapPin,
  MessageCircle,
  Home,
  Layers,
  PhoneCall,
  Info,
  ArrowUp,
  BookOpen,
  Mail,
  Sparkles,
} from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';
import { SocialPlatformIcon } from './SocialPlatformIcon';
import {
  DEFAULT_FOOTER_LINKS,
  SOCIAL_PLATFORM_CATALOG,
  formatTelHref,
  isValidEmailAddress,
  resolveActivePhoneNumbers,
  resolveActiveSocialLinks,
  resolveNavLinks,
} from '../utils/contactAndArticles';

export const Footer: React.FC = () => {
  const { lang, settings, theme } = useApp();

  const brandFa = settings?.brandNameFa || 'جواهری سعیدنیا';
  const brandEn = settings?.brandNameEn || settings?.footer?.brandNameEn || 'Saeednia Jewellery';
  const branchFa = settings?.branchNameFa || 'بازار بزرگ تهران';
  const branchEn = settings?.branchNameEn || 'Tehran Grand Bazaar';
  const contact = settings?.contact;
  const phoneNumbers = resolveActivePhoneNumbers(contact);
  const activeSocialLinks = resolveActiveSocialLinks(contact);

  const copyrightFa = settings?.footer?.copyrightFa || settings?.footerTextFa || 'تمامی حقوق برای جواهری سعیدنیا (شعبه بازار بزرگ تهران) محفوظ است.';
  const copyrightEn = settings?.footer?.copyrightEn || settings?.footerTextEn || 'All rights reserved for Saeednia Jewellery Grand Bazaar.';
  const validEmail = isValidEmailAddress(contact?.email) ? contact!.email!.trim() : '';
  const footerLinks = resolveNavLinks(settings?.navigation?.footerLinks, DEFAULT_FOOTER_LINKS);

  const getFooterLinkIcon = (to: string) => {
    if (to === '/') return Home;
    if (to.startsWith('/categories') || to.startsWith('/collection') || to.startsWith('/fine-jewelry')) return Layers;
    if (to.startsWith('/blog')) return BookOpen;
    if (to.startsWith('/contact')) return PhoneCall;
    if (to.startsWith('/about')) return Info;
    return Sparkles;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="main-footer"
      className={`relative footer-surface pt-12 sm:pt-14 pb-8 sm:pb-10 transition-colors duration-300 ${
        theme === 'light' ? 'bg-gradient-to-b from-[#E4DBCB] to-[#C8B696] text-[#1F1A16]' : 'on-dark'
      }`}
      data-surface={theme === 'light' ? 'light' : 'dark'}
    >
      {/* Delicate Luxury Halo Separator Line at Footer Entrance */}
      <div
        id="footer-halo-separator"
        className="absolute top-0 inset-x-0 h-[1px] pointer-events-none overflow-visible flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="footer-halo-glow absolute -top-1.5 inset-x-0 h-3 bg-gradient-to-r from-transparent via-[#C5A059]/25 via-50% to-transparent blur-[3px]" />
        <div className="footer-halo-line w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 via-50% to-transparent" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* UPPER PART: CENTERED OFFICIAL LOGO & BRAND TEXT */}
        <div className="flex flex-col items-center justify-center text-center mb-12 sm:mb-16">
          <Link
            to="/"
            onClick={scrollToTop}
            className="flex flex-col items-center justify-center group cursor-pointer focus:outline-none"
            aria-label="Saeednia Jewellery Home"
          >
            <div className="mb-3 transition-transform duration-300 group-hover:scale-105">
              <OfficialLogo size="md" />
            </div>

            <span className="font-vazir text-sm sm:text-base md:text-lg text-[#C5A059] mt-2 tracking-wide whitespace-nowrap footer-brand-matte-gold font-normal">
              {lang === 'fa' ? `${brandFa} ${branchFa}` : `${brandEn} • ${branchEn}`}
            </span>
          </Link>

          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent mt-6" />
        </div>

        {/* THREE BALANCED COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 lg:gap-16 pb-12 border-b border-[#C5A059]/15 text-start rtl:text-right ltr:text-left">

          {/* COLUMN 1: اطلاعات تماس */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-sm font-semibold text-footer-heading font-persian-heading flex items-center gap-2 border-b border-[#C5A059]/20 pb-2.5">
              <MapPin className="w-4 h-4 text-footer-gold shrink-0" />
              <span>{lang === 'fa' ? 'اطلاعات تماس' : 'Contact Information'}</span>
            </h2>

            <div className="flex items-start gap-2.5 text-xs text-footer-text leading-relaxed">
              <MapPin className="w-3.5 h-3.5 text-footer-gold mt-0.5 shrink-0 opacity-80" />
              <p className="font-persian-body">
                {lang === 'fa'
                  ? (contact?.addressFa || 'تهران، بازار بزرگ، بازار زرگرها، جواهری سعیدنیا')
                  : (contact?.addressEn || contact?.addressFa || 'Saeednia Jewellery, Zargaran Bazaar, Grand Bazaar, Tehran, Iran')}
              </p>
            </div>

            {phoneNumbers.length > 0 && (
              <div className="space-y-2 pt-1">
                {phoneNumbers.map((phone, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    <Phone className="w-3.5 h-3.5 text-footer-gold shrink-0 opacity-80" />
                    <a
                      href={formatTelHref(phone) || undefined}
                      className="text-footer-text hover:text-footer-gold font-mono tracking-wider transition-colors inline-block focus:outline-none focus-visible:underline"
                      dir="ltr"
                    >
                      {phone}
                    </a>
                  </div>
                ))}
              </div>
            )}

            {validEmail && (
              <div className="flex items-center gap-2.5 text-xs pt-1">
                <Mail className="w-3.5 h-3.5 text-footer-gold shrink-0 opacity-80" />
                <a
                  href={`mailto:${validEmail}`}
                  className="text-footer-text hover:text-footer-gold font-mono tracking-normal transition-colors inline-block focus:outline-none focus-visible:underline truncate"
                  dir="ltr"
                >
                  {validEmail}
                </a>
              </div>
            )}
          </div>

          {/* COLUMN 2: شبکه‌های اجتماعی (Dynamic from Admin CMS) */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-sm font-semibold text-footer-heading font-persian-heading flex items-center gap-2 border-b border-[#C5A059]/20 pb-2.5">
              <MessageCircle className="w-4 h-4 text-footer-gold shrink-0" />
              <span>{lang === 'fa' ? 'شبکه‌های اجتماعی' : 'Social Networks'}</span>
            </h2>

            {activeSocialLinks.length > 0 ? (
              <div className="flex flex-col space-y-2.5 pt-1">
                {activeSocialLinks.slice(0, 6).map((social) => {
                  const catalog = SOCIAL_PLATFORM_CATALOG[social.platform];
                  const platformLabel =
                    social.platform === 'custom' && social.customPlatformName
                      ? social.customPlatformName
                      : lang === 'fa'
                      ? catalog?.labelFa || social.platform
                      : catalog?.labelEn || social.platform;
                  const titleText =
                    lang === 'fa'
                      ? social.displayNameFa || platformLabel
                      : social.displayNameEn || social.displayNameFa || platformLabel;

                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 p-2.5 rounded-sm bg-footer-card border border-[#C5A059]/20 hover:border-footer-gold text-footer-text hover:text-footer-heading transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#A77B36]"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#C5A059]/15 flex items-center justify-center text-footer-gold group-hover:scale-110 transition-transform shrink-0">
                        <SocialPlatformIcon
                          platform={social.platform}
                          customIconKey={social.customIconKey}
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold font-persian-heading text-footer-heading truncate">
                          {platformLabel}
                        </span>
                        <span className="text-[10px] text-footer-muted truncate">
                          {titleText}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-footer-muted font-persian-body pt-1">
                {lang === 'fa'
                  ? 'برای دریافت اطلاعات، از شماره‌های تماس مستقیم استفاده نمایید.'
                  : 'Please reach us via our direct telephone numbers.'}
              </p>
            )}
          </div>

          {/* COLUMN 3 (Leftmost in Persian RTL): دسترسی سریع */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-sm font-semibold text-footer-heading font-persian-heading flex items-center gap-2 border-b border-[#C5A059]/20 pb-2.5">
              <Layers className="w-4 h-4 text-footer-gold shrink-0" />
              <span>{lang === 'fa' ? 'دسترسی سریع' : 'Quick Access'}</span>
            </h2>

            <nav className="flex flex-col space-y-2.5 pt-1 text-xs" aria-label="Footer Quick Access Links">
              {footerLinks.map((item) => {
                const IconComp = getFooterLinkIcon(item.to);
                const isExternal = /^https:\/\//i.test(item.to);
                const cls = 'flex items-center gap-2.5 text-footer-text hover:text-footer-gold transition-colors py-1 group focus:outline-none focus-visible:underline';
                if (isExternal) {
                  return (
                    <a
                      key={item.id || item.to}
                      href={item.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cls}
                    >
                      <IconComp className="w-3.5 h-3.5 text-footer-gold opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0" />
                      <span className="font-persian-nav">{lang === 'fa' ? item.labelFa : item.labelEn}</span>
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.id || item.to}
                    to={item.to}
                    onClick={scrollToTop}
                    className={cls}
                  >
                    <IconComp className="w-3.5 h-3.5 text-footer-gold opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0" />
                    <span className="font-persian-nav">{lang === 'fa' ? item.labelFa : item.labelEn}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

        </div>

        {/* ==============================================================
            LOWER BAR: COPYRIGHT & BACK TO TOP (NO LOCK ICON OR ADMIN LINK)
           ============================================================== */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-footer-muted">
          <p className="font-persian-body text-center sm:text-start leading-relaxed">
            {lang === 'fa' ? copyrightFa : copyrightEn}
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#C5A059]/25 hover:border-footer-gold text-footer-text hover:text-footer-gold transition-colors font-persian-nav cursor-pointer focus:outline-none"
            aria-label="Back to top"
          >
            <span>{lang === 'fa' ? 'بازگشت به بالا' : 'Back to top'}</span>
            <ArrowUp className="w-3.5 h-3.5 text-footer-gold" />
          </button>
        </div>

      </div>
    </footer>
  );
};
