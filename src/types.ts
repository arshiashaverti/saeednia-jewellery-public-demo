export type JewelleryCategoryKey = string;

export type AvailabilityStatus = 'in_stock' | 'made_to_order' | 'reserved';

export interface Product {
  id: string;
  slug?: string;
  titleFa: string;
  titleEn: string;
  category: string;
  categoryId?: string;
  descriptionFa: string;
  descriptionEn: string;
  price?: number | null;
  weight?: string;
  material?: string;
  mainImage: string;
  images: string[];
  productCode: string;
  availability: AvailabilityStatus;
  featured: boolean;
  displayOrder: number;
  visibility: boolean;
  status?: 'published' | 'draft';
  isTest?: boolean;
  specifications: {
    goldCarat?: string;
    gemstones?: string;
    approxWeight?: string;
    finish?: string;
  };
  showInLatestCreations?: boolean;
  latestCreationsOrder?: number;
  showInFineJewelry?: boolean;
  fineJewelryOrder?: number;
  seoTitleFa?: string;
  seoTitleEn?: string;
  metaDescriptionFa?: string;
  metaDescriptionEn?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ArticleSidebarModuleType =
  | 'featured_product'
  | 'featured_category'
  | 'selected_article'
  | 'promo_banner'
  | 'social_links'
  | 'custom_internal_link'
  | 'image_caption'
  | 'contact_info';

export type ArticleSidebarEntityType = '' | 'product' | 'category' | 'article';
export type ArticleSidebarDisplayStyle = 'card' | 'compact' | 'highlight';

export interface ArticleSidebarModule {
  id: string;
  articleId?: string;
  moduleType: ArticleSidebarModuleType;
  title: string;
  description?: string;
  mediaId?: string;
  imageUrl?: string;
  caption?: string;
  referencedEntityType?: ArticleSidebarEntityType;
  referencedEntityId?: string;
  destinationUrl?: string;
  displayOrder: number;
  isActive: boolean;
  displayStyle?: ArticleSidebarDisplayStyle;
  openInNewTab?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Article {
  id: string;
  slug: string;
  titleFa: string;
  titleEn?: string;
  excerptFa: string;
  excerptEn?: string;
  contentFa: string;
  contentEn?: string;
  coverImage?: string;
  featuredImage?: string;
  imageCaption?: string;
  author?: string;
  readingTime?: string;
  readingTimeMinutes?: number;
  category?: string;
  keywords?: string;
  status?: 'published' | 'draft';
  displayOrder?: number;
  published: boolean;
  publishedAt?: string;
  metaTitleFa?: string;
  metaTitleEn?: string;
  seoTitleFa?: string;
  seoTitleEn?: string;
  metaDescriptionFa?: string;
  metaDescriptionEn?: string;
  sidebarModules?: ArticleSidebarModule[];
  relatedArticleIds?: string[];
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: string;
  key: string;
  slug?: string;
  nameFa: string;
  nameEn: string;
  descriptionFa?: string;
  descriptionEn?: string;
  parentId?: string | null;
  image?: string;
  icon?: string;
  order: number;
  enabled?: boolean;
  showOnHome?: boolean;
  showInNav?: boolean;
  seoTitleFa?: string;
  seoTitleEn?: string;
  metaDescriptionFa?: string;
  metaDescriptionEn?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface PageContent {
  id: string; // 'home', 'collection', 'fine-jewelry', 'about', 'contact', 'blog', etc.
  name: string; // Internal name in admin
  slug: string; // Public route slug
  h1Fa: string; // Main headline on page
  h1En: string;
  subtitleFa?: string;
  subtitleEn?: string;
  browserTitleFa: string; // Document title (<title>)
  browserTitleEn: string;
  seoTitleFa: string; // SEO meta title
  seoTitleEn: string;
  metaDescriptionFa: string; // SEO meta description
  metaDescriptionEn: string;
  descriptionFa?: string; // Rich intro / editorial content
  descriptionEn?: string;
  featuredImage?: string;
  published: boolean;
  displayOrder: number;
  isDeleted?: boolean;
  deletedAt?: string;
  updatedAt?: string;
}

export interface LayoutGridConfig {
  columnsDesktop: number;
  columnsTablet: number;
  columnsMobile: number;
  itemsPerPage: number;
  paginationMode: 'pagination' | 'infinite' | 'view_all';
  cardGap: number;
  imageAspectRatio: 'portrait' | 'square' | 'wide';
  showProductName: boolean;
  showProductCode: boolean;
  showShortDescription: boolean;
  maxRows?: number;
}

export interface LayoutSettings {
  collectionPage: LayoutGridConfig;
  fineJewelryPage: LayoutGridConfig;
  homeFeatured: LayoutGridConfig;
}

export interface UrlRedirect {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'publish' | 'unpublish' | 'settings_change' | 'backup_restore';
  entityType: 'product' | 'category' | 'article' | 'page' | 'media' | 'settings';
  entityId?: string;
  entityTitle?: string;
  details?: string;
  user: string;
}

export interface HeroSettings {
  imageUrl: string;
  titleFa: string;
  titleEn: string;
  subtitleFa: string;
  subtitleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  ctaPrimaryFa: string;
  ctaPrimaryEn: string;
  ctaSecondaryFa: string;
  ctaSecondaryEn: string;
}

export interface PillarItem {
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
}

export type AboutGalleryItemFit = 'inherit' | 'cover' | 'contain';
export type AboutGalleryAspectRatio = '16:9' | '4:3' | '3:2';
export type AboutGalleryPlacement = 'before_story' | 'after_story' | 'after_quote' | 'bottom';

export interface AboutGalleryItem {
  id: string;
  mediaId?: string;
  url: string;
  altFa: string;
  altEn?: string;
  titleFa?: string;
  titleEn?: string;
  captionFa?: string;
  captionEn?: string;
  fit?: AboutGalleryItemFit;
  enabled: boolean;
  order: number;
  isFeatured?: boolean;
  createdAt?: string;
}

export interface AboutGallerySettings {
  enabled: boolean;
  titleFa: string;
  titleEn: string;
  subtitleFa?: string;
  subtitleEn?: string;
  placement: AboutGalleryPlacement;
  aspectRatio: AboutGalleryAspectRatio;
  defaultObjectFit: 'cover' | 'contain';
  showTitles: boolean;
  showCaptions: boolean;
  items: AboutGalleryItem[];
}

export interface AboutSettings {
  titleFa?: string;
  titleEn?: string;
  descriptionFa?: string;
  descriptionEn?: string;
  headlineFa?: string;
  headlineEn?: string;
  storyFa?: string[];
  storyEn?: string[];
  quoteFa?: string;
  quoteEn?: string;
  locationIdentityFa?: string;
  locationIdentityEn?: string;
  imageUrl?: string;
  pillars?: PillarItem[];
  gallery?: AboutGallerySettings;
}

export type PhoneContactType = 'landline' | 'mobile' | 'other';

export interface PhoneContactItem {
  id: string;
  number: string;
  displayLabelFa?: string;
  displayLabelEn?: string;
  type: PhoneContactType;
  order: number;
  enabled: boolean;
}

export type SocialMediaPlatformKey =
  | 'instagram'
  | 'telegram'
  | 'whatsapp'
  | 'youtube'
  | 'facebook'
  | 'x'
  | 'tiktok'
  | 'pinterest'
  | 'linkedin'
  | 'aparat'
  | 'eitaa'
  | 'bale'
  | 'rubika'
  | 'website'
  | 'custom';

export type CustomSocialIconKey =
  | 'globe'
  | 'share'
  | 'message'
  | 'video'
  | 'camera'
  | 'sparkles'
  | 'shopping-bag'
  | 'award'
  | 'send'
  | 'link';

export interface SocialMediaLink {
  id: string;
  platform: SocialMediaPlatformKey;
  customPlatformName?: string;
  customIconKey?: CustomSocialIconKey;
  displayNameFa: string;
  displayNameEn?: string;
  url: string;
  shortDescriptionFa?: string;
  shortDescriptionEn?: string;
  enabled: boolean;
  order: number;
  featured?: boolean;
}

export interface ContactSettings {
  addressFa?: string;
  addressEn?: string;
  phoneNumbers: string[];
  phoneItems?: PhoneContactItem[];
  socialLinks?: SocialMediaLink[];
  whatsappNumber?: string;
  whatsappDefaultMessageFa?: string;
  whatsappDefaultMessageEn?: string;
  whatsappEnabled?: boolean;
  instagramUsername?: string;
  instagramUrl?: string;
  googleMapsUrl?: string;
  wazeUrl?: string;
  neshanUrl?: string;
  appleMapsUrl?: string;
  openStreetMapUrl?: string;
  mapEmbedUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  enabledNavigationProviders?: ('google_maps' | 'waze' | 'apple_maps' | 'openstreetmap' | 'neshan')[];
  email?: string;
  openingHoursFa?: string;
  openingHoursEn?: string;
  locationNoteFa?: string;
  locationNoteEn?: string;
  contactTextFa?: string;
  contactTextEn?: string;
}

export interface FooterSettings {
  brandNameFa?: string;
  brandNameEn?: string;
  branchNameFa?: string;
  branchNameEn?: string;
  copyrightFa?: string;
  copyrightEn?: string;
  descriptionFa?: string;
  descriptionEn?: string;
}

export interface SectionsVisibility {
  hero: boolean;
  featuredCollection: boolean;
  categories: boolean;
  heritage: boolean;
  contact: boolean;
}

export interface LandingPageSettings {
  enabled: boolean;
  buttonTextFa: string;
  buttonTextEn: string;
  backgroundColor?: string;
  videoUrl?: string;
  posterUrl?: string;
}

export interface LatestCreationsSettings {
  enabled: boolean;
  titleFa: string;
  titleEn: string;
  subtitleFa?: string;
  subtitleEn?: string;
  autoScroll: boolean;
  direction: 'rtl' | 'ltr';
  speed: 'slow' | 'medium' | 'fast' | number;
  gap: number;
  cardsVisibleDesktop: number;
  cardsVisibleMobile: number;
  pauseOnHover: boolean;
  pauseOnInteract: boolean;
  hoverTextTheme?: 'light' | 'dark';
}

export interface BoutiqueSectionSettings {
  enabled: boolean;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  hoursTitleFa?: string;
  hoursTitleEn?: string;
  hoursFa: string;
  hoursEn: string;
  imageUrl?: string;
  imageSize?: 'normal' | 'large';
  addressSnippetFa?: string;
  addressSnippetEn?: string;
}

export interface FineJewelryPageSettings {
  titleFa?: string;
  titleEn?: string;
  subtitleFa?: string;
  subtitleEn?: string;
  columnsDesktop?: number;
}

export interface NavLinkItem {
  id: string;
  to: string;
  labelFa: string;
  labelEn: string;
  enabled?: boolean;
  order?: number;
}

export interface NavigationSettings {
  headerLinks?: NavLinkItem[];
  footerLinks?: NavLinkItem[];
}

export interface SiteSettings {
  brandNameFa: string;
  brandNameEn: string;
  businessFa?: string;
  businessEn?: string;
  branchNameFa?: string;
  branchNameEn?: string;
  locationIdentityFa?: string;
  locationIdentityEn?: string;
  subTitleFa?: string;
  subTitleEn?: string;
  taglineFa: string;
  taglineEn: string;
  logoUrl: string;
  faviconUrl?: string;
  landingPage?: LandingPageSettings;
  hero: HeroSettings;
  latestCreations?: LatestCreationsSettings;
  boutiqueSection?: BoutiqueSectionSettings;
  fineJewelryPageSettings?: FineJewelryPageSettings;
  about: AboutSettings;
  contact: ContactSettings;
  footer?: FooterSettings;
  navigation?: NavigationSettings;
  sectionsVisibility?: SectionsVisibility;
  footerTextFa: string;
  footerTextEn: string;
  homepageProductCount?: number;
  homepageProductsMode?: 'limited' | 'all';
  pages?: Record<string, PageContent>;
  layoutSettings?: LayoutSettings;
}

export interface AdminUser {
  username: string;
  name: string;
  role?: 'admin' | 'editor';
  authProvider?: 'supabase' | 'local';
}

export interface MediaAssetUsage {
  type: 'product' | 'page' | 'article' | 'settings';
  id: string;
  title: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  storagePath?: string;
  mimeType?: string;
  category: string;
  fileSize?: number; // bytes
  format?: string; // 'png', 'jpg', 'webp', etc.
  dimensions?: { width: number; height: number };
  altTextFa?: string;
  altTextEn?: string;
  caption?: string;
  uploadedBy?: string;
  metadata?: Record<string, any>;
  usageCount?: number;
  usedIn?: MediaAssetUsage[];
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
}

export interface PersistenceInfo {
  mode: 'supabase' | 'local_json';
  supabaseConfigured: boolean;
  frontendSupabaseConfigured?: boolean;
  storageBucket: string;
  jwtConfigured: boolean;
}
