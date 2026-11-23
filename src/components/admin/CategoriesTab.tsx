import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { safeParseJsonResponse } from '../../lib/api';
import type { CategoryInfo } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Layers,
  Check,
  AlertTriangle,
  Image as ImageIcon,
  GripVertical,
  ExternalLink,
} from 'lucide-react';
import { MediaLibraryModal } from './MediaLibraryModal';
import { AdminModal } from './AdminModal';

export const CategoriesTab: React.FC = () => {
  const { categories, products, token, refreshData, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Drag and Drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Safe Deletion Modal State
  const [deleteModalCategory, setDeleteModalCategory] = useState<CategoryInfo | null>(null);
  const [reassignToKey, setReassignToKey] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<{
    nameFa: string;
    nameEn: string;
    key: string;
    slug: string;
    parentId: string;
    descriptionFa: string;
    descriptionEn: string;
    image: string;
    icon: string;
    order: number;
    enabled: boolean;
    showOnHome: boolean;
    showInNav: boolean;
    seoTitleFa: string;
    seoTitleEn: string;
    metaDescriptionFa: string;
    metaDescriptionEn: string;
  }>({
    nameFa: '',
    nameEn: '',
    key: '',
    slug: '',
    parentId: '',
    descriptionFa: '',
    descriptionEn: '',
    image: '',
    icon: 'gem',
    order: 1,
    enabled: true,
    showOnHome: true,
    showInNav: true,
    seoTitleFa: '',
    seoTitleEn: '',
    metaDescriptionFa: '',
    metaDescriptionEn: '',
  });

  const activeCategories = categories.filter((c) => !c.isDeleted);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      nameFa: '',
      nameEn: '',
      key: '',
      slug: '',
      parentId: '',
      descriptionFa: '',
      descriptionEn: '',
      image: '',
      icon: 'gem',
      order: activeCategories.length + 1,
      enabled: true,
      showOnHome: true,
      showInNav: true,
      seoTitleFa: '',
      seoTitleEn: '',
      metaDescriptionFa: '',
      metaDescriptionEn: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryInfo) => {
    setEditingCategory(cat);
    setFormData({
      nameFa: cat.nameFa || '',
      nameEn: cat.nameEn || '',
      key: cat.key || '',
      slug: cat.slug || cat.key.replace(/_/g, '-'),
      parentId: cat.parentId || '',
      descriptionFa: cat.descriptionFa || '',
      descriptionEn: cat.descriptionEn || '',
      image: cat.image || '',
      icon: cat.icon || 'gem',
      order: cat.order || 1,
      enabled: cat.enabled !== false,
      showOnHome: cat.showOnHome !== false,
      showInNav: cat.showInNav !== false,
      seoTitleFa: cat.seoTitleFa || '',
      seoTitleEn: cat.seoTitleEn || '',
      metaDescriptionFa: cat.metaDescriptionFa || '',
      metaDescriptionEn: cat.metaDescriptionEn || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formData.nameFa.trim() || !formData.nameEn.trim()) {
      showToast('نام فارسی و انگلیسی دسته‌بندی الزامی است', 'error');
      return;
    }

    const payload = {
      ...formData,
      parentId: formData.parentId || undefined,
      slug: formData.slug.trim() || formData.key.replace(/_/g, '-'),
    };

    try {
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const parsed = await safeParseJsonResponse(res);
        if (!parsed.ok) {
          throw new Error(parsed.errorMessage || 'خطا در ویرایش دسته‌بندی');
        }
        showToast('دسته‌بندی با موفقیت ویرایش شد', 'success');
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const parsed = await safeParseJsonResponse(res);
        if (!parsed.ok) {
          throw new Error(parsed.errorMessage || 'خطا در ایجاد دسته‌بندی');
        }
        showToast('دسته‌بندی جدید با موفقیت اضافه شد', 'success');
      }
      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره دسته‌بندی', 'error');
    }
  };

  // Open Safe Deletion Dialog
  const promptDeleteCategory = (cat: CategoryInfo) => {
    const remainingCats = activeCategories.filter((c) => c.id !== cat.id);
    const defaultReassign = remainingCats[0]?.key || 'rings';
    setReassignToKey(defaultReassign);
    setDeleteModalCategory(cat);
  };

  // Confirm Safe Deletion with Product Reassignment
  const confirmDeleteCategory = async () => {
    if (!deleteModalCategory || !token) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/categories/${deleteModalCategory.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reassignTo: reassignToKey }),
      });

      const parsed = await safeParseJsonResponse(res);
      if (!parsed.ok) {
        throw new Error(parsed.errorMessage || 'خطا در حذف دسته‌بندی');
      }

      showToast(`دسته‌بندی «${deleteModalCategory.nameFa}» به سطل زباله منتقل شد`, 'info');
      setDeleteModalCategory(null);
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'خطا در حذف دسته‌بندی', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async (cat: CategoryInfo) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: !cat.enabled }),
      });
      if (res.ok) {
        showToast(cat.enabled ? 'دسته‌بندی غیرفعال شد' : 'دسته‌بندی فعال شد', 'info');
        refreshData();
      }
    } catch {
      showToast('خطا در تغییر وضعیت دسته‌بندی', 'error');
    }
  };

  const persistReorder = async (orderedIds: string[]) => {
    if (!token) return;
    try {
      const res = await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderedIds }),
      });
      if (res.ok) {
        showToast('ترتیب نمایش دسته‌بندی‌ها به‌روزرسانی شد', 'success');
        refreshData();
      }
    } catch {
      showToast('خطا در تغییر ترتیب', 'error');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeCategories.length) return;

    const list = [...activeCategories];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    await persistReorder(list.map((c) => c.id));
  };

  const handleDropReorder = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const fromIndex = activeCategories.findIndex((c) => c.id === draggedId);
    const toIndex = activeCategories.findIndex((c) => c.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const list = [...activeCategories];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    setDraggedId(null);
    setDragOverId(null);
    await persistReorder(list.map((c) => c.id));
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Banner */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-light text-[#EDE8DF] font-vazir flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C5A059]" />
            <span>مدیریت شاخه‌ها و دسته‌بندی‌های زرگری ({activeCategories.length} شاخه)</span>
          </h2>
          <p className="text-xs text-[#8C8880] mt-1 leading-relaxed">
            امکان کشیدن و رها کردن ردیف‌ها (Drag &amp; Drop) برای تغییر ترتیب، انتخاب تصویر از کتابخانه، سئو و انتقال ایمن به سطل زباله
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] text-xs font-semibold rounded-sm flex items-center gap-2 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن دسته‌بندی جدید</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#121216] border-b border-[#C5A059]/15 text-[#C5A059] font-cinzel">
              <tr>
                <th className="p-3 text-center w-16">ترتیب</th>
                <th className="p-3 text-start">تصویر</th>
                <th className="p-3 text-start">نام فارسی</th>
                <th className="p-3 text-start">English Title</th>
                <th className="p-3 text-start">کلید و Slug</th>
                <th className="p-3 text-center">آثار فعال</th>
                <th className="p-3 text-center">وضعیت</th>
                <th className="p-3 text-end">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A059]/10 text-[#C8C4BC]">
              {activeCategories.map((cat, idx) => {
                const productCount = products.filter(
                  (p) =>
                    !p.isDeleted &&
                    (p.category || '')
                      .split(',')
                      .map((s) => s.trim())
                      .includes(cat.key)
                ).length;
                const catSlug = cat.slug || cat.key.replace(/_/g, '-');
                const isDragOver = dragOverId === cat.id && draggedId !== cat.id;

                return (
                  <tr
                    key={cat.id}
                    draggable
                    onDragStart={() => setDraggedId(cat.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverId(cat.id);
                    }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={() => handleDropReorder(cat.id)}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDragOverId(null);
                    }}
                    className={`hover:bg-[#121218] transition-colors ${
                      draggedId === cat.id ? 'opacity-40' : ''
                    } ${isDragOver ? 'border-t-2 border-t-[#D4AF37] bg-[#161620]' : ''}`}
                  >
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <GripVertical className="w-4 h-4 text-[#8C8880] cursor-grab active:cursor-grabbing" />
                        <div className="flex flex-col items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, 'up')}
                            className="p-0.5 text-[#8C8880] hover:text-[#C5A059] disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-[11px] text-[#C5A059] font-bold">{cat.order}</span>
                          <button
                            type="button"
                            disabled={idx === activeCategories.length - 1}
                            onClick={() => handleMove(idx, 'down')}
                            className="p-0.5 text-[#8C8880] hover:text-[#C5A059] disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-12 h-12 rounded-sm overflow-hidden border border-[#C5A059]/20 bg-black flex items-center justify-center">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.nameFa} className="w-full h-full object-cover" />
                        ) : (
                          <Layers className="w-5 h-5 text-[#8C8880]" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-medium text-[#EDE8DF]">{cat.nameFa}</td>
                    <td className="p-3 text-[#A8A49C]">{cat.nameEn}</td>
                    <td className="p-3">
                      <span className="font-mono text-[11px] text-[#C5A059] block">key: {cat.key}</span>
                      <span className="font-mono text-[10px] text-[#8C8880] block" dir="ltr">
                        /categories/{catSlug}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-[#D4AF37] font-semibold">{productCount}</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(cat)}
                        className={`p-1.5 rounded text-xs transition-colors ${
                          cat.enabled !== false ? 'text-emerald-400 hover:text-emerald-300' : 'text-stone-600 hover:text-stone-400'
                        }`}
                        title="تغییر وضعیت فعال/غیرفعال"
                      >
                        {cat.enabled !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-3 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/categories/${catSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#181820] hover:bg-[#22222E] text-[#C5A059] rounded-sm transition-colors"
                          title="مشاهده صفحه دسته‌بندی"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 bg-[#181820] hover:bg-[#C5A059] hover:text-[#0A0A0B] text-[#C8C4BC] rounded-sm transition-colors"
                          title="ویرایش دسته‌بندی"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => promptDeleteCategory(cat)}
                          className="p-1.5 bg-[#181820] hover:bg-red-900 text-red-400 rounded-sm transition-colors"
                          title="حذف به سطل زباله"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT CATEGORY MODAL */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
        maxWidth="max-w-2xl"
        zLevel="base"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">نام فارسی دسته‌بندی *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameFa}
                    onChange={(e) => setFormData({ ...formData, nameFa: e.target.value })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">English Name *</label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">کلید فنی (Key) *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().trim() })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">آدرس اختصاصی سئو (Slug)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().trim() })}
                    placeholder="rings-solitaire"
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#C8C4BC] mb-1 font-medium">دسته والد (اختیاری - برای زیرمجموعه‌ها)</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:outline-none"
                >
                  <option value="">بدون والد (دسته اصلی)</option>
                  {activeCategories
                    .filter((c) => c.id !== editingCategory?.id && !c.parentId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameFa} ({c.nameEn})
                      </option>
                    ))}
                </select>
              </div>

              {/* Image with Media Library Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#C8C4BC] font-medium">تصویر شاخص دسته‌بندی</label>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-2.5 py-1 bg-[#1C1C24] hover:bg-[#C5A059] text-[#EDE8DF] hover:text-black rounded text-[11px] transition-colors flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>انتخاب از کتابخانه تصاویر</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/images/..."
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono"
                  />
                  {formData.image && (
                    <div className="w-10 h-10 rounded overflow-hidden border border-[#C5A059]/30 bg-black shrink-0">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">توضیح کوتاه فارسی</label>
                  <textarea
                    rows={2}
                    value={formData.descriptionFa}
                    onChange={(e) => setFormData({ ...formData, descriptionFa: e.target.value })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">English Description</label>
                  <textarea
                    rows={2}
                    dir="ltr"
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm"
                  />
                </div>
              </div>

              {/* SEO Metadata */}
              <div className="p-3 bg-[#111116] border border-[#C5A059]/15 rounded-sm space-y-2.5">
                <span className="text-[#C5A059] font-medium block">تنظیمات سئوی دسته‌بندی (اختیاری)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8C8880] mb-0.5">عنوان سئو (فارسی)</label>
                    <input
                      type="text"
                      value={formData.seoTitleFa}
                      onChange={(e) => setFormData({ ...formData, seoTitleFa: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8C8880] mb-0.5">SEO Title (English)</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formData.seoTitleEn}
                      onChange={(e) => setFormData({ ...formData, seoTitleEn: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#8C8880] mb-0.5">متادیسکریپشن سئو (فارسی)</label>
                  <textarea
                    rows={2}
                    value={formData.metaDescriptionFa}
                    onChange={(e) => setFormData({ ...formData, metaDescriptionFa: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#08080A] border border-[#C5A059]/20 rounded-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="rounded border-[#C5A059]/30 text-[#C5A059]"
                  />
                  <span className="text-[#EDE8DF]">دسته فعال</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnHome}
                    onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                    className="rounded border-[#C5A059]/30 text-[#C5A059]"
                  />
                  <span className="text-[#EDE8DF]">نمایش در نوار متحرک خانه</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showInNav}
                    onChange={(e) => setFormData({ ...formData, showInNav: e.target.checked })}
                    className="rounded border-[#C5A059]/30 text-[#C5A059]"
                  />
                  <span className="text-[#EDE8DF]">نمایش در منوی اصلی</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C5A059]/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#C5A059]/20 text-xs text-[#C8C4BC] rounded-sm hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold rounded-sm flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCategory ? 'ثبت تغییرات' : 'افزودن دسته‌بندی'}</span>
                </button>
              </div>
            </form>
      </AdminModal>

      {/* Media Picker Modal */}
      <MediaLibraryModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        mode="select-single"
        onSelect={(url) => {
          if (typeof url === 'string') {
            setFormData((prev) => ({ ...prev, image: url }));
          }
        }}
      />

      {/* SAFE DELETION CONFIRMATION MODAL */}
      <AdminModal
        isOpen={Boolean(deleteModalCategory)}
        onClose={() => {
          if (!isDeleting) setDeleteModalCategory(null);
        }}
        title={
          <span className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>تایید حذف دسته‌بندی «{deleteModalCategory?.nameFa}»</span>
          </span>
        }
        maxWidth="max-w-md"
        zLevel="confirm"
      >
        {deleteModalCategory &&
          (() => {
            const count = products.filter(
              (p) =>
                !p.isDeleted &&
                (p.category || '')
                  .split(',')
                  .map((s) => s.trim())
                  .includes(deleteModalCategory.key)
            ).length;
            const otherCategories = activeCategories.filter((c) => c.id !== deleteModalCategory.id);

            return (
              <div className="space-y-4 text-xs text-[#C8C4BC]">
                {count > 0 ? (
                  <>
                    <div className="p-3 bg-amber-950/20 border border-amber-700/30 rounded-sm">
                      <p className="leading-relaxed text-amber-200">
                        این دسته‌بندی حاوی <b>{count} قطعه جواهر فعال</b> است. برای حفظ داده‌ها و جلوگیری از بی‌دسته‌بندی شدن جواهرات، آن‌ها به دسته‌بندی انتخابی زیر منتقل خواهند شد:
                      </p>
                    </div>

                    <div>
                      <label className="block text-[#A8A49C] mb-1 font-medium">
                        انتقال جواهرات به دسته‌بندی:
                      </label>
                      <select
                        value={reassignToKey}
                        onChange={(e) => setReassignToKey(e.target.value)}
                        className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/30 text-[#EDE8DF] rounded-sm text-xs focus:outline-none"
                      >
                        {otherCategories.map((c) => (
                          <option key={c.id} value={c.key}>
                            {c.nameFa} ({c.nameEn})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <p className="leading-relaxed">
                    این دسته‌بندی به سطل زباله منتقل می‌شود و در صورت نیاز از تب «سطل زباله» قابل بازیابی خواهد بود.
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C5A059]/15">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setDeleteModalCategory(null)}
                    className="px-4 py-2 bg-[#17171C] text-[#A8A49C] hover:text-[#EDE8DF] rounded-sm"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={confirmDeleteCategory}
                    className="px-5 py-2 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-sm transition-colors"
                  >
                    {isDeleting ? 'در حال انتقال...' : 'انتقال به سطل زباله'}
                  </button>
                </div>
              </div>
            );
          })()}
      </AdminModal>
    </div>
  );
};
