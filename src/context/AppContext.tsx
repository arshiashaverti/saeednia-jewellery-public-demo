import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  SiteSettings,
  CategoryInfo,
  Product,
  MediaAsset,
  AdminUser,
  Article,
  PageContent,
  LayoutSettings,
  PersistenceInfo,
} from '../types.js';
import { safeParseJsonResponse } from '../lib/api.js';

interface AppContextType {
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  activePage: string;
  setActivePage: (page: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (prod: Product | null) => void;
  settings: SiteSettings | null;
  categories: CategoryInfo[];
  products: Product[];
  articles: Article[];
  pages: PageContent[];
  layoutSettings: LayoutSettings | null;
  media: MediaAsset[];
  persistenceInfo: PersistenceInfo | null;
  dataError: string | null;
  isLoading: boolean;
  token: string | null;
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  loginAdmin: (token: string, user: AdminUser) => void;
  updateAdminToken: (newToken: string) => void;
  logoutAdmin: () => Promise<void>;
  refreshData: () => Promise<void>;
  refreshArticles: () => Promise<void>;
  refreshMedia: () => Promise<void>;
  refreshPages: () => Promise<void>;
  refreshLayoutSettings: () => Promise<void>;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<'fa' | 'en'>('fa');
  const [activePage, setActivePage] = useState<'home' | 'collection' | 'about' | 'contact' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Theme Management (Defaults to obsidian dark luxury theme; UI preference kept in localStorage)
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('saeednia_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const applyTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    localStorage.setItem('saeednia_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    applyTheme(newTheme);
  }, [applyTheme]);

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings | null>(null);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [persistenceInfo, setPersistenceInfo] = useState<PersistenceInfo | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin auth state kept strictly in memory (never localStorage) paired with HttpOnly cookie session
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  const setLang = (newLang: 'fa' | 'en') => {
    setLangState(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'fa' ? 'rtl' : 'ltr';
  };

  const refreshArticles = useCallback(async () => {
    try {
      const res = await fetch('/api/articles?all=' + (token ? 'true' : 'false'), {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const parsed = await safeParseJsonResponse<Article[]>(res);
      if (parsed.ok && Array.isArray(parsed.data)) {
        setArticles(parsed.data);
      }
    } catch (err) {
      console.warn('Failed to load articles:', err);
    }
  }, [token]);

  const refreshPages = useCallback(async () => {
    try {
      const res = await fetch('/api/pages', {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const parsed = await safeParseJsonResponse<PageContent[]>(res);
      if (parsed.ok && Array.isArray(parsed.data)) {
        setPages(parsed.data);
      }
    } catch (err) {
      console.warn('Failed to load pages:', err);
    }
  }, [token]);

  const refreshLayoutSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/layout-settings');
      const parsed = await safeParseJsonResponse<LayoutSettings>(res);
      if (parsed.ok && parsed.data) {
        setLayoutSettings(parsed.data);
      }
    } catch (err) {
      console.warn('Failed to load layout settings:', err);
    }
  }, []);

  const refreshData = useCallback(async (retryAttempt = 0) => {
    setDataError(null);
    try {
      const [settingsRes, categoriesRes, productsRes, articlesRes, pagesRes, layoutRes, healthRes] =
        await Promise.all([
          fetch('/api/settings'),
          fetch('/api/categories?all=' + (token ? 'true' : 'false'), {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch('/api/products?includeHidden=' + (token ? 'true' : 'false'), {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch('/api/articles?all=' + (token ? 'true' : 'false'), {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch('/api/pages', {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch('/api/layout-settings'),
          fetch('/api/health'),
        ]);

      const [
        settingsParsed,
        categoriesParsed,
        productsParsed,
        articlesParsed,
        pagesParsed,
        layoutParsed,
        healthParsed,
      ] = await Promise.all([
        safeParseJsonResponse<SiteSettings>(settingsRes),
        safeParseJsonResponse<CategoryInfo[]>(categoriesRes),
        safeParseJsonResponse<Product[]>(productsRes),
        safeParseJsonResponse<Article[]>(articlesRes),
        safeParseJsonResponse<PageContent[]>(pagesRes),
        safeParseJsonResponse<LayoutSettings>(layoutRes),
        safeParseJsonResponse<{ persistence?: PersistenceInfo }>(healthRes),
      ]);

      // If proxy/server was mid-restart and returned HTML for an API call, retry once cleanly
      const anyHtml =
        settingsParsed.isHtmlResponse ||
        categoriesParsed.isHtmlResponse ||
        productsParsed.isHtmlResponse ||
        healthParsed.isHtmlResponse;
      if (anyHtml && retryAttempt === 0) {
        setTimeout(() => {
          refreshData(1);
        }, 700);
        return;
      }

      if (healthParsed.ok && healthParsed.data?.persistence) {
        setPersistenceInfo(healthParsed.data.persistence);
      }

      if (settingsParsed.ok && settingsParsed.data) {
        setSettings(settingsParsed.data);
      }
      if (categoriesParsed.ok && Array.isArray(categoriesParsed.data)) {
        setCategories(categoriesParsed.data);
      }
      if (productsParsed.ok && Array.isArray(productsParsed.data)) {
        setProducts(productsParsed.data);
      }
      if (articlesParsed.ok && Array.isArray(articlesParsed.data)) {
        setArticles(articlesParsed.data);
      }
      if (pagesParsed.ok && Array.isArray(pagesParsed.data)) {
        setPages(pagesParsed.data);
      }
      if (layoutParsed.ok && layoutParsed.data) {
        setLayoutSettings(layoutParsed.data);
      }

      if (!settingsParsed.ok && !categoriesParsed.ok && !productsParsed.ok) {
        const rawErr =
          categoriesParsed.errorMessage ||
          settingsParsed.errorMessage ||
          productsParsed.errorMessage ||
          '';
        if (rawErr.includes('schema cache') || rawErr.includes('Could not find the table')) {
          setDataError(
            'جداول پایگاه‌داده Supabase هنوز ایجاد نشده‌اند. لطفاً فایل‌های مایگریشن SQL (0001 و 0002) را در Supabase SQL Editor اجرا کنید.'
          );
        } else if (rawErr) {
          setDataError(rawErr);
        } else {
          setDataError('ارتباط با سرور اطلاعات برقرار نشد. لطفاً اتصال شبکه یا تنظیمات Supabase را بررسی کنید.');
        }
      }
    } catch (err) {
      console.warn('Failed to load initial site data:', err);
      setDataError('خطا در دریافت اطلاعات از پایگاه‌داده.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const refreshMedia = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/media', {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      const parsed = await safeParseJsonResponse<MediaAsset[]>(res);
      if (parsed.ok && Array.isArray(parsed.data)) {
        setMedia(parsed.data);
      }
    } catch (err) {
      console.warn('Failed to fetch media:', err);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Scrub any legacy localStorage admin tokens & restore active HttpOnly cookie session once on mount
  useEffect(() => {
    try {
      localStorage.removeItem('saeednia_admin_token');
      localStorage.removeItem('saeednia_admin_user');
    } catch {
      // Ignore storage access restrictions
    }

    fetch('/api/admin/me', { credentials: 'include' })
      .then((res) => (res.ok ? safeParseJsonResponse<{ admin?: AdminUser }>(res) : null))
      .then((parsed) => {
        if (parsed?.ok && parsed.data?.admin) {
          setAdminUser(parsed.data.admin);
          setToken('__cookie_session__');
        }
      })
      .catch(() => {});
  }, []);

  // Validate active admin session and fetch protected resources when authenticated
  useEffect(() => {
    if (token) {
      fetch('/api/admin/me', {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            setToken(null);
            setAdminUser(null);
          } else {
            refreshMedia();
          }
        })
        .catch(() => {});
    }
  }, [token, refreshMedia]);

  const loginAdmin = (newToken: string, user: AdminUser) => {
    setToken(newToken || '__cookie_session__');
    setAdminUser(user);
    try {
      localStorage.removeItem('saeednia_admin_token');
      localStorage.removeItem('saeednia_admin_user');
    } catch {
      // Ignore storage restrictions
    }
    refreshData();
    refreshMedia();
  };

  const updateAdminToken = (newToken: string) => {
    setToken(newToken || '__cookie_session__');
  };

  const logoutAdmin = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setToken(null);
    setAdminUser(null);
    setMedia([]);
    try {
      localStorage.removeItem('saeednia_admin_token');
      localStorage.removeItem('saeednia_admin_user');
    } catch {
      // Ignore storage restrictions
    }
    setActivePage('home');
    refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        activePage,
        setActivePage,
        selectedCategory,
        setSelectedCategory,
        selectedProduct,
        setSelectedProduct,
        settings,
        categories,
        products,
        articles,
        pages,
        layoutSettings,
        media,
        persistenceInfo,
        dataError,
        isLoading,
        token,
        adminUser,
        isAdminLoggedIn: Boolean(token && adminUser),
        loginAdmin,
        updateAdminToken,
        logoutAdmin,
        refreshData,
        refreshArticles,
        refreshMedia,
        refreshPages,
        refreshLayoutSettings,
        toast,
        showToast,
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
