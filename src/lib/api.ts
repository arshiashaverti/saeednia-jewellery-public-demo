export interface SafeJsonResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  errorMessage?: string;
  isHtmlResponse: boolean;
}

/**
 * Safely reads a fetch Response as JSON without throwing `SyntaxError: Unexpected token '<'`
 * if an HTML page (e.g. SPA fallback or proxy boot page) is returned instead of JSON.
 */
export async function safeParseJsonResponse<T = any>(res: Response): Promise<SafeJsonResult<T>> {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  let rawText = '';
  try {
    rawText = await res.text();
  } catch {
    return {
      ok: false,
      status: res.status,
      data: null,
      errorMessage: 'خطا در دریافت بدنه پاسخ از سرور.',
      isHtmlResponse: false,
    };
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      ok: res.ok,
      status: res.status,
      data: null,
      errorMessage: res.ok ? undefined : `خطای سرور (${res.status})`,
      isHtmlResponse: false,
    };
  }

  const looksLikeHtml =
    contentType.includes('text/html') ||
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<html');

  if (looksLikeHtml) {
    return {
      ok: false,
      status: res.status,
      data: null,
      errorMessage: 'پاسخ HTML به جای JSON دریافت شد (سرور API در دسترس نبود یا در حال راه‌اندازی است).',
      isHtmlResponse: true,
    };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        errorMessage:
          (parsed && typeof parsed === 'object' && (parsed.error || parsed.message)) ||
          `خطای سرور (${res.status})`,
        isHtmlResponse: false,
      };
    }
    return {
      ok: true,
      status: res.status,
      data: parsed as T,
      isHtmlResponse: false,
    };
  } catch {
    return {
      ok: false,
      status: res.status,
      data: null,
      errorMessage: `پاسخ نامعتبر غیرJSON از سرور دریافت شد (${res.status}).`,
      isHtmlResponse: false,
    };
  }
}
