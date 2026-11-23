import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  Image as ImageIcon,
  Save,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { safeParseJsonResponse } from '../../lib/api';
import type { Product, JewelleryCategoryKey, AvailabilityStatus } from '../../types';
import { MediaLibraryModal } from './MediaLibraryModal';
import { AdminModal } from './AdminModal';

interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel: string;
  tone: 'danger' | 'gold';
  onConfirm: () => Promise<void>;
}

export const ProductsTab: React.FC = () => {
  const { products, categories, token, refreshData, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'order' | 'newest' | 'code'>('order');

  // Multi-selection for bulk operations
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [confirmRunning, setConfirmRunning] = useState(false);

  // Media Library Picker state
  const [mediaPickerMode, setMediaPickerMode] = useState<'main' | 'gallery' | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    titleFa: string;
    titleEn: string;
    slug: string;
    category: JewelleryCategoryKey;
    descriptionFa: string;
    descriptionEn: string;
    mainImage: string;
    images: string[];
    productCode: string;
    availability: AvailabilityStatus;
    status: 'published' | 'draft';
    featured: boolean;
    showInLatestCreations: boolean;
    latestCreationsOrder: number;
    showInFineJewelry: boolean;
    fineJewelryOrder: number;
    displayOrder: number;
    visibility: boolean;
    goldCarat: string;
    gemstones: string;
    approxWeight: string;
    finish: string;
    seoTitleFa: string;
    seoTitleEn: string;
    metaDescriptionFa: string;
    metaDescriptionEn: string;
  }>({
    titleFa: '',
    titleEn: '',
    slug: '',
    category: 'women_rings',
    descriptionFa: '',
    descriptionEn: '',
    mainImage: '',
    images: [],
    productCode: '',
    availability: 'in_stock',
    status: 'published',
    featured: false,
    showInLatestCreations: true,
    latestCreationsOrder: 1,
    showInFineJewelry: true,
    fineJewelryOrder: 1,
    displayOrder: 1,
    visibility: true,
    goldCarat: '۱۸ عیار (750)',
    gemstones: '',
    approxWeight: '',
    finish: 'زرگری دست‌ساز صیقلی',
    seoTitleFa: '',
    seoTitleEn: '',
    metaDescriptionFa: '',
    metaDescriptionEn: '',
  });

  // Resolve SEO URL helper
  const getProductPublicUrl = (prod: Pick<Product, 'category' | 'slug' | 'productCode' | 'id'>) => {
    const firstCat = prod.category ? prod.category.split(',')[0].trim() : '';
    const catInfo = categories.find((c) => c.key === firstCat);
    const catSlug = catInfo?.slug || firstCat.replace(/_/g, '-');
    const prodSlug = prod.slug || prod.productCode.toLowerCase() || prod.id;
    return catSlug ? `/${catSlug}/${prodSlug}` : `/products/${prodSlug}`;
  };

  // Filtered & sorted products
  const filteredProducts = products
    .filter((p) => {
      if (p.isDeleted) return false;
      const matchesSearch =
        !searchQuery ||
        p.titleFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.slug && p.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.specifications?.gemstones && p.specifications.gemstones.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        filterCategory === 'all' ||
        p.category === filterCategory ||
        (filterCategory === 'rings' && (p.category === 'rings' || p.category === 'men_rings' || p.category === 'women_rings'));

      const matchesAvailability =
        filterAvailability === 'all' || p.availability === filterAvailability;

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'published' && p.visibility && p.status !== 'draft') ||
        (filterStatus === 'draft' && (!p.visibility || p.status === 'draft'));

      return matchesSearch && matchesCategory && matchesAvailability && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'code') {
        return a.productCode.localeCompare(b.productCode);
      }
      return (a.displayOrder || 1) - (b.displayOrder || 1);
    });

  const openCreateModal = () => {
    setEditingProduct(null);
    const randomCode = `SN-${Math.floor(100 + Math.random() * 900)}`;
    setFormData({
      titleFa: '',
      titleEn: '',
      slug: '',
      category: categories[0]?.key || 'women_rings',
      descriptionFa: '',
      descriptionEn: '',
      mainImage: '',
      images: [],
      productCode: randomCode,
      availability: 'in_stock',
      status: 'published',
      featured: false,
      showInLatestCreations: true,
      latestCreationsOrder: 1,
      showInFineJewelry: true,
      fineJewelryOrder: 1,
      displayOrder: products.length + 1,
      visibility: true,
      goldCarat: '۱۸ عیار (750)',
      gemstones: '',
      approxWeight: '',
      finish: 'زرگری دست‌ساز صیقلی',
      seoTitleFa: '',
      seoTitleEn: '',
      metaDescriptionFa: '',
      metaDescriptionEn: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      titleFa: p.titleFa,
      titleEn: p.titleEn || '',
      slug: p.slug || '',
      category: p.category,
      descriptionFa: p.descriptionFa || '',
      descriptionEn: p.descriptionEn || '',
      mainImage: p.mainImage || '',
      images: Array.isArray(p.images) ? p.images : [],
      productCode: p.productCode,
      availability: p.availability || 'in_stock',
      status: p.status || (p.visibility ? 'published' : 'draft'),
      featured: p.featured || false,
      showInLatestCreations: p.showInLatestCreations !== false,
      latestCreationsOrder: p.latestCreationsOrder || 1,
      showInFineJewelry: p.showInFineJewelry !== false,
      fineJewelryOrder: p.fineJewelryOrder || 1,
      displayOrder: p.displayOrder || 1,
      visibility: p.visibility !== false,
      goldCarat: p.specifications?.goldCarat || '',
      gemstones: p.specifications?.gemstones || '',
      approxWeight: p.specifications?.approxWeight || '',
      finish: p.specifications?.finish || '',
      seoTitleFa: p.seoTitleFa || '',
      seoTitleEn: p.seoTitleEn || '',
      metaDescriptionFa: p.metaDescriptionFa || '',
      metaDescriptionEn: p.metaDescriptionEn || '',
    });
    setIsModalOpen(true);
  };

  const handleGenerateSlug = () => {
    if (formData.titleEn.trim()) {
      const generated = formData.titleEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug: generated }));
    } else if (formData.productCode.trim()) {
      setFormData((prev) => ({
        ...prev,
        slug: prev.productCode.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formData.titleFa.trim() || !formData.productCode.trim()) {
      showToast('عنوان اثر و کد محصول الزامی هستند', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      titleFa: formData.titleFa.trim(),
      titleEn: formData.titleEn.trim(),
      productCode: formData.productCode.trim(),
      slug: formData.slug.trim() || undefined,
      descriptionFa: formData.descriptionFa.trim(),
      descriptionEn: formData.descriptionEn.trim(),
      specifications: {
        goldCarat: formData.goldCarat,
        gemstones: formData.gemstones,
        approxWeight: formData.approxWeight,
        finish: formData.finish,
      },
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

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
        throw new Error(parsed.errorMessage || 'خطا در ذخیره محصول');
      }

      showToast(editingProduct ? 'محصول با موفقیت ویرایش شد' : 'قطعه جدید به گالری افزوده شد', 'success');
      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const promptDeleteToTrash = (id: string, title: string) => {
    if (!token) return;
    setConfirmDialog({
      title: `انتقال «${title}» به سطل زباله`,
      message: 'این اثر از ویترین عمومی خارج شده و به بخش سطل زباله منتقل می‌شود. هر زمان بخواهید می‌توانید آن را بازیابی کنید.',
      confirmLabel: 'انتقال به سطل زباله',
      tone: 'danger',
      onConfirm: async () => {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('خطا در انتقال به سطل زباله');
        showToast(`قطعه «${title}» به سطل زباله منتقل گردید`, 'info');
        refreshData();
      },
    });
  };

  // Bulk Operations with luxury modal confirmation
  const promptBulkAction = (action: 'publish' | 'unpublish' | 'delete') => {
    if (!token || selectedProductIds.length === 0) return;

    const actionLabels = {
      publish: 'انتشار عمومی قطعات انتخاب‌شده',
      unpublish: 'تبدیل به پیش‌نویس قطعات انتخاب‌شده',
      delete: 'انتقال قطعات انتخاب‌شده به سطل زباله',
    };

    setConfirmDialog({
      title: actionLabels[action],
      message: `این عملیات بر روی ${selectedProductIds.length} اثر انتخاب‌شده اعمال خواهد شد. آیا ادامه می‌دهید؟`,
      confirmLabel: action === 'delete' ? 'انتقال گروهی به سطل زباله' : 'اعمال تغییرات گروهی',
      tone: action === 'delete' ? 'danger' : 'gold',
      onConfirm: async () => {
        const res = await fetch('/api/products/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action,
            ids: selectedProductIds,
          }),
        });

        const parsed = await safeParseJsonResponse<{ affected: number }>(res);
        if (!parsed.ok) throw new Error(parsed.errorMessage || 'عملیات گروهی ناموفق بود');
        showToast(`عملیات با موفقیت روی ${parsed.data?.affected || 0} اثر اعمال گردید`, 'success');
        setSelectedProductIds([]);
        refreshData();
      },
    });
  };

  const runConfirmAction = async () => {
    if (!confirmDialog) return;
    setConfirmRunning(true);
    try {
      await confirmDialog.onConfirm();
      setConfirmDialog(null);
    } catch (err: any) {
      showToast(err.message || 'خطا در اجرای عملیات', 'error');
    } finally {
      setConfirmRunning(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-light text-[#EDE8DF] font-vazir flex items-center gap-2">
            <Package className="w-5 h-5 text-[#C5A059]" />
            <span>مدیریت جواهرات و آثار کالکشن ({filteredProducts.length} قطعه)</span>
          </h2>
          <p className="text-xs text-[#8C8880] mt-1 leading-relaxed">
            ویرایش مشخصات زرگری (اختیاری)، انتخاب از کتابخانه تصاویر، آدرس اختصاصی سئو، پیش‌نمایش پیش‌نویس و عملیات گروهی
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] text-xs font-semibold rounded-sm flex items-center gap-2 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن قطعه جدید</span>
        </button>
      </div>

      {/* Filter, Sort and Search Bar */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-grow">
          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#8C8880] absolute start-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در کد، عنوان، گوهرها یا اسلاگ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-8 pe-3 py-1.5 bg-[#14141A] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] placeholder-[#64605A] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-[#14141A] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] focus:outline-none"
          >
            <option value="all">تمام دسته‌بندی‌ها</option>
            {categories.map((c) => (
              <option key={c.id} value={c.key}>
                {c.nameFa}
              </option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-2.5 py-1.5 bg-[#14141A] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] focus:outline-none"
          >
            <option value="all">تمام وضعیت‌های موجودی</option>
            <option value="in_stock">موجود در تهران</option>
            <option value="made_to_order">سفارشی</option>
            <option value="reserved">رزرو شده</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-[#14141A] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] focus:outline-none"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="published">منتشر شده</option>
            <option value="draft">پیش‌نویس / مخفی</option>
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1.5 bg-[#14141A] border border-[#C5A059]/20 rounded-sm px-2 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#C5A059]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-[#EDE8DF] focus:outline-none"
            >
              <option value="order" className="bg-[#14141A]">مرتب‌سازی: ترتیب نمایش</option>
              <option value="newest" className="bg-[#14141A]">مرتب‌سازی: جدیدترین</option>
              <option value="code" className="bg-[#14141A]">مرتب‌سازی: کد اثر</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedProductIds.length > 0 && (
          <div className="flex items-center gap-2 bg-[#171720] px-3 py-1.5 rounded border border-[#C5A059]/30 animate-fade-in">
            <span className="text-[11px] text-[#C5A059] font-medium">
              {selectedProductIds.length} اثر انتخاب شده:
            </span>
            <button
              type="button"
              onClick={() => promptBulkAction('publish')}
              className="px-2 py-1 bg-emerald-950/50 hover:bg-emerald-900 text-emerald-300 rounded text-[10px]"
            >
              انتشار عمومی
            </button>
            <button
              type="button"
              onClick={() => promptBulkAction('unpublish')}
              className="px-2 py-1 bg-amber-950/50 hover:bg-amber-900 text-amber-300 rounded text-[10px]"
            >
              تبدیل به پیش‌نویس
            </button>
            <button
              type="button"
              onClick={() => promptBulkAction('delete')}
              className="px-2 py-1 bg-red-950/50 hover:bg-red-900 text-red-300 rounded text-[10px]"
            >
              انتقال به سطل زباله
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#121216] border-b border-[#C5A059]/15 text-[#C5A059] font-cinzel">
              <tr>
                <th className="p-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProductIds.length === filteredProducts.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-[#C5A059]/30 text-[#C5A059] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-3 text-start">تصویر</th>
                <th className="p-3 text-start">کد قطعه</th>
                <th className="p-3 text-start">عنوان اثر</th>
                <th className="p-3 text-start">نشانی SEO</th>
                <th className="p-3 text-start">دسته‌بندی</th>
                <th className="p-3 text-start">موجودی</th>
                <th className="p-3 text-center">وضعیت انتشار</th>
                <th className="p-3 text-center">ویترین</th>
                <th className="p-3 text-end">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A059]/10 text-[#C8C4BC]">
              {filteredProducts.map((prod) => {
                const isSelected = selectedProductIds.includes(prod.id);
                const publicUrl = getProductPublicUrl(prod);
                const isDraft = !prod.visibility || prod.status === 'draft';
                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-[#121217] transition-colors ${isSelected ? 'bg-[#181824]' : ''}`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(prod.id)}
                        className="rounded border-[#C5A059]/30 text-[#C5A059] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <div className="w-12 h-12 bg-[#08080A] border border-[#C5A059]/20 rounded-sm overflow-hidden flex items-center justify-center p-0.5">
                        {prod.mainImage ? (
                          <img
                            src={prod.mainImage}
                            alt={prod.titleFa}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-[#8C8880]" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#D4AF37]">{prod.productCode}</td>
                    <td className="p-3">
                      <span className="font-medium text-[#EDE8DF] block">{prod.titleFa}</span>
                      <span className="text-[10px] text-[#8C8880]">{prod.titleEn}</span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#C5A059]" dir="ltr">
                      {publicUrl}
                    </td>
                    <td className="p-3 font-cinzel uppercase text-[#A8A49C]">{prod.category}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-sm text-[10px] border ${
                          prod.availability === 'in_stock'
                            ? 'text-emerald-400 border-emerald-800 bg-emerald-950/20'
                            : prod.availability === 'made_to_order'
                            ? 'text-[#D4AF37] border-[#C5A059]/30 bg-[#C5A059]/10'
                            : 'text-stone-400 border-stone-800 bg-stone-900/40'
                        }`}
                      >
                        {prod.availability === 'in_stock'
                          ? 'موجود'
                          : prod.availability === 'made_to_order'
                          ? 'سفارشی'
                          : 'رزرو'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {!isDraft ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 text-[10px]">
                          منتشر شده
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400 border border-amber-800/30 text-[10px]">
                          پیش‌نویس
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {prod.showInLatestCreations && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-[#C5A059]/10 text-[#C5A059] rounded border border-[#C5A059]/20">
                            جدیدترین‌ها
                          </span>
                        )}
                        {prod.showInFineJewelry && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-purple-950/40 text-purple-300 rounded border border-purple-800/30">
                            فاخر
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#181820] hover:bg-[#22222E] text-[#C5A059] rounded-sm transition-colors"
                          title={isDraft ? 'پیش‌نمایش پیش‌نویس' : 'مشاهده صفحه عمومی اثر'}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 bg-[#181820] hover:bg-[#C5A059] hover:text-[#0A0A0B] text-[#C8C4BC] rounded-sm transition-colors"
                          title="ویرایش اثر"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => promptDeleteToTrash(prod.id, prod.titleFa)}
                          className="p-1.5 bg-[#181820] hover:bg-red-900 text-red-400 rounded-sm transition-colors"
                          title="انتقال به سطل زباله"
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

      {/* CREATE / EDIT PRODUCT MODAL */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span>{editingProduct ? 'ویرایش اثر جواهری' : 'افزودن شاهکار جدید به کالکشن'}</span>
          </span>
        }
        maxWidth="max-w-4xl"
        zLevel="base"
      >
        <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* Row 1: Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">عنوان فارسی اثر *</label>
                  <input
                    type="text"
                    required
                    value={formData.titleFa}
                    onChange={(e) => setFormData({ ...formData, titleFa: e.target.value })}
                    placeholder="مثال: انگشتر تک‌نگین الماس زرد طبیعی"
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">عنوان انگلیسی (English Title)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="e.g. Natural Fancy Yellow Diamond Solitaire"
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Row 2: Code, Category, Availability, DisplayOrder */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">کد قطعه *</label>
                  <input
                    type="text"
                    required
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                    placeholder="SN-R-101"
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">دسته‌بندی اثر *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.key}>
                        {c.nameFa} ({c.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">وضعیت موجودی</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:outline-none"
                  >
                    <option value="in_stock">موجود در تهران</option>
                    <option value="made_to_order">قابل سفارش اختصاصی</option>
                    <option value="reserved">رزرو شده</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">ترتیب نمایش در لیست</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono text-center focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: SEO Slug (With Auto-generate helper) */}
              <div className="p-3 bg-[#111116] border border-[#C5A059]/15 rounded-sm">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#C5A059] font-medium">
                    آدرس اختصاصی سئو (SEO Slug) — با تغییر، ریدایرکت ۳۰۱ خودکار ثبت می‌شود:
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="text-[10px] text-[#C5A059] hover:text-[#D4AF37] underline"
                  >
                    تولید خودکار از نام انگلیسی یا کد
                  </button>
                </div>
                <div className="flex items-center gap-2" dir="ltr">
                  <span className="text-[#8C8880] font-mono text-[11px]">
                    /{(categories.find((c) => c.key === formData.category)?.slug || formData.category.replace(/_/g, '-'))}/
                  </span>
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="fancy-yellow-diamond-ring"
                    className="flex-grow px-3 py-1.5 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Main Image with Library Selection */}
              <div className="p-3 bg-[#111116] border border-[#C5A059]/15 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#C5A059] font-medium">تصویر اصلی اثر (Main Image)</span>
                  <button
                    type="button"
                    onClick={() => setMediaPickerMode('main')}
                    className="px-3 py-1 bg-[#1C1C24] hover:bg-[#C5A059] text-[#EDE8DF] hover:text-black rounded text-[11px] transition-colors flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>انتخاب از کتابخانه تصاویر</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.mainImage}
                    onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                    placeholder="/images/... یا آدرس فایل آپلود شده"
                    className="flex-grow px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm font-mono focus:outline-none"
                  />
                  {formData.mainImage && (
                    <div className="w-12 h-12 rounded-sm overflow-hidden border border-[#C5A059]/30 bg-black shrink-0">
                      <img src={formData.mainImage} alt="Main Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Gallery Images */}
              <div className="p-3 bg-[#111116] border border-[#C5A059]/15 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#C5A059] font-medium">
                    گالری سایر زاویه‌ها ({formData.images.length} تصویر)
                  </span>
                  <button
                    type="button"
                    onClick={() => setMediaPickerMode('gallery')}
                    className="px-3 py-1 bg-[#1C1C24] hover:bg-[#C5A059] text-[#EDE8DF] hover:text-black rounded text-[11px] transition-colors flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>انتخاب چندتایی از کتابخانه</span>
                  </button>
                </div>

                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative group w-14 h-14 rounded overflow-hidden border border-[#C5A059]/20 bg-black">
                        <img src={imgUrl} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                          aria-label={`حذف تصویر گالری ${idx + 1}`}
                          className="absolute top-0.5 end-0.5 w-6 h-6 rounded-sm bg-red-950/90 text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] flex items-center justify-center transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 6: Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">توضیحات و احساس اثر (فارسی)</label>
                  <textarea
                    rows={3}
                    value={formData.descriptionFa}
                    onChange={(e) => setFormData({ ...formData, descriptionFa: e.target.value })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:outline-none leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-medium">توضیحات انگلیسی (English Description)</label>
                  <textarea
                    rows={3}
                    dir="ltr"
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    className="w-full px-3 py-2 bg-[#08080A] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Row 7: Optional Specifications Sub-fields */}
              <div className="p-3.5 bg-[#111115] border border-[#C5A059]/15 rounded-sm space-y-3">
                <span className="font-cinzel text-xs text-[#D4AF37] block font-semibold">
                  مشخصات فنی و گوهرشناسی (اختیاری)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[#8C8880] mb-0.5">عیار و جنس فلز</label>
                    <input
                      type="text"
                      value={formData.goldCarat}
                      onChange={(e) => setFormData({ ...formData, goldCarat: e.target.value })}
                      placeholder="۱۸ عیار (750)"
                      className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8C8880] mb-0.5">سنگ‌ها و قیراط</label>
                    <input
                      type="text"
                      value={formData.gemstones}
                      onChange={(e) => setFormData({ ...formData, gemstones: e.target.value })}
                      placeholder="تک‌نگین برلیان ۲ قیراط GIA"
                      className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8C8880] mb-0.5">وزن تقریبی</label>
                    <input
                      type="text"
                      value={formData.approxWeight}
                      onChange={(e) => setFormData({ ...formData, approxWeight: e.target.value })}
                      placeholder="۶.۲ گرم"
                      className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8C8880] mb-0.5">نوع ساخت / پرداخت</label>
                    <input
                      type="text"
                      value={formData.finish}
                      onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                      placeholder="زرگری دست‌ساز صیقلی"
                      className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Row 8: Product SEO Metadata */}
              <div className="p-3.5 bg-[#111115] border border-[#C5A059]/15 rounded-sm space-y-3">
                <span className="text-xs text-[#D4AF37] block font-medium">
                  تنظیمات سئو و متاتگ‌های اختصاصی اثر (اختیاری)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8C8880] mb-0.5">عنوان سئو (SEO Title فارسی)</label>
                    <input
                      type="text"
                      value={formData.seoTitleFa}
                      onChange={(e) => setFormData({ ...formData, seoTitleFa: e.target.value })}
                      placeholder="اگر خالی باشد از عنوان فارسی استفاده می‌شود"
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
                  <div>
                    <label className="block text-[#8C8880] mb-0.5">متادیسکریپشن فارسی</label>
                    <textarea
                      rows={2}
                      value={formData.metaDescriptionFa}
                      onChange={(e) => setFormData({ ...formData, metaDescriptionFa: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8C8880] mb-0.5">Meta Description (English)</label>
                    <textarea
                      rows={2}
                      dir="ltr"
                      value={formData.metaDescriptionEn}
                      onChange={(e) => setFormData({ ...formData, metaDescriptionEn: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#08080A] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Row 9: Status & Showcase Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer bg-[#0A0A0E] p-2.5 rounded border border-[#C5A059]/15">
                  <input
                    type="checkbox"
                    checked={formData.visibility && formData.status !== 'draft'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visibility: e.target.checked,
                        status: e.target.checked ? 'published' : 'draft',
                      })
                    }
                    className="rounded border-[#C5A059]/30 text-[#C5A059]"
                  />
                  <div>
                    <span className="text-[#EDE8DF] font-medium block">انتشار در وبسایت</span>
                    <span className="text-[10px] text-[#8C8880]">در صورت عدم تیک: پیش‌نویس خصوصی</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-[#0A0A0E] p-2.5 rounded border border-[#C5A059]/15">
                  <input
                    type="checkbox"
                    checked={formData.showInLatestCreations}
                    onChange={(e) => setFormData({ ...formData, showInLatestCreations: e.target.checked })}
                    className="rounded border-[#C5A059]/30 text-[#C5A059]"
                  />
                  <div>
                    <span className="text-[#EDE8DF] font-medium block">جدیدترین آثار</span>
                    <span className="text-[10px] text-[#8C8880]">اسلایدر متحرک صفحه اول</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-[#0A0A0E] p-2.5 rounded border border-[#C5A059]/15">
                  <input
                    type="checkbox"
                    checked={formData.showInFineJewelry}
                    onChange={(e) => setFormData({ ...formData, showInFineJewelry: e.target.checked })}
                    className="rounded border-[#C5A059]/30 text-[#C5A059]"
                  />
                  <div>
                    <span className="text-[#EDE8DF] font-medium block">جواهرات فاخر</span>
                    <span className="text-[10px] text-[#8C8880]">کالکشن Haute Joaillerie</span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C5A059]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#C5A059]/20 text-xs text-[#C8C4BC] rounded-sm hover:text-[#EDE8DF]"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] disabled:bg-[#C5A059]/50 text-[#0A0A0B] text-xs font-semibold rounded-sm flex items-center gap-2 shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'در حال ذخیره‌سازی...' : 'ذخیره مشخصات قطعه'}</span>
                </button>
              </div>
            </form>
      </AdminModal>

      {/* Custom Dark-Gold Confirmation Modal */}
      <AdminModal
        isOpen={Boolean(confirmDialog)}
        onClose={() => {
          if (!confirmRunning) setConfirmDialog(null);
        }}
        title={
          <span className="flex items-center gap-2">
            <AlertTriangle
              className={`w-4 h-4 shrink-0 ${
                confirmDialog?.tone === 'danger' ? 'text-rose-400' : 'text-[#D4AF37]'
              }`}
            />
            <span>{confirmDialog?.title || ''}</span>
          </span>
        }
        maxWidth="max-w-md"
        zLevel="confirm"
      >
        {confirmDialog && (
          <div>
            <p className="text-xs text-[#A8A49C] mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={confirmRunning}
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-[#17171E] text-xs text-[#C8C4BC] rounded-sm"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={confirmRunning}
                onClick={runConfirmAction}
                className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors ${
                  confirmDialog.tone === 'danger'
                    ? 'bg-red-800 hover:bg-red-700 text-white'
                    : 'bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B]'
                }`}
              >
                {confirmRunning ? 'در حال انجام...' : confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Media Picker Modal */}
      <MediaLibraryModal
        isOpen={Boolean(mediaPickerMode)}
        onClose={() => setMediaPickerMode(null)}
        mode={mediaPickerMode === 'gallery' ? 'select-multiple' : 'select-single'}
        initialSelected={mediaPickerMode === 'gallery' ? formData.images : formData.mainImage}
        onSelect={(selected) => {
          if (mediaPickerMode === 'main' && typeof selected === 'string') {
            setFormData((prev) => ({ ...prev, mainImage: selected }));
          } else if (mediaPickerMode === 'gallery' && Array.isArray(selected)) {
            setFormData((prev) => ({ ...prev, images: selected }));
          }
        }}
      />
    </div>
  );
};
