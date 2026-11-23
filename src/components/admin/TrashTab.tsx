import React, { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Package,
  Layers,
  FileText,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { safeParseJsonResponse } from '../../lib/api';
import { AdminModal } from './AdminModal';

interface TrashData {
  products: any[];
  categories: any[];
  articles: any[];
  pages: any[];
  media: any[];
}

export const TrashTab: React.FC = () => {
  const { token, showToast, refreshData, refreshMedia } = useApp();

  const [activeCategory, setActiveCategory] = useState<'products' | 'categories' | 'articles' | 'pages' | 'media'>('products');
  const [trashData, setTrashData] = useState<TrashData>({
    products: [],
    categories: [],
    articles: [],
    pages: [],
    media: [],
  });
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Confirmation modal state for permanent delete or empty trash
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    type: 'product' | 'category' | 'article' | 'page' | 'media';
    id: string;
    title: string;
  } | null>(null);
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);

  const fetchTrash = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/trash', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const parsed = await safeParseJsonResponse<TrashData>(res);
      if (parsed.ok && parsed.data) {
        setTrashData(parsed.data);
      }
    } catch (err) {
      console.error('Failed to load trash:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  // Restore item
  const handleRestore = async (type: 'product' | 'category' | 'article' | 'page' | 'media', id: string) => {
    if (!token) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/trash/restore/${type}/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('عملیات بازیابی ناموفق بود');

      showToast('مورد با موفقیت بازیابی شد و به فهرست عمومی بازگشت', 'success');
      fetchTrash();
      refreshData();
      if (type === 'media') refreshMedia();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Permanent Delete
  const handlePermanentDelete = async () => {
    if (!token || !confirmDeleteModal) return;
    const { type, id } = confirmDeleteModal;
    setActionLoadingId(id);

    try {
      const res = await fetch(`/api/trash/permanent/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('حذف دائمی ناموفق بود');

      showToast('مورد برای همیشه از پایگاه‌داده حذف گردید', 'success');
      setConfirmDeleteModal(null);
      fetchTrash();
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Empty Trash
  const handleEmptyTrash = async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/trash/empty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: activeCategory }),
      });
      const parsed = await safeParseJsonResponse<{ count: number }>(res);
      if (!parsed.ok) throw new Error(parsed.errorMessage || 'خطا در پاکسازی سطل زباله');
      showToast(`سطل زباله با موفقیت خالی شد (${parsed.data?.count || 0} مورد حذف شد)`, 'success');
      setConfirmEmptyOpen(false);
      fetchTrash();
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const currentItems = trashData[activeCategory] || [];
  const totalTrashCount =
    trashData.products.length +
    trashData.categories.length +
    trashData.articles.length +
    trashData.pages.length +
    trashData.media.length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-light text-[#EDE8DF] font-vazir flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-amber-500" />
            <span>سطل زباله و موارد حذف‌شده (Soft Delete)</span>
          </h2>
          <p className="text-xs text-[#8C8880] mt-1 leading-relaxed">
            مواردی که در پنل حذف می‌شوند، ابتدا به این بخش منتقل می‌شوند تا از حذف ناخواسته اطلاعات و وابستگی‌ها جلوگیری شود.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchTrash}
            className="p-2 text-xs text-[#C5A059] hover:text-[#D4AF37] border border-[#C5A059]/20 rounded-sm transition-colors"
            title="تازه‌سازی سطل زباله"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {currentItems.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmEmptyOpen(true)}
              className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs rounded-sm transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>خالی کردن این بخش</span>
            </button>
          )}
        </div>
      </div>

      {/* Subcategory Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'products', label: 'جواهرات و محصولات', icon: Package, count: trashData.products.length },
          { id: 'categories', label: 'دسته‌بندی‌ها', icon: Layers, count: trashData.categories.length },
          { id: 'articles', label: 'مقالات و وبلاگ', icon: FileText, count: trashData.articles.length },
          { id: 'pages', label: 'صفحات', icon: Layers, count: trashData.pages.length },
          { id: 'media', label: 'فایل‌های رسانه', icon: ImageIcon, count: trashData.media.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs rounded-sm whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#C5A059] text-[#0A0A0B] border-[#D4AF37] font-semibold shadow-md'
                  : 'bg-[#121216] text-[#A8A49C] hover:text-[#EDE8DF] border-[#C5A059]/15'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-[#0A0A0B]/30 text-[#0A0A0B]' : 'bg-[#1C1C24] text-[#C5A059]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Trash Content Table */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#8C8880] flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#C5A059] animate-spin" />
            <span className="text-xs">در حال بارگذاری موارد سطل زباله...</span>
          </div>
        ) : currentItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#121216] border-b border-[#C5A059]/15 text-[#C5A059] font-cinzel">
                <tr>
                  <th className="p-3 text-start">تصویر</th>
                  <th className="p-3 text-start">عنوان / نام</th>
                  <th className="p-3 text-start">شناسه / کد</th>
                  <th className="p-3 text-start">تاریخ حذف</th>
                  <th className="p-3 text-center">عملیات بازیابی یا حذف دائمی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/10">
                {currentItems.map((item) => {
                  const imageSrc =
                    item.mainImage || item.image || item.coverImage || item.featuredImage || item.url || '';
                  const title = item.titleFa || item.nameFa || item.name || item.h1Fa || 'مورد بدون عنوان';
                  const codeOrSlug = item.productCode || item.key || item.slug || item.id;
                  const deleteDate = item.deletedAt
                    ? new Date(item.deletedAt).toLocaleString('fa-IR')
                    : 'نامشخص';

                  return (
                    <tr key={item.id} className="hover:bg-[#121218] transition-colors">
                      <td className="p-3">
                        <div className="w-12 h-12 rounded-sm overflow-hidden border border-[#C5A059]/20 bg-[#08080A] flex items-center justify-center">
                          {imageSrc ? (
                            <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-[#8C8880]" />
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-medium text-[#EDE8DF]">{title}</td>
                      <td className="p-3 font-mono text-[11px] text-[#A8A49C]">{codeOrSlug}</td>
                      <td className="p-3 text-[11px] text-[#8C8880] flex items-center gap-1.5 pt-4">
                        <Calendar className="w-3 h-3 text-[#C5A059]" />
                        <span>{deleteDate}</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            disabled={actionLoadingId === item.id}
                            onClick={() => {
                              const entityType =
                                activeCategory === 'products'
                                  ? 'product'
                                  : activeCategory === 'categories'
                                  ? 'category'
                                  : activeCategory === 'articles'
                                  ? 'article'
                                  : activeCategory === 'pages'
                                  ? 'page'
                                  : 'media';
                              handleRestore(entityType, item.id);
                            }}
                            className="px-3 py-1.5 bg-[#17171E] hover:bg-[#C5A059] text-[#EDE8DF] hover:text-[#0A0A0B] border border-[#C5A059]/20 rounded-sm transition-colors text-xs flex items-center gap-1.5 shadow-sm"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>بازیابی</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const entityType =
                                activeCategory === 'products'
                                  ? 'product'
                                  : activeCategory === 'categories'
                                  ? 'category'
                                  : activeCategory === 'articles'
                                  ? 'article'
                                  : activeCategory === 'pages'
                                  ? 'page'
                                  : 'media';
                              setConfirmDeleteModal({
                                type: entityType,
                                id: item.id,
                                title,
                              });
                            }}
                            className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/60 text-red-300 border border-red-800/30 rounded-sm transition-colors text-xs flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف دائمی</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-[#8C8880]">
            <Check className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-vazir text-[#EDE8DF]">سطل زباله در این دسته‌بندی خالی است</p>
            <p className="text-xs text-[#8C8880] mt-1">هیچ موردی اخیراً حذف نشده است.</p>
          </div>
        )}
      </div>

      {/* CONFIRM PERMANENT DELETE DIALOG */}
      <AdminModal
        isOpen={Boolean(confirmDeleteModal)}
        onClose={() => setConfirmDeleteModal(null)}
        title={
          <span className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>تأیید حذف دائمی</span>
          </span>
        }
        maxWidth="max-w-md"
        zLevel="confirm"
      >
        {confirmDeleteModal && (
          <div className="space-y-4">
            <p className="text-xs text-[#C8C4BC] leading-relaxed">
              آیا از حذف دائمی و قطعی «<strong className="text-white">{confirmDeleteModal.title}</strong>» اطمینان دارید؟
            </p>

            <div className="p-3 bg-red-950/30 border border-red-900/30 rounded text-[11px] text-red-300 leading-relaxed">
              توجه: این مورد به‌صورت کامل از پایگاه‌داده پاک خواهد شد و امکان بازیابی آن وجود نخواهد داشت.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(null)}
                className="px-4 py-2 border border-[#C5A059]/20 text-xs text-[#C8C4BC] rounded-sm hover:text-white"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handlePermanentDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>بله، حذف قطعی شود</span>
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* CONFIRM EMPTY TRASH MODAL */}
      <AdminModal
        isOpen={confirmEmptyOpen}
        onClose={() => setConfirmEmptyOpen(false)}
        title={
          <span className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>تأیید خالی کردن سطل زباله</span>
          </span>
        }
        maxWidth="max-w-md"
        zLevel="confirm"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#C8C4BC] leading-relaxed">
            آیا از پاکسازی دائمی تمام موارد این بخش ({currentItems.length} مورد) اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setConfirmEmptyOpen(false)}
              className="px-4 py-2 border border-[#C5A059]/20 text-xs text-[#C8C4BC] rounded-sm hover:text-white"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleEmptyTrash}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-sm transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>خالی کردن دائمی</span>
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
