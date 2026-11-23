import React, { useState } from 'react';
import { Check, Copy, Mail, Phone, ExternalLink } from 'lucide-react';
import { ContactSettings } from '../types';
import {
  formatTelHref,
  resolveActivePhoneItems,
  resolveActiveSocialLinks,
  SOCIAL_PLATFORM_CATALOG,
} from '../utils/contactAndArticles';
import { SocialPlatformIcon } from './SocialPlatformIcon';

export interface BalancedGridLayout {
  containerClass: string;
  getItemClass: (index: number) => string;
}

/**
 * Pure responsive layout planner preserving centered symmetry:
 * - 1 card: centered single column
 * - 2 cards: balanced 2-column row
 * - 3 cards: centered pyramid (2 cards top row, 3rd card centered underneath in both RTL & LTR)
 * - 4 cards: 2x2 balanced grid
 * - 5+ cards: 2-col tablet / 3-col desktop with centered trailing incomplete row
 */
export function getBalancedGridLayout(count: number): BalancedGridLayout {
  if (count <= 1) {
    return {
      containerClass: 'grid grid-cols-1 max-w-md mx-auto gap-4',
      getItemClass: () => '',
    };
  }
  if (count === 2) {
    return {
      containerClass: 'grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-4',
      getItemClass: () => '',
    };
  }
  if (count === 3) {
    return {
      containerClass: 'grid grid-cols-1 sm:grid-cols-4 max-w-2xl mx-auto gap-4',
      getItemClass: (index: number) =>
        index === 2 ? 'sm:col-span-2 sm:col-start-2' : 'sm:col-span-2',
    };
  }
  if (count === 4) {
    return {
      containerClass: 'grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-4',
      getItemClass: () => '',
    };
  }

  const desktopMod = count % 3;
  const tabletMod = count % 2;

  return {
    containerClass: 'grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-6 max-w-4xl mx-auto gap-4',
    getItemClass: (index: number) => {
      const classes = ['sm:col-span-2', 'lg:col-span-2'];

      // Tablet odd trailing item centered
      if (tabletMod === 1 && index === count - 1) {
        classes.push('sm:col-start-2');
      }

      // Desktop incomplete trailing row centered (overrides sm:col-start-2 cleanly)
      if (desktopMod === 0) {
        if (tabletMod === 1 && index === count - 1) {
          classes.push('lg:col-start-auto');
        }
      } else if (desktopMod === 1 && index === count - 1) {
        classes.push('lg:col-start-3');
      } else if (desktopMod === 2) {
        if (index === count - 2) {
          classes.push('lg:col-start-2');
        } else if (index === count - 1) {
          classes.push('lg:col-start-auto');
        }
      }

      return classes.join(' ');
    },
  };
}

interface ContactChannelsSectionProps {
  contact?: Partial<ContactSettings>;
  lang: 'fa' | 'en';
  isLight: boolean;
  showSectionHeadings?: boolean;
  showEmailCard?: boolean;
}

export const ContactChannelsSection: React.FC<ContactChannelsSectionProps> = ({
  contact,
  lang,
  isLight,
  showSectionHeadings = true,
  showEmailCard = true,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const phones = resolveActivePhoneItems(contact);
  const socials = resolveActiveSocialLinks(contact);
  const emailAddress = typeof contact?.email === 'string' ? contact.email.trim() : '';

  if (phones.length === 0 && socials.length === 0 && (!showEmailCard || !emailAddress)) {
    return null;
  }

  const copyValue = async (key: string, val: string) => {
    try {
      await navigator.clipboard?.writeText(val);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  const phoneGrid = getBalancedGridLayout(phones.length);
  const socialGrid = getBalancedGridLayout(socials.length);

  return (
    <div className="space-y-10 w-full">
      {/* Direct Phone Lines */}
      {phones.length > 0 && (
        <section aria-labelledby="contact-phones-heading" className="w-full">
          {showSectionHeadings && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-[#C5A059] text-xs uppercase tracking-[0.22em] mb-2">
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{lang === 'fa' ? 'شماره‌های تماس مستقیم گالری' : 'Direct Gallery Lines'}</span>
              </div>
              <h2
                id="contact-phones-heading"
                className={`text-xl md:text-2xl ${lang === 'fa' ? 'font-vazir font-medium' : 'font-serif'} ${
                  isLight ? 'text-[#2A2622]' : 'text-[#EDE8DF]'
                }`}
              >
                {lang === 'fa' ? 'گفتگو و مشاوره مستقیم با کارشناسان سعیدنیا' : 'Speak Directly With Our Concierge'}
              </h2>
            </div>
          )}

          <div className={phoneGrid.containerClass}>
            {phones.map((phone, idx) => {
              const telHref = formatTelHref(phone.number);
              const label =
                lang === 'fa'
                  ? phone.displayLabelFa || (phone.type === 'mobile' ? 'خط همراه گالری' : 'تلفن مستقیم گالری')
                  : phone.displayLabelEn || (phone.type === 'mobile' ? 'Gallery Mobile' : 'Direct Landline');
              const isCopied = copiedKey === `phone-${phone.id}`;

              return (
                <div
                  key={phone.id}
                  className={`${phoneGrid.getItemClass(idx)} min-w-0 group flex items-center justify-between gap-3 p-4 sm:p-5 rounded-sm border transition-all duration-300 ${
                    isLight
                      ? 'bg-[#FFFFFF] border-[#C5A059]/25 hover:border-[#C5A059] shadow-sm'
                      : 'bg-[#0C0C0F]/90 border-[#C5A059]/20 hover:border-[#C5A059]/60 shadow-[0_8px_24px_rgba(0,0,0,0.35)]'
                  }`}
                >
                  <a
                    href={telHref || '#'}
                    className="flex items-center gap-3.5 min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-sm"
                  >
                    <div
                      className={`w-11 h-11 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                        isLight
                          ? 'bg-[#F8F5EE] border-[#C5A059]/30 text-[#9D7833] group-hover:bg-[#C5A059] group-hover:text-white'
                          : 'bg-[#151519] border-[#C5A059]/30 text-[#D4AF37] group-hover:bg-[#C5A059] group-hover:text-[#0A0A0B]'
                      }`}
                    >
                      <Phone className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      <span className={`block text-[11px] mb-1 truncate ${isLight ? 'text-[#736B62]' : 'text-[#8C8880]'}`}>
                        {label}
                      </span>
                      <span
                        dir="ltr"
                        className={`block text-sm sm:text-base font-mono font-medium tracking-wider truncate ${
                          isLight ? 'text-[#1F1C18]' : 'text-[#EDE8DF]'
                        }`}
                      >
                        {phone.number}
                      </span>
                    </div>
                  </a>

                  <button
                    type="button"
                    onClick={() => copyValue(`phone-${phone.id}`, phone.number)}
                    aria-label={lang === 'fa' ? `کپی شماره ${phone.number}` : `Copy ${phone.number}`}
                    title={lang === 'fa' ? 'کپی شماره تماس' : 'Copy number'}
                    className={`w-9 h-9 rounded-sm border flex items-center justify-center shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                      isLight
                        ? 'border-[#C5A059]/25 text-[#8A6D3B] hover:bg-[#F5EFE2]'
                        : 'border-[#C5A059]/20 text-[#8C8880] hover:text-[#D4AF37] hover:border-[#C5A059]/50'
                    }`}
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>

          {showEmailCard && emailAddress && (
            <div className="max-w-md mx-auto mt-4">
              <div
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-sm border ${
                  isLight ? 'bg-[#FFFFFF] border-[#C5A059]/20' : 'bg-[#0C0C0F]/80 border-[#C5A059]/15'
                }`}
              >
                <a
                  href={`mailto:${emailAddress}`}
                  className="flex items-center gap-3 min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-sm"
                >
                  <Mail className="w-4 h-4 text-[#C5A059] shrink-0" aria-hidden="true" />
                  <span dir="ltr" className={`text-xs sm:text-sm font-mono truncate ${isLight ? 'text-[#2A2622]' : 'text-[#D6D0C6]'}`}>
                    {emailAddress}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => copyValue('email', emailAddress)}
                  aria-label={lang === 'fa' ? 'کپی نشانی ایمیل' : 'Copy email'}
                  className={`w-8 h-8 rounded-sm border flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                    isLight ? 'border-[#C5A059]/20 text-[#8A6D3B]' : 'border-[#C5A059]/20 text-[#8C8880] hover:text-[#D4AF37]'
                  }`}
                >
                  {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Official Social Channels */}
      {socials.length > 0 && (
        <section aria-labelledby="contact-socials-heading" className="w-full">
          {showSectionHeadings && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-[#C5A059] text-xs uppercase tracking-[0.22em] mb-2">
                <span>{lang === 'fa' ? 'کانال‌های رسمی جواهری سعیدنیا' : 'Official Social Channels'}</span>
              </div>
              <h2
                id="contact-socials-heading"
                className={`text-xl md:text-2xl ${lang === 'fa' ? 'font-vazir font-medium' : 'font-serif'} ${
                  isLight ? 'text-[#2A2622]' : 'text-[#EDE8DF]'
                }`}
              >
                {lang === 'fa' ? 'شبکه‌های اجتماعی رسمی گالری' : 'Connect Across Official Channels'}
              </h2>
            </div>
          )}

          <div className={socialGrid.containerClass}>
            {socials.map((social, idx) => {
              const meta = SOCIAL_PLATFORM_CATALOG[social.platform] || SOCIAL_PLATFORM_CATALOG.website;
              const platformLabel =
                social.platform === 'custom'
                  ? social.customPlatformName || (lang === 'fa' ? 'لینک رسمی' : 'Official Link')
                  : lang === 'fa'
                  ? meta.labelFa
                  : meta.labelEn;
              const title = lang === 'fa' ? social.displayNameFa : social.displayNameEn || social.displayNameFa;
              const subtitle =
                lang === 'fa'
                  ? social.shortDescriptionFa || platformLabel
                  : social.shortDescriptionEn || platformLabel;

              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${socialGrid.getItemClass(idx)} min-w-0 group flex items-center justify-between gap-3 p-4 sm:p-5 rounded-sm border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                    social.featured
                      ? isLight
                        ? 'bg-[#FDF9F0] border-[#C5A059]/45 hover:border-[#C5A059] shadow-sm'
                        : 'bg-[#12110E] border-[#C5A059]/40 hover:border-[#D4AF37] shadow-[0_8px_24px_rgba(197,160,89,0.08)]'
                      : isLight
                      ? 'bg-[#FFFFFF] border-[#C5A059]/25 hover:border-[#C5A059] shadow-sm'
                      : 'bg-[#0C0C0F]/90 border-[#C5A059]/20 hover:border-[#C5A059]/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-11 h-11 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                        isLight
                          ? 'bg-[#F8F5EE] border-[#C5A059]/30 text-[#9D7833] group-hover:bg-[#C5A059] group-hover:text-white'
                          : 'bg-[#151519] border-[#C5A059]/30 text-[#D4AF37] group-hover:bg-[#C5A059] group-hover:text-[#0A0A0B]'
                      }`}
                    >
                      <SocialPlatformIcon
                        platform={social.platform}
                        customIconKey={social.customIconKey}
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      <span
                        className={`block text-sm font-medium truncate ${
                          isLight ? 'text-[#1F1C18]' : 'text-[#EDE8DF]'
                        }`}
                      >
                        {title}
                      </span>
                      <span
                        className={`block text-xs truncate mt-0.5 ${
                          isLight ? 'text-[#736B62]' : 'text-[#8C8880]'
                        }`}
                      >
                        {subtitle}
                      </span>
                    </div>
                  </div>
                  <ExternalLink
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:-translate-y-0.5 ${
                      isLight ? 'text-[#9D7833]' : 'text-[#C5A059]/70 group-hover:text-[#D4AF37]'
                    }`}
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
