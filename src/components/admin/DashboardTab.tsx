import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { safeParseJsonResponse } from '../../lib/api';
import type { ActivityLog } from '../../types';
import {
  Package,
  Layers,
  Sparkles,
  Crown,
  Eye,
  Plus,
  Clock,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  FileText,
  History,
  BookOpen,
  Sliders,
} from 'lucide-react';

interface DashboardTabProps {
  onNavigateTab: (tab: any) => void;
  onOpenAddProduct: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onNavigateTab,
  onOpenAddProduct,
}) => {
  const { products, categories, articles, media, pages, token } = useApp();

  const [trashCount, setTrashCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (!token) return;

    fetch('/api/trash', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => safeParseJsonResponse<any>(res))
      .then((parsed) => {
        if (parsed.ok && parsed.data) {
          const data = parsed.data;
          const total =
            (data.products?.length || 0) +
            (data.categories?.length || 0) +
            (data.articles?.length || 0) +
            (data.pages?.length || 0) +
            (data.media?.length || 0);
          setTrashCount(total);
        }
      })
      .catch(() => {});

    fetch('/api/activity-logs?limit=6', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => safeParseJsonResponse<ActivityLog[]>(res))
      .then((parsed) => {
        if (parsed.ok && Array.isArray(parsed.data)) setRecentLogs(parsed.data);
      })
      .catch(() => {});
  }, [token, products.length, categories.length, articles.length, pages.length]);

  const activeProductsList = products.filter((p) => !p.isDeleted);
  const totalProducts = activeProductsList.length;
  const activeProducts = activeProductsList.filter((p) => p.visibility && p.status !== 'draft' && !p.isTest).length;
  const draftProducts = activeProductsList.filter((p) => !p.visibility || p.status === 'draft').length;
  const fineJewelryCount = activeProductsList.filter((p) => p.visibility && !p.isTest && (p.showInFineJewelry || p.featured)).length;

  const activeCategories = categories.filter((c) => !c.isDeleted);
  const activeArticles = articles.filter((a) => !a.isDeleted);
  const draftArticles = activeArticles.filter((a) => !a.published).length;

  const activePages = (pages || []).filter((p) => !p.isDeleted);
  const publishedPages = activePages.filter((p) => p.published).length;
  const draftPages = activePages.filter((p) => !p.published).length;

  const totalDrafts = draftProducts + draftArticles + draftPages;
  const activeMedia = media.filter((m) => !m.isDeleted);

  return (
    <div className="space-y-8 animate-fade-in text-start">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-sm bg-gradient-to-l from-[#14141C] via-[#0E0E14] to-[#0A0A0E] border border-[#C5A059]/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 end-0 w-80 h-80 bg-gradient-to-b from-[#C5A059]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-cinzel text-xs text-[#C5A059] tracking-[0.25em] uppercase font-medium">
                HAUTE JOAILLERIE CMS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-persian-heading text-[#EDE8DF] mb-2">
              مرکز مدیریت و فرماندهی جواهری سعیدنیا
            </h2>
            <p className="text-xs sm:text-sm text-[#A8A49C] font-persian-body max-w-2xl leading-relaxed">
              مدیریت یکپارچه آثار، صفحات و عناوین، چیدمان گرید، دسته‌بندی‌ها، کتابخانه رسانه، سطل زباله و نسخه پشتیبان.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-dash-add-product"
              type="button"
              onClick={onOpenAddProduct}
              className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] text-xs font-semibold font-persian-nav rounded-sm flex items-center gap-2 shadow-lg shadow-[#C5A059]/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن محصول جدید</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#171720] hover:bg-[#20202C] text-[#EDE8DF] border border-[#C5A059]/30 text-xs font-persian-nav rounded-sm flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>مشاهده وبسایت زنده</span>
            </a>
          </div>
        </div>
      </div>

      {/* Comprehensive KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <button
          type="button"
          onClick={() => onNavigateTab('products')}
          className="text-start p-4 bg-[#0E0E14] border border-[#C5A059]/20 rounded-sm hover:border-[#C5A059]/50 transition-colors"
        >
          <div className="flex items-center justify-between text-[#8C8880] mb-2">
            <span className="text-[11px] font-persian-nav font-medium">کل محصولات</span>
            <Package className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#EDE8DF]">{totalProducts}</div>
          <span className="text-[10px] text-[#7A766E] mt-1 block">{activeProducts} فعال</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('categories')}
          className="text-start p-4 bg-[#0E0E14] border border-[#C5A059]/20 rounded-sm hover:border-[#C5A059]/50 transition-colors"
        >
          <div className="flex items-center justify-between text-[#8C8880] mb-2">
            <span className="text-[11px] font-persian-nav font-medium">دسته‌بندی‌ها</span>
            <Layers className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#EDE8DF]">{activeCategories.length}</div>
          <span className="text-[10px] text-[#7A766E] mt-1 block">شاخه فعال</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('articles')}
          className="text-start p-4 bg-[#0E0E14] border border-[#C5A059]/20 rounded-sm hover:border-[#C5A059]/50 transition-colors"
        >
          <div className="flex items-center justify-between text-[#8C8880] mb-2">
            <span className="text-[11px] font-persian-nav font-medium">مقالات وبلاگ</span>
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#D4AF37]">{activeArticles.length}</div>
          <span className="text-[10px] text-[#7A766E] mt-1 block">یادداشت تخصصی</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('pages')}
          className="text-start p-4 bg-[#0E0E14] border border-[#C5A059]/20 rounded-sm hover:border-[#C5A059]/50 transition-colors"
        >
          <div className="flex items-center justify-between text-[#8C8880] mb-2">
            <span className="text-[11px] font-persian-nav font-medium">صفحات منتشرشده</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{publishedPages}</div>
          <span className="text-[10px] text-[#7A766E] mt-1 block">از {activePages.length} صفحه</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('products')}
          className="text-start p-4 bg-[#0E0E14] border border-[#C5A059]/20 rounded-sm hover:border-[#C5A059]/50 transition-colors"
        >
          <div className="flex items-center justify-between text-[#8C8880] mb-2">
            <span className="text-[11px] font-persian-nav font-medium">پیش‌نویس‌ها</span>
            <Eye className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{totalDrafts}</div>
          <span className="text-[10px] text-[#7A766E] mt-1 block">آثار/مقالات/صفحات</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('media')}
          className="text-start p-4 bg-[#0E0E14] border border-[#C5A059]/20 rounded-sm hover:border-[#C5A059]/50 transition-colors"
        >
          <div className="flex items-center justify-between text-[#8C8880] mb-2">
            <span className="text-[11px] font-persian-nav font-medium">فایل‌های رسانه</span>
            <ImageIcon className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#EDE8DF]">{activeMedia.length}</div>
          <span className="text-[10px] text-[#7A766E] mt-1 block">در کتابخانه</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('finejewelry')}
          className="text-start p-4 bg-[#0E0E14] border border-[#C5A059]/20 rounded-sm hover:border-[#C5A059]/50 transition-colors"
        >
          <div className="flex items-center justify-between text-[#8C8880] mb-2">
            <span className="text-[11px] font-persian-nav font-medium">جواهرات فاخر</span>
            <Crown className="w-4 h-4 text-purple-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">{fineJewelryCount}</div>
          <span className="text-[10px] text-[#7A766E] mt-1 block">شاهکار ویژه</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('trash')}
          className="text-start p-4 bg-[#0E0E14] border border-[#C5A059]/20 rounded-sm hover:border-rose-500/40 transition-colors"
        >
          <div className="flex items-center justify-between text-[#8C8880] mb-2">
            <span className="text-[11px] font-persian-nav font-medium">سطل زباله</span>
            <Trash2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{trashCount}</div>
          <span className="text-[10px] text-[#7A766E] mt-1 block">مورد قابل بازیابی</span>
        </button>
      </div>

      {/* Quick Shortcuts & Management Modules */}
      <div>
        <h3 className="text-base font-persian-heading text-[#EDE8DF] mb-4 flex items-center gap-2">
          <span>میانبرهای مدیریت بخش‌های اصلی سایت</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateTab('pages')}
            className="p-5 bg-[#0E0E14] border border-[#C5A059]/20 hover:border-[#C5A059] rounded-sm cursor-pointer group transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-sm bg-[#171720] border border-[#C5A059]/25 flex items-center justify-center text-[#C5A059] group-hover:scale-105 transition-transform mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-[#EDE8DF] group-hover:text-[#D4AF37] transition-colors mb-1 font-persian-heading">
              عناوین، صفحات و سئو
            </h4>
            <p className="text-xs text-[#8C8880] leading-relaxed font-persian-body">
              تغییر عنوان اصلی (H1)، تایتل مرورگر، متادیسکریپشن و ایجاد صفحات جدید.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('layout')}
            className="p-5 bg-[#0E0E14] border border-[#C5A059]/20 hover:border-[#C5A059] rounded-sm cursor-pointer group transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-sm bg-[#171720] border border-[#C5A059]/25 flex items-center justify-center text-[#C5A059] group-hover:scale-105 transition-transform mb-3">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-[#EDE8DF] group-hover:text-[#D4AF37] transition-colors mb-1 font-persian-heading">
              مدیریت چیدمان گرید
            </h4>
            <p className="text-xs text-[#8C8880] leading-relaxed font-persian-body">
              تنظیم ستون‌های دسکتاپ/تبلت/موبایل، تعداد نمایش در هر صفحه و صفحه‌بندی.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('media')}
            className="p-5 bg-[#0E0E14] border border-[#C5A059]/20 hover:border-[#C5A059] rounded-sm cursor-pointer group transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-sm bg-[#171720] border border-[#C5A059]/25 flex items-center justify-center text-[#C5A059] group-hover:scale-105 transition-transform mb-3">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-[#EDE8DF] group-hover:text-[#D4AF37] transition-colors mb-1 font-persian-heading">
              کتابخانه تصاویر و رسانه
            </h4>
            <p className="text-xs text-[#8C8880] leading-relaxed font-persian-body">
              آپلود چندتایی فایل‌ها، مشاهده ابعاد و کنترل هوشمند تصاویر در حال استفاده.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('homepage')}
            className="p-5 bg-[#0E0E14] border border-[#C5A059]/20 hover:border-[#C5A059] rounded-sm cursor-pointer group transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-sm bg-[#171720] border border-[#C5A059]/25 flex items-center justify-center text-[#C5A059] group-hover:scale-105 transition-transform mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-[#EDE8DF] group-hover:text-[#D4AF37] transition-colors mb-1 font-persian-heading">
              صفحه اصلی و ساعات مراجعه
            </h4>
            <p className="text-xs text-[#8C8880] leading-relaxed font-persian-body">
              کنترل اسلایدر جدیدترین آثار، بخش مراجعه حضوری، تصاویر Hero و ساعات کاری.
            </p>
          </div>
        </div>
      </div>

      {/* Latest Activity Logs & Latest Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Logs */}
        <div className="p-6 bg-[#0E0E14] border border-[#C5A059]/20 rounded-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#C5A059]/15 mb-4">
            <h3 className="text-sm sm:text-base font-persian-heading text-[#EDE8DF] flex items-center gap-2">
              <History className="w-4 h-4 text-[#C5A059]" />
              <span>آخرین رویدادها و فعالیت‌های مدیر</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('history')}
              className="text-xs text-[#C5A059] hover:text-[#D4AF37] font-persian-nav"
            >
              مشاهده گزارش کامل ←
            </button>
          </div>

          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#121218] border border-[#C5A059]/10 rounded-sm flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="text-[#EDE8DF] font-medium block truncate">
                      {log.details || log.entityTitle || log.action}
                    </span>
                    <span className="text-[10px] text-[#8C8880] font-mono">
                      {log.user} • {log.entityType}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#C5A059] font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8C8880] py-6 text-center">هنوز رویدادی ثبت نشده است.</p>
          )}
        </div>

        {/* Latest Articles */}
        <div className="p-6 bg-[#0E0E14] border border-[#C5A059]/20 rounded-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#C5A059]/15 mb-4">
            <h3 className="text-sm sm:text-base font-persian-heading text-[#EDE8DF] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C5A059]" />
              <span>آخرین مقالات وبلاگ</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('articles')}
              className="text-xs text-[#C5A059] hover:text-[#D4AF37] font-persian-nav"
            >
              مدیریت وبلاگ ←
            </button>
          </div>

          {activeArticles.length > 0 ? (
            <div className="space-y-3">
              {activeArticles.slice(0, 5).map((art) => (
                <div
                  key={art.id}
                  className="p-3 bg-[#121218] border border-[#C5A059]/10 rounded-sm flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="text-[#EDE8DF] font-medium block truncate">{art.titleFa}</span>
                    <span className="text-[10px] text-[#8C8880] font-mono" dir="ltr">
                      /blog/{art.slug}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-sm text-[10px] shrink-0 ${
                      art.published
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/30'
                        : 'bg-amber-950/40 text-amber-400 border border-amber-800/30'
                    }`}
                  >
                    {art.published ? 'منتشر شده' : 'پیش‌نویس'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8C8880] py-6 text-center">مقاله‌ای ثبت نشده است.</p>
          )}
        </div>
      </div>

      {/* Latest Products Quick Table */}
      <div className="p-6 bg-[#0E0E14] border border-[#C5A059]/20 rounded-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#C5A059]/15 mb-4">
          <h3 className="text-sm sm:text-base font-persian-heading text-[#EDE8DF]">
            آخرین محصولات ثبت‌شده
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('products')}
            className="text-xs text-[#C5A059] hover:text-[#D4AF37] flex items-center gap-1 font-persian-nav"
          >
            <span>مشاهده همه محصولات</span>
            <span>←</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="text-[#8C8880] border-b border-[#C5A059]/10">
                <th className="py-2.5 px-3">تصویر</th>
                <th className="py-2.5 px-3">کد / عنوان</th>
                <th className="py-2.5 px-3">دسته‌بندی</th>
                <th className="py-2.5 px-3 text-center">جدیدترین آثار</th>
                <th className="py-2.5 px-3 text-center">جواهرات فاخر</th>
                <th className="py-2.5 px-3 text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A059]/10">
              {activeProductsList.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-[#12121A] transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="w-10 h-10 rounded-sm bg-[#171720] border border-[#C5A059]/20 overflow-hidden flex items-center justify-center">
                      {p.mainImage ? (
                        <img src={p.mainImage} alt={p.titleFa} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-[#8C8880]" />
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[10px] text-[#C5A059] block">{p.productCode}</span>
                    <span className="text-[#EDE8DF] font-medium block truncate max-w-xs">{p.titleFa}</span>
                  </td>
                  <td className="py-2.5 px-3 text-[#A8A49C]">{p.category}</td>
                  <td className="py-2.5 px-3 text-center">
                    {p.showInLatestCreations ? (
                      <span className="px-2 py-0.5 rounded-sm bg-[#C5A059]/20 text-[#D4AF37] text-[10px]">
                        فعال (ترتیب: {p.latestCreationsOrder || 1})
                      </span>
                    ) : (
                      <span className="text-[#7A766E] text-[10px]">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.showInFineJewelry || p.featured ? (
                      <span className="px-2 py-0.5 rounded-sm bg-purple-950/40 border border-purple-800/40 text-purple-300 text-[10px]">
                        فاخر
                      </span>
                    ) : (
                      <span className="text-[#7A766E] text-[10px]">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.visibility && p.status !== 'draft' ? (
                      <span className="text-emerald-400 text-[10px]">نمایش عمومی</span>
                    ) : (
                      <span className="text-amber-400 text-[10px]">مخفی / پیش‌نویس</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
