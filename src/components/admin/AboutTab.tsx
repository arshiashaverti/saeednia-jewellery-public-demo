import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Star,
  Tablet,
  Trash2,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { safeParseJsonResponse } from '../../lib/api';
import type {
  AboutGalleryAspectRatio,
  AboutGalleryItem,
  AboutGalleryItemFit,
  AboutGalleryPlacement,
  AboutGallerySettings,
  AboutSettings,
  MediaAsset,
} from '../../types';
import {
  reorderAboutGalleryItems,
  resolveAboutGallerySettings,
} from '../../utils/aboutGallery';
import { AboutGallerySection } from '../AboutGallerySection';
import { AdminModal } from './AdminModal';
import { MediaLibraryModal } from './MediaLibraryModal';

const resolveAboutStoryText = (
  storyArr: string[] | undefined,
  fallbackDesc: string | undefined,
  defaultText: string
): string => {
  if (Array.isArray(storyArr) && storyArr.length > 0) {
    return storyArr.filter((p) => p && p.trim()).join('\n\n');
  }
  if (fallbackDesc && fallbackDesc.trim()) {
    return fallbackDesc.trim();
  }
  return defaultText;
};

const splitParagraphs = (raw: string): string[] =>
  String(raw || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

const MAX_CLIENT_BYTES = 15 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const AboutTab: React.FC = () => {
  const { settings, media, token, refreshData, refreshMedia, showToast } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'story' | 'gallery'>('story');

  const [titleFa, setTitleFa] = useState(settings?.about?.titleFa || 'درباره سعیدنیا');
  const [headlineFa, setHeadlineFa] = useState(settings?.about?.headlineFa || '');
  const [descriptionFa, setDescriptionFa] = useState(() =>
    resolveAboutStoryText(
      settings?.about?.storyFa,
      settings?.about?.descriptionFa,
      'جواهری سعیدنیا در بازار بزرگ تهران، تجلی سال‌ها تجربه، اصالت و پیوند هنر زرگری با کمیاب‌ترین گوهرهاست.'
    )
  );
  const [quoteFa, setQuoteFa] = useState(settings?.about?.quoteFa || '');

  const [titleEn, setTitleEn] = useState(settings?.about?.titleEn || 'About Saeednia');
  const [headlineEn, setHeadlineEn] = useState(settings?.about?.headlineEn || '');
  const [descriptionEn, setDescriptionEn] = useState(() =>
    resolveAboutStoryText(
      settings?.about?.storyEn,
      settings?.about?.descriptionEn,
      'Saeednia High Jewellery at Tehran Grand Bazaar represents generations of artisanal mastery, rare gemstones, and timeless refinement.'
    )
  );
  const [quoteEn, setQuoteEn] = useState(settings?.about?.quoteEn || '');

  const [galleryDraft, setGalleryDraft] = useState<AboutGallerySettings>(() =>
    resolveAboutGallerySettings(settings?.about)
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerKey, setMediaPickerKey] = useState(0);
  const [deleteTargetItem, setDeleteTargetItem] = useState<AboutGalleryItem | null>(null);
  const [brokenPreviewIds, setBrokenPreviewIds] = useState<Record<string, boolean>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Live Preview Modal state (never auto-saves)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewLang, setPreviewLang] = useState<'fa' | 'en'>('fa');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');

  const directUploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings?.about) {
      setTitleFa(settings.about.titleFa || 'درباره سعیدنیا');
      setHeadlineFa(settings.about.headlineFa || '');
      setDescriptionFa(
        resolveAboutStoryText(settings.about.storyFa, settings.about.descriptionFa, '')
      );
      setQuoteFa(settings.about.quoteFa || '');
      setTitleEn(settings.about.titleEn || 'About Saeednia');
      setHeadlineEn(settings.about.headlineEn || '');
      setDescriptionEn(
        resolveAboutStoryText(settings.about.storyEn, settings.about.descriptionEn, '')
      );
      setQuoteEn(settings.about.quoteEn || '');
      setGalleryDraft(resolveAboutGallerySettings(settings.about));
    }
  }, [settings?.about]);

  const activeMediaByUrl = useMemo(() => {
    const map = new Map<string, MediaAsset>();
    media.forEach((asset) => {
      if (!asset.isDeleted && asset.url) {
        map.set(asset.url, asset);
      }
    });
    return map;
  }, [media]);

  const activeMediaById = useMemo(() => {
    const map = new Map<string, MediaAsset>();
    media.forEach((asset) => {
      if (!asset.isDeleted && asset.id) {
        map.set(asset.id, asset);
      }
    });
    return map;
  }, [media]);

  const isManagedAssetMissing = (item: AboutGalleryItem): boolean => {
    if (brokenPreviewIds[item.id]) return true;
    if (item.mediaId && media.length > 0 && !activeMediaById.has(item.mediaId) && !activeMediaByUrl.has(item.url)) {
      return true;
    }
    const isManagedPath =
      item.url.startsWith('/uploads/') ||
      item.url.includes('/storage/v1/object/') ||
      item.url.includes('/api/media/');
    if (isManagedPath && media.length > 0 && !activeMediaByUrl.has(item.url)) {
      return true;
    }
    return false;
  };

  const buildDraftAboutPayload = (): AboutSettings => {
    const storyFa = splitParagraphs(descriptionFa);
    const storyEn = splitParagraphs(descriptionEn);
    const normalizedItems = galleryDraft.items.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    return {
      ...(settings?.about || {}),
      titleFa: titleFa.trim(),
      headlineFa: headlineFa.trim(),
      descriptionFa: storyFa.join('\n\n'),
      storyFa,
      quoteFa: quoteFa.trim(),
      titleEn: titleEn.trim(),
      headlineEn: headlineEn.trim(),
      descriptionEn: storyEn.join('\n\n'),
      storyEn,
      quoteEn: quoteEn.trim(),
      gallery: {
        ...galleryDraft,
        titleFa: galleryDraft.titleFa.trim(),
        titleEn: galleryDraft.titleEn.trim(),
        subtitleFa: (galleryDraft.subtitleFa || '').trim(),
        subtitleEn: (galleryDraft.subtitleEn || '').trim(),
        items: normalizedItems,
      },
    };
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token || saving) return;

    if (!titleFa.trim() || !titleEn.trim()) {
      showToast('عنوان فارسی و انگلیسی صفحه درباره ما الزامی است.', 'error');
      setActiveSubTab('story');
      return;
    }

    if (!descriptionFa.trim() || !descriptionEn.trim()) {
      showToast('متن روایت فارسی و انگلیسی درباره ما نباید خالی باشد.', 'error');
      setActiveSubTab('story');
      return;
    }

    setSaving(true);
    try {
      const updatedAbout = buildDraftAboutPayload();
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ about: updatedAbout }),
      });

      const parsed = await safeParseJsonResponse(res);
      if (!parsed.ok) {
        throw new Error(parsed.errorMessage || 'خطا در ذخیره اطلاعات درباره ما و گالری');
      }

      showToast('تنظیمات صفحه درباره ما و گالری تصاویر با موفقیت ذخیره شد', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err?.message || 'خطا در به‌روزرسانی محتوای درباره سعیدنیا', 'error');
    } finally {
      setSaving(false);
    }
  };

  const appendUrlsToGallery = (urls: string[]) => {
    if (!Array.isArray(urls) || urls.length === 0) return;

    setGalleryDraft((prev) => {
      const existingUrls = new Set(prev.items.map((item) => item.url));
      const newItems: AboutGalleryItem[] = [];
      let skipped = 0;

      urls.forEach((rawUrl, i) => {
        const cleanUrl = String(rawUrl || '').trim();
        if (!cleanUrl) return;
        if (existingUrls.has(cleanUrl)) {
          skipped += 1;
          return;
        }
        existingUrls.add(cleanUrl);
        const asset = activeMediaByUrl.get(cleanUrl);
        newItems.push({
          id: `about-gal-${Date.now()}-${prev.items.length + i + 1}`,
          mediaId: asset?.id,
          url: cleanUrl,
          altFa: asset?.altTextFa || asset?.name || 'تصویر گالری جواهری سعیدنیا',
          altEn: asset?.altTextEn || asset?.name || 'Saeednia Jewellery Gallery',
          titleFa: '',
          titleEn: '',
          captionFa: asset?.caption || '',
          captionEn: '',
          fit: 'inherit',
          enabled: true,
          order: prev.items.length + newItems.length + 1,
          isFeatured: false,
          createdAt: new Date().toISOString(),
        });
      });

      if (prev.items.length + newItems.length > 30) {
        showToast('حداکثر ۳۰ تصویر در گالری درباره ما مجاز است', 'error');
        return prev;
      }

      if (newItems.length > 0) {
        showToast(
          `${newItems.length} تصویر جدید به پیش‌نویس گالری اضافه شد${skipped > 0 ? ` (${skipped} مورد تکراری رد شد)` : ''}. برای انتشار، دکمه ذخیره را بزنید.`,
          'success'
        );
      } else if (skipped > 0) {
        showToast('تصاویر انتخاب‌شده از قبل در گالری وجود دارند', 'info');
      }

      return {
        ...prev,
        items: [...prev.items, ...newItems].map((it, idx) => ({ ...it, order: idx + 1 })),
      };
    });
  };

  const handleDirectUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !token) return;

    const validFiles: File[] = [];
    for (const f of Array.from(files) as File[]) {
      if (!ALLOWED_IMAGE_TYPES.has(f.type.toLowerCase())) {
        showToast(`فرمت فایل «${f.name}» مجاز نیست (فقط JPG, PNG, WebP, GIF)`, 'error');
        continue;
      }
      if (f.size > MAX_CLIENT_BYTES) {
        showToast(`حجم فایل «${f.name}» بیش از ۱۵ مگابایت است`, 'error');
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) {
      if (directUploadInputRef.current) directUploadInputRef.current.value = '';
      return;
    }

    if (galleryDraft.items.length + validFiles.length > 30) {
      showToast('حداکثر ۳۰ تصویر در گالری صفحه درباره ما مجاز است', 'error');
      if (directUploadInputRef.current) directUploadInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const uploadedAssets: MediaAsset[] = [];

      for (const file of validFiles) {
        const dataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error(`خطا در خواندن فایل ${file.name}`));
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: file.name.replace(/\.[^/.]+$/, ''),
            dataUri,
            category: 'about-gallery',
          }),
        });

        const parsed = await safeParseJsonResponse<{ asset: MediaAsset }>(res);
        if (!parsed.ok || !parsed.data?.asset) {
          throw new Error(parsed.errorMessage || `خطا در آپلود ${file.name}`);
        }
        uploadedAssets.push(parsed.data.asset);
      }

      await refreshMedia();

      setGalleryDraft((prev) => {
        const added: AboutGalleryItem[] = uploadedAssets.map((asset, idx) => ({
          id: `about-gal-${Date.now()}-${prev.items.length + idx + 1}`,
          mediaId: asset.id,
          url: asset.url,
          altFa: asset.altTextFa || asset.name || 'تصویر گالری جواهری سعیدنیا',
          altEn: asset.altTextEn || asset.name || 'Saeednia Jewellery Gallery',
          titleFa: '',
          titleEn: '',
          captionFa: '',
          captionEn: '',
          fit: 'inherit',
          enabled: true,
          order: prev.items.length + idx + 1,
          isFeatured: false,
          createdAt: asset.createdAt || new Date().toISOString(),
        }));

        return {
          ...prev,
          items: [...prev.items, ...added].map((it, idx) => ({ ...it, order: idx + 1 })),
        };
      });

      showToast(
        `${uploadedAssets.length} تصویر با موفقیت آپلود و به پیش‌نویس گالری اضافه شد. برای انتشار نهایی ذخیره کنید.`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'خطا در آپلود مستقیم تصویر', 'error');
    } finally {
      setUploading(false);
      if (directUploadInputRef.current) directUploadInputRef.current.value = '';
    }
  };

  const updateGalleryItem = (id: string, patch: Partial<AboutGalleryItem>) => {
    setGalleryDraft((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const moveGalleryItem = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= galleryDraft.items.length) return;
    setGalleryDraft((prev) => ({
      ...prev,
      items: reorderAboutGalleryItems(prev.items, index, target),
    }));
  };

  const handleConfirmRemoveGalleryItem = () => {
    if (!deleteTargetItem) return;
    const targetId = deleteTargetItem.id;
    setGalleryDraft((prev) => ({
      ...prev,
      items: prev.items
        .filter((it) => it.id !== targetId)
        .map((it, idx) => ({ ...it, order: idx + 1 })),
    }));
    setDeleteTargetItem(null);
    showToast('تصویر از گالری صفحه درباره ما حذف شد (فایل اصلی در کتابخانه رسانه حفظ می‌شود)', 'info');
  };

  const activeItemCount = galleryDraft.items.filter((it) => it.enabled !== false).length;

  return (
    <div className="space-y-6 max-w-5xl text-start pb-12">
      {/* Top Header & Sub-Tab Bar */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 p-5 sm:p-6 rounded-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5A059]/15 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-[#EDE8DF] font-vazir flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C5A059]" />
              <span>مدیریت صفحه «درباره ما» و گالری تصاویر مجموعه</span>
            </h3>
            <p className="text-xs text-[#8C8880] mt-1">
              ویرایش روایت برند سعیدنیا و مدیریت کامل گالری افقی تصاویر صفحه درباره ما با پیش‌نمایش زنده
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2 bg-[#16161D] hover:bg-[#1E1E28] border border-[#C5A059]/30 text-[#EDE8DF] text-xs font-medium rounded-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>پیش‌نمایش زنده گالری</span>
            </button>

            <button
              id="btn-admin-save-about"
              type="button"
              disabled={saving}
              onClick={() => handleSave()}
              className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] disabled:bg-[#C5A059]/50 text-[#0A0A0B] text-xs font-semibold rounded-sm flex items-center gap-2 shadow cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'در حال ذخیره...' : 'ذخیره تغییرات درباره ما و گالری'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="subtab-about-story"
            onClick={() => setActiveSubTab('story')}
            className={`px-4 py-2 text-xs font-medium rounded-sm border transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'story'
                ? 'bg-[#C5A059]/15 border-[#C5A059] text-[#D4AF37]'
                : 'bg-[#09090C] border-[#C5A059]/20 text-[#A8A49C] hover:text-[#EDE8DF]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>روایت و متون درباره ما</span>
          </button>

          <button
            type="button"
            id="subtab-about-gallery"
            onClick={() => setActiveSubTab('gallery')}
            className={`px-4 py-2 text-xs font-medium rounded-sm border transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'gallery'
                ? 'bg-[#C5A059]/15 border-[#C5A059] text-[#D4AF37]'
                : 'bg-[#09090C] border-[#C5A059]/20 text-[#A8A49C] hover:text-[#EDE8DF]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>مدیریت گالری درباره ما</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-sm bg-[#1A1A22] text-[#C5A059] tabular-nums">
              {activeItemCount} / {galleryDraft.items.length}
            </span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          SUBTAB 1: NARRATIVE & TEXT CONTENT
         ======================================================================= */}
      {activeSubTab === 'story' && (
        <form onSubmit={handleSave} className="bg-[#0D0D10] border border-[#C5A059]/20 p-6 rounded-sm space-y-5 text-xs">
          <p className="text-xs text-[#8C8880]">
            پاراگراف‌ها را با یک خط خالی از هم جدا کنید؛ تغییرات مستقیماً در صفحه «درباره ما» اعمال می‌شوند.
          </p>

          {/* Persian Section */}
          <div className="p-4 bg-[#121217] border border-[#C5A059]/15 rounded-sm space-y-3">
            <h4 className="text-xs font-semibold text-[#D4AF37] font-vazir">
              محتوای فارسی (Persian Content)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">عنوان بخش فارسی</label>
                <input
                  type="text"
                  required
                  value={titleFa}
                  onChange={(e) => setTitleFa(e.target.value)}
                  placeholder="درباره سعیدنیا"
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-vazir text-xs"
                />
              </div>
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">زیرعنوان روایت (اختیاری)</label>
                <input
                  type="text"
                  value={headlineFa}
                  onChange={(e) => setHeadlineFa(e.target.value)}
                  placeholder="سنت و هنر زرگری اصیل در بازار بزرگ تهران"
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-vazir text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#C8C4BC] mb-1 font-medium">متن کامل روایت فارسی (پاراگراف‌ها با خط خالی)</label>
              <textarea
                rows={7}
                required
                value={descriptionFa}
                onChange={(e) => setDescriptionFa(e.target.value)}
                placeholder="متن اصلی درباره تاریخچه، اصالت و اعتبار جواهری سعیدنیا در بازار بزرگ تهران..."
                className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-vazir leading-relaxed text-xs"
              />
            </div>

            <div>
              <label className="block text-[#C8C4BC] mb-1 font-medium">نقل‌قول برجسته پایین صفحه (اختیاری)</label>
              <input
                type="text"
                value={quoteFa}
                onChange={(e) => setQuoteFa(e.target.value)}
                placeholder="«جواهر واقعی، میراثی است که در گذر زمان درخشان‌تر می‌شود.»"
                className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-vazir text-xs"
              />
            </div>
          </div>

          {/* English Section */}
          <div className="p-4 bg-[#121217] border border-[#C5A059]/15 rounded-sm space-y-3">
            <h4 className="text-xs font-semibold text-[#D4AF37] font-cinzel">English Content</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">English Title</label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="About Saeednia"
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-cinzel text-xs"
                />
              </div>
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">Headline / Subtitle (Optional)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={headlineEn}
                  onChange={(e) => setHeadlineEn(e.target.value)}
                  placeholder="Heritage Craftsmanship in Tehran Grand Bazaar"
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-sans text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#C8C4BC] mb-1 font-medium">English Story Paragraphs (blank line separated)</label>
              <textarea
                rows={7}
                required
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="English text describing heritage, atelier craftsmanship, and timeless refinement..."
                className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-sans leading-relaxed text-xs"
              />
            </div>

            <div>
              <label className="block text-[#C8C4BC] mb-1 font-medium">English Highlight Quote (Optional)</label>
              <input
                type="text"
                dir="ltr"
                value={quoteEn}
                onChange={(e) => setQuoteEn(e.target.value)}
                placeholder="True jewellery is a legacy that shines brighter across generations."
                className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-sans text-xs"
              />
            </div>
          </div>
        </form>
      )}

      {/* =======================================================================
          SUBTAB 2: ABOUT GALLERY MANAGER
         ======================================================================= */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-6 text-xs">
          {/* Gallery General Display Settings */}
          <div className="bg-[#0D0D10] border border-[#C5A059]/20 p-5 sm:p-6 rounded-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C5A059]/15 pb-4">
              <div>
                <h4 className="text-sm font-semibold text-[#D4AF37] font-vazir">
                  تنظیمات کلی نمایش گالری در صفحه درباره ما
                </h4>
                <p className="text-[11px] text-[#8C8880] mt-0.5">
                  کنترل عنوان، نسبت ابعاد، محل قرارگیری در صفحه و نحوه تناسب تصاویر
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-sm bg-[#121217] border border-[#C5A059]/20">
                <input
                  type="checkbox"
                  checked={galleryDraft.enabled}
                  onChange={(e) =>
                    setGalleryDraft((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-[#C5A059]/40 bg-[#08080A] text-[#C5A059]"
                />
                <span className="text-[#EDE8DF] font-medium">فعال بودن گالری در صفحه درباره ما</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">عنوان بخش گالری (فارسی)</label>
                <input
                  type="text"
                  value={galleryDraft.titleFa}
                  onChange={(e) =>
                    setGalleryDraft((prev) => ({ ...prev, titleFa: e.target.value }))
                  }
                  placeholder="گالری تصاویر مجموعه سعیدنیا"
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-vazir text-xs"
                />
              </div>

              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">Gallery Section Title (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={galleryDraft.titleEn}
                  onChange={(e) =>
                    setGalleryDraft((prev) => ({ ...prev, titleEn: e.target.value }))
                  }
                  placeholder="Saeednia Collection Gallery"
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-cinzel text-xs"
                />
              </div>

              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">زیرعنوان گالری (فارسی - اختیاری)</label>
                <input
                  type="text"
                  value={galleryDraft.subtitleFa || ''}
                  onChange={(e) =>
                    setGalleryDraft((prev) => ({ ...prev, subtitleFa: e.target.value }))
                  }
                  placeholder="نمایی از فضای گالری و ویترین جواهری سعیدنیا"
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-vazir text-xs"
                />
              </div>

              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">Gallery Subtitle (English - Optional)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={galleryDraft.subtitleEn || ''}
                  onChange={(e) =>
                    setGalleryDraft((prev) => ({ ...prev, subtitleEn: e.target.value }))
                  }
                  placeholder="Glimpses of our boutique and craftsmanship"
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-sans text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#121217] border border-[#C5A059]/15 rounded-sm">
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">محل قرارگیری در صفحه درباره ما</label>
                <select
                  value={galleryDraft.placement}
                  onChange={(e) =>
                    setGalleryDraft((prev) => ({
                      ...prev,
                      placement: e.target.value as AboutGalleryPlacement,
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
                >
                  <option value="after_quote">پس از نقل‌قول (پیشنهادی)</option>
                  <option value="after_story">بلافاصله پس از متن روایت</option>
                  <option value="before_story">پیش از متن روایت (بالای صفحه)</option>
                  <option value="bottom">انتهای صفحه درباره ما</option>
                </select>
              </div>

              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">نسبت ابعاد قاب (Aspect Ratio)</label>
                <select
                  value={galleryDraft.aspectRatio}
                  onChange={(e) =>
                    setGalleryDraft((prev) => ({
                      ...prev,
                      aspectRatio: e.target.value as AboutGalleryAspectRatio,
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
                >
                  <option value="16:9">۱۶:۹ (عریض لوکس)</option>
                  <option value="3:2">۳:۲ (ادیتوریال متعادل)</option>
                  <option value="4:3">۴:۳ (کلاسیک)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">حالت پیش‌فرض تصویر در قاب</label>
                <select
                  value={galleryDraft.defaultObjectFit}
                  onChange={(e) =>
                    setGalleryDraft((prev) => ({
                      ...prev,
                      defaultObjectFit: e.target.value as 'cover' | 'contain',
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
                >
                  <option value="cover">پر کردن کامل کادر (Cover)</option>
                  <option value="contain">نمایش کامل تصویر بدون برش (Contain)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-[#EDE8DF]">
                <input
                  type="checkbox"
                  checked={galleryDraft.showTitles}
                  onChange={(e) =>
                    setGalleryDraft((prev) => ({ ...prev, showTitles: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-[#C5A059]/40 bg-[#08080A] text-[#C5A059]"
                />
                <span>نمایش عنوان اختیاری تصاویر در زیر قاب</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[#EDE8DF]">
                <input
                  type="checkbox"
                  checked={galleryDraft.showCaptions}
                  onChange={(e) =>
                    setGalleryDraft((prev) => ({ ...prev, showCaptions: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-[#C5A059]/40 bg-[#08080A] text-[#C5A059]"
                />
                <span>نمایش توضیح کوتاه (Caption) تصاویر</span>
              </label>
            </div>
          </div>

          {/* Add / Upload Controls */}
          <div className="bg-[#0D0D10] border border-[#C5A059]/20 p-5 sm:p-6 rounded-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5A059]/15 pb-4">
              <div>
                <h4 className="text-sm font-semibold text-[#D4AF37] font-vazir">
                  تصاویر گالری ({galleryDraft.items.length} تصویر)
                </h4>
                <p className="text-[11px] text-[#8C8880] mt-0.5">
                  ترتیب تصاویر با کشیدن و رها کردن یا دکمه‌های بالا/پایین قابل تغییر است.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={directUploadInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleDirectUploadFiles}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => directUploadInputRef.current?.click()}
                  className="px-3.5 py-2 bg-[#16161D] hover:bg-[#1E1E28] border border-[#C5A059]/30 text-[#EDE8DF] rounded-sm flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{uploading ? 'در حال آپلود...' : 'آپلود مستقیم تصویر جدید'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMediaPickerKey((k) => k + 1);
                    setIsMediaPickerOpen(true);
                  }}
                  className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] font-semibold rounded-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>انتخاب تکی یا چندتایی از کتابخانه رسانه</span>
                </button>
              </div>
            </div>

            {galleryDraft.items.length === 0 ? (
              <div className="p-8 border border-dashed border-[#C5A059]/25 bg-[#09090C] rounded-sm text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-[#C5A059]/50 mx-auto" />
                <p className="text-sm text-[#EDE8DF] font-medium font-vazir">
                  هنوز تصویری برای گالری صفحه درباره ما ثبت نشده است
                </p>
                <p className="text-xs text-[#8C8880] max-w-lg mx-auto leading-relaxed">
                  تا زمانی که هیچ تصویر فعالی در این بخش وجود نداشته باشد، هیچ کادر یا بخش خالی در صفحه عمومی «درباره ما» نمایش داده نمی‌شود.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {galleryDraft.items.map((item, index) => {
                  const missingWarning = isManagedAssetMissing(item);
                  const isDragOver = dragOverIndex === index && dragIndex !== index;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverIndex !== index) setDragOverIndex(index);
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === index) setDragOverIndex(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragIndex !== null && dragIndex !== index) {
                          setGalleryDraft((prev) => ({
                            ...prev,
                            items: reorderAboutGalleryItems(prev.items, dragIndex, index),
                          }));
                        }
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={`p-4 rounded-sm border transition-colors ${
                        isDragOver
                          ? 'border-[#D4AF37] bg-[#181510]'
                          : item.enabled
                          ? 'border-[#C5A059]/25 bg-[#121217]'
                          : 'border-[#C5A059]/10 bg-[#0B0B0F] opacity-75'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Left column: drag/reorder + thumbnail */}
                        <div className="flex items-start gap-3 shrink-0">
                          <div className="flex flex-col items-center gap-1 pt-1">
                            <span
                              title="کشیدن برای جابه‌جایی"
                              className="p-1 text-[#8C8880] hover:text-[#C5A059] cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="w-4 h-4" />
                            </span>

                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveGalleryItem(index, -1)}
                              aria-label="انتقال تصویر به بالا"
                              title="انتقال به بالا"
                              className="w-7 h-7 rounded-sm border border-[#C5A059]/20 bg-[#09090C] text-[#C8C4BC] hover:text-[#D4AF37] disabled:opacity-30 flex items-center justify-center cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              disabled={index === galleryDraft.items.length - 1}
                              onClick={() => moveGalleryItem(index, 1)}
                              aria-label="انتقال تصویر به پایین"
                              title="انتقال به پایین"
                              className="w-7 h-7 rounded-sm border border-[#C5A059]/20 bg-[#09090C] text-[#C8C4BC] hover:text-[#D4AF37] disabled:opacity-30 flex items-center justify-center cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="w-36 sm:w-44 aspect-[4/3] rounded-sm overflow-hidden border border-[#C5A059]/25 bg-[#070709] relative shrink-0">
                            <img
                              src={item.url}
                              alt={item.altFa || 'پیش‌نمایش گالری'}
                              onLoad={() => {
                                if (brokenPreviewIds[item.id]) {
                                  setBrokenPreviewIds((prev) => {
                                    const next = { ...prev };
                                    delete next[item.id];
                                    return next;
                                  });
                                }
                              }}
                              onError={() =>
                                setBrokenPreviewIds((prev) =>
                                  prev[item.id] ? prev : { ...prev, [item.id]: true }
                                )
                              }
                              className={`w-full h-full ${
                                (item.fit === 'contain' ||
                                  (item.fit === 'inherit' && galleryDraft.defaultObjectFit === 'contain'))
                                  ? 'object-contain p-1.5'
                                  : 'object-cover'
                              }`}
                            />
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] rounded-sm bg-black/80 text-[#D4AF37] border border-[#C5A059]/30 tabular-nums">
                              #{index + 1}
                            </span>
                          </div>
                        </div>

                        {/* Right column: metadata & controls */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#C5A059]/10">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                              <button
                                type="button"
                                onClick={() => updateGalleryItem(item.id, { enabled: !item.enabled })}
                                className={`px-2.5 py-1 rounded-sm border text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                                  item.enabled
                                    ? 'bg-[#C5A059]/15 border-[#C5A059]/40 text-[#D4AF37]'
                                    : 'bg-[#09090C] border-[#C5A059]/15 text-[#8C8880]'
                                }`}
                              >
                                {item.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                <span>{item.enabled ? 'فعال در سایت' : 'مخفی'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  updateGalleryItem(item.id, { isFeatured: !item.isFeatured })
                                }
                                className={`px-2.5 py-1 rounded-sm border text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                                  item.isFeatured
                                    ? 'bg-[#C5A059]/20 border-[#D4AF37]/50 text-[#D4AF37]'
                                    : 'bg-[#09090C] border-[#C5A059]/15 text-[#8C8880]'
                                }`}
                              >
                                <Star className="w-3 h-3" />
                                <span>{item.isFeatured ? 'تصویر شاخص' : 'عادی'}</span>
                              </button>

                              {missingWarning && (
                                <span className="px-2.5 py-1 rounded-sm bg-amber-950/60 border border-amber-500/40 text-amber-200 text-[11px] flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                  <span>فایل در کتابخانه رسانه یافت نشد یا لینک شکسته است</span>
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setDeleteTargetItem(item)}
                              className="px-2.5 py-1 rounded-sm border border-red-500/30 bg-red-950/30 hover:bg-red-950/60 text-red-300 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>حذف از گالری</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[#A8A49C] mb-1">متن جایگزین تصویر (Alt فارسی)</label>
                              <input
                                type="text"
                                value={item.altFa}
                                onChange={(e) =>
                                  updateGalleryItem(item.id, { altFa: e.target.value })
                                }
                                placeholder="توضیح تصویر برای سئو و دسترس‌پذیری"
                                className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[#A8A49C] mb-1">Alt Text (English)</label>
                              <input
                                type="text"
                                dir="ltr"
                                value={item.altEn || ''}
                                onChange={(e) =>
                                  updateGalleryItem(item.id, { altEn: e.target.value })
                                }
                                placeholder="Image description"
                                className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[#A8A49C] mb-1">نحوه نمایش این تصویر (Object Fit)</label>
                              <select
                                value={item.fit || 'inherit'}
                                onChange={(e) =>
                                  updateGalleryItem(item.id, {
                                    fit: e.target.value as AboutGalleryItemFit,
                                  })
                                }
                                className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm text-xs"
                              >
                                <option value="inherit">پیروی از تنظیم پیش‌فرض گالری</option>
                                <option value="cover">پر کردن کامل کادر (Cover)</option>
                                <option value="contain">نمایش کامل بدون برش (Contain)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[#A8A49C] mb-1">عنوان اختیاری تصویر (فارسی)</label>
                              <input
                                type="text"
                                value={item.titleFa || ''}
                                onChange={(e) =>
                                  updateGalleryItem(item.id, { titleFa: e.target.value })
                                }
                                placeholder="مثلاً: ویترین مرکزی گالری سعیدنیا"
                                className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[#A8A49C] mb-1">Optional Title (English)</label>
                              <input
                                type="text"
                                dir="ltr"
                                value={item.titleEn || ''}
                                onChange={(e) =>
                                  updateGalleryItem(item.id, { titleEn: e.target.value })
                                }
                                placeholder="e.g., Main Showroom Display"
                                className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[#A8A49C] mb-1">توضیح کوتاه زیر تصویر (Caption فارسی)</label>
                              <input
                                type="text"
                                value={item.captionFa || ''}
                                onChange={(e) =>
                                  updateGalleryItem(item.id, { captionFa: e.target.value })
                                }
                                placeholder="توضیح اختیاری درباره فضای گالری یا اثر"
                                className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[#A8A49C] mb-1">Optional Caption (English)</label>
                              <input
                                type="text"
                                dir="ltr"
                                value={item.captionEn || ''}
                                onChange={(e) =>
                                  updateGalleryItem(item.id, { captionEn: e.target.value })
                                }
                                placeholder="Short caption"
                                className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multi-select Media Library Modal */}
      {isMediaPickerOpen && (
        <MediaLibraryModal
          key={mediaPickerKey}
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          mode="select-multiple"
          initialSelected={[]}
          onSelect={(selected) => {
            if (Array.isArray(selected)) {
              appendUrlsToGallery(selected);
            } else if (typeof selected === 'string' && selected) {
              appendUrlsToGallery([selected]);
            }
          }}
        />
      )}

      {/* Confirm Removal from About Gallery (Preserves Media Library asset) */}
      <AdminModal
        isOpen={Boolean(deleteTargetItem)}
        onClose={() => setDeleteTargetItem(null)}
        zLevel="confirm"
        maxWidth="max-w-md"
        title="حذف تصویر از گالری درباره ما"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#EDE8DF] leading-relaxed">
            آیا از حذف این تصویر از فهرست گالری صفحه «درباره ما» مطمئن هستید؟
          </p>
          <p className="text-[#9E9A92] leading-relaxed bg-[#14141A] border border-[#C5A059]/15 p-3 rounded-sm">
            فایل اصلی تصویر در کتابخانه رسانه و فضای ذخیره‌سازی حفظ خواهد شد و برای نشر نهایی تغییر، روی دکمه «ذخیره تغییرات» کلیک کنید.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteTargetItem(null)}
              className="px-4 py-2 bg-[#16161D] hover:bg-[#1E1E28] text-[#EDE8DF] rounded-sm cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleConfirmRemoveGalleryItem}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-sm cursor-pointer"
            >
              تایید حذف از گالری
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Live Preview Modal */}
      <AdminModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="max-w-5xl"
        title="پیش‌نمایش زنده گالری صفحه درباره ما (بدون ذخیره خودکار)"
        subtitle="مشاهده خروجی واقعی گالری در نمای دسکتاپ، تبلت و موبایل پیش از ذخیره نهایی"
      >
        <div className="space-y-5">
          {/* Preview Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#121218] border border-[#C5A059]/20 rounded-sm text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewViewport('desktop')}
                className={`px-3 py-1.5 rounded-sm border flex items-center gap-1.5 cursor-pointer ${
                  previewViewport === 'desktop'
                    ? 'bg-[#C5A059] text-black border-[#C5A059] font-semibold'
                    : 'bg-[#08080A] text-[#C8C4BC] border-[#C5A059]/20'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>دسکتاپ</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewViewport('tablet')}
                className={`px-3 py-1.5 rounded-sm border flex items-center gap-1.5 cursor-pointer ${
                  previewViewport === 'tablet'
                    ? 'bg-[#C5A059] text-black border-[#C5A059] font-semibold'
                    : 'bg-[#08080A] text-[#C8C4BC] border-[#C5A059]/20'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>تبلت</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewViewport('mobile')}
                className={`px-3 py-1.5 rounded-sm border flex items-center gap-1.5 cursor-pointer ${
                  previewViewport === 'mobile'
                    ? 'bg-[#C5A059] text-black border-[#C5A059] font-semibold'
                    : 'bg-[#08080A] text-[#C8C4BC] border-[#C5A059]/20'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>موبایل</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewLang((l) => (l === 'fa' ? 'en' : 'fa'))}
                className="px-3 py-1.5 rounded-sm border border-[#C5A059]/25 bg-[#08080A] text-[#EDE8DF] cursor-pointer"
              >
                زبان: {previewLang === 'fa' ? 'فارسی (RTL)' : 'English (LTR)'}
              </button>

              <button
                type="button"
                onClick={() => setPreviewTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                className="px-3 py-1.5 rounded-sm border border-[#C5A059]/25 bg-[#08080A] text-[#EDE8DF] cursor-pointer"
              >
                تم: {previewTheme === 'dark' ? 'Obsidian Dark' : 'Ivory Light'}
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div
            className={`p-4 sm:p-8 rounded-sm border border-[#C5A059]/20 overflow-x-auto ${
              previewTheme === 'light' ? 'bg-[#FAF8F4]' : 'bg-[#0A0A0D]'
            }`}
          >
            {!galleryDraft.enabled || activeItemCount === 0 ? (
              <div className="py-12 text-center text-xs text-[#8C8880]">
                {galleryDraft.enabled
                  ? 'هیچ تصویر فعالی در گالری وجود ندارد؛ در سایت عمومی هیچ کادر خالی رندر نمی‌شود.'
                  : 'گالری در تنظیمات غیرفعال است؛ در صفحه درباره ما نمایش داده نمی‌شود.'}
              </div>
            ) : (
              <AboutGallerySection
                about={buildDraftAboutPayload()}
                lang={previewLang}
                isLight={previewTheme === 'light'}
                previewMode
                previewViewport={previewViewport}
                className="my-2"
              />
            )}
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
