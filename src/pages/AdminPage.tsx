import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { safeParseJsonResponse } from '../lib/api';
import { applyPageSeo } from '../utils/seo';
import { DEFAULT_HEADER_LINKS, DEFAULT_FOOTER_LINKS, isSafeNavTargetUrl } from '../utils/contactAndArticles';
import { CORE_SYSTEM_PAGE_IDS } from '../utils/customPages';
import type { NavLinkItem } from '../types';
import { DashboardTab } from '../components/admin/DashboardTab';
import { ProductsTab } from '../components/admin/ProductsTab';
import { CategoriesTab } from '../components/admin/CategoriesTab';
import { PagesTab } from '../components/admin/PagesTab';
import { LayoutTab } from '../components/admin/LayoutTab';
import { HomepageTab } from '../components/admin/HomepageTab';
import { FineJewelryTab } from '../components/admin/FineJewelryTab';
import { ArticlesTab } from '../components/admin/ArticlesTab';
import { AboutTab } from '../components/admin/AboutTab';
import { ContactTab } from '../components/admin/ContactTab';
import { TrashTab } from '../components/admin/TrashTab';
import { ActivityLogsTab } from '../components/admin/ActivityLogsTab';
import { BackupTab } from '../components/admin/BackupTab';
import { MediaLibraryModal } from '../components/admin/MediaLibraryModal';
import {
  Shield,
  KeyRound,
  LogOut,
  Package,
  Layers,
  FileText,
  Phone,
  Settings,
  RefreshCw,
  BookOpen,
  LayoutDashboard,
  Crown,
  MoveHorizontal,
  Sliders,
  Trash2,
  History,
  Database,
  Upload,
  Image as ImageIcon,
  Check,
  Navigation as NavigationIcon,
  Plus,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const {
    setActivePage,
    token,
    adminUser,
    isAdminLoggedIn,
    loginAdmin,
    updateAdminToken,
    logoutAdmin,
    settings,
    categories,
    products,
    articles,
    pages,
    media,
    persistenceInfo,
    refreshData,
    showToast,
  } = useApp();

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'products'
    | 'categories'
    | 'pages'
    | 'layout'
    | 'homepage'
    | 'finejewelry'
    | 'articles'
    | 'about'
    | 'contact'
    | 'media'
    | 'trash'
    | 'history'
    | 'backup'
    | 'settings'
  >('dashboard');

  // Media Library Modal standalone & picker state
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<'browse' | 'logo' | 'landingPoster'>('browse');

  // Settings local drafts
  const [brandDraft, setBrandDraft] = useState({
    brandNameFa: settings?.brandNameFa || '',
    brandNameEn: settings?.brandNameEn || '',
    branchNameFa: settings?.branchNameFa || '',
    branchNameEn: settings?.branchNameEn || '',
    locationIdentityFa: settings?.locationIdentityFa || '',
    locationIdentityEn: settings?.locationIdentityEn || '',
    taglineFa: settings?.taglineFa || '',
    taglineEn: settings?.taglineEn || '',
    logoUrl: settings?.logoUrl || '',
    footerTextFa: settings?.footer?.copyrightFa || settings?.footerTextFa || '',
    footerTextEn: settings?.footer?.copyrightEn || settings?.footerTextEn || '',
    homepageProductCount: settings?.homepageProductCount || 6,
    homepageProductsMode: (settings?.homepageProductsMode || 'limited') as 'limited' | 'all',
  });

  const normalizeLandingBg = (bg?: string) => {
    const clean = (bg || '').trim();
    return /^#[0-9a-fA-F]{6}$/.test(clean) && clean.toLowerCase() !== '#050507' ? clean : '#02130e';
  };

  const [landingDraft, setLandingDraft] = useState({
    enabled: settings?.landingPage?.enabled !== false,
    buttonTextFa: settings?.landingPage?.buttonTextFa || 'مشاهده مجموعه',
    buttonTextEn: settings?.landingPage?.buttonTextEn || 'View Collection',
    backgroundColor: normalizeLandingBg(settings?.landingPage?.backgroundColor),
    videoUrl: settings?.landingPage?.videoUrl ?? '',
    posterUrl: settings?.landingPage?.posterUrl || '/images/entrance_emerald_gold.png',
  });

  const [navDraft, setNavDraft] = useState<{ headerLinks: NavLinkItem[]; footerLinks: NavLinkItem[] }>({
    headerLinks:
      settings?.navigation?.headerLinks && settings.navigation.headerLinks.length > 0
        ? settings.navigation.headerLinks
        : DEFAULT_HEADER_LINKS,
    footerLinks:
      settings?.navigation?.footerLinks && settings.navigation.footerLinks.length > 0
        ? settings.navigation.footerLinks
        : DEFAULT_FOOTER_LINKS,
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    applyPageSeo({
      browserTitle: 'پنل مدیریت | جواهری سعیدنیا',
      metaDescription: 'سامانه مدیریت محتوای جواهری سعیدنیا',
      robots: 'noindex, nofollow',
      canonicalPath: '/admin',
    });
  }, []);

  useEffect(() => {
    if (settings) {
      setBrandDraft({
        brandNameFa: settings.brandNameFa,
        brandNameEn: settings.brandNameEn,
        branchNameFa: settings.branchNameFa || '',
        branchNameEn: settings.branchNameEn || '',
        locationIdentityFa: settings.locationIdentityFa || '',
        locationIdentityEn: settings.locationIdentityEn || '',
        taglineFa: settings.taglineFa,
        taglineEn: settings.taglineEn,
        logoUrl: settings.logoUrl || '',
        footerTextFa: settings.footer?.copyrightFa || settings.footerTextFa || '',
        footerTextEn: settings.footer?.copyrightEn || settings.footerTextEn || '',
        homepageProductCount: settings.homepageProductCount || 6,
        homepageProductsMode: (settings.homepageProductsMode || 'limited') as 'limited' | 'all',
      });
      setLandingDraft({
        enabled: settings.landingPage?.enabled !== false,
        buttonTextFa: settings.landingPage?.buttonTextFa || 'مشاهده مجموعه',
        buttonTextEn: settings.landingPage?.buttonTextEn || 'View Collection',
        backgroundColor: normalizeLandingBg(settings.landingPage?.backgroundColor),
        videoUrl: settings.landingPage?.videoUrl ?? '',
        posterUrl: settings.landingPage?.posterUrl || '/images/entrance_emerald_gold.png',
      });
      setNavDraft({
        headerLinks:
          settings.navigation?.headerLinks && settings.navigation.headerLinks.length > 0
            ? settings.navigation.headerLinks
            : DEFAULT_HEADER_LINKS,
        footerLinks:
          settings.navigation?.footerLinks && settings.navigation.footerLinks.length > 0
            ? settings.navigation.footerLinks
            : DEFAULT_FOOTER_LINKS,
      });
    }
  }, [settings]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const parsed = await safeParseJsonResponse<{ token: string; admin: any }>(res);
      if (!parsed.ok || !parsed.data) {
        throw new Error(parsed.errorMessage || 'ورود ناموفق بود');
      }

      setPassword('');
      loginAdmin(parsed.data.token, parsed.data.admin);
      showToast('ورود به سامانه مدیریت جواهری سعیدنیا با موفقیت انجام شد', 'success');
    } catch (err: any) {
      setLoginError(err.message || 'نام کاربری یا رمز عبور اشتباه است');
    } finally {
      setLoginLoading(false);
    }
  };

  // Save Brand & Global Identity
  const handleSaveBrand = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...brandDraft,
          footer: {
            ...(settings?.footer || {}),
            copyrightFa: brandDraft.footerTextFa,
            copyrightEn: brandDraft.footerTextEn,
            brandNameFa: brandDraft.brandNameFa,
            brandNameEn: brandDraft.brandNameEn,
            branchNameFa: brandDraft.branchNameFa,
            branchNameEn: brandDraft.branchNameEn,
          },
        }),
      });
      const parsed = await safeParseJsonResponse(res);
      if (parsed.ok) {
        showToast('هویت برند با موفقیت ذخیره شد', 'success');
        refreshData();
      } else {
        showToast(parsed.errorMessage || 'خطا در ذخیره تنظیمات برند', 'error');
      }
    } catch {
      showToast('خطا در ذخیره تنظیمات برند', 'error');
    }
  };

  // Save Landing Page Settings
  const handleSaveLanding = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          landingPage: landingDraft,
        }),
      });
      const parsed = await safeParseJsonResponse(res);
      if (parsed.ok) {
        showToast('تنظیمات صفحه ورودی سینمایی با موفقیت ذخیره شد', 'success');
        refreshData();
      } else {
        showToast(parsed.errorMessage || 'خطا در ذخیره تنظیمات صفحه ورودی', 'error');
      }
    } catch {
      showToast('خطا در ذخیره تنظیمات صفحه ورودی', 'error');
    }
  };

  // Save Header & Footer Navigation
  const handleSaveNavigation = async () => {
    if (!token) return;
    const allItems = [...navDraft.headerLinks, ...navDraft.footerLinks];
    for (const item of allItems) {
      if (!item.labelFa.trim() || !isSafeNavTargetUrl(item.to)) {
        showToast(`لطفاً عنوان و مسیر معتبر (مانند /about) برای لینک «${item.labelFa || item.to || '#'}» وارد کنید.`, 'error');
        return;
      }
    }
    try {
      const normalizedPayload = {
        headerLinks: navDraft.headerLinks.map((item, idx) => ({ ...item, order: idx + 1 })),
        footerLinks: navDraft.footerLinks.map((item, idx) => ({ ...item, order: idx + 1 })),
      };
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ navigation: normalizedPayload }),
      });
      const parsed = await safeParseJsonResponse(res);
      if (!parsed.ok) {
        throw new Error(parsed.errorMessage || 'خطا در ذخیره تنظیمات منو');
      }
      showToast('تنظیمات منوی هدر و دسترسی سریع فوتر ذخیره شد', 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره تنظیمات منو', 'error');
    }
  };

  const updateNavLinkItem = (
    listKey: 'headerLinks' | 'footerLinks',
    idx: number,
    patch: Partial<NavLinkItem>
  ) => {
    setNavDraft((prev) => ({
      ...prev,
      [listKey]: prev[listKey].map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  };

  const moveNavLinkItem = (listKey: 'headerLinks' | 'footerLinks', idx: number, dir: -1 | 1) => {
    setNavDraft((prev) => {
      const next = [...prev[listKey]];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...prev, [listKey]: next };
    });
  };

  const addNavLinkItem = (
    listKey: 'headerLinks' | 'footerLinks',
    preset?: { to: string; labelFa: string; labelEn: string }
  ) => {
    setNavDraft((prev) => ({
      ...prev,
      [listKey]: [
        ...prev[listKey],
        {
          id: `${listKey === 'headerLinks' ? 'nav' : 'foot'}-${Date.now()}`,
          to: preset?.to || '/',
          labelFa: preset?.labelFa || 'لینک جدید',
          labelEn: preset?.labelEn || 'New Link',
          enabled: true,
          order: prev[listKey].length + 1,
        },
      ],
    }));
  };

  const removeNavLinkItem = (listKey: 'headerLinks' | 'footerLinks', idx: number) => {
    setNavDraft((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== idx),
    }));
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (passwordForm.next.length < 8) {
      showToast('رمز عبور جدید باید حداقل ۸ کاراکتر باشد', 'error');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      showToast('تکرار رمز عبور جدید مطابقت ندارد', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      });

      const parsed = await safeParseJsonResponse<{ token?: string }>(res);
      if (!parsed.ok) throw new Error(parsed.errorMessage || 'تغییر رمز عبور ناموفق بود');
      if (parsed.data?.token) {
        updateAdminToken(parsed.data.token);
      }

      showToast('رمز عبور مدیریت با موفقیت تغییر یافت', 'success');
      setPasswordForm({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // If not logged in, render Secure Minimalist Login
  if (!isAdminLoggedIn) {
    return (
      <div id="admin-login-screen" className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0E0E12] border border-[#C5A059]/20 rounded-sm p-8 sm:p-10 shadow-2xl relative">
          
          {/* Header */}
          <div className="text-center mb-8">
            <span className="font-cinzel text-xs text-[#C5A059] tracking-[0.3em] uppercase block mb-3 font-medium">
              SAEEDNIA
            </span>
            <h1 className="text-2xl font-light text-[#EDE8DF] font-vazir mb-1.5">
              مدیریت محتوای جواهری
            </h1>
            <p className="font-cinzel text-[11px] text-[#8C8880] tracking-widest uppercase">
              سامانه جامع CMS
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 bg-red-950/20 border border-red-900/40 rounded-sm text-xs text-red-300 text-center leading-relaxed">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">
                شناسه کاربری
              </label>
              <input
                id="input-admin-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">
                رمز عبور
              </label>
              <input
                id="input-admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                id="btn-admin-login-submit"
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-[#C5A059] hover:bg-[#D4AF37] disabled:bg-[#C5A059]/50 text-[#0A0A0B] text-xs font-semibold tracking-wider uppercase font-cinzel rounded-sm transition-all shadow-md shadow-[#C5A059]/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loginLoading ? <span>در حال بررسی...</span> : <span>ورود به سامانه</span>}
              </button>
            </div>
          </form>

          {/* Return to website */}
          <div className="mt-8 pt-6 border-t border-[#C5A059]/10 text-center">
            <Link
              to="/"
              onClick={() => setActivePage('home')}
              className="text-xs text-[#8C8880] hover:text-[#C5A059] transition-colors inline-block"
            >
              بازگشت به وبسایت
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // Active counts
  const activeProductsCount = products.filter((p) => !p.isDeleted).length;
  const activeCategoriesCount = categories.filter((c) => !c.isDeleted).length;
  const activeArticlesCount = articles.filter((a) => !a.isDeleted).length;
  const isSupabaseMode = persistenceInfo?.mode === 'supabase';
  const isFullAdmin = !adminUser?.role || adminUser.role === 'admin';

  const ALL_TABS = [
    { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
    { id: 'products', label: 'محصولات', icon: Package, count: activeProductsCount },
    { id: 'categories', label: 'دسته‌بندی‌ها', icon: Layers, count: activeCategoriesCount },
    { id: 'pages', label: 'عنوان و صفحات', icon: Layers, count: pages.length },
    { id: 'layout', label: 'چیدمان گرید', icon: Sliders },
    { id: 'homepage', label: 'صفحه اصلی', icon: MoveHorizontal },
    {
      id: 'finejewelry',
      label: 'جواهرات فاخر',
      icon: Crown,
      count: products.filter((p) => !p.isDeleted && p.visibility && !p.isTest && p.status !== 'draft' && (Boolean(p.showInFineJewelry) || p.featured)).length,
    },
    { id: 'articles', label: 'وبلاگ', icon: BookOpen, count: activeArticlesCount },
    { id: 'about', label: 'درباره ما', icon: FileText },
    { id: 'contact', label: 'تماس با ما', icon: Phone },
    { id: 'media', label: 'کتابخانه رسانه', icon: Upload, count: media.length },
    { id: 'trash', label: 'سطل زباله', icon: Trash2 },
    { id: 'history', label: 'تاریخچه رویدادها', icon: History, adminOnly: true },
    { id: 'backup', label: 'پشتیبان و پایداری', icon: Database, adminOnly: true },
    { id: 'settings', label: 'برند و امنیت', icon: Settings, adminOnly: true },
  ];

  const TABS = ALL_TABS.filter((tab) => !tab.adminOnly || isFullAdmin);

  return (
    <div id="admin-dashboard" className="min-h-screen bg-[#070708] text-[#EDE8DF] pt-0 pb-20 text-start">
      
      {/* Top Admin Header Bar */}
      <header className="bg-[#0D0D10] border-b border-[#C5A059]/20 sticky top-0 z-40 shadow-[0_6px_24px_rgba(0,0,0,0.75)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <Shield className="w-5 h-5 text-[#C5A059] shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <span className="font-vazir text-sm font-semibold text-[#EDE8DF] block truncate">
                {adminUser?.name || 'مدیریت جواهری سعیدنیا'}
              </span>
              <span
                className={`text-[10px] flex items-center gap-1 font-mono truncate ${
                  isSupabaseMode ? 'text-[#25D366]' : 'text-amber-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isSupabaseMode ? 'bg-[#25D366]' : 'bg-amber-400'
                  }`}
                />
                <span className="truncate">
                  {isSupabaseMode
                    ? 'متصل به Supabase PostgreSQL + Storage'
                    : 'حالت محلی موقت (Local JSON — در انتظار تنظیم Secrets سوپابیس)'}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/"
              onClick={() => setActivePage('home')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#15151C] hover:bg-[#1E1E28] text-xs text-[#C5A059] hover:text-[#D4AF37] border border-[#C5A059]/20 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
              title="مشاهده وب‌سایت عمومی"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مشاهده سایت</span>
            </Link>

            <button
              type="button"
              onClick={refreshData}
              className="p-1.5 text-xs text-[#C5A059] hover:text-[#D4AF37] border border-[#C5A059]/20 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
              title="تازه‌سازی اطلاعات"
              aria-label="تازه‌سازی اطلاعات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              id="btn-admin-logout"
              type="button"
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#17171C] hover:bg-red-950/40 text-xs text-[#C8C4BC] hover:text-red-300 border border-[#C5A059]/20 rounded-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Horizontal Scroll */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-t border-[#C5A059]/10 pt-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#141418]'
                    : 'border-transparent text-[#9E9A92] hover:text-[#EDE8DF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#C5A059] text-black font-semibold' : 'bg-[#1C1C22] text-[#C5A059]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Admin Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 0: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onOpenAddProduct={() => setActiveTab('products')}
          />
        )}

        {/* TAB 1: PRODUCTS CMS */}
        {activeTab === 'products' && <ProductsTab />}

        {/* TAB 2: CATEGORIES CMS */}
        {activeTab === 'categories' && <CategoriesTab />}

        {/* TAB 3: PAGES & TITLES CMS */}
        {activeTab === 'pages' && <PagesTab />}

        {/* TAB 4: LAYOUT & GRID SETTINGS */}
        {activeTab === 'layout' && <LayoutTab />}

        {/* TAB 5: HOMEPAGE CMS */}
        {activeTab === 'homepage' && <HomepageTab />}

        {/* TAB 6: FINE JEWELRY CMS */}
        {activeTab === 'finejewelry' && (
          <FineJewelryTab onOpenAddProduct={() => setActiveTab('products')} />
        )}

        {/* TAB 7: ARTICLES & BLOG */}
        {activeTab === 'articles' && <ArticlesTab />}

        {/* TAB 8: ABOUT SAEDNIA */}
        {activeTab === 'about' && <AboutTab />}

        {/* TAB 9: CONTACT & BOUTIQUE */}
        {activeTab === 'contact' && <ContactTab />}

        {/* TAB 10: MEDIA LIBRARY */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="bg-[#0D0D10] border border-[#C5A059]/20 p-5 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-medium text-[#EDE8DF] font-vazir flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#C5A059]" />
                  <span>کتابخانه و مدیریت تصاویر لوکس (Media Assets)</span>
                </h3>
                <p className="text-xs text-[#8C8880] mt-1">
                  مشاهده تمام تصاویر، بررسی وابستگی‌ها به محصولات و صفحات، و آپلود تصاویر جدید با حفظ کیفیت
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMediaTargetField('browse');
                  setIsMediaModalOpen(true);
                }}
                className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black text-xs font-semibold rounded-sm flex items-center gap-2 shadow-md transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>باز کردن گالری و آپلود فایل</span>
              </button>
            </div>

            {/* Inline Quick Media Grid */}
            <div className="bg-[#0D0D10] border border-[#C5A059]/20 p-5 rounded-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {media.slice(0, 18).map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      setMediaTargetField('browse');
                      setIsMediaModalOpen(true);
                    }}
                    className="group relative rounded overflow-hidden border border-[#C5A059]/15 hover:border-[#C5A059] aspect-square bg-black cursor-pointer transition-all text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                    aria-label={`باز کردن کتابخانه رسانه برای ${asset.name}`}
                  >
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 flex flex-col justify-end text-[10px] text-[#EDE8DF]">
                      <span className="truncate font-mono">{asset.name}</span>
                      <span className="text-[#C5A059] truncate">{asset.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: TRASH & RECOVERY */}
        {activeTab === 'trash' && <TrashTab />}

        {/* TAB 12: ACTIVITY LOGS */}
        {activeTab === 'history' && isFullAdmin && <ActivityLogsTab />}

        {/* TAB 13: BACKUP & DATABASE PERSISTENCE */}
        {activeTab === 'backup' && isFullAdmin && <BackupTab />}

        {/* TAB 14: SETTINGS & BRAND */}
        {activeTab === 'settings' && isFullAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
            {/* Brand Settings */}
            <div className="bg-[#0D0D10] border border-[#C5A059]/20 p-6 rounded-sm space-y-4">
              <h3 className="text-base font-medium text-[#EDE8DF] font-vazir mb-1 flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#C5A059]" />
                <span>هویت برند و متون عمومی</span>
              </h3>

              <div>
                <label className="block text-xs text-[#C8C4BC] mb-1">نام برند به فارسی</label>
                <input
                  type="text"
                  value={brandDraft.brandNameFa}
                  onChange={(e) => setBrandDraft({ ...brandDraft, brandNameFa: e.target.value })}
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#C8C4BC] mb-1">نام انگلیسی برند</label>
                <input
                  type="text"
                  value={brandDraft.brandNameEn}
                  onChange={(e) => setBrandDraft({ ...brandDraft, brandNameEn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm font-cinzel focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#C8C4BC] mb-1">نام شعبه (فارسی)</label>
                  <input
                    type="text"
                    value={brandDraft.branchNameFa}
                    onChange={(e) => setBrandDraft({ ...brandDraft, branchNameFa: e.target.value })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C8C4BC] mb-1">نام شعبه (انگلیسی)</label>
                  <input
                    type="text"
                    value={brandDraft.branchNameEn}
                    onChange={(e) => setBrandDraft({ ...brandDraft, branchNameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm font-cinzel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#C8C4BC] mb-1">هویت مکانی (فارسی)</label>
                  <input
                    type="text"
                    value={brandDraft.locationIdentityFa}
                    onChange={(e) => setBrandDraft({ ...brandDraft, locationIdentityFa: e.target.value })}
                    placeholder="بازار بزرگ تهران"
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C8C4BC] mb-1">هویت مکانی (انگلیسی)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={brandDraft.locationIdentityEn}
                    onChange={(e) => setBrandDraft({ ...brandDraft, locationIdentityEn: e.target.value })}
                    placeholder="Grand Bazaar Tehran"
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm font-cinzel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#C8C4BC] mb-1">شعار برند (فارسی)</label>
                  <input
                    type="text"
                    value={brandDraft.taglineFa}
                    onChange={(e) => setBrandDraft({ ...brandDraft, taglineFa: e.target.value })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C8C4BC] mb-1">شعار برند (انگلیسی)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={brandDraft.taglineEn}
                    onChange={(e) => setBrandDraft({ ...brandDraft, taglineEn: e.target.value })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#C8C4BC] mb-1">متن کپی‌رایت فوتر (فارسی)</label>
                <input
                  type="text"
                  value={brandDraft.footerTextFa}
                  onChange={(e) => setBrandDraft({ ...brandDraft, footerTextFa: e.target.value })}
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-[#C8C4BC] mb-1">متن کپی‌رایت فوتر (انگلیسی)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={brandDraft.footerTextEn}
                  onChange={(e) => setBrandDraft({ ...brandDraft, footerTextEn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm font-sans"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[#C8C4BC]">تصویر لوگوی رسمی برند</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaTargetField('logo');
                      setIsMediaModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-[#1C1C24] hover:bg-[#C5A059] text-[#EDE8DF] hover:text-black rounded text-[11px] transition-colors flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>انتخاب از کتابخانه تصاویر</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    dir="ltr"
                    value={brandDraft.logoUrl}
                    onChange={(e) => setBrandDraft({ ...brandDraft, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm font-mono"
                  />
                  {brandDraft.logoUrl && (
                    <div className="w-10 h-10 rounded overflow-hidden border border-[#C5A059]/30 bg-black shrink-0 p-1">
                      <img src={brandDraft.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveBrand}
                className="w-full py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] text-xs font-semibold rounded-sm transition-colors"
              >
                ذخیره تنظیمات هویت برند
              </button>
            </div>

            {/* Security & Entrance */}
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-[#0D0D10] border border-[#C5A059]/20 p-6 rounded-sm space-y-4">
                <h3 className="text-base font-medium text-[#EDE8DF] font-vazir mb-1 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#C5A059]" />
                  <span>تغییر رمز عبور مدیریت (امنیت)</span>
                </h3>
                <p className="text-xs text-[#8C8880]">
                  رمز عبور جدید به‌صورت امن در سرور هش‌گذاری خواهد شد.
                </p>

                <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#C8C4BC] mb-1">رمز عبور فعلی</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[#C8C4BC] mb-1">رمز عبور جدید (حداقل ۸ کاراکتر)</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordForm.next}
                      onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                      className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[#C8C4BC] mb-1">تکرار رمز عبور جدید</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#181820] hover:bg-[#C5A059] hover:text-[#0A0A0B] border border-[#C5A059]/30 text-[#EDE8DF] text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                  >
                    به‌روزرسانی رمز عبور
                  </button>
                </form>
              </div>

              {/* Entrance Screen Full Controls */}
              <div className="bg-[#0D0D10] border border-[#C5A059]/20 p-6 rounded-sm space-y-4">
                <h3 className="text-base font-medium text-[#EDE8DF] font-vazir mb-1">
                  صفحه ورودی سینمایی (First Screen)
                </h3>
                <div className="flex items-center justify-between p-3 bg-[#08080A] border border-[#C5A059]/20 rounded-sm">
                  <div>
                    <span className="text-xs text-[#EDE8DF] block font-medium">فعال‌سازی صفحه ورودی سینمایی</span>
                    <span className="text-[11px] text-[#8C8880]">نمایش دکمه ورود قبل از بارگذاری صفحه اصلی</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLandingDraft({ ...landingDraft, enabled: !landingDraft.enabled })}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                      landingDraft.enabled ? 'bg-[#C5A059]' : 'bg-[#25252A]'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-[#0A0A0B] shadow transition-transform ${
                        landingDraft.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#C8C4BC] mb-1">متن دکمه ورود (فارسی)</label>
                    <input
                      type="text"
                      value={landingDraft.buttonTextFa}
                      onChange={(e) => setLandingDraft({ ...landingDraft, buttonTextFa: e.target.value })}
                      placeholder="مشاهده مجموعه"
                      className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[#C8C4BC] mb-1">Entrance Button (English)</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={landingDraft.buttonTextEn}
                      onChange={(e) => setLandingDraft({ ...landingDraft, buttonTextEn: e.target.value })}
                      placeholder="View Collection"
                      className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-cinzel"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#C8C4BC] mb-1">رنگ پس‌زمینه (Hex)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={/^#[0-9a-fA-F]{6}$/.test(landingDraft.backgroundColor) ? landingDraft.backgroundColor : '#02130e'}
                        onChange={(e) => setLandingDraft({ ...landingDraft, backgroundColor: e.target.value })}
                        className="w-9 h-9 rounded bg-transparent border border-[#C5A059]/25 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        dir="ltr"
                        value={landingDraft.backgroundColor}
                        onChange={(e) => setLandingDraft({ ...landingDraft, backgroundColor: e.target.value })}
                        placeholder="#02130e"
                        className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setLandingDraft({ ...landingDraft, backgroundColor: '#02130e' })}
                        className="px-2 py-2 bg-[#17171E] text-[#A8A49C] hover:text-[#EDE8DF] rounded-sm text-[10px] shrink-0"
                        title="بازگشت به رنگ زمردی پیش‌فرض"
                      >
                        پیش‌فرض
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#C8C4BC] mb-1">آدرس ویدیو ورودی (اختیاری)</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        dir="ltr"
                        value={landingDraft.videoUrl}
                        onChange={(e) => setLandingDraft({ ...landingDraft, videoUrl: e.target.value })}
                        placeholder="خالی = نمایش تصویر زمردی و لوگو"
                        className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono"
                      />
                      {landingDraft.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setLandingDraft({ ...landingDraft, videoUrl: '' })}
                          className="px-2.5 py-2 bg-[#17171E] text-rose-400 hover:bg-rose-950/50 rounded-sm text-[10px] shrink-0"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#C8C4BC]">تصویر پس‌زمینه / پوستر ورودی</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTargetField('landingPoster');
                        setIsMediaModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-[#1C1C24] hover:bg-[#C5A059] text-[#EDE8DF] hover:text-black rounded text-[11px] transition-colors flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>انتخاب از کتابخانه تصاویر</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    dir="ltr"
                    value={landingDraft.posterUrl}
                    onChange={(e) => setLandingDraft({ ...landingDraft, posterUrl: e.target.value })}
                    placeholder="/images/entrance_emerald_gold.png"
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveLanding}
                  className="w-full py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] text-xs font-semibold rounded-sm transition-colors"
                >
                  ذخیره تنظیمات صفحه ورودی
                </button>
              </div>

              {/* RBAC Roles Architecture Overview */}
              <div className="bg-[#0D0D10] border border-[#C5A059]/20 p-6 rounded-sm space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-[#EDE8DF] font-vazir flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#C5A059]" />
                    <span>ساختار سطوح دسترسی (RBAC)</span>
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 rounded font-mono text-[10px]">
                    نقش فعلی: {adminUser?.role || 'admin'}
                  </span>
                </div>
                <p className="text-[#8C8880] leading-relaxed">
                  سامانه احراز هویت بر پایه تفکیک نقش‌های مدیریتی طراحی شده است:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-[#08080A] border border-[#C5A059]/25 rounded-sm">
                    <span className="text-[#D4AF37] font-semibold block mb-1">مدیر کل (Admin)</span>
                    <span className="text-[11px] text-[#A8A49C] leading-relaxed block">
                      دسترسی کامل به محصولات، صفحات، تنظیمات برند، پشتیبان‌گیری، سطل زباله و امنیت
                    </span>
                  </div>
                  <div className="p-3 bg-[#08080A] border border-[#C5A059]/15 rounded-sm">
                    <span className="text-[#EDE8DF] font-semibold block mb-1">ویراستار محتوا (Editor)</span>
                    <span className="text-[11px] text-[#8C8880] leading-relaxed block">
                      ویرایش محصولات، مقالات وبلاگ و بارگذاری تصاویر بدون دسترسی به پاکسازی دائمی یا تنظیمات امنیتی
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Header & Footer Navigation Manager (Full Width Span) */}
            <div className="lg:col-span-2 bg-[#0D0D10] border border-[#C5A059]/20 p-6 rounded-sm space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C5A059]/15 pb-4">
                <div>
                  <h3 className="text-base font-medium text-[#EDE8DF] font-vazir flex items-center gap-2">
                    <NavigationIcon className="w-4 h-4 text-[#C5A059]" />
                    <span>مدیریت منوی هدر و دسترسی سریع فوتر</span>
                  </h3>
                  <p className="text-[11px] text-[#8C8880] mt-1">
                    لینک‌ها و عناوین منوی بالای سایت و ستون دسترسی سریع فوتر را ویرایش، مرتب‌سازی یا به صفحات سفارشی متصل کنید.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveNavigation}
                  className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] text-xs font-semibold rounded-sm transition-colors shrink-0"
                >
                  ذخیره تنظیمات منوها
                </button>
              </div>

              {(
                [
                  { key: 'headerLinks' as const, title: 'لینک‌های منوی اصلی هدر و موبایل' },
                  { key: 'footerLinks' as const, title: 'لینک‌های دسترسی سریع فوتر' },
                ] as const
              ).map((section) => {
                const publishedCustomPages = (pages || []).filter(
                  (p) => !p.isDeleted && p.published !== false && !CORE_SYSTEM_PAGE_IDS.has(p.id) && p.slug
                );
                return (
                  <div key={section.key} className="space-y-3 p-4 bg-[#08080A] border border-[#C5A059]/15 rounded-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#C5A059]/10">
                      <span className="text-xs font-semibold text-[#D4AF37]">{section.title}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {publishedCustomPages.map((cp) => (
                          <button
                            key={cp.id}
                            type="button"
                            onClick={() =>
                              addNavLinkItem(section.key, {
                                to: `/${cp.slug}`,
                                labelFa: cp.h1Fa || cp.name,
                                labelEn: cp.h1En || cp.h1Fa || cp.name,
                              })
                            }
                            className="px-2.5 py-1 bg-[#14141B] hover:bg-[#1E1E28] border border-[#C5A059]/25 text-[#C5A059] rounded-sm text-[11px]"
                          >
                            + صفحه «{cp.name}»
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => addNavLinkItem(section.key)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#C5A059]/15 hover:bg-[#C5A059] text-[#C5A059] hover:text-[#0A0A0B] border border-[#C5A059]/30 rounded-sm text-[11px] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>افزودن لینک</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {navDraft[section.key].map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2.5 bg-[#0E0E13] border border-[#C5A059]/15 rounded-sm"
                        >
                          <div className="md:col-span-3">
                            <input
                              type="text"
                              value={item.labelFa}
                              onChange={(e) => updateNavLinkItem(section.key, idx, { labelFa: e.target.value })}
                              placeholder="عنوان فارسی"
                              className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF]"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <input
                              type="text"
                              dir="ltr"
                              value={item.labelEn || ''}
                              onChange={(e) => updateNavLinkItem(section.key, idx, { labelEn: e.target.value })}
                              placeholder="English Label"
                              className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF]"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <input
                              type="text"
                              dir="ltr"
                              value={item.to}
                              onChange={(e) => updateNavLinkItem(section.key, idx, { to: e.target.value })}
                              placeholder="/about"
                              className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 rounded-sm text-[#C5A059] font-mono"
                            />
                          </div>
                          <div className="md:col-span-3 flex items-center justify-end gap-1.5">
                            <label className="flex items-center gap-1 cursor-pointer px-2">
                              <input
                                type="checkbox"
                                checked={item.enabled !== false}
                                onChange={(e) => updateNavLinkItem(section.key, idx, { enabled: e.target.checked })}
                                className="rounded border-[#C5A059]/30 text-[#C5A059]"
                              />
                              <span className="text-[11px] text-[#C8C4BC]">فعال</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => moveNavLinkItem(section.key, idx, -1)}
                              disabled={idx === 0}
                              className="p-1.5 bg-[#15151C] text-[#A8A49C] hover:text-[#EDE8DF] disabled:opacity-30 rounded-sm"
                              title="انتقال به بالا"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveNavLinkItem(section.key, idx, 1)}
                              disabled={idx === navDraft[section.key].length - 1}
                              className="p-1.5 bg-[#15151C] text-[#A8A49C] hover:text-[#EDE8DF] disabled:opacity-30 rounded-sm"
                              title="انتقال به پایین"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeNavLinkItem(section.key, idx)}
                              className="p-1.5 bg-[#15151C] text-rose-400 hover:bg-rose-950/60 rounded-sm"
                              title="حذف لینک"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Standalone & Logo/Poster Picker Media Library Modal */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setMediaTargetField('browse');
        }}
        mode={mediaTargetField === 'browse' ? 'browse' : 'select-single'}
        initialSelected={
          mediaTargetField === 'logo'
            ? brandDraft.logoUrl
            : mediaTargetField === 'landingPoster'
            ? landingDraft.posterUrl
            : undefined
        }
        onSelect={(url) => {
          if (typeof url !== 'string') return;
          if (mediaTargetField === 'logo') {
            setBrandDraft((prev) => ({ ...prev, logoUrl: url }));
          } else if (mediaTargetField === 'landingPoster') {
            setLandingDraft((prev) => ({ ...prev, posterUrl: url }));
          }
        }}
      />
    </div>
  );
};
