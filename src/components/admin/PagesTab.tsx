import React, { useState } from 'react';
import {
  Layers,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { safeParseJsonResponse } from '../../lib/api';
import type { PageContent } from '../../types';
import { MediaLibraryModal } from './MediaLibraryModal';
import { AdminModal } from './AdminModal';
import { isReservedSystemSlug, normalizeCustomPageSlug } from '../../utils/customPages';

const CORE_SYSTEM_PAGE_IDS = ['home', 'collection', 'fine-jewelry', 'about', 'contact', 'blog'];

export const PagesTab: React.FC = () => {
  const { pages, refreshPages, showToast, token } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [deleteConfirmPage, setDeleteConfirmPage] = useState<PageContent | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PageContent>>({});
  const [saving, setSaving] = useState(false);

  const activePages = (pages || []).filter((p) => !p.isDeleted);

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingPage(null);
    setFormData({
      name: '',
      slug: '',
      h1Fa: '',
      h1En: '',
      subtitleFa: '',
      subtitleEn: '',
      browserTitleFa: '',
      browserTitleEn: '',
      seoTitleFa: '',
      seoTitleEn: '',
      metaDescriptionFa: '',
      metaDescriptionEn: '',
      descriptionFa: '',
      descriptionEn: '',
      featuredImage: '',
      published: true,
      displayOrder: activePages.length + 1,
    });
  };

  const handleOpenEdit = (page: PageContent) => {
    setIsCreating(false);
    setEditingPage(page);
    setFormData({
      name: page.name,
      slug: page.slug,
      h1Fa: page.h1Fa,
      h1En: page.h1En,
      subtitleFa: page.subtitleFa || '',
      subtitleEn: page.subtitleEn || '',
      browserTitleFa: page.browserTitleFa,
      browserTitleEn: page.browserTitleEn,
      seoTitleFa: page.seoTitleFa,
      seoTitleEn: page.seoTitleEn,
      metaDescriptionFa: page.metaDescriptionFa,
      metaDescriptionEn: page.metaDescriptionEn,
      descriptionFa: page.descriptionFa || '',
      descriptionEn: page.descriptionEn || '',
      featuredImage: page.featuredImage || '',
      published: page.published !== false,
      displayOrder: page.displayOrder || 1,
    });
  };

  const handleCloseModal = () => {
    setIsCreating(false);
    setEditingPage(null);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formData.name?.trim() || !formData.h1Fa?.trim()) {
      showToast('نام صفحه و عنوان اصلی H1 الزامی هستند', 'error');
      return;
    }

    const isCore = Boolean(editingPage && CORE_SYSTEM_PAGE_IDS.includes(editingPage.id));
    if (!isCore) {
      const normalizedSlug = normalizeCustomPageSlug(formData.slug || '');
      if (!normalizedSlug) {
        showToast('مسیر اختصاصی (Slug) برای صفحات جدید الزامی است', 'error');
        return;
      }
      if (isReservedSystemSlug(normalizedSlug)) {
        showToast(`مسیر «/${normalizedSlug}» رزرو‌شده سیستمی است و قابل استفاده برای صفحه سفارشی نیست`, 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        browserTitleFa: formData.browserTitleFa?.trim() || formData.h1Fa?.trim(),
        browserTitleEn: formData.browserTitleEn?.trim() || formData.h1En?.trim() || '',
        seoTitleFa: formData.seoTitleFa?.trim() || formData.h1Fa?.trim() || '',
        seoTitleEn: formData.seoTitleEn?.trim() || formData.h1En?.trim() || '',
        metaDescriptionFa: formData.metaDescriptionFa?.trim() || '',
        metaDescriptionEn: formData.metaDescriptionEn?.trim() || '',
      };

      const url = isCreating ? '/api/pages' : `/api/pages/${editingPage?.id}`;
      const method = isCreating ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const parsed = await safeParseJsonResponse(res);
      if (!parsed.ok) {
        throw new Error(parsed.errorMessage || 'خطا در ذخیره صفحه');
      }

      showToast(
        isCreating
          ? `صفحه جدید «${formData.name}» با موفقیت ایجاد شد`
          : `تنظیمات و عناوین صفحه «${formData.name}» با موفقیت ذخیره شد`,
        'success'
      );
      handleCloseModal();
      refreshPages();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (page: PageContent) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ published: !page.published }),
      });
      const parsed = await safeParseJsonResponse(res);
      if (!parsed.ok) throw new Error(parsed.errorMessage || 'خطا در تغییر وضعیت انتشار صفحه');
      showToast(page.published ? `صفحه «${page.name}» به پیش‌نویس منتقل شد` : `صفحه «${page.name}» منتشر شد`, 'info');
      refreshPages();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSoftDelete = async () => {
    if (!token || !deleteConfirmPage) return;
    try {
      const res = await fetch(`/api/pages/${deleteConfirmPage.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const parsed = await safeParseJsonResponse(res);
      if (!parsed.ok) throw new Error(parsed.errorMessage || 'خطا در حذف صفحه');
      showToast(`صفحه «${deleteConfirmPage.name}» به سطل زباله منتقل شد`, 'info');
      setDeleteConfirmPage(null);
      refreshPages();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const isModalOpen = isCreating || Boolean(editingPage);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-light text-[#EDE8DF] font-vazir flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C5A059]" />
            <span>مدیریت عنوان‌ها، سئو و صفحات وب‌سایت ({activePages.length} صفحه)</span>
          </h2>
          <p className="text-xs text-[#8C8880] mt-1 leading-relaxed">
            مدیریت کامل و تفکیک‌شده عنوان اصلی (H1)، عنوان مرورگر (Document Title)، عنوان سئو (SEO Title)، متادیسکریپشن و امکان افزودن صفحات اختصاصی
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] text-xs font-semibold rounded-sm flex items-center gap-2 shadow-md transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ایجاد صفحه جدید</span>
        </button>
      </div>

      {/* Pages Table */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#121216] border-b border-[#C5A059]/15 text-[#C5A059] font-cinzel">
              <tr>
                <th className="p-3 text-start">شناسه</th>
                <th className="p-3 text-start">نام صفحه در پنل</th>
                <th className="p-3 text-start">عنوان اصلی نمایشی (H1)</th>
                <th className="p-3 text-start">عنوان مرورگر (Title)</th>
                <th className="p-3 text-start">مسیر اختصاصی (Slug)</th>
                <th className="p-3 text-center">وضعیت</th>
                <th className="p-3 text-end">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A059]/10">
              {activePages.map((p) => {
                const isCore = CORE_SYSTEM_PAGE_IDS.includes(p.id);
                const publicPath = p.slug ? `/${p.slug}` : '/';
                return (
                  <tr key={p.id} className="hover:bg-[#121218] transition-colors">
                    <td className="p-3 font-mono text-[#8C8880]">
                      {p.id}
                      {isCore && (
                        <span className="ms-1.5 text-[9px] px-1.5 py-0.2 rounded bg-[#C5A059]/15 text-[#C5A059]">
                          سیستمی
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-[#EDE8DF]">{p.name}</td>
                    <td className="p-3 text-[#C8C4BC] max-w-xs truncate">{p.h1Fa}</td>
                    <td className="p-3 text-[#A8A49C] max-w-xs truncate font-mono text-[11px]">{p.browserTitleFa}</td>
                    <td className="p-3 font-mono text-[11px] text-[#C5A059]" dir="ltr">
                      {publicPath}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(p)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border transition-colors ${
                          p.published
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30 hover:bg-emerald-900/50'
                            : 'bg-amber-950/40 text-amber-400 border-amber-800/30 hover:bg-amber-900/50'
                        }`}
                      >
                        {p.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{p.published ? 'منتشر شده' : 'پیش‌نویس'}</span>
                      </button>
                    </td>
                    <td className="p-3 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={publicPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#17171E] hover:bg-[#22222C] text-[#C5A059] border border-[#C5A059]/20 rounded-sm transition-colors"
                          title="مشاهده صفحه در سایت"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="px-3 py-1.5 bg-[#17171E] hover:bg-[#C5A059] text-[#EDE8DF] hover:text-[#0A0A0B] border border-[#C5A059]/20 rounded-sm transition-colors text-xs flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>ویرایش عنوان‌ها و سئو</span>
                        </button>
                        {!isCore && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmPage(p)}
                            className="p-1.5 bg-[#17171E] hover:bg-red-900 text-red-400 border border-red-900/30 rounded-sm transition-colors"
                            title="انتقال به سطل زباله"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PAGE MODAL */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span>
              {isCreating
                ? 'ایجاد صفحه جدید در وب‌سایت'
                : `تنظیمات محتوا، عنوان‌ها و سئوی صفحه: ${editingPage?.name}`}
            </span>
          </span>
        }
        maxWidth="max-w-4xl"
        zLevel="base"
      >
        <form onSubmit={handleSavePage} className="space-y-5 text-xs">
              {/* Row 1: Internal Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A8A49C] mb-1 font-medium">نام صفحه در پنل مدیریت *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: راهنمای خرید الماس یا خدمات VIP"
                    className="w-full px-3 py-2 bg-[#121216] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A8A49C] mb-1 font-medium">
                    آدرس اختصاصی (Slug) — با تغییر، ریدایرکت ۳۰۱ ثبت می‌شود:
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    disabled={editingPage?.id === 'home'}
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder={editingPage?.id === 'home' ? '/' : 'vip-services'}
                    className="w-full px-3 py-2 bg-[#121216] border border-[#C5A059]/20 focus:border-[#C5A059] disabled:opacity-50 rounded-sm text-[#EDE8DF] font-mono focus:outline-none"
                  />
                  {(!editingPage || !CORE_SYSTEM_PAGE_IDS.includes(editingPage.id)) && (
                    <span className="text-[10px] text-[#8C8880] mt-1 block">
                      فقط حروف انگلیسی و خط تیره (مثال: vip-services). مسیرهای سیستمی (admin, about, contact, blog, categories, fine-jewelry) مجاز نیستند.
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Primary H1 Titles (Persian & English) */}
              <div className="p-4 bg-[#111116] border border-[#C5A059]/15 rounded-sm space-y-3">
                <span className="text-[#C5A059] font-medium block">
                  ۱. عنوان اصلی نمایشی روی صفحه (H1 Hero Title)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A8A49C] mb-1">عنوان فارسی (H1) *</label>
                    <input
                      type="text"
                      required
                      value={formData.h1Fa || ''}
                      onChange={(e) => setFormData({ ...formData, h1Fa: e.target.value })}
                      className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A8A49C] mb-1">عنوان انگلیسی (H1)</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formData.h1En || ''}
                      onChange={(e) => setFormData({ ...formData, h1En: e.target.value })}
                      className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[#A8A49C] mb-1">زیرعنوان فارسی</label>
                    <input
                      type="text"
                      value={formData.subtitleFa || ''}
                      onChange={(e) => setFormData({ ...formData, subtitleFa: e.target.value })}
                      className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A8A49C] mb-1">زیرعنوان انگلیسی</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formData.subtitleEn || ''}
                      onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                      className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Browser Title (<title>) */}
              <div className="p-4 bg-[#111116] border border-[#C5A059]/15 rounded-sm space-y-3">
                <span className="text-[#C5A059] font-medium block">
                  ۲. عنوان تب مرورگر (Document Title — &lt;title&gt;)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A8A49C] mb-1">عنوان تب مرورگر (فارسی)</label>
                    <input
                      type="text"
                      required
                      value={formData.browserTitleFa || ''}
                      onChange={(e) => setFormData({ ...formData, browserTitleFa: e.target.value })}
                      className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A8A49C] mb-1">عنوان تب مرورگر (انگلیسی)</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formData.browserTitleEn || ''}
                      onChange={(e) => setFormData({ ...formData, browserTitleEn: e.target.value })}
                      className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: SEO Metadata */}
              <div className="p-4 bg-[#111116] border border-[#C5A059]/15 rounded-sm space-y-3">
                <span className="text-[#C5A059] font-medium block">
                  ۳. بهینه‌سازی موتورهای جستجو (SEO Title & Meta Description)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A8A49C] mb-1">عنوان سئو (SEO Title فارسی)</label>
                    <input
                      type="text"
                      value={formData.seoTitleFa || ''}
                      onChange={(e) => setFormData({ ...formData, seoTitleFa: e.target.value })}
                      className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A8A49C] mb-1">عنوان سئو (SEO Title انگلیسی)</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formData.seoTitleEn || ''}
                      onChange={(e) => setFormData({ ...formData, seoTitleEn: e.target.value })}
                      className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[#A8A49C] mb-1">توضیحات سئو (Meta Description فارسی)</label>
                    <textarea
                      rows={2}
                      value={formData.metaDescriptionFa || ''}
                      onChange={(e) => setFormData({ ...formData, metaDescriptionFa: e.target.value })}
                      className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A8A49C] mb-1">توضیحات سئو (Meta Description انگلیسی)</label>
                    <textarea
                      rows={2}
                      dir="ltr"
                      value={formData.metaDescriptionEn || ''}
                      onChange={(e) => setFormData({ ...formData, metaDescriptionEn: e.target.value })}
                      className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Editorial Descriptions and Featured Image */}
              <div className="space-y-2">
                <span className="text-[10px] text-[#8C8880] block">
                  پشتیبانی از نگارش ساختاریافته ایمن: تیتر (`## عنوان`)، نقل‌قول (`&gt; متن`)، بولت (`- مورد`)، بولد (`**متن**`) و لینک (`[عنوان](/contact)`). تگ‌های HTML غیرایمن به‌صورت خودکار پاکسازی می‌شوند.
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A8A49C] mb-1 font-medium">محتوا / شرح صفحه (فارسی)</label>
                    <textarea
                      rows={5}
                      value={formData.descriptionFa || ''}
                      onChange={(e) => setFormData({ ...formData, descriptionFa: e.target.value })}
                      className="w-full px-3 py-2 bg-[#121216] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A8A49C] mb-1 font-medium">محتوا / شرح صفحه (انگلیسی)</label>
                    <textarea
                      rows={5}
                      dir="ltr"
                      value={formData.descriptionEn || ''}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      className="w-full px-3 py-2 bg-[#121216] border border-[#C5A059]/20 focus:border-[#C5A059] rounded-sm text-[#EDE8DF] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#A8A49C] mb-1 font-medium">تصویر شاخص صفحه</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.featuredImage || ''}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    placeholder="/images/..."
                    className="w-full px-3 py-2 bg-[#121216] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-3 py-2 bg-[#1C1C24] hover:bg-[#C5A059] text-[#EDE8DF] hover:text-[#0A0A0B] border border-[#C5A059]/25 rounded-sm whitespace-nowrap transition-colors"
                  >
                    انتخاب از کتابخانه تصاویر
                  </button>
                </div>
                {formData.featuredImage && (
                  <div className="mt-2 h-16 w-32 rounded-sm overflow-hidden border border-[#C5A059]/20 bg-black">
                    <img src={formData.featuredImage} alt="Featured" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Row 6: Status and Order */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published !== false}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded border-[#C5A059]/30 text-[#C5A059] focus:ring-0"
                  />
                  <span className="text-[#EDE8DF] font-medium">وضعیت انتشار (عمومی)</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[#A8A49C]">ترتیب نمایش:</span>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder || 1}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) || 1 })}
                    className="w-20 px-2 py-1 bg-[#121216] border border-[#C5A059]/20 rounded-sm text-center text-[#EDE8DF]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C5A059]/20">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-[#C5A059]/20 text-xs text-[#C8C4BC] rounded-sm hover:text-[#EDE8DF]"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#C5A059] hover:bg-[#D4AF37] disabled:bg-[#C5A059]/50 text-[#0A0A0B] text-xs font-semibold rounded-sm flex items-center gap-2 shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'در حال ذخیره‌سازی...' : isCreating ? 'ایجاد و انتشار صفحه' : 'ذخیره تغییرات صفحه'}</span>
                </button>
              </div>
            </form>
      </AdminModal>

      {/* Soft Delete Confirmation Modal */}
      <AdminModal
        isOpen={Boolean(deleteConfirmPage)}
        onClose={() => setDeleteConfirmPage(null)}
        title={
          <span className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>انتقال صفحه «{deleteConfirmPage?.name}» به سطل زباله</span>
          </span>
        }
        maxWidth="max-w-md"
        zLevel="confirm"
      >
        {deleteConfirmPage && (
          <div>
            <p className="text-xs text-[#A8A49C] mb-6 leading-relaxed">
              این صفحه از دسترسی عمومی خارج شده و به بخش «سطل زباله» منتقل می‌شود تا در صورت نیاز قابل بازیابی باشد.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmPage(null)}
                className="px-4 py-2 bg-[#17171E] text-xs text-[#C8C4BC] rounded-sm"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSoftDelete}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-sm"
              >
                انتقال به سطل زباله
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Media Picker Modal */}
      <MediaLibraryModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        mode="select-single"
        onSelect={(selected) => {
          if (typeof selected === 'string') {
            setFormData((prev) => ({ ...prev, featuredImage: selected }));
          }
        }}
      />
    </div>
  );
};
