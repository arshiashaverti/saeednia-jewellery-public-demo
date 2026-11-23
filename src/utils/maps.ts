import { ContactSettings } from '../types';

export interface ParsedMapResult {
  ok: boolean;
  lat?: number;
  lng?: number;
  zoom?: number;
  embedUrl?: string;
  externalUrl?: string;
  sourceType?: 'google_coords' | 'google_embed' | 'google_query' | 'openstreetmap' | 'coordinates';
  error?: string;
}

export interface RenderableMapData {
  canEmbed: boolean;
  lat?: number;
  lng?: number;
  zoom: number;
  embedUrl: string;
  externalUrl: string;
  error?: string;
}

const SHORT_MAP_HOSTS = new Set(['maps.app.goo.gl', 'goo.gl', 'g.co']);

const ALLOWED_GOOGLE_HOSTS = new Set([
  'www.google.com',
  'google.com',
  'maps.google.com',
]);

const ALLOWED_OSM_HOSTS = new Set([
  'www.openstreetmap.org',
  'openstreetmap.org',
]);

export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function buildGoogleMapsExternalUrl(lat: number, lng: number): string {
  const safeLat = Number(lat.toFixed(6));
  const safeLng = Number(lng.toFixed(6));
  return `https://www.google.com/maps/search/?api=1&query=${safeLat},${safeLng}`;
}

export function buildGoogleMapsEmbedUrl(
  lat: number,
  lng: number,
  zoom: number = 16,
  lang: 'fa' | 'en' = 'fa',
  apiKey?: string
): string {
  const safeLat = Number(lat.toFixed(6));
  const safeLng = Number(lng.toFixed(6));
  const safeZoom = Math.min(Math.max(Math.round(Number(zoom) || 16), 1), 21);
  const hl = lang === 'en' ? 'en' : 'fa';

  const trimmedKey = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (trimmedKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(trimmedKey)}&q=${safeLat},${safeLng}&zoom=${safeZoom}&language=${hl}`;
  }

  return `https://maps.google.com/maps?q=${safeLat},${safeLng}&z=${safeZoom}&hl=${hl}&output=embed`;
}

function extractIframeSrcIfSnippet(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.toLowerCase().includes('<iframe')) {
    return trimmed;
  }
  const match = trimmed.match(/<iframe\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  return (match?.[1] || match?.[2] || match?.[3] || '').trim();
}

function parseCoordinatePair(raw: string | null): { lat: number; lng: number } | null {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw).trim();
  const match = decoded.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:[,;\s]|$)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!isValidCoordinates(lat, lng)) return null;
  return { lat, lng };
}

export function parseGoogleMapsInput(
  rawInput: string,
  lang: 'fa' | 'en' = 'fa',
  apiKey?: string
): ParsedMapResult {
  const extracted = extractIframeSrcIfSnippet(rawInput || '');
  if (!extracted) {
    return { ok: false, error: 'لینک یا کد نقشه خالی است.' };
  }

  const lower = extracted.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return { ok: false, error: 'پروتکل نشانی واردشده مجاز نیست.' };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(extracted);
  } catch {
    return {
      ok: false,
      error: 'فرمت نشانی نقشه معتبر نیست. لطفاً یک لینک کامل HTTPS از Google Maps وارد کنید.',
    };
  }

  if (parsedUrl.protocol !== 'https:') {
    return { ok: false, error: 'نشانی نقشه باید فقط با پروتکل امن HTTPS باشد.' };
  }

  const host = parsedUrl.hostname.toLowerCase();

  if (SHORT_MAP_HOSTS.has(host)) {
    return {
      ok: false,
      error:
        'لینک‌های کوتاه (maps.app.goo.gl / goo.gl) در مرورگر قابل استخراج مستقیم نیستند. لینک را باز کرده و آدرس کامل مرورگر (شامل @lat,lng,zoom) را جای‌گذاری کنید.',
    };
  }

  if (ALLOWED_OSM_HOSTS.has(host)) {
    const mlat = Number(parsedUrl.searchParams.get('mlat'));
    const mlon = Number(parsedUrl.searchParams.get('mlon'));
    if (isValidCoordinates(mlat, mlon)) {
      return {
        ok: true,
        lat: mlat,
        lng: mlon,
        zoom: 16,
        embedUrl: parsedUrl.pathname.includes('/export/embed.html')
          ? parsedUrl.toString()
          : `https://www.openstreetmap.org/export/embed.html?bbox=${mlon - 0.004}%2C${mlat - 0.004}%2C${mlon + 0.004}%2C${mlat + 0.004}&layer=mapnik&marker=${mlat}%2C${mlon}`,
        externalUrl: `https://www.openstreetmap.org/?mlat=${mlat}&mlon=${mlon}#map=16/${mlat}/${mlon}`,
        sourceType: 'openstreetmap',
      };
    }
    if (parsedUrl.pathname.includes('/export/embed.html') && parsedUrl.searchParams.has('bbox')) {
      const marker = parseCoordinatePair(parsedUrl.searchParams.get('marker'));
      return {
        ok: true,
        lat: marker?.lat,
        lng: marker?.lng,
        zoom: 16,
        embedUrl: parsedUrl.toString(),
        externalUrl: marker
          ? `https://www.openstreetmap.org/?mlat=${marker.lat}&mlon=${marker.lng}#map=16/${marker.lat}/${marker.lng}`
          : 'https://www.openstreetmap.org/',
        sourceType: 'openstreetmap',
      };
    }
    return {
      ok: false,
      error: 'از این لینک OpenStreetMap مختصات معتبری استخراج نشد.',
    };
  }

  if (!ALLOWED_GOOGLE_HOSTS.has(host)) {
    return {
      ok: false,
      error: 'دامنه نشانی مجاز نیست. فقط لینک‌های Google Maps یا OpenStreetMap پشتیبانی می‌شوند.',
    };
  }

  const pathname = parsedUrl.pathname || '';
  const fullHref = parsedUrl.toString();

  // Check if it is a Google host without any map context (e.g. https://www.google.com/)
  if (!pathname.startsWith('/maps') && host !== 'maps.google.com') {
    return {
      ok: false,
      error: 'این نشانی مربوط به صفحه نقشه Google Maps نیست (مسیر باید با /maps شروع شود).',
    };
  }

  // 1. Existing official embed URL (/maps/embed or /maps/embed/v1/* or output=embed)
  if (
    pathname.startsWith('/maps/embed') ||
    parsedUrl.searchParams.get('output') === 'embed'
  ) {
    const qCoords =
      parseCoordinatePair(parsedUrl.searchParams.get('q')) ||
      parseCoordinatePair(parsedUrl.searchParams.get('ll')) ||
      parseCoordinatePair(parsedUrl.searchParams.get('center'));
    const zParam = Number(parsedUrl.searchParams.get('z') || parsedUrl.searchParams.get('zoom'));
    const zoom = Number.isFinite(zParam) && zParam >= 1 && zParam <= 21 ? Math.round(zParam) : 16;

    return {
      ok: true,
      lat: qCoords?.lat,
      lng: qCoords?.lng,
      zoom,
      embedUrl: fullHref,
      externalUrl: qCoords
        ? buildGoogleMapsExternalUrl(qCoords.lat, qCoords.lng)
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parsedUrl.searchParams.get('q') || 'Saeednia Jewellery')}`,
      sourceType: 'google_embed',
    };
  }

  // 2. Priority: explicit place marker coordinates (!3dLAT!4dLNG) OR viewport @lat,lng,zoom
  const placeCoordMatch = fullHref.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  const atCoordMatch = fullHref.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,(\d+(?:\.\d+)?)([zm]))?/i);

  if (atCoordMatch || placeCoordMatch) {
    const chosenLat = Number(placeCoordMatch?.[1] ?? atCoordMatch?.[1]);
    const chosenLng = Number(placeCoordMatch?.[2] ?? atCoordMatch?.[2]);
    let zoom = 16;
    if (atCoordMatch?.[3]) {
      const rawZoomVal = Number(atCoordMatch[3]);
      const unit = (atCoordMatch[4] || 'z').toLowerCase();
      if (unit === 'z' && Number.isFinite(rawZoomVal)) {
        zoom = Math.min(Math.max(Math.round(rawZoomVal), 1), 21);
      } else if (unit === 'm' && Number.isFinite(rawZoomVal)) {
        zoom = rawZoomVal <= 300 ? 17 : rawZoomVal <= 1000 ? 15 : 14;
      }
    }

    if (!isValidCoordinates(chosenLat, chosenLng)) {
      return { ok: false, error: 'مختصات جغرافیایی داخل لینک خارج از محدوده استاندارد است.' };
    }

    return {
      ok: true,
      lat: chosenLat,
      lng: chosenLng,
      zoom,
      embedUrl: buildGoogleMapsEmbedUrl(chosenLat, chosenLng, zoom, lang, apiKey),
      externalUrl: buildGoogleMapsExternalUrl(chosenLat, chosenLng),
      sourceType: 'google_coords',
    };
  }

  // 3. Coordinate query params (?q=lat,lng | ?query=lat,lng | ?ll=lat,lng | ?center=lat,lng)
  const queryCoordCandidate =
    parseCoordinatePair(parsedUrl.searchParams.get('q')) ||
    parseCoordinatePair(parsedUrl.searchParams.get('query')) ||
    parseCoordinatePair(parsedUrl.searchParams.get('ll')) ||
    parseCoordinatePair(parsedUrl.searchParams.get('center'));

  if (queryCoordCandidate) {
    const zParam = Number(parsedUrl.searchParams.get('z') || parsedUrl.searchParams.get('zoom'));
    const zoom = Number.isFinite(zParam) && zParam >= 1 && zParam <= 21 ? Math.round(zParam) : 16;
    return {
      ok: true,
      lat: queryCoordCandidate.lat,
      lng: queryCoordCandidate.lng,
      zoom,
      embedUrl: buildGoogleMapsEmbedUrl(queryCoordCandidate.lat, queryCoordCandidate.lng, zoom, lang, apiKey),
      externalUrl: buildGoogleMapsExternalUrl(queryCoordCandidate.lat, queryCoordCandidate.lng),
      sourceType: 'google_coords',
    };
  }

  // 4. Text search / place name URL (/maps/search/?api=1&query=... or /maps/place/Name)
  const searchQuery =
    parsedUrl.searchParams.get('query') ||
    parsedUrl.searchParams.get('q') ||
    (pathname.startsWith('/maps/place/')
      ? decodeURIComponent(pathname.replace('/maps/place/', '').split('/')[0]).replace(/\+/g, ' ')
      : '');

  if (searchQuery && searchQuery.trim().length >= 2) {
    const cleanQ = searchQuery.trim();
    const hl = lang === 'en' ? 'en' : 'fa';
    const trimmedKey = typeof apiKey === 'string' ? apiKey.trim() : '';
    const embedUrl = trimmedKey
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(trimmedKey)}&q=${encodeURIComponent(cleanQ)}&language=${hl}`
      : `https://maps.google.com/maps?q=${encodeURIComponent(cleanQ)}&z=16&hl=${hl}&output=embed`;
    return {
      ok: true,
      zoom: 16,
      embedUrl,
      externalUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanQ)}`,
      sourceType: 'google_query',
    };
  }

  return {
    ok: false,
    error: 'مختصات یا پارامتر مکان معتبری در این لینک Google Maps یافت نشد. لطفاً لینک دارای @lat,lng,zoom یا ?q=lat,lng را وارد کنید.',
  };
}

export function resolveRenderableMapData(
  contact: Partial<ContactSettings> | undefined,
  lang: 'fa' | 'en' = 'fa',
  apiKey?: string
): RenderableMapData {
  const coords = contact?.coordinates;
  const hasCoords = Boolean(
    coords &&
      typeof coords.lat === 'number' &&
      typeof coords.lng === 'number' &&
      isValidCoordinates(coords.lat, coords.lng) &&
      (coords.lat !== 0 || coords.lng !== 0)
  );
  const coordExternal = hasCoords
    ? buildGoogleMapsExternalUrl(coords!.lat, coords!.lng)
    : 'https://www.google.com';

  const safeGoogleMapsUrl =
    contact?.googleMapsUrl && /^https:\/\/(www\.google\.com|maps\.google\.com|maps\.app\.goo\.gl|goo\.gl)\//i.test(contact.googleMapsUrl)
      ? contact.googleMapsUrl
      : coordExternal;

  const rawEmbed = (contact?.mapEmbedUrl || '').trim();
  if (rawEmbed) {
    const parsed = parseGoogleMapsInput(rawEmbed, lang, apiKey);
    if (parsed.ok && parsed.embedUrl) {
      return {
        canEmbed: true,
        lat: parsed.lat ?? coords?.lat,
        lng: parsed.lng ?? coords?.lng,
        zoom: parsed.zoom || 16,
        embedUrl: parsed.embedUrl,
        externalUrl: parsed.externalUrl || safeGoogleMapsUrl,
      };
    }

    // Fallback to valid explicit coordinates if mapEmbedUrl is broken
    if (hasCoords) {
      return {
        canEmbed: true,
        lat: coords!.lat,
        lng: coords!.lng,
        zoom: 16,
        embedUrl: buildGoogleMapsEmbedUrl(coords!.lat, coords!.lng, 16, lang, apiKey),
        externalUrl: safeGoogleMapsUrl,
      };
    }

    return {
      canEmbed: false,
      zoom: 16,
      embedUrl: '',
      externalUrl: safeGoogleMapsUrl,
      error: parsed.error || 'امکان نمایش پیش‌نمایش نقشه برای نشانی ثبت‌شده وجود ندارد.',
    };
  }

  if (hasCoords) {
    return {
      canEmbed: true,
      lat: coords!.lat,
      lng: coords!.lng,
      zoom: 16,
      embedUrl: buildGoogleMapsEmbedUrl(coords!.lat, coords!.lng, 16, lang, apiKey),
      externalUrl: safeGoogleMapsUrl,
    };
  }

  return {
    canEmbed: false,
    zoom: 16,
    embedUrl: '',
    externalUrl: safeGoogleMapsUrl,
    error: 'مختصات یا لینک نقشه برای نمایش ثبت نشده است.',
  };
}
