import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { safeParseJsonResponse } from '../../lib/api';
import { MediaLibraryModal } from './MediaLibraryModal';
import type { LatestCreationsSettings, BoutiqueSectionSettings } from '../../types';
import {
  Sparkles,
  Save,
  Check,
  Eye,
  Clock,
  MapPin,
  MoveHorizontal,
  Sliders,
  ShieldCheck,
  Image as ImageIcon,
  RotateCw,
} from 'lucide-react';

export const HomepageTab: React.FC = () => {
  const { settings, token, refreshData, showToast } = useApp();
  const [saving, setSaving] = useState(false);
  const [isBoutiqueMediaOpen, setIsBoutiqueMediaOpen] = useState(false);

  // 1. Hero draft
  const [heroDraft, setHeroDraft] = useState(settings?.hero || {
    imageUrl: '/images/saeednia_hero_jewel_1788961889341.jpg',
    titleFa: 'زیبایی، در ماندگاریِ یک انتخاب',
    titleEn: 'Timeless Artistry, Enduring Brilliance',
    subtitleFa: 'جواهری سعیدنیا • بازار بزرگ تهران',
    subtitleEn: 'Saeednia High Jewellery • Grand Bazaar Tehran',
    descriptionFa: '',
    descriptionEn: '',
    ctaPrimaryFa: 'مشاهده جواهرات',
    ctaPrimaryEn: 'Explore Jewellery',
    ctaSecondaryFa: 'تماس و نشانی گالری',
    ctaSecondaryEn: 'Contact & Gallery',
  });

  // 2. Latest Creations Showcase draft
  const [latestDraft, setLatestDraft] = useState<LatestCreationsSettings>(settings?.latestCreations || {
    enabled: true,
    titleFa: 'جدیدترین آثار جواهری سعیدنیا',
    titleEn: 'Latest Saeednia High Jewellery',
    subtitleFa: 'شاهکارهای زرگری و برلیان‌های شناسنامه‌دار',
    subtitleEn: 'Masterpieces of Craftsmanship & Certified Gems',
    autoScroll: true,
    direction: 'rtl',
    speed: 'medium',
    gap: 24,
    cardsVisibleDesktop: 3,
    cardsVisibleMobile: 1.2,
    pauseOnHover: true,
    pauseOnInteract: true,
  });

  // 3. Boutique Visit & Physical Store draft
  const [boutiqueDraft, setBoutiqueDraft] = useState<BoutiqueSectionSettings>(settings?.boutiqueSection || {
    enabled: true,
    titleFa: 'جواهری سعیدنیا',
    titleEn: 'Saeednia High Jewellery Boutique',
    descriptionFa: 'برای دیدار از نزدیک و مشاهده آثار جواهری سعیدنیا، از حضور شما در فروشگاه خوشحال می‌شویم.',
    descriptionEn: 'We look forward to welcoming you to our boutique to experience Saeednia creations in person.',
    hoursTitleFa: 'ساعات مراجعه حضوری',
    hoursTitleEn: 'Boutique Visiting Hours',
    hoursFa: `شنبه تا چهارشنبه: ساعت ۱۰ تا ۱۶\nپنجشنبه: ساعت ۱۰ تا ۱۵\nجمعه: تعطیل`,
    hoursEn: `Saturday to Wednesday: 10:00 – 16:00\nThursday: 10:00 – 15:00\nFriday: Closed`,
    imageUrl: '/images/7.png',
    imageSize: 'normal',
  });

  // 4. Heritage section draft
  const [heritageDraft, setHeritageDraft] = useState({
    titleFa: settings?.about?.headlineFa || '«اصالت و تجربه ما»',
    titleEn: settings?.about?.headlineEn || 'Heritage & 30 Years of Experience',
    textFa: settings?.about?.quoteFa || '«سی سال تجربه، حاصل سال‌ها دقت، شناخت و احترام به هنر جواهرسازی است. در جواهری سعیدنیا، هر انتخاب با نگاهی به ظرافت، کیفیت و ماندگاری انجام می‌شود؛ زیرا باور داریم ارزش یک جواهر، تنها در درخشش آن نیست، بلکه در اصالتی است که با خود همراه دارد.»',
    textEn: settings?.about?.quoteEn || '"Thirty years of dedication, craftsmanship and reverence for haute joaillerie. At Saeednia Jewellery, every masterpiece embodies generational refinement and lasting distinction."',
  });

  // 5. Sections visibility toggles
  const [visibilityDraft, setVisibilityDraft] = useState({
    hero: settings?.sectionsVisibility?.hero !== false,
    categories: settings?.sectionsVisibility?.categories !== false,
    heritage: settings?.sectionsVisibility?.heritage !== false,
  });

  useEffect(() => {
    if (settings) {
      if (settings.hero) setHeroDraft(settings.hero);
      if (settings.latestCreations) setLatestDraft(settings.latestCreations);
      if (settings.boutiqueSection) setBoutiqueDraft(settings.boutiqueSection);
      if (settings.about) {
        setHeritageDraft({
          titleFa: settings.about.headlineFa || '«اصالت و تجربه ما»',
          titleEn: settings.about.headlineEn || 'Heritage & 30 Years of Experience',
          textFa: settings.about.quoteFa || '«سی سال تجربه، حاصل سال‌ها دقت، شناخت و احترام به هنر جواهرسازی است. در جواهری سعیدنیا، هر انتخاب با نگاهی به ظرافت، کیفیت و ماندگاری انجام می‌شود؛ زیرا باور داریم ارزش یک جواهر، تنها در درخشش آن نیست، بلکه در اصالتی است که با خود همراه دارد.»',
          textEn: settings.about.quoteEn || '"Thirty years of dedication, craftsmanship and reverence for haute joaillerie. At Saeednia Jewellery, every masterpiece embodies generational refinement and lasting distinction."',
        });
      }
      setVisibilityDraft({
        hero: settings.sectionsVisibility?.hero !== false,
        categories: settings.sectionsVisibility?.categories !== false,
        heritage: settings.sectionsVisibility?.heritage !== false,
      });
    }
  }, [settings]);

  const handleSaveHomepage = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const payload = {
        hero: heroDraft,
        latestCreations: latestDraft,
        boutiqueSection: boutiqueDraft,
        sectionsVisibility: {
          ...(settings?.sectionsVisibility || {}),
          ...visibilityDraft,
        },
        about: {
          ...(settings?.about || {}),
          headlineFa: heritageDraft.titleFa,
          headlineEn: heritageDraft.titleEn,
          quoteFa: heritageDraft.textFa,
          quoteEn: heritageDraft.textEn,
        },
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const parsed = await safeParseJsonResponse(res);
      if (!parsed.ok) throw new Error(parsed.errorMessage || 'خطا در ذخیره تنظیمات صفحه اصلی');
      showToast('تنظیمات صفحه اصلی با موفقیت ذخیره شد', 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-start pb-12">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#C5A059]/20 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-persian-heading text-[#EDE8DF]">
            مدیریت کامل بخش‌های صفحه اصلی
          </h2>
          <p className="text-xs text-[#8C8880] mt-1 font-persian-body">
            کنترل بدون کدنویسی تمام بخش‌های صفحه نخست: Hero، جدیدترین آثار، اصالت و تجربه، و مراجعه حضوری.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveHomepage}
          disabled={saving}
          className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] disabled:bg-[#C5A059]/50 text-[#0A0A0B] text-xs font-semibold font-persian-nav rounded-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'در حال ذخیره...' : 'ذخیره تمام تغییرات صفحه اصلی'}</span>
        </button>
      </div>

      {/* =========================================================================
          MODULE 0: HERO SECTION & PRIMARY/SECONDARY CTAS
         ========================================================================= */}
      <div className="p-6 bg-[#0E0E14] border border-[#C5A059]/30 rounded-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#C5A059]/15">
          <div className="w-8 h-8 rounded-sm bg-[#171720] border border-[#C5A059]/25 flex items-center justify-center text-[#C5A059]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#EDE8DF] font-persian-heading">
              بخش اول صفحه اصلی (دکمه‌های Hero و نمایش بخش‌ها)
            </h3>
            <p className="text-[11px] text-[#8C8880]">
              تنظیم متن دکمه‌های دعوت به اقدام در بنر اصلی و کنترل فعال‌بودن بخش‌های صفحه نخست (تصاویر رسمی بنر در دو تم تیره و روشن ثابت هستند)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">دکمه اصلی (فارسی)</label>
            <input
              type="text"
              value={heroDraft.ctaPrimaryFa || ''}
              onChange={(e) => setHeroDraft({ ...heroDraft, ctaPrimaryFa: e.target.value })}
              placeholder="مشاهده جواهرات"
              className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">Primary CTA (English)</label>
            <input
              type="text"
              dir="ltr"
              value={heroDraft.ctaPrimaryEn || ''}
              onChange={(e) => setHeroDraft({ ...heroDraft, ctaPrimaryEn: e.target.value })}
              placeholder="Explore Jewellery"
              className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">دکمه دوم (فارسی)</label>
            <input
              type="text"
              value={heroDraft.ctaSecondaryFa || ''}
              onChange={(e) => setHeroDraft({ ...heroDraft, ctaSecondaryFa: e.target.value })}
              placeholder="تماس و نشانی گالری"
              className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">Secondary CTA (English)</label>
            <input
              type="text"
              dir="ltr"
              value={heroDraft.ctaSecondaryEn || ''}
              onChange={(e) => setHeroDraft({ ...heroDraft, ctaSecondaryEn: e.target.value })}
              placeholder="Contact & Gallery"
              className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#C5A059]/15 flex flex-wrap gap-6 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibilityDraft.hero}
              onChange={(e) => setVisibilityDraft({ ...visibilityDraft, hero: e.target.checked })}
              className="w-4 h-4 rounded border-[#C5A059]/30 bg-[#0A0A0D] text-[#C5A059] focus:ring-0"
            />
            <span className="text-[#EDE8DF]">نمایش بنر اصلی (Hero)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibilityDraft.categories}
              onChange={(e) => setVisibilityDraft({ ...visibilityDraft, categories: e.target.checked })}
              className="w-4 h-4 rounded border-[#C5A059]/30 bg-[#0A0A0D] text-[#C5A059] focus:ring-0"
            />
            <span className="text-[#EDE8DF]">نمایش نوار دسته‌بندی‌ها (Marquee)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibilityDraft.heritage}
              onChange={(e) => setVisibilityDraft({ ...visibilityDraft, heritage: e.target.checked })}
              className="w-4 h-4 rounded border-[#C5A059]/30 bg-[#0A0A0D] text-[#C5A059] focus:ring-0"
            />
            <span className="text-[#EDE8DF]">نمایش بخش «اصالت و تجربه ما»</span>
          </label>
        </div>
      </div>

      {/* =========================================================================
          MODULE 1: LATEST CREATIONS SHOWCASE SETTINGS
         ========================================================================= */}
      <div className="p-6 bg-[#0E0E14] border border-[#C5A059]/30 rounded-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#C5A059]/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#171720] border border-[#C5A059]/25 flex items-center justify-center text-[#C5A059]">
              <MoveHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#EDE8DF] font-persian-heading">
                تنظیمات نمایشگر افقی «جدیدترین آثار»
              </h3>
              <p className="text-[11px] text-[#8C8880]">
                کنترل حرکت پیوسته، سرعت، جهت و واکنش به ماوس و لمس
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-[#EDE8DF] font-persian-nav font-medium">فعال بودن بخش</span>
            <input
              type="checkbox"
              checked={latestDraft.enabled}
              onChange={(e) => setLatestDraft({ ...latestDraft, enabled: e.target.checked })}
              className="w-4 h-4 rounded border-[#C5A059]/30 bg-[#0A0A0D] text-[#C5A059] focus:ring-0"
            />
          </label>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">عنوان فارسی بخش</label>
            <input
              type="text"
              value={latestDraft.titleFa}
              onChange={(e) => setLatestDraft({ ...latestDraft, titleFa: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">عنوان انگلیسی بخش</label>
            <input
              type="text"
              value={latestDraft.titleEn}
              onChange={(e) => setLatestDraft({ ...latestDraft, titleEn: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">توضیح زیر عنوان فارسی</label>
            <input
              type="text"
              value={latestDraft.subtitleFa || ''}
              onChange={(e) => setLatestDraft({ ...latestDraft, subtitleFa: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">توضیح زیر عنوان انگلیسی</label>
            <input
              type="text"
              value={latestDraft.subtitleEn || ''}
              onChange={(e) => setLatestDraft({ ...latestDraft, subtitleEn: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>

        {/* Carousel Mechanics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#0A0A0D] border border-[#C5A059]/15 rounded-sm">
          {/* Direction */}
          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">جهت حرکت کارت‌ها</label>
            <select
              value={latestDraft.direction}
              onChange={(e) => setLatestDraft({ ...latestDraft, direction: e.target.value as 'rtl' | 'ltr' })}
              className="w-full px-3 py-2 bg-[#121217] border border-[#C5A059]/20 text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            >
              <option value="rtl">از راست به چپ (پیشنهادی برای فارسی)</option>
              <option value="ltr">از چپ به راست</option>
            </select>
          </div>

          {/* Speed */}
          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">سرعت حرکت</label>
            <select
              value={String(latestDraft.speed)}
              onChange={(e) => setLatestDraft({ ...latestDraft, speed: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#121217] border border-[#C5A059]/20 text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            >
              <option value="slow">آهسته و آرام (بسیار لوکس)</option>
              <option value="medium">متوسط استاندارد</option>
              <option value="fast">سریع</option>
            </select>
          </div>

          {/* Card Gap */}
          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">فاصله بین کارت‌ها (پیکسل)</label>
            <input
              type="number"
              min="12"
              max="64"
              value={latestDraft.gap}
              onChange={(e) => setLatestDraft({ ...latestDraft, gap: Number(e.target.value) || 24 })}
              className="w-full px-3 py-2 bg-[#121217] border border-[#C5A059]/20 text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            />
          </div>

          {/* Auto Scroll Toggle */}
          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">حرکت خودکار پیوسته</label>
            <select
              value={latestDraft.autoScroll ? 'true' : 'false'}
              onChange={(e) => setLatestDraft({ ...latestDraft, autoScroll: e.target.value === 'true' })}
              className="w-full px-3 py-2 bg-[#121217] border border-[#C5A059]/20 text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            >
              <option value="true">فعال (پیوسته و خودکار)</option>
              <option value="false">غیرفعال (گالری پیمایش دستی)</option>
            </select>
          </div>

          {/* Hover Text & Overlay Theme Toggle */}
          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">رنگ متن هنگام هاور روی عکس اثر</label>
            <select
              value={latestDraft.hoverTextTheme || 'light'}
              onChange={(e) => setLatestDraft({ ...latestDraft, hoverTextTheme: e.target.value as 'light' | 'dark' })}
              className="w-full px-3 py-2 bg-[#121217] border border-[#C5A059]/20 text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            >
              <option value="light">متن روشن و طلایی لوکس (مشابه تم تیره - پیش‌فرض)</option>
              <option value="dark">متن تیره با هاله روشن (Dark on Light)</option>
            </select>
          </div>
        </div>

        {/* Interaction Behavior checkboxes */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#EDE8DF]">
            <input
              type="checkbox"
              checked={latestDraft.pauseOnHover}
              onChange={(e) => setLatestDraft({ ...latestDraft, pauseOnHover: e.target.checked })}
              className="w-4 h-4 rounded border-[#C5A059]/30 bg-[#0A0A0D] text-[#C5A059] focus:ring-0"
            />
            <span>توقف خودکار حرکت با قرار گرفتن ماوس روی کارت‌ها (Pause on Hover)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#EDE8DF]">
            <input
              type="checkbox"
              checked={latestDraft.pauseOnInteract}
              onChange={(e) => setLatestDraft({ ...latestDraft, pauseOnInteract: e.target.checked })}
              className="w-4 h-4 rounded border-[#C5A059]/30 bg-[#0A0A0D] text-[#C5A059] focus:ring-0"
            />
            <span>توقف هنگام تعامل لمسی یا درگ روی موبایل و دسکتاپ</span>
          </label>
        </div>
      </div>

      {/* =========================================================================
          MODULE 2: PHYSICAL BOUTIQUE VISIT & HOURS SECTION
         ========================================================================= */}
      <div className="p-6 bg-[#0E0E14] border border-[#C5A059]/30 rounded-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#C5A059]/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#171720] border border-[#C5A059]/25 flex items-center justify-center text-[#C5A059]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#EDE8DF] font-persian-heading">
                بخش اطلاع‌رسانی مراجعه حضوری و نمای مغازه
              </h3>
              <p className="text-[11px] text-[#8C8880]">
                تنظیم متن دعوت به فروشگاه، ساعات کاری هفتگی و تصویر دایره‌ای نمای سالن
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-[#EDE8DF] font-persian-nav font-medium">فعال بودن بخش</span>
            <input
              type="checkbox"
              checked={boutiqueDraft.enabled}
              onChange={(e) => setBoutiqueDraft({ ...boutiqueDraft, enabled: e.target.checked })}
              className="w-4 h-4 rounded border-[#C5A059]/30 bg-[#0A0A0D] text-[#C5A059] focus:ring-0"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form fields (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">عنوان بخش (فارسی)</label>
                <input
                  type="text"
                  value={boutiqueDraft.titleFa}
                  onChange={(e) => setBoutiqueDraft({ ...boutiqueDraft, titleFa: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">عنوان بخش (انگلیسی)</label>
                <input
                  type="text"
                  value={boutiqueDraft.titleEn}
                  onChange={(e) => setBoutiqueDraft({ ...boutiqueDraft, titleEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">متن اصلی دعوت به فروشگاه (فارسی)</label>
              <textarea
                rows={2}
                value={boutiqueDraft.descriptionFa}
                onChange={(e) => setBoutiqueDraft({ ...boutiqueDraft, descriptionFa: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">متن اصلی دعوت به فروشگاه (انگلیسی)</label>
              <textarea
                rows={2}
                value={boutiqueDraft.descriptionEn}
                onChange={(e) => setBoutiqueDraft({ ...boutiqueDraft, descriptionEn: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none resize-none leading-relaxed"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">ساعات مراجعه حضوری (فارسی - خط به خط)</label>
                <textarea
                  rows={4}
                  value={boutiqueDraft.hoursFa}
                  onChange={(e) => setBoutiqueDraft({ ...boutiqueDraft, hoursFa: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">ساعات مراجعه حضوری (انگلیسی - خط به خط)</label>
                <textarea
                  rows={4}
                  value={boutiqueDraft.hoursEn}
                  onChange={(e) => setBoutiqueDraft({ ...boutiqueDraft, hoursEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none leading-relaxed"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-[#A8A49C] font-medium">آدرس تصویر نمای مغازه / بوتیک (URL یا مسیر آپلود)</label>
                <button
                  type="button"
                  onClick={() => setIsBoutiqueMediaOpen(true)}
                  className="px-2.5 py-1 bg-[#1C1C24] hover:bg-[#C5A059] text-[#EDE8DF] hover:text-black rounded text-[11px] transition-colors flex items-center gap-1"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>انتخاب از کتابخانه تصاویر</span>
                </button>
              </div>
              <input
                type="text"
                value={boutiqueDraft.imageUrl || ''}
                onChange={(e) => setBoutiqueDraft({ ...boutiqueDraft, imageUrl: e.target.value })}
                placeholder="/images/7.png یا لینک تصویر آپلود شده"
                className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>

          {/* Circular Frame Live Preview (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-[#08080A] border border-[#C5A059]/20 rounded-sm">
            <span className="text-xs text-[#C5A059] font-cinzel tracking-wider uppercase mb-4">
              پیش‌نمایش قاب دایره‌ای
            </span>

            <div className="relative w-44 h-44 rounded-full p-1 bg-gradient-to-tr from-[#967942] via-[#D4AF37] to-[#C5A059] shadow-xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0E0E14] flex items-center justify-center p-2">
                <img
                  src={boutiqueDraft.imageUrl || '/images/7.png'}
                  alt="نمای مغازه"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            <span className="text-[11px] text-[#8C8880] mt-4 text-center">
              قاب طلایی دارای انیمیشن نوری ملایم در صفحه سایت است
            </span>
          </div>

        </div>
      </div>

      {/* =========================================================================
          MODULE 3: HERITAGE & EXPERIENCE SECTION («اصالت و تجربه ما»)
         ========================================================================= */}
      <div className="p-6 bg-[#0E0E14] border border-[#C5A059]/30 rounded-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#C5A059]/15">
          <div className="w-8 h-8 rounded-sm bg-[#171720] border border-[#C5A059]/25 flex items-center justify-center text-[#C5A059]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#EDE8DF] font-persian-heading">
              بخش «اصالت و تجربه ما» (روایت ۳۰ سال تجربه زرگری)
            </h3>
            <p className="text-[11px] text-[#8C8880]">
              متن اصلی برندینگ و فلسفه زرگری جواهری سعیدنیا در بازار بزرگ تهران
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">عنوان فارسی</label>
            <input
              type="text"
              value={heritageDraft.titleFa}
              onChange={(e) => setHeritageDraft({ ...heritageDraft, titleFa: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">عنوان انگلیسی</label>
            <input
              type="text"
              value={heritageDraft.titleEn}
              onChange={(e) => setHeritageDraft({ ...heritageDraft, titleEn: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">متن پیام اصالت برند (فارسی)</label>
          <textarea
            rows={3}
            value={heritageDraft.textFa}
            onChange={(e) => setHeritageDraft({ ...heritageDraft, textFa: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">متن پیام اصالت برند (انگلیسی)</label>
          <textarea
            rows={3}
            value={heritageDraft.textEn}
            onChange={(e) => setHeritageDraft({ ...heritageDraft, textEn: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none leading-relaxed"
            dir="ltr"
          />
        </div>
      </div>

      <MediaLibraryModal
        isOpen={isBoutiqueMediaOpen}
        onClose={() => setIsBoutiqueMediaOpen(false)}
        mode="select-single"
        initialSelected={boutiqueDraft.imageUrl}
        onSelect={(url) => {
          if (typeof url === 'string') {
            setBoutiqueDraft((prev) => ({ ...prev, imageUrl: url }));
          }
        }}
      />

    </div>
  );
};
