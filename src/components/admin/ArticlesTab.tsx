import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { safeParseJsonResponse } from '../../lib/api';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Image as ImageIcon,
  ExternalLink,
  AlertTriangle,
  Clock,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';
import type { Article, ArticleSidebarModule } from '../../types';
import { MediaLibraryModal } from './MediaLibraryModal';
import { ArticleSidebarBuilder } from './ArticleSidebarBuilder';
import { RelatedArticlesSelector } from './RelatedArticlesSelector';
import { AdminModal } from './AdminModal';
import { ArticleReaderView } from '../ArticleReaderView';
import { calculateReadingTimeMinutes, formatReadingTimeLabel } from '../../utils/contactAndArticles';

export const ArticlesTab: React.FC = () => {
  const { articles, products, categories, settings, token, refreshArticles, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    { type: 'cover' } | { type: 'sidebar'; moduleId: string } | null
  >(null);

  const [formData, setFormData] = useState<{
    titleFa: string;
    titleEn: string;
    slug: string;
    author: string;
    category: string;
    excerptFa: string;
    excerptEn: string;
    contentFa: string;
    contentEn: string;
    coverImage: string;
    imageCaption: string;
    seoTitleFa: string;
    seoTitleEn: string;
    metaDescriptionFa: string;
    metaDescriptionEn: string;
    published: boolean;
    sidebarModules: ArticleSidebarModule[];
    relatedArticleIds: string[];
  }>({
    titleFa: '',
    titleEn: '',
    slug: '',
    author: 'تحریریه جواهری سعیدنیا',
    category: '',
    excerptFa: '',
    excerptEn: '',
    contentFa: '',
    contentEn: '',
    coverImage: '',
    imageCaption: '',
    seoTitleFa: '',
    seoTitleEn: '',
    metaDescriptionFa: '',
    metaDescriptionEn: '',
    published: true,
    sidebarModules: [],
    relatedArticleIds: [],
  });

  const activeArticles = (articles || []).filter((a) => !a.isDeleted);

  const openAddModal = () => {
    setEditingArticle(null);
    setFormData({
      titleFa: '',
      titleEn: '',
      slug: '',
      author: 'تحریریه جواهری سعیدنیا',
      category: '',
      excerptFa: '',
      excerptEn: '',
      contentFa: '',
      contentEn: '',
      coverImage: '',
      imageCaption: '',
      seoTitleFa: '',
      seoTitleEn: '',
      metaDescriptionFa: '',
      metaDescriptionEn: '',
      published: true,
      sidebarModules: [],
      relatedArticleIds: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      titleFa: article.titleFa || '',
      titleEn: article.titleEn || '',
      slug: article.slug || '',
      author: article.author || 'تحریریه جواهری سعیدنیا',
      category: article.category || '',
      excerptFa: article.excerptFa || '',
      excerptEn: article.excerptEn || '',
      contentFa: article.contentFa || '',
      contentEn: article.contentEn || '',
      coverImage: article.coverImage || '',
      imageCaption: article.imageCaption || '',
      seoTitleFa: article.seoTitleFa || '',
      seoTitleEn: article.seoTitleEn || '',
      metaDescriptionFa: article.metaDescriptionFa || '',
      metaDescriptionEn: article.metaDescriptionEn || '',
      published: article.published !== false,
      sidebarModules: Array.isArray(article.sidebarModules) ? article.sidebarModules : [],
      relatedArticleIds: Array.isArray(article.relatedArticleIds) ? article.relatedArticleIds : [],
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.titleFa.trim() || !formData.excerptFa.trim() || !formData.contentFa.trim()) {
      showToast('عنوان، چکیده و متن فارسی مقاله الزامی هستند', 'error');
      return;
    }

    if (formData.relatedArticleIds.length === 1) {
      showToast('لطفاً ۲ یا ۳ مقاله منتشرشده برای «مطالب پیشنهادی برای مطالعه» انتخاب کنید یا آن را خالی بگذارید', 'error');
      return;
    }

    let finalSlug = formData.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!finalSlug) {
      finalSlug = formData.titleEn
        ? formData.titleEn
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '')
        : 'article-' + Date.now();
    }

    const duplicate = activeArticles.find(
      (a) => a.slug === finalSlug && (!editingArticle || a.id !== editingArticle.id)
    );
    if (duplicate) {
      showToast('این نامک (Slug) قبلاً برای مقاله دیگری استفاده شده است', 'error');
      return;
    }

    const readingMinutes = calculateReadingTimeMinutes(formData.contentFa);

    try {
      const payload = {
        ...formData,
        slug: finalSlug,
        readingTimeMinutes: readingMinutes,
        readingTime: formatReadingTimeLabel(readingMinutes, 'fa'),
      };

      if (editingArticle) {
        const res = await fetch(`/api/articles/${editingArticle.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const parsed = await safeParseJsonResponse(res);
        if (!parsed.ok) {
          throw new Error(parsed.errorMessage || 'خطا در ویرایش مقاله');
        }
        showToast('مقاله، ستون کناری و مطالب پیشنهادی با موفقیت ذخیره شد', 'success');
      } else {
        const res = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const parsed = await safeParseJsonResponse(res);
        if (!parsed.ok) {
          throw new Error(parsed.errorMessage || 'خطا در ثبت مقاله');
        }
        showToast('مقاله جدید با موفقیت ثبت شد', 'success');
      }

      setIsModalOpen(false);
      await refreshArticles();
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره مقاله', 'error');
    }
  };

  const handleDeleteToTrash = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('خطا در انتقال مقاله به سطل زباله');
      showToast('مقاله به سطل زباله منتقل شد', 'info');
      setDeleteConfirmId(null);
      refreshArticles();
    } catch {
      showToast('خطا در انتقال مقاله به سطل زباله', 'error');
    }
  };

  const handleTogglePublish = async (article: Article) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ published: !article.published }),
      });
      if (!res.ok) throw new Error('خطا در تغییر وضعیت انتشار');
      showToast(article.published ? 'مقاله به پیش‌نویس منتقل شد' : 'مقاله منتشر شد', 'success');
      refreshArticles();
    } catch {
      showToast('خطا در تغییر وضعیت انتشار', 'error');
    }
  };

  const liveReadingMinutes = calculateReadingTimeMinutes(formData.contentFa);
  const liveReadingLabel = formatReadingTimeLabel(liveReadingMinutes, 'fa');

  const livePreviewArticle: Article = {
    id: editingArticle?.id || 'draft-preview',
    titleFa: formData.titleFa.trim() || 'عنوان پیش‌نمایش مقاله',
    titleEn: formData.titleEn.trim() || undefined,
    slug: formData.slug.trim() || 'article-preview',
    author: formData.author.trim() || 'تحریریه جواهری سعیدنیا',
    category: formData.category.trim() || undefined,
    excerptFa: formData.excerptFa,
    excerptEn: formData.excerptEn || undefined,
    contentFa:
      formData.contentFa.trim() ||
      '## نمونه ساختار مقاله\n\nمتن پیش‌نمایش مقاله پس از تایپ در ویرایشگر، بلافاصله در این نما نمایش داده می‌شود.',
    contentEn: formData.contentEn || undefined,
    coverImage: formData.coverImage,
    imageCaption: formData.imageCaption || undefined,
    readingTime: liveReadingLabel,
    readingTimeMinutes: liveReadingMinutes,
    seoTitleFa: formData.seoTitleFa || undefined,
    seoTitleEn: formData.seoTitleEn || undefined,
    metaDescriptionFa: formData.metaDescriptionFa || undefined,
    metaDescriptionEn: formData.metaDescriptionEn || undefined,
    published: formData.published,
    publishedAt: editingArticle?.publishedAt || editingArticle?.createdAt || new Date().toISOString(),
    updatedAt: editingArticle?.updatedAt,
    createdAt: editingArticle?.createdAt || new Date().toISOString(),
    sidebarModules: formData.sidebarModules,
    relatedArticleIds: formData.relatedArticleIds,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C5A059]/20">
        <div>
          <h2 className="text-lg font-persian-heading text-[#EDE8DF] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C5A059]" />
            <span>مدیریت مقالات، ستون کناری و مطالب پیشنهادی ({activeArticles.length} مقاله)</span>
          </h2>
          <p className="text-xs text-[#8C8880] mt-1 font-persian-body">
            مدیریت مقالات گوهرشناسی، انتخاب ماژول‌های ستون کناری راست، مطالب پیشنهادی انتهای مقاله، سئو و ریدایرکت ۳۰۱
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#070709] text-xs font-persian-nav font-semibold rounded-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن مقاله جدید</span>
        </button>
      </div>

      {/* Articles Table */}
      {activeArticles.length > 0 ? (
        <div className="bg-[#09090C] border border-[#C5A059]/20 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-[#121218] border-b border-[#C5A059]/15 text-[#C5A059] font-persian-nav">
                <tr>
                  <th className="py-3 px-4 text-start">تصویر</th>
                  <th className="py-3 px-4 text-start">عنوان مقاله</th>
                  <th className="py-3 px-4 text-start">نامک (Slug)</th>
                  <th className="py-3 px-4 text-center">ستون / پیشنهادی</th>
                  <th className="py-3 px-4 text-center">وضعیت انتشار</th>
                  <th className="py-3 px-4 text-center">تاریخ</th>
                  <th className="py-3 px-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/10">
                {activeArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-[#12121A]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 bg-[#060608] border border-[#C5A059]/20 rounded-sm flex items-center justify-center overflow-hidden">
                        {art.coverImage ? (
                          <img src={art.coverImage} alt={art.titleFa} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-[#C5A059]/40" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-persian-heading text-[#EDE8DF] max-w-xs truncate">
                      {art.titleFa}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#8C8880] max-w-[160px] truncate" dir="ltr">
                      /blog/{art.slug}
                    </td>
                    <td className="py-3 px-4 text-center text-[11px] text-[#A8A49C] font-mono">
                      {(art.sidebarModules || []).filter((m) => m.isActive !== false).length} /{' '}
                      {(art.relatedArticleIds || []).length}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(art)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-persian-nav transition-all ${
                          art.published
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {art.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{art.published ? 'منتشر شده' : 'پیش‌نویس'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center text-[#8C8880] font-mono">
                      {new Date(art.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`/blog/${art.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#C5A059] hover:text-[#EDE8DF] hover:bg-[#161622] rounded-sm transition-colors"
                          title={art.published ? 'مشاهده مقاله' : 'پیش‌نمایش پیش‌نویس'}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditModal(art)}
                          className="p-1.5 text-[#C5A059] hover:text-[#EDE8DF] hover:bg-[#161622] rounded-sm transition-colors"
                          title="ویرایش"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(art.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-sm transition-colors"
                          title="انتقال به سطل زباله"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center bg-[#09090C] border border-[#C5A059]/15 rounded-sm p-8">
          <BookOpen className="w-10 h-10 text-[#C5A059] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-persian-heading text-[#EDE8DF] mb-2">هنوز مقاله‌ای ثبت نشده است</h3>
          <p className="text-xs text-[#8C8880] max-w-sm mx-auto mb-6 font-persian-body leading-relaxed">
            جهت غنای بخش وبلاگ سایت، می‌توانید اولین مقاله پیرامون گوهرشناسی یا تاریخچه زرگری را ثبت فرمایید.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#070709] text-xs font-persian-nav font-semibold rounded-sm"
          >
            افزودن اولین مقاله
          </button>
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      <AdminModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title={
          <span className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>انتقال مقاله به سطل زباله</span>
          </span>
        }
        zLevel="confirm"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm hover:bg-[#161620] cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={() => deleteConfirmId && handleDeleteToTrash(deleteConfirmId)}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-persian-nav rounded-sm cursor-pointer"
            >
              انتقال به سطل زباله
            </button>
          </div>
        }
      >
        <p className="text-xs text-[#A8A49C] font-persian-body leading-relaxed">
          این مقاله از صفحه عمومی وبلاگ پنهان شده و به بخش «سطل زباله» منتقل می‌شود تا در صورت نیاز قابل بازیابی یا حذف قطعی باشد.
        </p>
      </AdminModal>

      {/* Create / Edit Article Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span>{editingArticle ? 'ویرایش مقاله' : 'افزودن مقاله جدید'}</span>
          </span>
        }
        subtitle={`زمان مطالعه تخمینی: ${liveReadingLabel}`}
        maxWidth="max-w-4xl"
        zLevel="base"
        closeOnBackdropClick={false}
        headerActions={
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B1B24] hover:bg-[#C5A059] text-[#D4AF37] hover:text-[#070709] border border-[#C5A059]/35 rounded-sm text-xs font-persian-nav transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">پیش‌نمایش زنده</span>
          </button>
        }
      >
        <form onSubmit={handleSave} className="space-y-5 text-xs font-persian-body">
              {/* Persian Title */}
              <div>
                <label className="block text-[#C8C4BC] mb-1 font-persian-nav">عنوان مقاله (فارسی) *</label>
                <input
                  type="text"
                  required
                  value={formData.titleFa}
                  onChange={(e) => setFormData({ ...formData, titleFa: e.target.value })}
                  placeholder="مثال: هنر گوهرشناسی و شناسایی زمرد کلمبیا"
                  className="w-full px-3 py-2 bg-[#060608] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* English Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-persian-nav">عنوان انگلیسی (اختیاری)</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="E.g., The Art of Colombian Emeralds"
                    className="w-full px-3 py-2 bg-[#060608] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:border-[#D4AF37] focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-persian-nav">نامک یکتا (Slug) *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="colombian-emeralds"
                    className="w-full px-3 py-2 bg-[#060608] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:border-[#D4AF37] focus:outline-none font-mono"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-[#736E67] mt-0.5 block">
                    با تغییر، ریدایرکت ۳۰۱ از مسیر قبلی ثبت می‌شود: /blog/slug
                  </span>
                </div>
              </div>

              {/* Author & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-persian-nav">نویسنده / تحریریه (اختیاری)</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="تحریریه جواهری سعیدنیا"
                    className="w-full px-3 py-2 bg-[#060608] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-persian-nav">موضوع / دسته مقاله (اختیاری)</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="گوهرشناسی / راهنمای انتخاب"
                    className="w-full px-3 py-2 bg-[#060608] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Image URL + Caption + Media Library Picker */}
              <div className="p-3 bg-[#111116] border border-[#C5A059]/15 rounded-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[#C5A059] font-persian-nav">تصویر شاخص مقاله (Cover Image)</label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget({ type: 'cover' })}
                    className="px-3 py-1 bg-[#1C1C24] hover:bg-[#C5A059] text-[#EDE8DF] hover:text-black rounded text-[11px] transition-colors flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>انتخاب از کتابخانه تصاویر</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="/images/... یا آدرس آپلود شده"
                    className="w-full px-3 py-2 bg-[#060608] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:border-[#D4AF37] focus:outline-none font-mono"
                    dir="ltr"
                  />
                  {formData.coverImage && (
                    <div className="w-12 h-12 rounded-sm overflow-hidden border border-[#C5A059]/30 bg-black shrink-0">
                      <img src={formData.coverImage} alt="Article Cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[#8C8880] mb-1">زیرنویس تصویر شاخص (Image Caption - اختیاری)</label>
                  <input
                    type="text"
                    value={formData.imageCaption}
                    onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                    placeholder="توضیح کوتاه زیر تصویر شاخص مقاله..."
                    className="w-full px-3 py-1.5 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Excerpts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-persian-nav">چکیده مقاله (فارسی) *</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.excerptFa}
                    onChange={(e) => setFormData({ ...formData, excerptFa: e.target.value })}
                    placeholder="خلاصه‌ای کوتاه که در کارت مقاله نمایش داده می‌شود..."
                    className="w-full px-3 py-2 bg-[#060608] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#C8C4BC] mb-1 font-persian-nav">Excerpt (English)</label>
                  <textarea
                    rows={2}
                    dir="ltr"
                    value={formData.excerptEn}
                    onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                    placeholder="Short English summary..."
                    className="w-full px-3 py-2 bg-[#060608] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[#C8C4BC] font-persian-nav">متن کامل مقاله (فارسی) *</label>
                  <span className="text-[10px] text-[#8C8880]">
                    برای تیتر بخش‌ها از ## و برای زیرتیتر از ### در ابتدای خط استفاده کنید
                  </span>
                </div>
                <textarea
                  rows={7}
                  required
                  value={formData.contentFa}
                  onChange={(e) => setFormData({ ...formData, contentFa: e.target.value })}
                  placeholder="متن کامل و تفصیلی مقاله. پاراگراف‌ها را با فاصله Enter از هم جدا فرمایید..."
                  className="w-full px-3 py-2 bg-[#060608] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:border-[#D4AF37] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[#C8C4BC] mb-1 font-persian-nav">Full Content (English - Optional)</label>
                <textarea
                  rows={4}
                  dir="ltr"
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#060608] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm focus:border-[#D4AF37] focus:outline-none leading-relaxed"
                />
              </div>

              {/* PHASE 6: Dynamic Right Sidebar Builder */}
              <ArticleSidebarBuilder
                articleId={editingArticle?.id}
                modules={formData.sidebarModules}
                onChange={(nextModules) => setFormData((prev) => ({ ...prev, sidebarModules: nextModules }))}
                products={products}
                categories={categories}
                articles={articles}
                settings={settings}
                onOpenMediaPicker={(moduleId) => setMediaPickerTarget({ type: 'sidebar', moduleId })}
              />

              {/* PHASE 7: Related Articles Selector */}
              <RelatedArticlesSelector
                currentArticleId={editingArticle?.id}
                selectedIds={formData.relatedArticleIds}
                onChange={(nextIds) => setFormData((prev) => ({ ...prev, relatedArticleIds: nextIds }))}
                articles={articles}
              />

              {/* SEO Metadata */}
              <div className="p-3 bg-[#111116] border border-[#C5A059]/15 rounded-sm space-y-2.5">
                <span className="text-[#C5A059] font-persian-nav block">تنظیمات سئو مقاله (اختیاری)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8C8880] mb-0.5">عنوان سئو (فارسی)</label>
                    <input
                      type="text"
                      value={formData.seoTitleFa}
                      onChange={(e) => setFormData({ ...formData, seoTitleFa: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8C8880] mb-0.5">SEO Title (English)</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formData.seoTitleEn}
                      onChange={(e) => setFormData({ ...formData, seoTitleEn: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[#8C8880] mb-0.5">متادیسکریپشن سئو (فارسی)</label>
                    <textarea
                      rows={2}
                      value={formData.metaDescriptionFa}
                      onChange={(e) => setFormData({ ...formData, metaDescriptionFa: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="publishedToggle"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 accent-[#C5A059]"
                />
                <label htmlFor="publishedToggle" className="text-[#EDE8DF] font-persian-nav cursor-pointer">
                  انتشار عمومی در وبلاگ (در صورت عدم انتخاب، به عنوان پیش‌نویس ذخیره می‌شود)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#C5A059]/15">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#C5A059]/35 text-[#D4AF37] hover:bg-[#171722] rounded-sm text-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>پیش‌نمایش زنده صفحه مقاله</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-[#C5A059]/25 text-xs text-[#EDE8DF] rounded-sm hover:bg-[#161620] cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#070709] text-xs font-persian-nav font-semibold rounded-sm cursor-pointer"
                  >
                    {editingArticle ? 'ذخیره تغییرات' : 'ثبت و انتشار مقاله'}
                  </button>
                </div>
              </div>
            </form>
      </AdminModal>

      {/* Reactive Live Article Layout Preview Modal (Zero auto-save / zero auto-publish) */}
      <AdminModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="پیش‌نمایش زنده چیدمان مقاله"
        subtitle="برگرفته از رندر واقعی صفحه عمومی — بدون ذخیره یا انتشار خودکار در Supabase"
        maxWidth="max-w-7xl"
        zLevel="nested"
        bodyClassName="p-3 sm:p-5 bg-[#050507]"
        headerActions={
          <div className="flex items-center gap-1 bg-[#08080C] border border-[#C5A059]/20 rounded-sm p-1">
            <button
              type="button"
              onClick={() => setPreviewViewport('desktop')}
              title="نمای دسکتاپ (۱۲۸۰px)"
              aria-label="نمای دسکتاپ"
              className={`px-2.5 py-1 rounded-sm text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                previewViewport === 'desktop'
                  ? 'bg-[#C5A059] text-[#070709] font-semibold'
                  : 'text-[#A8A49C] hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">دسکتاپ</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewport('tablet')}
              title="نمای تبلت (۷۶۸px)"
              aria-label="نمای تبلت"
              className={`px-2.5 py-1 rounded-sm text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                previewViewport === 'tablet'
                  ? 'bg-[#C5A059] text-[#070709] font-semibold'
                  : 'text-[#A8A49C] hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">تبلت</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewport('mobile')}
              title="نمای موبایل (۳۷۵px)"
              aria-label="نمای موبایل"
              className={`px-2.5 py-1 rounded-sm text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                previewViewport === 'mobile'
                  ? 'bg-[#C5A059] text-[#070709] font-semibold'
                  : 'text-[#A8A49C] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">موبایل</span>
            </button>
          </div>
        }
      >
        <div className="mb-4 px-3.5 py-2.5 bg-amber-950/40 border border-amber-500/40 text-amber-200 rounded-sm text-xs flex flex-wrap items-center justify-between gap-2">
          <span>
            حالت پیش‌نمایش زنده — این خروجی دقیقاً از مقادیر فعلی فرم و ستون کناری ساخته شده و هنوز در پایگاه‌داده ذخیره یا منتشر نشده است.
          </span>
          <span className="font-mono text-[11px] text-amber-300" dir="ltr">
            {previewViewport === 'desktop' ? '1280px' : previewViewport === 'tablet' ? '768px' : '375px'}
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div
            className={`bg-[#070709] text-[#EDE8DF] border border-[#C5A059]/30 rounded-sm mx-auto transition-all duration-300 ${
              previewViewport === 'mobile'
                ? 'w-[375px]'
                : previewViewport === 'tablet'
                ? 'w-[768px]'
                : 'w-full min-w-[960px]'
            }`}
          >
            <ArticleReaderView
              article={livePreviewArticle}
              lang="fa"
              isLight={false}
              products={products}
              categories={categories}
              articles={articles}
              settings={settings}
              previewMode={true}
              viewportMode={previewViewport}
              onCopyLink={() => showToast('در حالت پیش‌نمایش، آدرس نمونه کپی شد', 'info')}
            />
          </div>
        </div>
      </AdminModal>

      {/* Media Picker Modal (Top-Level Layering for both Cover & Sidebar Modules) */}
      <MediaLibraryModal
        key={
          mediaPickerTarget
            ? `${mediaPickerTarget.type}-${mediaPickerTarget.type === 'sidebar' ? mediaPickerTarget.moduleId : 'cover'}`
            : 'closed'
        }
        isOpen={Boolean(mediaPickerTarget)}
        onClose={() => setMediaPickerTarget(null)}
        mode="select-single"
        onSelect={(url) => {
          if (typeof url !== 'string' || !mediaPickerTarget) return;
          if (mediaPickerTarget.type === 'cover') {
            setFormData((prev) => ({ ...prev, coverImage: url }));
          } else if (mediaPickerTarget.type === 'sidebar') {
            const targetId = mediaPickerTarget.moduleId;
            setFormData((prev) => ({
              ...prev,
              sidebarModules: prev.sidebarModules.map((m) =>
                m.id === targetId ? { ...m, imageUrl: url } : m
              ),
            }));
          }
          setMediaPickerTarget(null);
        }}
      />
    </div>
  );
};
