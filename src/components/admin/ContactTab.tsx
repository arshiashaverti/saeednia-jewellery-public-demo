import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { safeParseJsonResponse } from '../../lib/api';
import {
  Phone,
  Plus,
  Trash2,
  Check,
  MapPin,
  MessageSquare,
  Compass,
  Navigation,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Star,
  Share2,
  AlertCircle,
  Edit2,
  ExternalLink,
  Clock,
  RefreshCw,
} from 'lucide-react';
import type {
  CustomSocialIconKey,
  PhoneContactItem,
  PhoneContactType,
  SocialMediaLink,
  SocialMediaPlatformKey,
} from '../../types';
import {
  CUSTOM_ICON_OPTIONS,
  SOCIAL_PLATFORM_CATALOG,
  formatTelHref,
  inferPhoneType,
  resolvePhoneItemsFromContact,
  resolveSocialLinksFromContact,
} from '../../utils/contactAndArticles';
import { SocialPlatformIcon } from '../SocialPlatformIcon';
import {
  buildGoogleMapsEmbedUrl,
  buildGoogleMapsExternalUrl,
  isValidCoordinates,
  parseGoogleMapsInput,
  resolveRenderableMapData,
} from '../../utils/maps';
import { getBalancedGridLayout } from '../ContactChannelsSection';

function isValidClientHttpsUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (/^(javascript|data|file|vbscript):/i.test(trimmed)) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

export const ContactTab: React.FC = () => {
  const { settings, token, refreshData, showToast } = useApp();

  // Structured Phone Numbers
  const [phoneItems, setPhoneItems] = useState<PhoneContactItem[]>([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newPhoneLabelFa, setNewPhoneLabelFa] = useState('');
  const [newPhoneType, setNewPhoneType] = useState<PhoneContactType>('landline');
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);

  // Dynamic Social Media Links
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [socialDraft, setSocialDraft] = useState<{
    platform: SocialMediaPlatformKey;
    customPlatformName: string;
    customIconKey: CustomSocialIconKey;
    displayNameFa: string;
    displayNameEn: string;
    url: string;
    shortDescriptionFa: string;
    shortDescriptionEn: string;
    enabled: boolean;
    featured: boolean;
  }>({
    platform: 'instagram',
    customPlatformName: '',
    customIconKey: 'globe',
    displayNameFa: '',
    displayNameEn: '',
    url: '',
    shortDescriptionFa: '',
    shortDescriptionEn: '',
    enabled: true,
    featured: false,
  });

  // General contact & location fields
  const [contactTextFa, setContactTextFa] = useState(
    'برای استعلام موجودی و سفارش طراحی اختصاصی، می‌توانید به‌صورت مستقیم از طریق شماره‌های تماس، شبکه‌های اجتماعی رسمی و نشانی بازار بزرگ تهران با گالری جواهری سعیدنیا در ارتباط باشید.'
  );
  const [contactTextEn, setContactTextEn] = useState(
    'For availability inquiries and bespoke jewellery commissions, connect directly with Saeednia Jewellery via phone, official social channels, or our Tehran Grand Bazaar gallery.'
  );
  const [addressFa, setAddressFa] = useState('تهران، بازار بزرگ، بازار زرگرها، جواهری سعیدنیا');
  const [addressEn, setAddressEn] = useState('Saeednia Jewellery, Zargaran Bazaar, Tehran Grand Bazaar, Iran');
  const [openingHoursFa, setOpeningHoursFa] = useState('شنبه تا چهارشنبه ۱۰:۰۰ الی ۱۸:۰۰ • پنجشنبه‌ها ۱۰:۰۰ الی ۱۴:۰۰');
  const [openingHoursEn, setOpeningHoursEn] = useState('Saturday – Wednesday: 10:00 – 18:00 • Thursday: 10:00 – 14:00');
  const [email, setEmail] = useState('');

  // WhatsApp Inquiry Template Helper
  const [whatsappDefaultMessageFa, setWhatsappDefaultMessageFa] = useState(
    'درود و احترام، جهت استعلام و اطلاعات اثر جواهری سعیدنیا پیام می‌دهم.'
  );
  const [whatsappDefaultMessageEn, setWhatsappDefaultMessageEn] = useState(
    'Hello, I would like to inquire about Saeednia Jewellery pieces.'
  );

  // Map & Navigation
  const [lat, setLat] = useState<number>(35.6744);
  const [lng, setLng] = useState<number>(51.4216);
  const [mapEmbedUrl, setMapEmbedUrl] = useState(
    'https://www.openstreetmap.org/export/embed.html?bbox=51.4166%2C35.6704%2C51.4266%2C35.6784&layer=mapnik&marker=35.6744%2C51.4216'
  );
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://maps.google.com/?q=35.6744,51.4216');
  const [wazeUrl, setWazeUrl] = useState('https://waze.com/ul?ll=35.6744,51.4216&navigate=yes');
  const [neshanUrl, setNeshanUrl] = useState('https://nshn.ir');
  const [appleMapsUrl, setAppleMapsUrl] = useState('https://maps.apple.com/?ll=35.6744,51.4216&q=Saeednia+Jewellery');
  const [openStreetMapUrl, setOpenStreetMapUrl] = useState(
    'https://www.openstreetmap.org/?mlat=35.6744&mlon=51.4216#map=17/35.6744/51.4216'
  );
  const [enabledProviders, setEnabledProviders] = useState<string[]>([
    'google_maps',
    'waze',
    'apple_maps',
    'openstreetmap',
    'neshan',
  ]);

  const [mapZoom, setMapZoom] = useState<number>(17);
  const [mapRawInput, setMapRawInput] = useState<string>('');
  const [mapValidationError, setMapValidationError] = useState<string>('');
  const [mapIframeError, setMapIframeError] = useState<boolean>(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.contact) {
      const c = settings.contact;
      setPhoneItems(resolvePhoneItemsFromContact(c));
      setSocialLinks(resolveSocialLinksFromContact(c));

      setContactTextFa(
        c.contactTextFa ||
          'برای استعلام موجودی و سفارش طراحی اختصاصی، می‌توانید به‌صورت مستقیم از طریق شماره‌های تماس، شبکه‌های اجتماعی رسمی و نشانی بازار بزرگ تهران با گالری جواهری سعیدنیا در ارتباط باشید.'
      );
      setContactTextEn(
        c.contactTextEn ||
          'For availability inquiries and bespoke jewellery commissions, connect directly with Saeednia Jewellery via phone, official social channels, or our Tehran Grand Bazaar gallery.'
      );
      setAddressFa(c.addressFa || 'تهران، بازار بزرگ، بازار زرگرها، جواهری سعیدنیا');
      setAddressEn(c.addressEn || 'Saeednia Jewellery, Zargaran Bazaar, Tehran Grand Bazaar, Iran');
      setOpeningHoursFa(c.openingHoursFa || 'شنبه تا چهارشنبه ۱۰:۰۰ الی ۱۸:۰۰ • پنجشنبه‌ها ۱۰:۰۰ الی ۱۴:۰۰');
      setOpeningHoursEn(c.openingHoursEn || 'Saturday – Wednesday: 10:00 – 18:00 • Thursday: 10:00 – 14:00');
      setEmail(c.email || '');

      setWhatsappDefaultMessageFa(
        c.whatsappDefaultMessageFa || 'درود و احترام، جهت استعلام و اطلاعات اثر جواهری سعیدنیا پیام می‌دهم.'
      );
      setWhatsappDefaultMessageEn(
        c.whatsappDefaultMessageEn || 'Hello, I would like to inquire about Saeednia Jewellery pieces.'
      );

      if (c.coordinates) {
        setLat(c.coordinates.lat);
        setLng(c.coordinates.lng);
      }
      const initialMapUrl =
        c.mapEmbedUrl ||
        'https://www.openstreetmap.org/export/embed.html?bbox=51.4166%2C35.6704%2C51.4266%2C35.6784&layer=mapnik&marker=35.6744%2C51.4216';
      setMapEmbedUrl(initialMapUrl);
      setMapRawInput(initialMapUrl);
      setMapValidationError('');
      setMapIframeError(false);
      setGoogleMapsUrl(c.googleMapsUrl || 'https://maps.google.com/?q=35.6744,51.4216');
      setWazeUrl(c.wazeUrl || 'https://waze.com/ul?ll=35.6744,51.4216&navigate=yes');
      setNeshanUrl(c.neshanUrl || 'https://nshn.ir');
      setAppleMapsUrl(c.appleMapsUrl || 'https://maps.apple.com/?ll=35.6744,51.4216&q=Saeednia+Jewellery');
      setOpenStreetMapUrl(
        c.openStreetMapUrl || 'https://www.openstreetmap.org/?mlat=35.6744&mlon=51.4216#map=17/35.6744/51.4216'
      );
      if (c.enabledNavigationProviders) {
        setEnabledProviders(c.enabledNavigationProviders);
      }
      setHasUnsavedChanges(false);
    }
  }, [settings?.contact]);

  const markDirty = () => setHasUnsavedChanges(true);

  // ---------------- Phone Number Manager Handlers ----------------
  const handleAddPhoneItem = () => {
    const trimmed = newPhoneNumber.trim();
    if (!trimmed) {
      showToast('لطفاً شماره تماس را وارد کنید', 'error');
      return;
    }
    const telHref = formatTelHref(trimmed);
    if (!telHref || telHref.replace(/\D/g, '').length < 6) {
      showToast('فرمت شماره تماس معتبر نیست (حداقل ۶ رقم)', 'error');
      return;
    }
    if (phoneItems.some((p) => p.number.trim() === trimmed)) {
      showToast('این شماره تماس قبلاً ثبت شده است', 'error');
      return;
    }
    const inferredType = newPhoneType || inferPhoneType(trimmed);
    const defaultLabelFa =
      newPhoneLabelFa.trim() ||
      (inferredType === 'mobile' ? 'تلفن همراه گالری' : inferredType === 'landline' ? 'تلفن ثابت گالری' : 'شماره تماس مستقیم');

    const next: PhoneContactItem = {
      id: `phone-${Date.now()}`,
      number: trimmed,
      displayLabelFa: defaultLabelFa,
      displayLabelEn: inferredType === 'mobile' ? 'Gallery Mobile' : inferredType === 'landline' ? 'Gallery Landline' : 'Direct Line',
      type: inferredType,
      order: phoneItems.length + 1,
      enabled: true,
    };
    setPhoneItems([...phoneItems, next]);
    setNewPhoneNumber('');
    setNewPhoneLabelFa('');
    markDirty();
  };

  const updatePhoneField = (id: string, patch: Partial<PhoneContactItem>) => {
    setPhoneItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    markDirty();
  };

  const removePhoneItem = (id: string) => {
    setPhoneItems((prev) => prev.filter((item) => item.id !== id).map((item, idx) => ({ ...item, order: idx + 1 })));
    if (editingPhoneId === id) setEditingPhoneId(null);
    markDirty();
  };

  const movePhoneItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= phoneItems.length) return;
    const next = [...phoneItems];
    [next[index], next[target]] = [next[target], next[index]];
    setPhoneItems(next.map((item, idx) => ({ ...item, order: idx + 1 })));
    markDirty();
  };

  // ---------------- Social Media Manager Handlers ----------------
  const resetSocialDraft = () => {
    setSocialDraft({
      platform: 'instagram',
      customPlatformName: '',
      customIconKey: 'globe',
      displayNameFa: '',
      displayNameEn: '',
      url: '',
      shortDescriptionFa: '',
      shortDescriptionEn: '',
      enabled: true,
      featured: false,
    });
    setEditingSocialId(null);
    setIsAddingSocial(false);
  };

  const openAddSocialForm = () => {
    setEditingSocialId(null);
    setSocialDraft({
      platform: 'instagram',
      customPlatformName: '',
      customIconKey: 'globe',
      displayNameFa: '',
      displayNameEn: '',
      url: '',
      shortDescriptionFa: '',
      shortDescriptionEn: '',
      enabled: true,
      featured: false,
    });
    setIsAddingSocial(true);
  };

  const openEditSocialForm = (item: SocialMediaLink) => {
    setIsAddingSocial(false);
    setEditingSocialId(item.id);
    setSocialDraft({
      platform: item.platform,
      customPlatformName: item.customPlatformName || '',
      customIconKey: item.customIconKey || 'globe',
      displayNameFa: item.displayNameFa,
      displayNameEn: item.displayNameEn || '',
      url: item.url,
      shortDescriptionFa: item.shortDescriptionFa || '',
      shortDescriptionEn: item.shortDescriptionEn || '',
      enabled: item.enabled !== false,
      featured: Boolean(item.featured),
    });
  };

  const handleSaveSocialDraft = () => {
    const trimmedName = socialDraft.displayNameFa.trim();
    const trimmedUrl = socialDraft.url.trim();
    if (!trimmedName) {
      showToast('نام نمایشی شبکه اجتماعی (فارسی) الزامی است', 'error');
      return;
    }
    if (!isValidClientHttpsUrl(trimmedUrl)) {
      showToast('نشانی پیوند باید یک URL معتبر با پروتکل https:// باشد', 'error');
      return;
    }
    if (socialDraft.platform === 'custom' && !socialDraft.customPlatformName.trim()) {
      showToast('برای پلتفرم سفارشی، نام پلتفرم را وارد کنید', 'error');
      return;
    }

    if (editingSocialId) {
      setSocialLinks((prev) =>
        prev.map((item) =>
          item.id === editingSocialId
            ? {
                ...item,
                platform: socialDraft.platform,
                customPlatformName:
                  socialDraft.platform === 'custom' ? socialDraft.customPlatformName.trim() : undefined,
                customIconKey: socialDraft.platform === 'custom' ? socialDraft.customIconKey : undefined,
                displayNameFa: trimmedName,
                displayNameEn: socialDraft.displayNameEn.trim(),
                url: trimmedUrl,
                shortDescriptionFa: socialDraft.shortDescriptionFa.trim(),
                shortDescriptionEn: socialDraft.shortDescriptionEn.trim(),
                enabled: socialDraft.enabled,
                featured: socialDraft.featured,
              }
            : item
        )
      );
    } else {
      const nextItem: SocialMediaLink = {
        id: `social-${Date.now()}`,
        platform: socialDraft.platform,
        customPlatformName: socialDraft.platform === 'custom' ? socialDraft.customPlatformName.trim() : undefined,
        customIconKey: socialDraft.platform === 'custom' ? socialDraft.customIconKey : undefined,
        displayNameFa: trimmedName,
        displayNameEn: socialDraft.displayNameEn.trim(),
        url: trimmedUrl,
        shortDescriptionFa: socialDraft.shortDescriptionFa.trim(),
        shortDescriptionEn: socialDraft.shortDescriptionEn.trim(),
        enabled: socialDraft.enabled,
        order: socialLinks.length + 1,
        featured: socialDraft.featured,
      };
      setSocialLinks((prev) => [...prev, nextItem]);
    }
    markDirty();
    resetSocialDraft();
  };

  const toggleSocialEnabled = (id: string) => {
    setSocialLinks((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
    markDirty();
  };

  const toggleSocialFeatured = (id: string) => {
    setSocialLinks((prev) => prev.map((s) => (s.id === id ? { ...s, featured: !s.featured } : s)));
    markDirty();
  };

  const moveSocialItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= socialLinks.length) return;
    const next = [...socialLinks];
    [next[index], next[target]] = [next[target], next[index]];
    setSocialLinks(next.map((item, idx) => ({ ...item, order: idx + 1 })));
    markDirty();
  };

  const removeSocialItem = (id: string) => {
    setSocialLinks((prev) => prev.filter((item) => item.id !== id).map((item, idx) => ({ ...item, order: idx + 1 })));
    if (editingSocialId === id) resetSocialDraft();
    markDirty();
  };

  const toggleProvider = (key: string) => {
    if (enabledProviders.includes(key)) {
      setEnabledProviders(enabledProviders.filter((p) => p !== key));
    } else {
      setEnabledProviders([...enabledProviders, key]);
    }
    markDirty();
  };

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  const applyMapInputParsing = (rawOverride?: string, showToastOnResult = false) => {
    const candidate = (rawOverride !== undefined ? rawOverride : mapRawInput).trim();
    if (!candidate) {
      setMapValidationError('لینک نقشه خالی است. لطفاً آدرس Google Maps یا Embed URL را وارد کنید.');
      return false;
    }

    const parsed = parseGoogleMapsInput(candidate, 'fa', mapsApiKey);
    if (!parsed.ok || !parsed.embedUrl) {
      setMapValidationError(parsed.error || 'آدرس نقشه معتبر نیست.');
      if (showToastOnResult) {
        showToast(parsed.error || 'آدرس نقشه معتبر نیست.', 'error');
      }
      return false;
    }

    setMapValidationError('');
    setMapIframeError(false);
    setMapEmbedUrl(parsed.embedUrl);
    if (parsed.zoom) {
      setMapZoom(parsed.zoom);
    }
    if (parsed.lat !== undefined && parsed.lng !== undefined) {
      setLat(parsed.lat);
      setLng(parsed.lng);
    }
    markDirty();
    if (showToastOnResult) {
      showToast('مختصات و لینک پیش‌نمایش نقشه با موفقیت استخراج شد', 'success');
    }
    return true;
  };

  const handleSyncNavLinksFromCoordinates = () => {
    if (!isValidCoordinates(lat, lng)) {
      showToast('مختصات عرض و طول جغرافیایی معتبر نیست', 'error');
      return;
    }
    const safeLat = Number(lat.toFixed(6));
    const safeLng = Number(lng.toFixed(6));
    setGoogleMapsUrl(buildGoogleMapsExternalUrl(safeLat, safeLng));
    setWazeUrl(`https://waze.com/ul?ll=${safeLat},${safeLng}&navigate=yes`);
    setAppleMapsUrl(`https://maps.apple.com/?ll=${safeLat},${safeLng}&q=Saeednia+Jewellery`);
    setOpenStreetMapUrl(`https://www.openstreetmap.org/?mlat=${safeLat}&mlon=${safeLng}#map=${mapZoom}/${safeLat}/${safeLng}`);
    setMapEmbedUrl(buildGoogleMapsEmbedUrl(safeLat, safeLng, mapZoom, 'fa', mapsApiKey));
    setMapIframeError(false);
    setMapValidationError('');
    markDirty();
    showToast('لینک‌های مسیریاب و آدرس پیش‌نمایش نقشه بر اساس مختصات فعلی به‌روزرسانی شد', 'success');
  };

  // ---------------- Save All Contact & Social Settings ----------------
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const enabledPhones = phoneItems.filter((p) => p.enabled !== false);
    if (enabledPhones.length === 0) {
      showToast('حداقل یک شماره تماس فعال باید ثبت و فعال باشد', 'error');
      return;
    }

    // Validate map input if user edited mapRawInput without clicking extract
    let finalLat = Number(lat) || 35.6744;
    let finalLng = Number(lng) || 51.4216;
    let finalEmbedUrl = mapEmbedUrl.trim();

    if (mapRawInput.trim() && mapRawInput.trim() !== finalEmbedUrl) {
      const parsedMap = parseGoogleMapsInput(mapRawInput.trim(), 'fa', mapsApiKey);
      if (!parsedMap.ok || !parsedMap.embedUrl) {
        setMapValidationError(parsedMap.error || 'آدرس نقشه واردشده نامعتبر است.');
        showToast(parsedMap.error || 'آدرس نقشه واردشده نامعتبر است.', 'error');
        return;
      }
      finalEmbedUrl = parsedMap.embedUrl;
      if (parsedMap.lat !== undefined && parsedMap.lng !== undefined) {
        finalLat = parsedMap.lat;
        finalLng = parsedMap.lng;
      }
    } else if (finalEmbedUrl) {
      const parsedMap = parseGoogleMapsInput(finalEmbedUrl, 'fa', mapsApiKey);
      if (!parsedMap.ok || !parsedMap.embedUrl) {
        setMapValidationError(parsedMap.error || 'آدرس نقشه واردشده نامعتبر است.');
        showToast(parsedMap.error || 'آدرس نقشه واردشده نامعتبر است.', 'error');
        return;
      }
      finalEmbedUrl = parsedMap.embedUrl;
    }

    if (!isValidCoordinates(finalLat, finalLng)) {
      showToast('مختصات عرض یا طول جغرافیایی خارج از محدوده مجاز است', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const normalizedPhones = phoneItems.map((p, idx) => ({ ...p, order: idx + 1 }));
      const normalizedSocials = socialLinks.map((s, idx) => ({ ...s, order: idx + 1 }));

      const updatedContact = {
        ...(settings?.contact || {}),
        phoneItems: normalizedPhones,
        phoneNumbers: normalizedPhones.filter((p) => p.enabled !== false).map((p) => p.number),
        socialLinks: normalizedSocials,
        contactTextFa: contactTextFa.trim(),
        contactTextEn: contactTextEn.trim(),
        addressFa: addressFa.trim(),
        addressEn: addressEn.trim(),
        openingHoursFa: openingHoursFa.trim(),
        openingHoursEn: openingHoursEn.trim(),
        email: email.trim(),
        whatsappDefaultMessageFa: whatsappDefaultMessageFa.trim(),
        whatsappDefaultMessageEn: whatsappDefaultMessageEn.trim(),
        coordinates: {
          lat: finalLat,
          lng: finalLng,
        },
        mapEmbedUrl: finalEmbedUrl,
        googleMapsUrl: googleMapsUrl.trim(),
        wazeUrl: wazeUrl.trim(),
        neshanUrl: neshanUrl.trim(),
        appleMapsUrl: appleMapsUrl.trim(),
        openStreetMapUrl: openStreetMapUrl.trim(),
        enabledNavigationProviders: enabledProviders,
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contact: updatedContact }),
      });

      const parsed = await safeParseJsonResponse<{ success: boolean; error?: string }>(res);
      if (!parsed.ok) {
        throw new Error(parsed.errorMessage || 'خطا در ذخیره اطلاعات تماس و شبکه‌های اجتماعی');
      }

      setHasUnsavedChanges(false);
      showToast('اطلاعات تماس، شماره‌ها، شبکه‌های اجتماعی و نقشه با موفقیت در پایگاه‌داده ذخیره شد', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err?.message || 'خطا در ذخیره اطلاعات تماس', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const activeSocialPreview = socialLinks.filter((s) => s.enabled !== false);
  const currentPlatformMeta = SOCIAL_PLATFORM_CATALOG[socialDraft.platform] || SOCIAL_PLATFORM_CATALOG.website;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 p-6 rounded-sm space-y-6">
        {/* Header */}
        <div className="border-b border-[#C5A059]/15 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-medium text-[#EDE8DF] font-vazir mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C5A059]" />
              <span>مدیریت شماره‌های تماس، شبکه‌های اجتماعی و نشانی گالری</span>
            </h3>
            <p className="text-xs text-[#8C8880]">
              تنظیم پویا و مستقیم شماره‌های تماس، لینک‌های شبکه اجتماعی و نقشه بازار بزرگ تهران بدون نیاز به تغییر کد.
            </p>
          </div>
          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[11px] rounded-sm shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>تغییرات ذخیره نشده است</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* 1. DYNAMIC PHONE NUMBER MANAGER */}
          <div className="p-4 bg-[#121217] border border-[#C5A059]/15 rounded-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#C5A059]/10 pb-2.5">
              <h4 className="text-xs font-semibold text-[#D4AF37] font-vazir flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                <span>مدیریت شماره‌های تماس ({phoneItems.length})</span>
              </h4>
              <span className="text-[11px] text-[#8C8880]">
                شماره‌های فعال بلافاصله با لینک استاندارد <code className="text-[#C5A059]">tel:</code> در سایت نمایش داده می‌شوند
              </span>
            </div>

            {/* Structured Phone List */}
            <div className="space-y-2.5">
              {phoneItems.map((phone, idx) => {
                const isEditingThis = editingPhoneId === phone.id;
                const telHref = formatTelHref(phone.number);
                return (
                  <div
                    key={phone.id}
                    className={`p-3 rounded-sm border transition-colors ${
                      phone.enabled !== false
                        ? 'bg-[#08080A] border-[#C5A059]/20'
                        : 'bg-[#08080A]/60 border-zinc-800 opacity-75'
                    }`}
                  >
                    {isEditingThis ? (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] text-[#8C8880] mb-1">شماره تماس</label>
                          <input
                            type="text"
                            value={phone.number}
                            onChange={(e) => updatePhoneField(phone.id, { number: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-[#121218] border border-[#C5A059]/30 text-[#EDE8DF] rounded-sm font-mono text-xs"
                            dir="ltr"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] text-[#8C8880] mb-1">برچسب فارسی</label>
                          <input
                            type="text"
                            value={phone.displayLabelFa || ''}
                            onChange={(e) => updatePhoneField(phone.id, { displayLabelFa: e.target.value })}
                            placeholder="تلفن ثابت گالری"
                            className="w-full px-2.5 py-1.5 bg-[#121218] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-[#8C8880] mb-1">نوع خط</label>
                          <select
                            value={phone.type}
                            onChange={(e) =>
                              updatePhoneField(phone.id, { type: e.target.value as PhoneContactType })
                            }
                            className="w-full px-2 py-1.5 bg-[#121218] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
                          >
                            <option value="landline">تلفن ثابت</option>
                            <option value="mobile">تلفن همراه</option>
                            <option value="other">سایر</option>
                          </select>
                        </div>
                        <div className="sm:col-span-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingPhoneId(null)}
                            className="px-3 py-1.5 bg-[#C5A059] text-[#0A0A0B] font-semibold rounded-sm text-[11px]"
                          >
                            تأیید ویرایش
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[10px] text-stone-500 font-mono">#{idx + 1}</span>
                          <span className="text-xs text-[#EDE8DF] font-mono tracking-wider" dir="ltr">
                            {phone.number}
                          </span>
                          <span className="text-[11px] text-[#C5A059] font-vazir">
                            {phone.displayLabelFa || (phone.type === 'mobile' ? 'تلفن همراه' : 'تلفن ثابت')}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] rounded-sm bg-[#16161C] border border-[#C5A059]/15 text-[#8C8880]">
                            {phone.type === 'mobile' ? 'همراه' : phone.type === 'landline' ? 'ثابت' : 'سایر'}
                          </span>
                          {telHref && (
                            <span className="text-[10px] text-stone-500 font-mono hidden md:inline" dir="ltr">
                              ({telHref})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updatePhoneField(phone.id, { enabled: phone.enabled === false })}
                            className={`px-2 py-1 rounded-sm text-[10px] border transition-colors flex items-center gap-1 ${
                              phone.enabled !== false
                                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                            }`}
                            title={phone.enabled !== false ? 'غیرفعال کردن' : 'فعال کردن'}
                          >
                            {phone.enabled !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{phone.enabled !== false ? 'فعال' : 'غیرفعال'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => movePhoneItem(idx, -1)}
                            className="p-1.5 text-stone-400 hover:text-[#C5A059] disabled:opacity-30"
                            title="انتقال به بالا"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === phoneItems.length - 1}
                            onClick={() => movePhoneItem(idx, 1)}
                            className="p-1.5 text-stone-400 hover:text-[#C5A059] disabled:opacity-30"
                            title="انتقال به پایین"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPhoneId(phone.id)}
                            className="p-1.5 text-[#C5A059] hover:text-[#EDE8DF]"
                            title="ویرایش شماره"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePhoneItem(phone.id)}
                            className="p-1.5 text-stone-400 hover:text-red-400"
                            title="حذف شماره"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-[#C5A059]/10">
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPhoneItem();
                    }
                  }}
                  placeholder="شماره جدید (مثال: ۰۲۱-۵۵۶۳۴۱۲۰)"
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs font-mono"
                />
              </div>
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={newPhoneLabelFa}
                  onChange={(e) => setNewPhoneLabelFa(e.target.value)}
                  placeholder="برچسب (مثال: خط مستقیم مدیریت)"
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <select
                  value={newPhoneType}
                  onChange={(e) => setNewPhoneType(e.target.value as PhoneContactType)}
                  className="w-full px-2.5 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
                >
                  <option value="landline">ثابت</option>
                  <option value="mobile">همراه</option>
                  <option value="other">سایر</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddPhoneItem}
                  className="w-full py-2 bg-[#17171C] hover:bg-[#C5A059] hover:text-[#0A0A0B] text-[#C5A059] border border-[#C5A059]/30 rounded-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن شماره</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. FULLY DYNAMIC SOCIAL MEDIA MANAGEMENT SYSTEM */}
          <div className="p-4 bg-[#121217] border border-[#C5A059]/20 rounded-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C5A059]/10 pb-3">
              <div>
                <h4 className="text-xs font-semibold text-[#D4AF37] font-vazir flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مدیریت پویا و کامل شبکه‌های اجتماعی ({socialLinks.length})</span>
                </h4>
                <p className="text-[11px] text-[#8C8880] mt-0.5">
                  افزودن بی‌نهایت پلتفرم، انتخاب آیکون رسمی، ویرایش نام نمایشی، مرتب‌سازی و پیش‌نمایش زنده در صفحه تماس و فوتر.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddSocialForm}
                className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] font-semibold rounded-sm flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن شبکه اجتماعی</span>
              </button>
            </div>

            {/* Social Media List */}
            {socialLinks.length > 0 ? (
              <div className="space-y-2.5">
                {socialLinks.map((item, idx) => {
                  const catalog = SOCIAL_PLATFORM_CATALOG[item.platform];
                  const platformLabel =
                    item.platform === 'custom'
                      ? item.customPlatformName || 'پلتفرم سفارشی'
                      : catalog?.labelFa || item.platform;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        item.enabled !== false
                          ? 'bg-[#08080A] border-[#C5A059]/20'
                          : 'bg-[#08080A]/60 border-zinc-800 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-sm bg-[#16161C] border border-[#C5A059]/25 flex items-center justify-center text-[#C5A059] shrink-0">
                          <SocialPlatformIcon
                            platform={item.platform}
                            customIconKey={item.customIconKey}
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-[#EDE8DF]">{item.displayNameFa}</span>
                            <span className="px-1.5 py-0.5 text-[10px] rounded-sm bg-[#15151C] text-[#C5A059] border border-[#C5A059]/15">
                              {platformLabel}
                            </span>
                            {item.featured && (
                              <span className="px-1.5 py-0.5 text-[10px] rounded-sm bg-amber-950/60 text-amber-300 border border-amber-500/30">
                                برگزیده
                              </span>
                            )}
                          </div>
                          {item.shortDescriptionFa && (
                            <p className="text-[11px] text-[#8C8880] truncate">{item.shortDescriptionFa}</p>
                          )}
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            dir="ltr"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-[#A8A49C] hover:text-[#D4AF37] truncate max-w-full"
                          >
                            <span className="truncate">{item.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => toggleSocialFeatured(item.id)}
                          className={`p-1.5 rounded-sm border transition-colors ${
                            item.featured
                              ? 'text-amber-300 border-amber-500/40 bg-amber-950/40'
                              : 'text-stone-500 border-transparent hover:text-[#C5A059]'
                          }`}
                          title="نمایش ویژه (Featured)"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSocialEnabled(item.id)}
                          className={`px-2 py-1 rounded-sm text-[10px] border transition-colors flex items-center gap-1 ${
                            item.enabled !== false
                              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {item.enabled !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{item.enabled !== false ? 'فعال' : 'غیرفعال'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSocialItem(idx, -1)}
                          className="p-1.5 text-stone-400 hover:text-[#C5A059] disabled:opacity-30"
                          title="انتقال به بالا"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === socialLinks.length - 1}
                          onClick={() => moveSocialItem(idx, 1)}
                          className="p-1.5 text-stone-400 hover:text-[#C5A059] disabled:opacity-30"
                          title="انتقال به پایین"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditSocialForm(item)}
                          className="p-1.5 text-[#C5A059] hover:text-[#EDE8DF]"
                          title="ویرایش"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSocialItem(item.id)}
                          className="p-1.5 text-stone-400 hover:text-red-400"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center bg-[#08080A] border border-dashed border-[#C5A059]/20 rounded-sm text-[#8C8880]">
                هنوز هیچ شبکه اجتماعی فعالی ثبت نشده است. با دکمه «افزودن شبکه اجتماعی» شروع کنید.
              </div>
            )}

            {/* Add / Edit Social Media Form Drawer */}
            {(isAddingSocial || editingSocialId) && (
              <div className="p-4 bg-[#08080A] border border-[#C5A059]/40 rounded-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#C5A059]/15 pb-2.5">
                  <span className="text-xs font-semibold text-[#D4AF37]">
                    {editingSocialId ? 'ویرایش شبکه اجتماعی' : 'افزودن شبکه اجتماعی جدید'}
                  </span>
                  <button
                    type="button"
                    onClick={resetSocialDraft}
                    className="text-[11px] text-[#8C8880] hover:text-[#EDE8DF]"
                  >
                    بستن فرم
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#C8C4BC] mb-1">انتخاب پلتفرم *</label>
                    <select
                      value={socialDraft.platform}
                      onChange={(e) => {
                        const nextPlat = e.target.value as SocialMediaPlatformKey;
                        setSocialDraft((prev) => ({
                          ...prev,
                          platform: nextPlat,
                          displayNameFa:
                            prev.displayNameFa ||
                            (nextPlat === 'custom' ? '' : `${SOCIAL_PLATFORM_CATALOG[nextPlat]?.labelFa || ''} جواهری سعیدنیا`),
                        }));
                      }}
                      className="w-full px-3 py-2 bg-[#121218] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
                    >
                      {(Object.keys(SOCIAL_PLATFORM_CATALOG) as SocialMediaPlatformKey[]).map((key) => (
                        <option key={key} value={key}>
                          {SOCIAL_PLATFORM_CATALOG[key].labelFa} ({SOCIAL_PLATFORM_CATALOG[key].labelEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#C8C4BC] mb-1">نام نمایشی حساب کاربری (فارسی) *</label>
                    <input
                      type="text"
                      value={socialDraft.displayNameFa}
                      onChange={(e) => setSocialDraft({ ...socialDraft, displayNameFa: e.target.value })}
                      placeholder="مثال: @saeedniajewellerygrandbazar"
                      className="w-full px-3 py-2 bg-[#121218] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
                    />
                  </div>

                  {socialDraft.platform === 'custom' && (
                    <>
                      <div>
                        <label className="block text-[#C8C4BC] mb-1">نام پلتفرم سفارشی *</label>
                        <input
                          type="text"
                          value={socialDraft.customPlatformName}
                          onChange={(e) => setSocialDraft({ ...socialDraft, customPlatformName: e.target.value })}
                          placeholder="مثال: کاتالوگ اختصاصی / کلاب"
                          className="w-full px-3 py-2 bg-[#121218] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[#C8C4BC] mb-1">انتخاب آیکون ایمن (کتابخانه تأییدشده)</label>
                        <div className="flex flex-wrap gap-1.5">
                          {CUSTOM_ICON_OPTIONS.map((opt) => (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setSocialDraft({ ...socialDraft, customIconKey: opt.key })}
                              className={`p-2 rounded-sm border transition-colors flex items-center gap-1 text-[10px] ${
                                socialDraft.customIconKey === opt.key
                                  ? 'bg-[#C5A059] text-[#0A0A0B] border-[#C5A059]'
                                  : 'bg-[#121218] text-[#EDE8DF] border-[#C5A059]/20 hover:border-[#C5A059]/50'
                              }`}
                              title={opt.labelFa}
                            >
                              <SocialPlatformIcon platform="custom" customIconKey={opt.key} className="w-3.5 h-3.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-[#C8C4BC] mb-1">
                      لینک مستقیم پروفایل یا کانال (HTTPS الزامی) *
                    </label>
                    <input
                      type="url"
                      value={socialDraft.url}
                      onChange={(e) => setSocialDraft({ ...socialDraft, url: e.target.value })}
                      placeholder={currentPlatformMeta.placeholderUrl}
                      dir="ltr"
                      className={`w-full px-3 py-2 bg-[#121218] border rounded-sm font-mono text-xs text-[#EDE8DF] ${
                        socialDraft.url && !isValidClientHttpsUrl(socialDraft.url)
                          ? 'border-rose-500/60'
                          : 'border-[#C5A059]/25'
                      }`}
                    />
                    <span className="text-[10px] text-[#8C8880] mt-1 block">{currentPlatformMeta.hintFa}</span>
                  </div>

                  <div>
                    <label className="block text-[#C8C4BC] mb-1">عنوان انگلیسی (اختیاری)</label>
                    <input
                      type="text"
                      value={socialDraft.displayNameEn}
                      onChange={(e) => setSocialDraft({ ...socialDraft, displayNameEn: e.target.value })}
                      placeholder="E.g., Official Instagram"
                      dir="ltr"
                      className="w-full px-3 py-2 bg-[#121218] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#C8C4BC] mb-1">توضیح کوتاه (فارسی - اختیاری)</label>
                    <input
                      type="text"
                      value={socialDraft.shortDescriptionFa}
                      onChange={(e) => setSocialDraft({ ...socialDraft, shortDescriptionFa: e.target.value })}
                      placeholder="مثال: مشاهده کلکسیون روزانه جواهرات"
                      className="w-full px-3 py-2 bg-[#121218] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-[#EDE8DF]">
                      <input
                        type="checkbox"
                        checked={socialDraft.enabled}
                        onChange={(e) => setSocialDraft({ ...socialDraft, enabled: e.target.checked })}
                        className="accent-[#C5A059]"
                      />
                      <span>فعال و قابل نمایش در سایت</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-[#EDE8DF]">
                      <input
                        type="checkbox"
                        checked={socialDraft.featured}
                        onChange={(e) => setSocialDraft({ ...socialDraft, featured: e.target.checked })}
                        className="accent-[#C5A059]"
                      />
                      <span>نمایش به‌عنوان کانال برگزیده</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C5A059]/10">
                  <button
                    type="button"
                    onClick={resetSocialDraft}
                    className="px-4 py-1.5 border border-[#C5A059]/25 text-[#C8C4BC] rounded-sm"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSocialDraft}
                    className="px-5 py-1.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] font-semibold rounded-sm"
                  >
                    {editingSocialId ? 'به‌روزرسانی در فهرست' : 'افزودن به فهرست'}
                  </button>
                </div>
              </div>
            )}

            {/* Live Social Preview */}
            {activeSocialPreview.length > 0 && (() => {
              const gridPlan = getBalancedGridLayout(activeSocialPreview.length);
              return (
                <div className="pt-3 border-t border-[#C5A059]/10">
                  <span className="text-[11px] text-[#8C8880] block mb-2">
                    پیش‌نمایش زنده چیدمان متعادل در صفحه تماس و درباره ما ({activeSocialPreview.length} کانال فعال):
                  </span>
                  <div className={gridPlan.containerClass}>
                    {activeSocialPreview.map((s, idx) => (
                      <div
                        key={s.id}
                        className={`${gridPlan.getItemClass(idx)} p-2.5 bg-[#08080A] border border-[#C5A059]/25 rounded-sm flex items-center gap-2.5 min-w-0`}
                      >
                        <div className="w-8 h-8 rounded-sm bg-[#16161C] border border-[#C5A059]/25 flex items-center justify-center text-[#D4AF37] shrink-0">
                          <SocialPlatformIcon platform={s.platform} customIconKey={s.customIconKey} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] text-[#EDE8DF] truncate font-medium">{s.displayNameFa}</div>
                          <div className="text-[10px] text-[#8C8880] truncate">
                            {s.shortDescriptionFa || SOCIAL_PLATFORM_CATALOG[s.platform]?.labelFa || s.platform}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 3. Contact Intro Texts */}
          <div className="p-4 bg-[#121217] border border-[#C5A059]/15 rounded-sm space-y-4">
            <h4 className="text-xs font-semibold text-[#D4AF37] font-vazir">متن‌های راهنمای تماس و ایمیل</h4>
            <div>
              <label className="block text-[#C8C4BC] mb-1 font-medium">متن راهنمای تماس (فارسی)</label>
              <textarea
                rows={2}
                value={contactTextFa}
                onChange={(e) => {
                  setContactTextFa(e.target.value);
                  markDirty();
                }}
                className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-vazir text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[#C8C4BC] mb-1 font-medium">متن راهنمای تماس (English)</label>
              <textarea
                rows={2}
                dir="ltr"
                value={contactTextEn}
                onChange={(e) => {
                  setContactTextEn(e.target.value);
                  markDirty();
                }}
                className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-sans text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[#C8C4BC] mb-1 font-medium">ایمیل رسمی گالری (اختیاری)</label>
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  markDirty();
                }}
                placeholder="info@example.com"
                className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono text-xs"
              />
            </div>
          </div>

          {/* 4. Physical Address & Opening Hours */}
          <div className="p-4 bg-[#121217] border border-[#C5A059]/15 rounded-sm space-y-4">
            <h4 className="text-xs font-semibold text-[#D4AF37] font-vazir flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>نشانی سالن بازار بزرگ و ساعات فعالیت</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">نشانی گالری در تهران (فارسی)</label>
                <input
                  type="text"
                  value={addressFa}
                  onChange={(e) => {
                    setAddressFa(e.target.value);
                    markDirty();
                  }}
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-vazir text-xs"
                />
              </div>
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">Physical Address (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={addressEn}
                  onChange={(e) => {
                    setAddressEn(e.target.value);
                    markDirty();
                  }}
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-sans text-xs"
                />
              </div>
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>ساعات پاسخگویی و فعالیت (فارسی)</span>
                </label>
                <input
                  type="text"
                  value={openingHoursFa}
                  onChange={(e) => {
                    setOpeningHoursFa(e.target.value);
                    markDirty();
                  }}
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-vazir text-xs"
                />
              </div>
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">Opening Hours (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={openingHoursEn}
                  onChange={(e) => {
                    setOpeningHoursEn(e.target.value);
                    markDirty();
                  }}
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-sans text-xs"
                />
              </div>
            </div>
          </div>

          {/* 5. WhatsApp Default Inquiry Message (Used by Product Pages) */}
          <div className="p-4 bg-[#121217] border border-[#C5A059]/15 rounded-sm space-y-4">
            <h4 className="text-xs font-semibold text-[#D4AF37] font-vazir flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>متن پیش‌فرض پیام استعلام محصول در واتس‌اپ</span>
            </h4>
            <p className="text-[11px] text-[#8C8880]">
              شماره و فعال/غیرفعال‌سازی واتس‌اپ از بخش «شبکه‌های اجتماعی» در بالا مدیریت می‌شود.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">متن پیش‌فرض (فارسی)</label>
                <textarea
                  rows={2}
                  value={whatsappDefaultMessageFa}
                  onChange={(e) => {
                    setWhatsappDefaultMessageFa(e.target.value);
                    markDirty();
                  }}
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-vazir text-xs"
                />
              </div>
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">Default Message (English)</label>
                <textarea
                  rows={2}
                  dir="ltr"
                  value={whatsappDefaultMessageEn}
                  onChange={(e) => {
                    setWhatsappDefaultMessageEn(e.target.value);
                    markDirty();
                  }}
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-sans text-xs"
                />
              </div>
            </div>
          </div>

          {/* 6. Interactive Map & Coordinates */}
          {(() => {
            const previewMap = resolveRenderableMapData(
              {
                coordinates: { lat, lng },
                mapEmbedUrl,
                googleMapsUrl,
              },
              'fa',
              mapsApiKey
            );

            return (
              <div className="p-4 bg-[#121217] border border-[#C5A059]/15 rounded-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C5A059]/10 pb-2.5">
                  <h4 className="text-xs font-semibold text-[#D4AF37] font-vazir flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5" />
                    <span>مختصات جغرافیایی، تبدیل هوشمند لینک Google Maps و پیش‌نمایش زنده</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleSyncNavLinksFromCoordinates}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#181822] hover:bg-[#C5A059] text-[#C5A059] hover:text-[#0A0A0B] border border-[#C5A059]/30 rounded-sm text-[11px] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>به‌روزرسانی لینک مسیریاب‌های ذخیره شده بر اساس مختصات</span>
                  </button>
                </div>

                {/* Smart Google Maps URL / Embed Extractor */}
                <div className="space-y-2">
                  <label className="block text-[#C8C4BC] font-medium">
                    لینک Google Maps، مختصات (@lat,lng,zoom) یا آدرس Embed نقشه
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={mapRawInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMapRawInput(val);
                        setMapValidationError('');
                        markDirty();
                      }}
                      onBlur={() => {
                        const trimmed = mapRawInput.trim();
                        if (trimmed && (trimmed.includes('@') || trimmed.includes('google.com/maps') || trimmed.includes('openstreetmap.org'))) {
                          applyMapInputParsing(trimmed, false);
                        }
                      }}
                      placeholder="https://www.google.com/maps/@35.677569,51.420443,17z"
                      className="flex-1 min-w-0 px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => applyMapInputParsing(mapRawInput, true)}
                      className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] font-semibold rounded-sm whitespace-nowrap transition-colors cursor-pointer shrink-0"
                    >
                      استخراج خودکار مختصات و ساخت پیش‌نمایش
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8C8880] leading-relaxed">
                    لینک کامل مرورگر مانند <code className="text-[#C5A059]" dir="ltr">https://www.google.com/maps/@35.677569,51.420443,17z</code> یا کد Embed رسمی را جای‌گذاری کنید تا مختصات و پیش‌نمایش به‌طور خودکار تولید شود.
                  </p>
                </div>

                {mapValidationError && (
                  <div className="p-3 bg-red-950/35 border border-red-700/40 rounded-sm text-red-200 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span className="leading-relaxed">{mapValidationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#C8C4BC] mb-1 font-medium">عرض جغرافیایی (Latitude)</label>
                    <input
                      type="number"
                      step="any"
                      dir="ltr"
                      value={lat}
                      onChange={(e) => {
                        setLat(parseFloat(e.target.value) || 0);
                        setMapIframeError(false);
                        markDirty();
                      }}
                      className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[#C8C4BC] mb-1 font-medium">طول جغرافیایی (Longitude)</label>
                    <input
                      type="number"
                      step="any"
                      dir="ltr"
                      value={lng}
                      onChange={(e) => {
                        setLng(parseFloat(e.target.value) || 0);
                        setMapIframeError(false);
                        markDirty();
                      }}
                      className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[#C8C4BC] mb-1 font-medium">بزرگنمایی نقشه (Zoom)</label>
                    <input
                      type="number"
                      min={1}
                      max={21}
                      dir="ltr"
                      value={mapZoom}
                      onChange={(e) => {
                        const z = Math.min(Math.max(parseInt(e.target.value, 10) || 16, 1), 21);
                        setMapZoom(z);
                        if (isValidCoordinates(lat, lng)) {
                          setMapEmbedUrl(buildGoogleMapsEmbedUrl(lat, lng, z, 'fa', mapsApiKey));
                        }
                        markDirty();
                      }}
                      className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[#C8C4BC] mb-1 font-medium">آدرس استاندارد تولیدشده برای جاسازی (Normalized Embed URL)</label>
                    <input
                      type="url"
                      dir="ltr"
                      value={mapEmbedUrl}
                      onChange={(e) => {
                        setMapEmbedUrl(e.target.value);
                        setMapIframeError(false);
                        markDirty();
                      }}
                      className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#C5A059] rounded-sm font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Live Admin Map Preview Card */}
                <div className="border border-[#C5A059]/25 rounded-sm overflow-hidden bg-[#08080A]">
                  <div className="px-3.5 py-2.5 bg-[#101016] border-b border-[#C5A059]/15 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[#EDE8DF] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>پیش‌نمایش زنده نقشه در صفحه تماس با ما</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-[#8C8880]" dir="ltr">
                        {isValidCoordinates(lat, lng) ? `${lat.toFixed(6)}, ${lng.toFixed(6)} • z${mapZoom}` : 'Invalid'}
                      </span>
                      <a
                        href={previewMap.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#181822] hover:bg-[#C5A059] text-[#C5A059] hover:text-[#0A0A0B] border border-[#C5A059]/30 rounded-sm text-[11px] transition-colors"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {previewMap.canEmbed && !mapIframeError ? (
                    <div className="w-full h-64 relative bg-[#0B0B0F]">
                      <iframe
                        key={previewMap.embedUrl}
                        src={previewMap.embedUrl}
                        title="Admin Map Live Preview"
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        onError={() => setMapIframeError(true)}
                      />
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-3 bg-[#09090D]">
                      <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                      <p className="text-xs text-[#C8C4BC]">
                        {previewMap.error || 'بارگذاری پیش‌نمایش تعاملی نقشه در این مرورگر با محدودیت روبه‌رو شد.'}
                      </p>
                      <a
                        href={previewMap.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] font-semibold rounded-sm text-xs transition-colors"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 7. Store Navigation Links */}
          <div className="p-4 bg-[#121217] border border-[#C5A059]/15 rounded-sm space-y-4">
            <h4 className="text-xs font-semibold text-[#D4AF37] font-vazir flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5" />
              <span>مسیریابی هوشمند و اپلیکیشن‌های مجاز</span>
            </h4>
            <div className="space-y-1.5 pb-2 border-b border-[#C5A059]/10">
              <span className="text-[11px] text-[#C8C4BC] block">اپلیکیشن‌های فعال:</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { key: 'google_maps', label: 'Google Maps' },
                  { key: 'waze', label: 'Waze' },
                  { key: 'apple_maps', label: 'Apple Maps' },
                  { key: 'openstreetmap', label: 'OpenStreetMap' },
                  { key: 'neshan', label: 'نشان (Neshan)' },
                ].map((prov) => {
                  const isActive = enabledProviders.includes(prov.key);
                  return (
                    <button
                      key={prov.key}
                      type="button"
                      onClick={() => toggleProvider(prov.key)}
                      className={`px-2.5 py-1 text-[11px] rounded-sm border transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#C5A059]/15 text-[#D4AF37] border-[#C5A059]/40'
                          : 'bg-[#08080A] text-stone-500 border-stone-800'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#C5A059]' : 'bg-stone-600'}`} />
                      <span>{prov.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'لینک Google Maps', value: googleMapsUrl, setter: setGoogleMapsUrl },
                { label: 'لینک Waze', value: wazeUrl, setter: setWazeUrl },
                { label: 'لینک Apple Maps', value: appleMapsUrl, setter: setAppleMapsUrl },
                { label: 'لینک OpenStreetMap', value: openStreetMapUrl, setter: setOpenStreetMapUrl },
                { label: 'لینک نشان (Neshan)', value: neshanUrl, setter: setNeshanUrl },
              ].map((nav) => (
                <div key={nav.label}>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">{nav.label}</label>
                  <input
                    type="url"
                    value={nav.value}
                    onChange={(e) => {
                      nav.setter(e.target.value);
                      markDirty();
                    }}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono text-xs dir-ltr"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-4">
            <button
              id="btn-admin-save-contact"
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0A0A0B] text-xs font-semibold rounded-sm flex items-center gap-2 shadow cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات تماس و شبکه‌های اجتماعی'}</span>
            </button>
            {hasUnsavedChanges && (
              <span className="text-[11px] text-amber-300">برای اعمال تغییرات در سایت عمومی دکمه ذخیره را بزنید</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
