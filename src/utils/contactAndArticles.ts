import type {
  ContactSettings,
  CustomSocialIconKey,
  PhoneContactItem,
  PhoneContactType,
  SocialMediaLink,
  SocialMediaPlatformKey,
} from '../types.js';

export const SOCIAL_PLATFORM_CATALOG: Record<
  SocialMediaPlatformKey,
  {
    labelFa: string;
    labelEn: string;
    placeholderUrl: string;
    hintFa: string;
  }
> = {
  instagram: {
    labelFa: 'اینستاگرام',
    labelEn: 'Instagram',
    placeholderUrl: 'https://instagram.com/saeednia.jewellery',
    hintFa: 'آدرس کامل پروفایل اینستاگرام (با https://)',
  },
  telegram: {
    labelFa: 'تلگرام',
    labelEn: 'Telegram',
    placeholderUrl: 'https://t.me/saeedniajewellery',
    hintFa: 'لینک کانال یا صفحه تلگرام (t.me)',
  },
  whatsapp: {
    labelFa: 'واتس‌اپ',
    labelEn: 'WhatsApp',
    placeholderUrl: 'https://wa.me/989121234567',
    hintFa: 'لینک رسمی واتس‌اپ (wa.me یا whatsapp.com)',
  },
  youtube: {
    labelFa: 'یوتیوب',
    labelEn: 'YouTube',
    placeholderUrl: 'https://youtube.com/@saeedniajewellery',
    hintFa: 'آدرس کانال رسمی یوتیوب',
  },
  facebook: {
    labelFa: 'فیسبوک',
    labelEn: 'Facebook',
    placeholderUrl: 'https://facebook.com/saeedniajewellery',
    hintFa: 'آدرس صفحه رسمی فیسبوک',
  },
  x: {
    labelFa: 'ایکس (توییتر)',
    labelEn: 'X (Twitter)',
    placeholderUrl: 'https://x.com/saeedniajewellery',
    hintFa: 'آدرس پروفایل در شبکه X',
  },
  tiktok: {
    labelFa: 'تیک‌تاک',
    labelEn: 'TikTok',
    placeholderUrl: 'https://tiktok.com/@saeedniajewellery',
    hintFa: 'آدرس صفحه رسمی تیک‌تاک',
  },
  pinterest: {
    labelFa: 'پینترست',
    labelEn: 'Pinterest',
    placeholderUrl: 'https://pinterest.com/saeedniajewellery',
    hintFa: 'آدرس بورد یا پروفایل پینترست',
  },
  linkedin: {
    labelFa: 'لینکدین',
    labelEn: 'LinkedIn',
    placeholderUrl: 'https://linkedin.com/company/saeednia-jewellery',
    hintFa: 'آدرس صفحه شرکتی یا پروفایل لینکدین',
  },
  aparat: {
    labelFa: 'آپارات',
    labelEn: 'Aparat',
    placeholderUrl: 'https://www.aparat.com/saeedniajewellery',
    hintFa: 'آدرس کانال رسمی آپارات',
  },
  eitaa: {
    labelFa: 'ایتا',
    labelEn: 'Eitaa',
    placeholderUrl: 'https://eitaa.com/saeedniajewellery',
    hintFa: 'لینک کانال یا صفحه ایتا (eitaa.com)',
  },
  bale: {
    labelFa: 'بله',
    labelEn: 'Bale',
    placeholderUrl: 'https://ble.ir/saeedniajewellery',
    hintFa: 'لینک کانال یا صفحه در پیام‌رسان بله (ble.ir)',
  },
  rubika: {
    labelFa: 'روبیکا',
    labelEn: 'Rubika',
    placeholderUrl: 'https://rubika.ir/saeedniajewellery',
    hintFa: 'لینک صفحه رسمی روبیکا (rubika.ir)',
  },
  website: {
    labelFa: 'وب‌سایت / لینک رسمی',
    labelEn: 'Official Website',
    placeholderUrl: 'https://example.com',
    hintFa: 'نشانی اینترنتی معتبر با https://',
  },
  custom: {
    labelFa: 'پلتفرم سفارشی',
    labelEn: 'Custom Platform',
    placeholderUrl: 'https://example.com/saeednia',
    hintFa: 'نام پلتفرم، آیکون ایمن و لینک HTTPS را وارد کنید',
  },
};

export const CUSTOM_ICON_OPTIONS: Array<{ key: CustomSocialIconKey; labelFa: string }> = [
  { key: 'globe', labelFa: 'وب / کره' },
  { key: 'share', labelFa: 'اشتراک‌گذاری' },
  { key: 'message', labelFa: 'گفتگو / پیام' },
  { key: 'video', labelFa: 'ویدیو' },
  { key: 'camera', labelFa: 'تصویر / گالری' },
  { key: 'sparkles', labelFa: 'درخشش / برند' },
  { key: 'shopping-bag', labelFa: 'کاتالوگ' },
  { key: 'award', labelFa: 'اصالت' },
  { key: 'send', labelFa: 'کانال / ارسال' },
  { key: 'link', labelFa: 'پیوند مستقیم' },
];

export function toAsciiDigits(input: string): string {
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  return String(input || '')
    .split('')
    .map((ch) => {
      const pIdx = persian.indexOf(ch);
      if (pIdx !== -1) return String(pIdx);
      const aIdx = arabic.indexOf(ch);
      if (aIdx !== -1) return String(aIdx);
      return ch;
    })
    .join('');
}

export function toPersianDigits(input: string | number): string {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/\d/g, (d) => persian[Number(d)] ?? d);
}

/**
 * Formats a phone string cleanly into an RFC3966-safe `tel:` URI while never
 * breaking displayed Persian formatting.
 */
export function formatTelHref(numberStr: string): string {
  const ascii = toAsciiDigits(numberStr).trim();
  const hasPlus = ascii.startsWith('+');
  const digits = ascii.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return `tel:${hasPlus ? '+' : ''}${digits}`;
}

export function inferPhoneType(numberStr: string): PhoneContactType {
  const ascii = toAsciiDigits(numberStr).replace(/[^0-9+]/g, '');
  if (/^(09|\+?989)/.test(ascii)) return 'mobile';
  if (/^(0\d{2,3}|\+?98\d{2,3})/.test(ascii)) return 'landline';
  return 'other';
}

export function resolvePhoneItemsFromContact(contact?: ContactSettings): PhoneContactItem[] {
  if (contact?.phoneItems && Array.isArray(contact.phoneItems) && contact.phoneItems.length > 0) {
    return [...contact.phoneItems]
      .filter((item) => item && typeof item.number === 'string' && item.number.trim().length > 0)
      .sort((a, b) => (a.order ?? 1) - (b.order ?? 1));
  }

  const rawList = Array.isArray(contact?.phoneNumbers)
    ? contact.phoneNumbers.filter((n) => typeof n === 'string' && n.trim().length > 0)
    : [];

  return rawList.map((num, idx) => {
    const type = inferPhoneType(num);
    return {
      id: `phone-legacy-${idx + 1}`,
      number: num.trim(),
      displayLabelFa: type === 'mobile' ? 'تلفن همراه گالری' : 'تلفن ثابت گالری',
      displayLabelEn: type === 'mobile' ? 'Gallery Mobile' : 'Gallery Landline',
      type,
      order: idx + 1,
      enabled: true,
    };
  });
}

export function resolveActivePhoneItems(contact?: Partial<ContactSettings>): PhoneContactItem[] {
  return resolvePhoneItemsFromContact(contact as ContactSettings).filter((item) => item.enabled !== false);
}

export function resolveActivePhoneNumbers(contact?: ContactSettings): string[] {
  if (contact?.phoneItems && Array.isArray(contact.phoneItems) && contact.phoneItems.length > 0) {
    return resolvePhoneItemsFromContact(contact)
      .filter((item) => item.enabled !== false)
      .map((item) => item.number.trim())
      .filter(Boolean);
  }
  return Array.isArray(contact?.phoneNumbers) ? contact.phoneNumbers.filter(Boolean) : [];
}

export function resolveSocialLinksFromContact(contact?: ContactSettings): SocialMediaLink[] {
  if (contact?.socialLinks && Array.isArray(contact.socialLinks)) {
    return [...contact.socialLinks]
      .filter((item) => item && typeof item.url === 'string')
      .sort((a, b) => (a.order ?? 1) - (b.order ?? 1));
  }

  // Migrate legacy contact fields cleanly into structured records without inventing non-existent URLs
  const derived: SocialMediaLink[] = [];

  const rawIgUrl = contact?.instagramUrl?.trim();
  const rawIgUser = contact?.instagramUsername?.trim().replace(/^@/, '');
  const resolvedIgUrl =
    rawIgUrl && /^https:\/\//i.test(rawIgUrl)
      ? rawIgUrl
      : rawIgUser
      ? `https://instagram.com/${rawIgUser}`
      : '';

  if (resolvedIgUrl) {
    derived.push({
      id: 'social-legacy-instagram',
      platform: 'instagram',
      displayNameFa: rawIgUser ? `@${rawIgUser}` : 'اینستاگرام جواهری سعیدنیا',
      displayNameEn: rawIgUser ? `@${rawIgUser}` : 'Saeednia Jewellery Instagram',
      url: resolvedIgUrl,
      shortDescriptionFa: 'مشاهده تازه‌ترین آثار و کالکشن‌ها',
      shortDescriptionEn: 'Latest creations & collections',
      enabled: true,
      order: 1,
      featured: true,
    });
  }

  const rawWaDigits = toAsciiDigits(contact?.whatsappNumber || '').replace(/[^0-9]/g, '');
  if (rawWaDigits) {
    const waMsg =
      contact?.whatsappDefaultMessageFa ||
      'درود، برای استعلام و اطلاعات درباره آثار جواهری سعیدنیا پیام می‌دهم.';
    derived.push({
      id: 'social-legacy-whatsapp',
      platform: 'whatsapp',
      displayNameFa: 'واتس‌اپ جواهری سعیدنیا',
      displayNameEn: 'Saeednia Jewellery WhatsApp',
      url: `https://wa.me/${rawWaDigits}?text=${encodeURIComponent(waMsg)}`,
      shortDescriptionFa: 'ارتباط مستقیم و ارسال تصویر اثر',
      shortDescriptionEn: 'Direct messaging',
      enabled: contact?.whatsappEnabled !== false,
      order: derived.length + 1,
      featured: false,
    });
  }

  return derived;
}

export function resolveActiveSocialLinks(contact?: ContactSettings): SocialMediaLink[] {
  return resolveSocialLinksFromContact(contact).filter(
    (item) => item.enabled !== false && Boolean(item.url && item.url.trim())
  );
}

/**
 * Accurate word-based reading time calculation for both Persian & English content.
 */
export function calculateReadingTimeMinutes(text: string): number {
  const clean = String(text || '')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
  if (!clean) return 1;
  const words = clean.split(/\s+/).filter(Boolean).length;
  // Standard editorial reading pace ~180 words/minute
  return Math.max(1, Math.ceil(words / 180));
}

export function formatReadingTimeLabel(minutes: number, lang: 'fa' | 'en'): string {
  const safeMin = Math.max(1, Math.round(minutes || 1));
  if (lang === 'en') {
    return `${safeMin} min read`;
  }
  return `${toPersianDigits(safeMin)} دقیقه مطالعه`;
}

export function isValidEmailAddress(email?: string): boolean {
  const clean = String(email || '').trim();
  if (!clean || clean.length > 160) return false;
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(clean);
}

/**
 * Enhances a WhatsApp link with the configured default message (Fa/En) and
 * the inspected piece's title/code on Product Detail pages without altering
 * non-WhatsApp social URLs.
 */
export function buildProductSocialEnquiryUrl(
  socialUrl: string,
  platform: SocialMediaPlatformKey,
  options: {
    productTitle: string;
    productCode?: string;
    lang: 'fa' | 'en';
    defaultMsgFa?: string;
    defaultMsgEn?: string;
  }
): string {
  const cleanUrl = String(socialUrl || '').trim();
  if (!cleanUrl) return '';
  if (platform !== 'whatsapp') return cleanUrl;

  try {
    const parsed = new URL(cleanUrl);
    if (
      !['wa.me', 'api.whatsapp.com', 'web.whatsapp.com', 'whatsapp.com'].some(
        (h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`)
      )
    ) {
      return cleanUrl;
    }

    const baseMsg =
      options.lang === 'fa'
        ? options.defaultMsgFa?.trim() || 'درود و احترام، جهت استعلام موجودیت این اثر پیام می‌دهم:'
        : options.defaultMsgEn?.trim() || 'Hello, I would like to inquire about this piece:';
    const pieceLabel = options.productCode
      ? `${options.productTitle} (${options.productCode})`
      : options.productTitle;
    const fullText = `${baseMsg} ${pieceLabel}`.trim();
    parsed.searchParams.set('text', fullText);
    return parsed.toString();
  } catch {
    return cleanUrl;
  }
}

export const DEFAULT_HEADER_LINKS = [
  { id: 'nav-home', to: '/', labelFa: 'خانه', labelEn: 'Home', enabled: true, order: 1 },
  { id: 'nav-categories', to: '/categories', labelFa: 'دسته‌بندی‌ها', labelEn: 'Collections', enabled: true, order: 2 },
  { id: 'nav-fine', to: '/fine-jewelry', labelFa: 'جواهرات فاخر', labelEn: 'Fine Jewellery', enabled: true, order: 3 },
  { id: 'nav-blog', to: '/blog', labelFa: 'وبلاگ', labelEn: 'Journal', enabled: true, order: 4 },
  { id: 'nav-about', to: '/about', labelFa: 'درباره ما', labelEn: 'About Us', enabled: true, order: 5 },
  { id: 'nav-contact', to: '/contact', labelFa: 'تماس با ما', labelEn: 'Contact', enabled: true, order: 6 },
];

export const DEFAULT_FOOTER_LINKS = [
  { id: 'foot-home', to: '/', labelFa: 'خانه', labelEn: 'Home', enabled: true, order: 1 },
  { id: 'foot-categories', to: '/categories', labelFa: 'دسته‌بندی‌ها', labelEn: 'Collections', enabled: true, order: 2 },
  { id: 'foot-blog', to: '/blog', labelFa: 'وبلاگ', labelEn: 'Journal', enabled: true, order: 3 },
  { id: 'foot-contact', to: '/contact', labelFa: 'تماس با ما', labelEn: 'Contact Us', enabled: true, order: 4 },
  { id: 'foot-about', to: '/about', labelFa: 'درباره ما', labelEn: 'About Us', enabled: true, order: 5 },
];

export function isSafeNavTargetUrl(rawUrl: string): boolean {
  const clean = String(rawUrl || '').trim();
  if (!clean || /[\x00-\x1f\x7f]/.test(clean)) return false;
  if (clean.startsWith('/') && !clean.startsWith('//')) {
    return true;
  }
  if (/^https:\/\//i.test(clean)) {
    try {
      const parsed = new URL(clean);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
  return false;
}

export function resolveNavLinks<T extends { id?: string; to: string; labelFa: string; labelEn?: string; enabled?: boolean; order?: number }>(
  configured: T[] | undefined,
  defaults: typeof DEFAULT_HEADER_LINKS
) {
  if (!Array.isArray(configured) || configured.length === 0) {
    return defaults;
  }
  const active = configured
    .filter((item) => item && item.enabled !== false && item.to && isSafeNavTargetUrl(item.to) && (item.labelFa || item.labelEn))
    .sort((a, b) => (a.order ?? 1) - (b.order ?? 1))
    .map((item, idx) => ({
      id: item.id || `nav-${idx + 1}`,
      to: item.to.trim(),
      labelFa: (item.labelFa || item.labelEn || '').trim(),
      labelEn: (item.labelEn || item.labelFa || '').trim(),
      enabled: true,
      order: item.order ?? idx + 1,
    }));

  return active.length > 0 ? active : defaults;
}

