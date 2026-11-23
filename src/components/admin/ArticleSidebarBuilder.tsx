import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  LayoutList,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import type {
  Article,
  ArticleSidebarDisplayStyle,
  ArticleSidebarModule,
  ArticleSidebarModuleType,
  CategoryInfo,
  Product,
  SiteSettings,
} from '../../types';
import { ArticleSidebar } from '../ArticleSidebar';

const MODULE_TYPE_META: Array<{
  type: ArticleSidebarModuleType;
  labelFa: string;
  defaultTitle: string;
  needsEntity?: 'product' | 'category' | 'article';
}> = [
  { type: 'featured_product', labelFa: 'معرفی محصول منتخب', defaultTitle: 'اثر منتخب مرتبط', needsEntity: 'product' },
  { type: 'featured_category', labelFa: 'دسته‌بندی منتخب', defaultTitle: 'مجموعه پیشنهادی', needsEntity: 'category' },
  { type: 'selected_article', labelFa: 'مقاله برگزیده', defaultTitle: 'یادداشت برگزیده', needsEntity: 'article' },
  { type: 'promo_banner', labelFa: 'بنر معرفی / اطلاع‌رسانی', defaultTitle: 'گالری جواهری سعیدنیا' },
  { type: 'social_links', labelFa: 'شبکه‌های اجتماعی رسمی', defaultTitle: 'شبکه‌های اجتماعی ما' },
  { type: 'custom_internal_link', labelFa: 'پیوند سفارشی', defaultTitle: 'مسیر پیشنهادی' },
  { type: 'image_caption', labelFa: 'تصویر همراه با زیرنویس', defaultTitle: 'نگاه نزدیک به جزئیات' },
  { type: 'contact_info', labelFa: 'اطلاعات تماس گالری', defaultTitle: 'ارتباط مستقیم با گالری' },
];

interface ArticleSidebarBuilderProps {
  articleId?: string;
  modules: ArticleSidebarModule[];
  onChange: (nextModules: ArticleSidebarModule[]) => void;
  products: Product[];
  categories: CategoryInfo[];
  articles: Article[];
  settings: SiteSettings | null;
  onOpenMediaPicker: (moduleId: string) => void;
}

export const ArticleSidebarBuilder: React.FC<ArticleSidebarBuilderProps> = ({
  articleId,
  modules,
  onChange,
  products,
  categories,
  articles,
  settings,
  onOpenMediaPicker,
}) => {
  const [selectedNewType, setSelectedNewType] = useState<ArticleSidebarModuleType>('featured_product');
  const [entitySearchByModule, setEntitySearchByModule] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  const handleAddModule = () => {
    const meta = MODULE_TYPE_META.find((m) => m.type === selectedNewType) || MODULE_TYPE_META[0];
    const nextModule: ArticleSidebarModule = {
      id: `smod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      articleId,
      moduleType: selectedNewType,
      title: meta.defaultTitle,
      description: '',
      imageUrl: '',
      caption: '',
      referencedEntityType: meta.needsEntity || '',
      referencedEntityId: '',
      destinationUrl: '',
      displayOrder: modules.length + 1,
      isActive: true,
      displayStyle: 'card',
      openInNewTab: false,
    };
    onChange([...modules, nextModule]);
  };

  const updateModule = (id: string, patch: Partial<ArticleSidebarModule>) => {
    onChange(modules.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const removeModule = (id: string) => {
    onChange(modules.filter((m) => m.id !== id).map((m, i) => ({ ...m, displayOrder: i + 1 })));
  };

  const moveModule = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= modules.length) return;
    const copy = [...modules];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    onChange(copy.map((m, i) => ({ ...m, displayOrder: i + 1 })));
  };

  const activeProducts = (products || []).filter((p) => !p.isDeleted);
  const activeCategories = (categories || []).filter((c) => !c.isDeleted);
  const selectableArticles = (articles || []).filter((a) => !a.isDeleted && a.id !== articleId);

  return (
    <div className="p-4 bg-[#111116] border border-[#C5A059]/20 rounded-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#C5A059]/15 pb-3">
        <div>
          <h4 className="text-xs font-persian-nav font-semibold text-[#D4AF37] flex items-center gap-2">
            <LayoutList className="w-4 h-4" />
            <span>محتوای ستون کناری مقاله ({modules.length} ماژول)</span>
          </h4>
          <p className="text-[11px] text-[#8C8880] mt-0.5">
            ماژول‌های فعال به صورت عمودی در ستون سمت راست صفحه مقاله (در دسکتاپ) نمایش داده می‌شوند. اگر ماژول فعالی وجود نداشته باشد، مقاله در نمای تمام‌عرض خوانده می‌شود.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="px-3 py-1.5 border border-[#C5A059]/30 bg-[#181820] hover:bg-[#C5A059]/15 text-[#D4AF37] rounded-sm text-[11px] flex items-center gap-1.5 self-start sm:self-auto"
        >
          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showPreview ? 'بستن پیش‌نمایش' : 'پیش‌نمایش زنده ستون کناری'}</span>
        </button>
      </div>

      {/* Add New Module Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={selectedNewType}
          onChange={(e) => setSelectedNewType(e.target.value as ArticleSidebarModuleType)}
          className="flex-1 px-3 py-2 bg-[#060608] border border-[#C5A059]/25 text-[#EDE8DF] rounded-sm text-xs"
        >
          {MODULE_TYPE_META.map((opt) => (
            <option key={opt.type} value={opt.type}>
              {opt.labelFa}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAddModule}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#070709] font-semibold rounded-sm text-xs flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>افزودن ماژول</span>
        </button>
      </div>

      {/* Configured Modules List */}
      {modules.length > 0 ? (
        <div className="space-y-3">
          {modules.map((mod, idx) => {
            const typeMeta = MODULE_TYPE_META.find((m) => m.type === mod.moduleType);
            const searchQ = (entitySearchByModule[mod.id] || '').trim().toLowerCase();

            return (
              <div
                key={mod.id}
                className={`p-3.5 rounded-sm border space-y-3 ${
                  mod.isActive !== false
                    ? 'bg-[#08080C] border-[#C5A059]/25'
                    : 'bg-[#08080C]/50 border-zinc-800 opacity-75'
                }`}
              >
                {/* Module Header Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C5A059]/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 font-mono">#{idx + 1}</span>
                    <span className="px-2 py-0.5 text-[10px] rounded-sm bg-[#16161E] text-[#D4AF37] border border-[#C5A059]/20">
                      {typeMeta?.labelFa || mod.moduleType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateModule(mod.id, { isActive: mod.isActive === false })}
                      className={`px-2 py-1 rounded-sm text-[10px] border flex items-center gap-1 ${
                        mod.isActive !== false
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {mod.isActive !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{mod.isActive !== false ? 'فعال' : 'غیرفعال'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveModule(idx, -1)}
                      className="p-1 text-stone-400 hover:text-[#C5A059] disabled:opacity-30"
                      title="بالا"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === modules.length - 1}
                      onClick={() => moveModule(idx, 1)}
                      className="p-1 text-stone-400 hover:text-[#C5A059] disabled:opacity-30"
                      title="پایین"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeModule(mod.id)}
                      className="p-1 text-stone-400 hover:text-rose-400"
                      title="حذف ماژول"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Module Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8C8880] mb-1">عنوان ماژول *</label>
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => updateModule(mod.id, { title: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8C8880] mb-1">سبک نمایش</label>
                    <select
                      value={mod.displayStyle || 'card'}
                      onChange={(e) =>
                        updateModule(mod.id, { displayStyle: e.target.value as ArticleSidebarDisplayStyle })
                      }
                      className="w-full px-2.5 py-1.5 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    >
                      <option value="card">کارت استاندارد</option>
                      <option value="highlight">کارت برجسته طلایی</option>
                      <option value="compact">کارت فشرده</option>
                    </select>
                  </div>

                  {/* Entity Selector for Product / Category / Article */}
                  {typeMeta?.needsEntity === 'product' && (
                    <div className="sm:col-span-2 space-y-2 p-2.5 bg-[#101016] border border-[#C5A059]/15 rounded-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-[#C5A059] text-[11px]">انتخاب محصول از پایگاه‌داده *</label>
                        <div className="relative">
                          <Search className="w-3 h-3 text-[#8C8880] absolute start-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={entitySearchByModule[mod.id] || ''}
                            onChange={(e) =>
                              setEntitySearchByModule((prev) => ({ ...prev, [mod.id]: e.target.value }))
                            }
                            placeholder="جستجو نام یا کد محصول..."
                            className="ps-7 pe-2 py-1 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm text-[11px]"
                          />
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                        {activeProducts
                          .filter(
                            (p) =>
                              !searchQ ||
                              p.titleFa.toLowerCase().includes(searchQ) ||
                              (p.productCode || '').toLowerCase().includes(searchQ)
                          )
                          .slice(0, 25)
                          .map((p) => {
                            const selected = mod.referencedEntityId === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() =>
                                  updateModule(mod.id, {
                                    referencedEntityType: 'product',
                                    referencedEntityId: p.id,
                                    imageUrl: mod.imageUrl || p.mainImage || '',
                                  })
                                }
                                className={`w-full p-2 rounded-sm border text-start flex items-center justify-between gap-2 transition-colors ${
                                  selected
                                    ? 'bg-[#C5A059]/15 border-[#C5A059]'
                                    : 'bg-[#060608] border-[#C5A059]/10 hover:border-[#C5A059]/40'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {p.mainImage && (
                                    <img
                                      src={p.mainImage}
                                      alt={p.titleFa}
                                      className="w-8 h-8 rounded-sm object-cover shrink-0 border border-[#C5A059]/20"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <div className="text-[11px] text-[#EDE8DF] truncate">{p.titleFa}</div>
                                    <div className="text-[10px] font-mono text-[#8C8880]" dir="ltr">
                                      {p.productCode}
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-sm shrink-0 ${
                                    p.visibility !== false && p.status !== 'draft'
                                      ? 'bg-emerald-950/60 text-emerald-300'
                                      : 'bg-zinc-900 text-zinc-400'
                                  }`}
                                >
                                  {p.visibility !== false && p.status !== 'draft' ? 'منتشر شده' : 'مخفی'}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {typeMeta?.needsEntity === 'category' && (
                    <div className="sm:col-span-2 space-y-2 p-2.5 bg-[#101016] border border-[#C5A059]/15 rounded-sm">
                      <label className="text-[#C5A059] text-[11px] block">انتخاب دسته‌بندی از پایگاه‌داده *</label>
                      <select
                        value={mod.referencedEntityId || ''}
                        onChange={(e) => {
                          const cat = activeCategories.find((c) => c.id === e.target.value);
                          updateModule(mod.id, {
                            referencedEntityType: 'category',
                            referencedEntityId: e.target.value,
                            imageUrl: mod.imageUrl || cat?.image || '',
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm text-xs"
                      >
                        <option value="">— انتخاب دسته‌بندی —</option>
                        {activeCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameFa} ({c.enabled === false ? 'غیرفعال' : 'فعال'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {typeMeta?.needsEntity === 'article' && (
                    <div className="sm:col-span-2 space-y-2 p-2.5 bg-[#101016] border border-[#C5A059]/15 rounded-sm">
                      <label className="text-[#C5A059] text-[11px] block">انتخاب مقاله برگزیده *</label>
                      <select
                        value={mod.referencedEntityId || ''}
                        onChange={(e) => {
                          const art = selectableArticles.find((a) => a.id === e.target.value);
                          updateModule(mod.id, {
                            referencedEntityType: 'article',
                            referencedEntityId: e.target.value,
                            imageUrl: mod.imageUrl || art?.coverImage || '',
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm text-xs"
                      >
                        <option value="">— انتخاب مقاله —</option>
                        {selectableArticles.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.titleFa} ({a.published ? 'منتشر شده' : 'پیش‌نویس'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Image Picker from Media Library */}
                  {['featured_product', 'featured_category', 'selected_article', 'promo_banner', 'custom_internal_link', 'image_caption'].includes(
                    mod.moduleType
                  ) && (
                    <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-2">
                      <input
                        type="text"
                        value={mod.imageUrl || ''}
                        onChange={(e) => updateModule(mod.id, { imageUrl: e.target.value })}
                        placeholder="آدرس تصویر ماژول (اختیاری — از کتابخانه رسانه انتخاب کنید)"
                        dir="ltr"
                        className="flex-1 px-2.5 py-1.5 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => onOpenMediaPicker(mod.id)}
                        className="px-3 py-1.5 bg-[#1C1C24] hover:bg-[#C5A059] text-[#EDE8DF] hover:text-black rounded-sm text-[11px] flex items-center gap-1.5 shrink-0"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>انتخاب از کتابخانه رسانه</span>
                      </button>
                    </div>
                  )}

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-[#8C8880] mb-1">توضیح کوتاه (اختیاری)</label>
                    <textarea
                      rows={2}
                      value={mod.description || ''}
                      onChange={(e) => updateModule(mod.id, { description: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                    />
                  </div>

                  {mod.moduleType === 'image_caption' && (
                    <div className="sm:col-span-2">
                      <label className="block text-[#8C8880] mb-1">زیرنویس تصویر (Caption)</label>
                      <input
                        type="text"
                        value={mod.caption || ''}
                        onChange={(e) => updateModule(mod.id, { caption: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm"
                      />
                    </div>
                  )}

                  {/* Destination URL & Open in new tab */}
                  {['promo_banner', 'custom_internal_link', 'image_caption', 'featured_product', 'featured_category', 'selected_article'].includes(
                    mod.moduleType
                  ) && (
                    <>
                      <div>
                        <label className="block text-[#8C8880] mb-1">لینک مقصد اختیاری (مسیر داخلی /... یا https://)</label>
                        <input
                          type="text"
                          dir="ltr"
                          value={mod.destinationUrl || ''}
                          onChange={(e) => updateModule(mod.id, { destinationUrl: e.target.value })}
                          placeholder="/categories یا https://..."
                          className="w-full px-2.5 py-1.5 bg-[#060608] border border-[#C5A059]/20 text-[#EDE8DF] rounded-sm font-mono text-[11px]"
                        />
                      </div>
                      <div className="flex items-end pb-1.5">
                        <label className="inline-flex items-center gap-2 text-[#C8C4BC] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(mod.openInNewTab)}
                            onChange={(e) => updateModule(mod.id, { openInNewTab: e.target.checked })}
                            className="accent-[#C5A059]"
                          />
                          <span>باز کردن لینک خارجی در تب جدید</span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-5 text-center bg-[#08080C] border border-dashed border-[#C5A059]/20 rounded-sm text-[#8C8880]">
          هنوز ماژولی برای ستون کناری این مقاله تعریف نشده است. مقاله در حالت تمام‌عرض متمرکز نمایش داده می‌شود.
        </div>
      )}

      {/* Live Preview Panel */}
      {showPreview && modules.some((m) => m.isActive !== false) && (
        <div className="p-4 bg-[#070709] border border-[#C5A059]/30 rounded-sm space-y-2">
          <span className="text-[11px] text-[#C5A059] block font-persian-nav">
            پیش‌نمایش ستون کناری مقاله (عرض دسکتاپ واقعی ۲۷۲px):
          </span>
          <div className="w-full max-w-[272px]">
            <ArticleSidebar
              modules={modules}
              lang="fa"
              products={products}
              categories={categories}
              articles={articles}
              settings={settings}
              previewMode
            />
          </div>
        </div>
      )}
    </div>
  );
};
