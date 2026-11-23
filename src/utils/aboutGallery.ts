import type {
  AboutGalleryAspectRatio,
  AboutGalleryItem,
  AboutGalleryItemFit,
  AboutGalleryPlacement,
  AboutGallerySettings,
  AboutSettings,
} from '../types';

export const ABOUT_GALLERY_PLACEMENTS: readonly AboutGalleryPlacement[] = [
  'before_story',
  'after_story',
  'after_quote',
  'bottom',
] as const;

export const ABOUT_GALLERY_ASPECT_RATIOS: readonly AboutGalleryAspectRatio[] = [
  '16:9',
  '4:3',
  '3:2',
] as const;

export const DEFAULT_ABOUT_GALLERY_SETTINGS: AboutGallerySettings = {
  enabled: true,
  titleFa: 'گالری تصاویر مجموعه سعیدنیا',
  titleEn: 'Saeednia Collection Gallery',
  subtitleFa: 'نمایی از فضای گالری، ویترین‌ها و جزئیات ساخت جواهرات دست‌ساز سعیدنیا',
  subtitleEn: 'Glimpses of our boutique, vitrines, and artisanal fine-jewellery details',
  placement: 'after_quote',
  aspectRatio: '16:9',
  defaultObjectFit: 'cover',
  showTitles: true,
  showCaptions: true,
  items: [],
};

export function resolveAboutGallerySettings(about?: AboutSettings | null): AboutGallerySettings {
  const raw = about?.gallery;
  if (!raw || typeof raw !== 'object') {
    return {
      ...DEFAULT_ABOUT_GALLERY_SETTINGS,
      items: [],
    };
  }

  const placement: AboutGalleryPlacement = ABOUT_GALLERY_PLACEMENTS.includes(raw.placement)
    ? raw.placement
    : DEFAULT_ABOUT_GALLERY_SETTINGS.placement;

  const aspectRatio: AboutGalleryAspectRatio = ABOUT_GALLERY_ASPECT_RATIOS.includes(raw.aspectRatio)
    ? raw.aspectRatio
    : DEFAULT_ABOUT_GALLERY_SETTINGS.aspectRatio;

  const defaultObjectFit: 'cover' | 'contain' =
    raw.defaultObjectFit === 'contain' ? 'contain' : 'cover';

  const items: AboutGalleryItem[] = Array.isArray(raw.items)
    ? raw.items
        .filter((item): item is AboutGalleryItem => Boolean(item && typeof item === 'object' && typeof item.url === 'string' && item.url.trim()))
        .map((item, idx) => ({
          id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `about-gal-${idx + 1}`,
          mediaId: typeof item.mediaId === 'string' && item.mediaId.trim() ? item.mediaId.trim() : undefined,
          url: item.url.trim(),
          altFa: typeof item.altFa === 'string' ? item.altFa.trim() : '',
          altEn: typeof item.altEn === 'string' ? item.altEn.trim() : '',
          titleFa: typeof item.titleFa === 'string' ? item.titleFa.trim() : '',
          titleEn: typeof item.titleEn === 'string' ? item.titleEn.trim() : '',
          captionFa: typeof item.captionFa === 'string' ? item.captionFa.trim() : '',
          captionEn: typeof item.captionEn === 'string' ? item.captionEn.trim() : '',
          fit: (item.fit === 'cover' || item.fit === 'contain' ? item.fit : 'inherit') as AboutGalleryItemFit,
          enabled: item.enabled !== false,
          order: Number.isFinite(Number(item.order)) ? Number(item.order) : idx + 1,
          isFeatured: item.isFeatured === true,
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
        }))
        .sort((a, b) => a.order - b.order)
    : [];

  return {
    enabled: raw.enabled !== false,
    titleFa: typeof raw.titleFa === 'string' ? raw.titleFa.trim() : DEFAULT_ABOUT_GALLERY_SETTINGS.titleFa,
    titleEn: typeof raw.titleEn === 'string' ? raw.titleEn.trim() : DEFAULT_ABOUT_GALLERY_SETTINGS.titleEn,
    subtitleFa: typeof raw.subtitleFa === 'string' ? raw.subtitleFa.trim() : DEFAULT_ABOUT_GALLERY_SETTINGS.subtitleFa,
    subtitleEn: typeof raw.subtitleEn === 'string' ? raw.subtitleEn.trim() : DEFAULT_ABOUT_GALLERY_SETTINGS.subtitleEn,
    placement,
    aspectRatio,
    defaultObjectFit,
    showTitles: raw.showTitles !== false,
    showCaptions: raw.showCaptions !== false,
    items,
  };
}

export function getActiveAboutGalleryItems(gallery?: AboutGallerySettings | null): AboutGalleryItem[] {
  if (!gallery || !gallery.enabled || !Array.isArray(gallery.items)) {
    return [];
  }
  return gallery.items
    .filter((item) => item && item.enabled !== false && Boolean(item.url && item.url.trim()))
    .sort((a, b) => a.order - b.order);
}

export function resolveAboutGalleryItemFit(
  item: AboutGalleryItem,
  gallery: Pick<AboutGallerySettings, 'defaultObjectFit'>
): 'cover' | 'contain' {
  if (item.fit === 'cover' || item.fit === 'contain') {
    return item.fit;
  }
  return gallery.defaultObjectFit === 'contain' ? 'contain' : 'cover';
}

export function clampAboutGalleryIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  const mod = Math.trunc(index) % total;
  return mod < 0 ? mod + total : mod;
}

export function getNextAboutGalleryIndex(currentIndex: number, total: number): number {
  if (total <= 1) return 0;
  return clampAboutGalleryIndex(currentIndex + 1, total);
}

export function getPrevAboutGalleryIndex(currentIndex: number, total: number): number {
  if (total <= 1) return 0;
  return clampAboutGalleryIndex(currentIndex - 1, total);
}

export function getAboutGalleryAspectClasses(
  aspectRatio: AboutGalleryAspectRatio,
  previewViewport?: 'desktop' | 'tablet' | 'mobile'
): string {
  if (previewViewport === 'mobile') {
    return 'aspect-[4/3]';
  }
  switch (aspectRatio) {
    case '4:3':
      return 'aspect-[4/3]';
    case '3:2':
      return 'aspect-[4/3] sm:aspect-[3/2]';
    case '16:9':
    default:
      return 'aspect-[4/3] sm:aspect-[16/9]';
  }
}

export function reorderAboutGalleryItems(
  items: AboutGalleryItem[],
  fromIndex: number,
  toIndex: number
): AboutGalleryItem[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items.map((item, idx) => ({ ...item, order: idx + 1 }));
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((item, idx) => ({ ...item, order: idx + 1 }));
}
