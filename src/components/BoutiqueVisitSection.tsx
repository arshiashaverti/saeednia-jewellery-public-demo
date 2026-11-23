import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { BoutiqueSectionSettings } from '../types';
import { AmbientJewelleryDecor } from './AmbientJewelleryDecor';
import { LuxuryLightDecor } from './LuxuryLightDecor';
import { MapPin, Clock, Compass, PhoneCall } from 'lucide-react';

interface BoutiqueVisitSectionProps {
  settings?: BoutiqueSectionSettings;
}

export const BoutiqueVisitSection: React.FC<BoutiqueVisitSectionProps> = ({ settings }) => {
  const { lang, theme } = useApp();

  const isEnabled = settings?.enabled !== false;
  if (!isEnabled) return null;

  const title =
    lang === 'fa'
      ? settings?.titleFa || 'جواهری سعیدنیا'
      : settings?.titleEn || 'Saeednia High Jewellery';

  const description =
    lang === 'fa'
      ? settings?.descriptionFa ||
        'برای دیدار از نزدیک و مشاهده آثار جواهری سعیدنیا، از حضور شما در فروشگاه خوشحال می‌شویم.'
      : settings?.descriptionEn ||
        'We look forward to welcoming you to our boutique to experience Saeednia creations in person.';

  const hoursTitle =
    lang === 'fa'
      ? settings?.hoursTitleFa || 'ساعات مراجعه حضوری:'
      : settings?.hoursTitleEn || 'Boutique Visiting Hours:';

  const defaultHoursFa = `شنبه تا چهارشنبه: ساعت ۱۰ تا ۱۶
پنجشنبه: ساعت ۱۰ تا ۱۵
جمعه: تعطیل`;

  const defaultHoursEn = `Saturday to Wednesday: 10:00 – 16:00
Thursday: 10:00 – 15:00
Friday: Closed`;

  const hoursText =
    lang === 'fa'
      ? settings?.hoursFa || defaultHoursFa
      : settings?.hoursEn || defaultHoursEn;

  const boutiqueImage = settings?.imageUrl || '/images/7.png';

  return (
    <section
      id="section-boutique-visit"
      className="py-18 sm:py-24 md:py-28 relative overflow-hidden bg-white dark:bg-gradient-to-b dark:from-[#090909] dark:via-[#151413] dark:to-[#090909] transition-colors duration-500"
    >
      {/* Decorative Ambient Jewellery Geometry and Light Halos */}
      <AmbientJewelleryDecor position="boutique-flanks" />

      {/* Subtle luxury light theme decor */}
      <LuxuryLightDecor section="boutique" />

      {/* =========================================================================
          Top Multi-stage Gradient Halo: Seamless blend from Section E (Pure White) above
         ========================================================================= */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-white via-white/80 to-transparent dark:from-[#090909] dark:via-[#151413]/60 pointer-events-none z-10" />
      <div className="absolute -top-16 start-1/2 -translate-x-1/2 w-[700px] h-[120px] bg-gradient-to-b from-[#C8B696]/15 via-[#E4DBCB]/20 to-transparent dark:from-[#C5A059]/15 dark:via-[#A9874F]/10 dark:to-transparent rounded-full blur-3xl pointer-events-none z-10" />

      {/* =========================================================================
          Bottom Multi-stage Gradient Halo: Seamless blend into Footer (#E4DBCB) below
         ========================================================================= */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#E4DBCB]/40 via-white/80 to-transparent dark:from-[#090909] dark:via-[#151413]/60 pointer-events-none z-10" />
      <div className="absolute -bottom-16 start-1/2 -translate-x-1/2 w-[700px] h-[120px] bg-gradient-to-t from-[#C8B696]/20 via-[#E4DBCB]/25 to-transparent dark:from-[#C5A059]/15 dark:via-[#A9874F]/10 dark:to-transparent rounded-full blur-3xl pointer-events-none z-10" />

      {/* Preserved dark ambient background soft light aura in center */}
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-gradient-to-tr from-[#C8B696]/10 via-[#E4DBCB]/15 to-transparent dark:from-[#C5A059]/8 dark:via-[#A9874F]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-center">
          
          {/* Circular Luxury Frame: Top on mobile/tablet (order-1), Right on desktop (order-2 lg:col-span-5) */}
          <div className="lg:col-span-5 flex justify-center order-1 lg:order-2 w-full">
            <div className="relative group max-w-full">
              {/* Outer delicate animated gold breathing ring */}
              <div className="absolute -inset-3.5 rounded-full bg-gradient-to-r from-[#AC9262]/25 via-[#906D2D]/30 to-[#AC9262]/25 dark:from-[#C5A059]/30 dark:via-[#D4AF37]/50 dark:to-[#C5A059]/30 blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse pointer-events-none" />

              {/* Rotating hairline border glow with responsive bounded sizes */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 mx-auto rounded-full p-1 bg-gradient-to-tr from-[#906D2D] via-[#AC9262] to-[#C8B696] dark:from-[#967942] dark:via-[#D4AF37] dark:to-[#C5A059] shadow-[0_16px_45px_rgba(74,63,53,0.1)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.95)]">
                {/* Inner circular clipping stage */}
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#0A0A0D] border-2 border-[#C8B696]/60 dark:border-[#121217] flex items-center justify-center p-2.5 sm:p-3 relative shadow-inner">
                  <img
                    src={boutiqueImage}
                    alt={title}
                    className="w-full h-full object-cover object-center rounded-full select-none group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Subtle inner circular shadow */}
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_24px_rgba(0,0,0,0.06)] pointer-events-none" />
                </div>
              </div>

              {/* Hallmark Badge with crisp light luxury frame */}
              <div className="absolute -bottom-3 inset-x-0 flex justify-center">
                <span className="px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/95 dark:bg-[#0E0E14] border border-[#AC9262] dark:border-[#C5A059]/40 text-[10px] sm:text-xs font-cinzel text-[#906D2D] dark:text-[#D4AF37] tracking-[0.2em] uppercase shadow-md font-bold whitespace-nowrap">
                  TEHRAN GRAND BAZAAR
                </span>
              </div>
            </div>
          </div>

          {/* Information & Visiting Hours: Below image on mobile/tablet (order-2), Left on desktop (order-1 lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-start order-2 lg:order-1 w-full">
            <div className="inline-flex items-center gap-2 mb-3 justify-center lg:justify-start">
              <MapPin className="w-4 h-4 text-[#906D2D] dark:text-[#E1C58F] shrink-0" />
              <span className="font-cinzel text-xs sm:text-sm text-[#906D2D] dark:text-[#C5A059] tracking-[0.3em] uppercase font-bold">
                VISITING OUR ATELIER
              </span>
            </div>

            {/* Persian Title: جواهری سعیدنیا */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-persian-heading text-[#1F1A16] dark:text-[#FAF8F3] mb-4 sm:mb-5 tracking-tight leading-tight">
              {title}
            </h2>

            {/* Main description paragraph: Deep Brown for high contrast legibility */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#4A3F35] dark:text-[#EDE8DF] font-persian-body leading-[2.1] sm:leading-[2.2] mb-6 sm:mb-8 max-w-xl font-normal">
              {description}
            </p>

            {/* Visiting hours box: Soft luxury card with warm light cream background and gold accents */}
            <div className="w-full max-w-xl p-5 sm:p-6 md:p-7 rounded-sm bg-[#FAF8F5] dark:bg-[#151413]/95 border border-[#C8B696] dark:border-[#C5A059]/30 shadow-[0_8px_24px_rgba(74,63,53,0.06)] dark:shadow-none mb-6 sm:mb-8 text-start backdrop-blur-sm">
              <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-[#C8B696]/40 dark:border-[#C5A059]/25 text-[#906D2D] dark:text-[#E1C58F]">
                <Clock className="w-4 h-4" />
                <h3 className="font-persian-heading font-bold text-base sm:text-lg text-[#1F1A16] dark:text-[#FAF8F3]">
                  {hoursTitle}
                </h3>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm md:text-base font-persian-body text-[#4A3F35] dark:text-[#EDE8DF] font-medium leading-relaxed">
                {hoursText.split('\n').map((line, idx) => (
                  <p key={idx} className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#906D2D] dark:bg-[#E1C58F] flex-shrink-0" />
                    <span>{line}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Action buttons with light luxury palette */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-[#906D2D] hover:bg-[#785922] text-white border border-[#AC9262] dark:bg-gradient-to-b dark:from-[#C5A059] dark:to-[#A9874F] dark:hover:from-[#E1C58F] dark:hover:to-[#C5A059] dark:text-[#090909] dark:font-semibold text-xs sm:text-sm font-persian-nav font-medium rounded-sm transition-all shadow-md active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>{lang === 'fa' ? 'مسیریابی و نشانی گالری' : 'Directions & Map'}</span>
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-white hover:bg-[#FAF8F5] text-[#1F1A16] border border-[#AC9262] hover:border-[#906D2D] dark:bg-[#151413] dark:hover:bg-[#211E1A] dark:text-[#EDE8DF] dark:hover:text-[#E1C58F] dark:border-[#C5A059]/30 text-xs sm:text-sm font-persian-nav rounded-sm transition-all shadow-sm active:scale-95 font-medium"
              >
                <PhoneCall className="w-4 h-4 text-[#906D2D] dark:text-[#C5A059]" />
                <span>{lang === 'fa' ? 'تماس با سالن' : 'Contact Atelier'}</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

