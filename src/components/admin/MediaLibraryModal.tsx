import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Check,
  Trash2,
  Copy,
  AlertTriangle,
  Sparkles,
  Info,
  Layers,
  FileText,
  Package,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { safeParseJsonResponse } from '../../lib/api';
import type { MediaAsset, MediaAssetUsage } from '../../types';
import { AdminModal } from './AdminModal';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (url: string | string[]) => void;
  mode?: 'select-single' | 'select-multiple' | 'browse';
  initialSelected?: string | string[];
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  mode = 'browse',
  initialSelected,
}) => {
  const { media, refreshMedia, showToast, token, adminUser } = useApp();

  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrls, setSelectedUrls] = useState<string[]>(() => {
    if (Array.isArray(initialSelected)) return initialSelected;
    if (typeof initialSelected === 'string' && initialSelected) return [initialSelected];
    return [];
  });
  const [previewMedia, setPreviewMedia] = useState<MediaAsset | null>(null);

  // Safe delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [deleteBlockedUsedIn, setDeleteBlockedUsedIn] = useState<MediaAssetUsage[] | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('products');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canDeleteMedia = !adminUser?.role || adminUser.role === 'admin';

  // Filter media
  const filteredMedia = media.filter((item) => {
    if (item.isDeleted) return false;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSelectUrl = (url: string) => {
    if (mode === 'select-single') {
      setSelectedUrls([url]);
    } else {
      setSelectedUrls((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    }
  };

  const handleConfirmSelection = () => {
    if (!onSelect) return;
    if (mode === 'select-single') {
      onSelect(selectedUrls[0] || '');
    } else {
      onSelect(selectedUrls);
    }
    onClose();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('آدرس تصویر در حافظه کپی شد', 'info');
  };

  const openDeleteDialog = (item: MediaAsset) => {
    setDeleteTarget(item);
    setDeleteBlockedUsedIn(item.usedIn && item.usedIn.length > 0 ? item.usedIn : null);
    setDeleteErrorMsg(null);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!deleteTarget || !token || isDeleting) return;
    if (deleteBlockedUsedIn && deleteBlockedUsedIn.length > 0) return;

    setIsDeleting(true);
    setDeleteErrorMsg(null);

    try {
      const res = await fetch(`/api/media/${encodeURIComponent(deleteTarget.id)}?permanent=true`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const rawText = await res.text();
      let payload: { success?: boolean; error?: string; usedIn?: MediaAssetUsage[] } = {};
      try {
        payload = rawText ? JSON.parse(rawText) : {};
      } catch {
        payload = {};
      }

      if (!res.ok) {
        if (res.status === 409 && Array.isArray(payload.usedIn) && payload.usedIn.length > 0) {
          setDeleteBlockedUsedIn(payload.usedIn);
        }
        setDeleteErrorMsg(payload.error || 'حذف این فایل ممکن نیست.');
        return;
      }

      const deletedUrl = deleteTarget.url;
      const deletedId = deleteTarget.id;
      setSelectedUrls((prev) => prev.filter((u) => u !== deletedUrl));
      if (previewMedia?.id === deletedId) {
        setPreviewMedia(null);
      }
      setDeleteTarget(null);
      await refreshMedia();
      showToast('فایل رسانه با موفقیت از کتابخانه و مخزن ذخیره‌سازی حذف شد', 'success');
    } catch {
      setDeleteErrorMsg('خطای ارتباط با سرور در حذف تصویر.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Upload File Handler (supports multiple files with size/type validation)
  const MAX_CLIENT_BYTES = 15 * 1024 * 1024;
  const ALLOWED_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (const f of Array.from(files) as File[]) {
      if (!ALLOWED_TYPES.has(f.type.toLowerCase())) {
        showToast(`فرمت فایل «${f.name}» مجاز نیست (فقط JPG, PNG, WebP, GIF)`, 'error');
        continue;
      }
      if (f.size > MAX_CLIENT_BYTES) {
        showToast(`حجم فایل «${f.name}» بیش از ۱۵ مگابایت است`, 'error');
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);

    const uploads = validFiles.map((file: File) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const dataUri = reader.result as string;
            const res = await fetch('/api/media/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                name: uploadName.trim() || file.name.replace(/\.[^/.]+$/, ''),
                dataUri,
                category: uploadCategory,
              }),
            });

            const parsed = await safeParseJsonResponse<{ asset: MediaAsset }>(res);
            if (!parsed.ok || !parsed.data?.asset) {
              throw new Error(parsed.errorMessage || 'خطا در بارگذاری فایل');
            }
            if (mode === 'select-single') {
              setSelectedUrls([parsed.data.asset.url]);
            } else {
              setSelectedUrls((prev) => [...prev, parsed.data!.asset.url]);
            }
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('خطا در خواندن فایل از دستگاه'));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(uploads)
      .then(() => {
        showToast('تصاویر با موفقیت در کتابخانه رسانه ثبت شدند', 'success');
        refreshMedia();
        setUploadName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setActiveTab('gallery');
      })
      .catch((err: any) => {
        showToast(err?.message || 'خطا در آپلود برخی تصاویر', 'error');
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const activeDeleteUsages = deleteBlockedUsedIn || deleteTarget?.usedIn || [];
  const isDeleteBlocked = activeDeleteUsages.length > 0;

  return (
    <>
      <AdminModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <span className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span>کتابخانه رسانه و تصاویر سعیدنیا</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1C1C24] text-[#C5A059] border border-[#C5A059]/20">
              {filteredMedia.length} تصویر
            </span>
          </span>
        }
        maxWidth="max-w-5xl"
        zLevel="nested"
        bodyClassName="p-0 flex flex-col min-h-[60vh]"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#A8A49C]">
              {selectedUrls.length > 0 ? (
                <span>
                  <strong className="text-[#C5A059]">{selectedUrls.length}</strong> تصویر انتخاب شده است
                </span>
              ) : (
                <span>تصویری انتخاب نشده است</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#C5A059]/20 text-xs text-[#C8C4BC] hover:text-[#EDE8DF] rounded-sm transition-colors cursor-pointer"
              >
                انصراف
              </button>

              {mode !== 'browse' && (
                <button
                  type="button"
                  disabled={selectedUrls.length === 0}
                  onClick={handleConfirmSelection}
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] disabled:bg-[#C5A059]/30 text-[#0A0A0B] text-xs font-semibold rounded-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>تأیید و درج در فرم</span>
                </button>
              )}
            </div>
          </div>
        }
      >
        {/* Top Control Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-[#C5A059]/15 flex flex-wrap items-center justify-between gap-3 bg-[#0B0B0E] shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-1.5 text-xs rounded-sm transition-colors cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-[#C5A059] text-[#0A0A0B] font-medium'
                  : 'text-[#A8A49C] hover:text-[#EDE8DF] bg-[#14141A]'
              }`}
            >
              گالری تصاویر
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 text-xs rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-[#C5A059] text-[#0A0A0B] font-medium'
                  : 'text-[#A8A49C] hover:text-[#EDE8DF] bg-[#14141A]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>بارگذاری تصویر جدید</span>
            </button>
          </div>

          {/* Search & Category Filter (Only in Gallery view) */}
          {activeTab === 'gallery' && (
            <div className="flex flex-wrap items-center gap-2 flex-grow sm:flex-grow-0 min-w-0">
              <div className="relative flex-1 sm:flex-none min-w-0">
                <Search className="w-3.5 h-3.5 text-[#8C8880] absolute start-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="جستجوی نام تصویر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full ps-8 pe-3 py-1.5 text-xs bg-[#14141A] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] placeholder-[#64605A] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#14141A] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] focus:outline-none"
              >
                <option value="all">تمام دسته‌ها</option>
                <option value="products">محصولات</option>
                <option value="banners">بنرها و هدر</option>
                <option value="articles">وبلاگ</option>
                <option value="boutique">بوتیک</option>
                <option value="general">عمومی</option>
              </select>
            </div>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* TAB 1: GALLERY */}
          {activeTab === 'gallery' && (
            <>
              {/* Image Grid Area */}
              <div className="flex-1 min-h-[220px] overflow-y-auto p-4 sm:p-5 scrollbar-thin">
                {filteredMedia.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {filteredMedia.map((item) => {
                      const isSelected = selectedUrls.includes(item.url);
                      const isUsed = Boolean(item.usedIn && item.usedIn.length > 0);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setPreviewMedia(item);
                            if (mode !== 'browse') {
                              toggleSelectUrl(item.url);
                            }
                          }}
                          className={`group relative rounded-sm overflow-hidden border cursor-pointer transition-all aspect-square bg-[#08080A] ${
                            isSelected
                              ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-lg shadow-[#D4AF37]/10'
                              : 'border-[#C5A059]/15 hover:border-[#C5A059]/50'
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Selection Checkmark */}
                          {isSelected && (
                            <div className="absolute top-2 start-2 w-6 h-6 rounded-full bg-[#D4AF37] text-[#0A0A0B] flex items-center justify-center shadow-md z-10">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          {/* Delete Action Button (always keyboard/touch reachable, clear top-end badge) */}
                          {canDeleteMedia && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(item);
                              }}
                              aria-label={`حذف تصویر ${item.name}`}
                              title={isUsed ? 'حذف تصویر (در حال استفاده در سایت)' : 'حذف تصویر'}
                              className={`absolute top-2 end-2 z-10 w-7 h-7 rounded-sm border flex items-center justify-center transition-all cursor-pointer ${
                                isUsed
                                  ? 'bg-black/75 border-amber-500/40 text-amber-300 hover:bg-amber-950/90'
                                  : 'bg-black/75 border-rose-500/40 text-rose-300 hover:bg-rose-700 hover:text-white'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Usage Count Badge */}
                          {item.usageCount && item.usageCount > 0 ? (
                            <span className="absolute bottom-8 start-2 px-1.5 py-0.5 rounded-sm bg-black/80 text-[10px] text-[#C5A059] border border-[#C5A059]/30 z-10">
                              {item.usageCount} استفاده
                            </span>
                          ) : null}

                          {/* Hover Overlay with quick info & copy */}
                          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2 p-2 pointer-events-none group-hover:pointer-events-auto">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewMedia(item);
                              }}
                              className="p-1.5 rounded-sm bg-[#1A1A22] text-[#EDE8DF] hover:text-[#C5A059] cursor-pointer"
                              title="مشاهده جزئیات و وابستگی‌ها"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(item.url);
                              }}
                              className="p-1.5 rounded-sm bg-[#1A1A22] text-[#EDE8DF] hover:text-[#C5A059] cursor-pointer"
                              title="کپی آدرس"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Bottom filename snippet */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 text-start">
                            <span className="text-[11px] text-[#C8C4BC] truncate block font-mono">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#8C8880]">
                    <ImageIcon className="w-12 h-12 stroke-[1] mb-3 text-[#C5A059]/40" />
                    <p className="text-sm font-vazir text-[#EDE8DF] mb-1">
                      هیچ تصویری در این دسته یافت نشد
                    </p>
                    <p className="text-xs text-[#8C8880] mb-4">
                      می‌توانید با دکمه بارگذاری، تصاویر جدید اضافه فرمایید.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="px-4 py-2 bg-[#C5A059] text-[#0A0A0B] text-xs font-medium rounded-sm cursor-pointer"
                    >
                      افزودن تصویر جدید
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar Inspector / Preview Details */}
              {previewMedia && (
                <div className="w-full md:w-80 max-h-[42vh] md:max-h-none border-t md:border-t-0 md:border-s border-[#C5A059]/20 bg-[#0B0B0E] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto shrink-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#C5A059]/15">
                      <span className="text-xs font-semibold text-[#EDE8DF]">مشخصات فایل</span>
                      <button
                        type="button"
                        onClick={() => setPreviewMedia(null)}
                        className="text-xs text-[#8C8880] hover:text-[#EDE8DF] cursor-pointer"
                      >
                        بستن
                      </button>
                    </div>

                    {/* Preview Box */}
                    <div className="aspect-video w-full rounded-sm overflow-hidden border border-[#C5A059]/20 bg-black flex items-center justify-center">
                      <img
                        src={previewMedia.url}
                        alt={previewMedia.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Metadata Table */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[#8C8880] block text-[10px]">نام فایل:</span>
                        <span className="text-[#EDE8DF] font-medium break-all font-mono">
                          {previewMedia.name}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[#8C8880] block text-[10px]">دسته:</span>
                          <span className="text-[#C5A059]">{previewMedia.category}</span>
                        </div>
                        <div>
                          <span className="text-[#8C8880] block text-[10px]">فرمت:</span>
                          <span className="text-[#EDE8DF] uppercase font-mono">
                            {previewMedia.format || 'JPG'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[#8C8880] block text-[10px]">حجم فایل:</span>
                        <span className="text-[#EDE8DF] font-mono">
                          {formatFileSize(previewMedia.fileSize)}
                        </span>
                      </div>

                      {previewMedia.storagePath && (
                        <div>
                          <span className="text-[#8C8880] block text-[10px]">مسیر در مخزن ذخیره‌سازی:</span>
                          <span className="text-emerald-400 font-mono text-[10px] break-all">
                            {previewMedia.url.startsWith('/uploads/')
                              ? `uploads/${previewMedia.storagePath}`
                              : `saeednia-media/${previewMedia.storagePath}`}
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="text-[#8C8880] block text-[10px]">آدرس مستقیم:</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <input
                            type="text"
                            readOnly
                            dir="ltr"
                            value={previewMedia.url}
                            className="w-full px-2 py-1 bg-[#14141A] border border-[#C5A059]/20 rounded text-[11px] font-mono text-[#A8A49C]"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopy(previewMedia.url)}
                            aria-label="کپی آدرس فایل"
                            className="p-1 text-[#C5A059] hover:text-[#D4AF37] cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Usage Relations Section */}
                      <div className="pt-2 border-t border-[#C5A059]/15">
                        <span className="text-[#C5A059] block text-xs font-medium mb-1.5 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" />
                          <span>وابستگی‌ها و موارد استفاده ({previewMedia.usedIn?.length || 0}):</span>
                        </span>

                        {previewMedia.usedIn && previewMedia.usedIn.length > 0 ? (
                          <div className="max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
                            {previewMedia.usedIn.map((use, idx) => (
                              <div
                                key={idx}
                                className="p-1.5 rounded bg-[#14141A] border border-[#C5A059]/10 text-[11px] flex items-center gap-1.5"
                              >
                                {use.type === 'product' && <Package className="w-3 h-3 text-[#C5A059] shrink-0" />}
                                {use.type === 'page' && <Layers className="w-3 h-3 text-sky-400 shrink-0" />}
                                {use.type === 'article' && <FileText className="w-3 h-3 text-emerald-400 shrink-0" />}
                                <span className="text-[#C8C4BC] truncate">{use.title}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-[#8C8880] italic">
                            این تصویر در هیچ محصول یا صفحه‌ای استفاده نشده است (حذف آن ایمن است).
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 space-y-2">
                    {mode !== 'browse' && (
                      <button
                        type="button"
                        onClick={() => toggleSelectUrl(previewMedia.url)}
                        className="w-full py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                      >
                        {selectedUrls.includes(previewMedia.url) ? 'لغو انتخاب این تصویر' : 'انتخاب این تصویر'}
                      </button>
                    )}

                    {canDeleteMedia && (
                      <button
                        type="button"
                        onClick={() => openDeleteDialog(previewMedia)}
                        className="w-full py-2 border border-rose-500/35 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 text-xs font-medium rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف فایل از کتابخانه</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: UPLOAD MULTIPLE */}
          {activeTab === 'upload' && (
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
              <div className="w-full p-8 border-2 border-dashed border-[#C5A059]/30 hover:border-[#C5A059] rounded-sm text-center bg-[#09090C] transition-colors relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                <Upload className="w-12 h-12 text-[#C5A059] mx-auto mb-3" />
                <h3 className="text-sm font-medium text-[#EDE8DF] mb-1 font-vazir">
                  تصاویر را به اینجا بکشید یا برای انتخاب کلیک کنید
                </h3>
                <p className="text-xs text-[#8C8880] mb-4">
                  پشتیبانی از فرمت‌های WebP, JPG, PNG با حداکثر کیفیت و انتخاب چندتایی
                </p>

                {uploading ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C1C24] text-[#C5A059] text-xs rounded-sm">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>در حال بهینه‌سازی و ذخیره تصاویر...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0B] text-xs font-semibold rounded-sm tracking-wide"
                  >
                    انتخاب فایل‌ها از سیستم
                  </button>
                )}
              </div>

              {/* Upload Meta options */}
              <div className="w-full mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#A8A49C] mb-1">پیشوند نام اثر (اختیاری):</label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="مثال: انگشتر زمرد سلطنتی"
                    className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] placeholder-[#64605A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A8A49C] mb-1">دسته‌بندی فایل:</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] focus:outline-none"
                  >
                    <option value="products">محصولات و جواهرات</option>
                    <option value="banners">بنرها و هدر</option>
                    <option value="articles">وبلاگ و مقالات</option>
                    <option value="boutique">عکس‌های بوتیک</option>
                    <option value="general">عمومی</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminModal>

      {/* Safe Media Permanent Deletion Confirmation Dialog */}
      <AdminModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteErrorMsg(null);
          }
        }}
        title={
          <span className="flex items-center gap-2 text-rose-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{isDeleteBlocked ? 'امکان حذف تصویر در حال استفاده وجود ندارد' : 'تأیید حذف دائمی فایل رسانه'}</span>
          </span>
        }
        zLevel="confirm"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => {
                setDeleteTarget(null);
                setDeleteErrorMsg(null);
              }}
              className="px-4 py-2 border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm hover:bg-[#161620] cursor-pointer"
            >
              {isDeleteBlocked ? 'بستن' : 'انصراف'}
            </button>
            {!isDeleteBlocked && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmPermanentDelete}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-medium rounded-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'در حال حذف...' : 'حذف دائمی تصویر'}</span>
              </button>
            )}
          </div>
        }
      >
        {deleteTarget && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-[#14141A] border border-[#C5A059]/20 rounded-sm">
              <div className="w-16 h-16 rounded-sm overflow-hidden border border-[#C5A059]/25 bg-black shrink-0">
                <img src={deleteTarget.url} alt={deleteTarget.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[#EDE8DF] font-mono font-medium truncate">{deleteTarget.name}</div>
                <div className="text-[#8C8880] mt-1 font-mono text-[11px]">
                  {deleteTarget.format?.toUpperCase() || 'IMG'} • {formatFileSize(deleteTarget.fileSize)}
                </div>
                <div className="text-[#736E67] font-mono text-[10px] truncate mt-0.5" dir="ltr">
                  {deleteTarget.url}
                </div>
              </div>
            </div>

            {isDeleteBlocked ? (
              <div className="p-3.5 bg-amber-950/35 border border-amber-500/40 rounded-sm space-y-2.5">
                <div className="flex items-start gap-2 text-amber-300 font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    این تصویر در {activeDeleteUsages.length} بخش فعال سایت استفاده شده است. برای جلوگیری از شکستن تصاویر صفحات و محصولات، حذف آن متوقف شد:
                  </span>
                </div>
                <ul className="space-y-1 max-h-40 overflow-y-auto ps-2">
                  {activeDeleteUsages.map((u, idx) => (
                    <li
                      key={idx}
                      className="text-[11px] text-[#EDE8DF] bg-[#0B0B0E] border border-[#C5A059]/15 px-2.5 py-1.5 rounded-sm truncate"
                    >
                      {u.title}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-[#C8C4BC] leading-relaxed">
                  راهکار ایمن: ابتدا در بخش‌های فهرست‌شده بالا تصویر دیگری جایگزین یا حذف نمایید، سپس برای حذف دائمی به این پنجره بازگردید.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-sm text-[#D6D0C6] leading-relaxed space-y-1.5">
                <p>
                  حذف این تصویر به‌صورت دائمی انجام شده و رکورد آن از پایگاه‌داده و فایل مربوطه از مخزن ذخیره‌سازی (Supabase Storage / پوشه آپلود) حذف می‌گردد.
                </p>
                <p className="text-[11px] text-amber-300">
                  در حال حاضر هیچ محصول، دسته‌بندی، صفحه یا تنظیماتی به این فایل ارجاع نمی‌دهد.
                </p>
              </div>
            )}

            {deleteErrorMsg && !isDeleteBlocked && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-sm text-rose-200 text-[11px]">
                {deleteErrorMsg}
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </>
  );
};
