import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { Product } from '../../types';
import {
  Crown,
  Sparkles,
  Save,
  Check,
  Eye,
  Plus,
  ExternalLink,
  Package,
} from 'lucide-react';

interface FineJewelryTabProps {
  onOpenAddProduct: () => void;
}

export const FineJewelryTab: React.FC<FineJewelryTabProps> = ({ onOpenAddProduct }) => {
  const { products, settings, pages, token, refreshData, showToast } = useApp();
  const [saving, setSaving] = useState(false);

  const finePageRecord = pages?.find((p) => p.id === 'fine-jewelry');

  // Fine Jewelry page settings draft
  const [pageDraft, setPageDraft] = useState({
    titleFa: finePageRecord?.h1Fa || settings?.fineJewelryPageSettings?.titleFa || 'جواهرات فاخر سعیدنیا',
    titleEn: finePageRecord?.h1En || settings?.fineJewelryPageSettings?.titleEn || 'Fine & High Jewellery',
    columnsDesktop: settings?.fineJewelryPageSettings?.columnsDesktop || 3,
  });

  // Track product fine jewelry flags
  const [productOrderMap, setProductOrderMap] = useState<{ [id: string]: number }>(() => {
    const map: { [id: string]: number } = {};
    products.forEach((p) => {
      map[p.id] = p.fineJewelryOrder || p.displayOrder || 1;
    });
    return map;
  });

  useEffect(() => {
    setPageDraft({
      titleFa: finePageRecord?.h1Fa || settings?.fineJewelryPageSettings?.titleFa || 'جواهرات فاخر سعیدنیا',
      titleEn: finePageRecord?.h1En || settings?.fineJewelryPageSettings?.titleEn || 'Fine & High Jewellery',
      columnsDesktop: settings?.fineJewelryPageSettings?.columnsDesktop || 3,
    });
  }, [finePageRecord?.h1Fa, finePageRecord?.h1En, settings?.fineJewelryPageSettings]);

  useEffect(() => {
    const nextMap: { [id: string]: number } = {};
    products.forEach((p) => {
      nextMap[p.id] = p.fineJewelryOrder || p.displayOrder || 1;
    });
    setProductOrderMap(nextMap);
  }, [products]);

  const toggleFineJewelry = async (prod: Product) => {
    if (!token) return;
    try {
      const nextVal = !prod.showInFineJewelry;
      const res = await fetch(`/api/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...prod,
          showInFineJewelry: nextVal,
        }),
      });

      if (!res.ok) throw new Error('خطا در به‌روزرسانی وضعیت محصول');
      showToast(nextVal ? `قطعه "${prod.titleFa}" به جواهرات فاخر اضافه شد` : `قطعه "${prod.titleFa}" از جواهرات فاخر خارج شد`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const updateProductOrder = async (prod: Product, order: number) => {
    if (!token) return;
    const clampedOrder = Math.max(1, Math.min(1000, Math.round(Number(order) || 1)));
    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...prod,
          fineJewelryOrder: clampedOrder,
        }),
      });
      if (!res.ok) {
        throw new Error('خطا در ذخیره ترتیب نمایش محصول');
      }
      showToast(`ترتیب نمایش "${prod.titleFa}" ذخیره شد`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(err?.message || 'خطا در به‌روزرسانی ترتیب نمایش', 'error');
    }
  };

  const handleSavePageSettings = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const settingsReq = fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fineJewelryPageSettings: pageDraft,
        }),
      });
      const pageReq = finePageRecord
        ? fetch(`/api/pages/${finePageRecord.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              h1Fa: pageDraft.titleFa,
              h1En: pageDraft.titleEn,
            }),
          })
        : Promise.resolve(new Response(null, { status: 200 }));

      const [res, pageRes] = await Promise.all([settingsReq, pageReq]);
      if (!res.ok || !pageRes.ok) throw new Error('خطا در ذخیره تنظیمات');
      showToast('تنظیمات صفحه جواهرات فاخر ذخیره شد', 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const fineProducts = products.filter((p) => p.visibility && !p.isTest && (p.showInFineJewelry || p.featured));

  return (
    <div className="space-y-8 animate-fade-in text-start pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#C5A059]/20 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <Crown className="w-4 h-4 text-[#C5A059]" />
            <span className="font-cinzel text-xs text-[#C5A059] tracking-wider uppercase font-medium">
              HAUTE JOAILLERIE CURATION
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-persian-heading text-[#EDE8DF]">
            مدیریت صفحه و گالری جواهرات فاخر
          </h2>
          <p className="text-xs text-[#8C8880] mt-1 font-persian-body">
            کنترل چیدمان ۳ ستونه دسکتاپ، انتخاب قطعات ویژه و تعیین ترتیب نمایش هر اثر.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/fine-jewelry"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#171720] hover:bg-[#20202C] text-[#EDE8DF] border border-[#C5A059]/30 text-xs font-persian-nav rounded-sm flex items-center gap-2 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>مشاهده صفحه فاخر</span>
          </a>

          <button
            type="button"
            onClick={handleSavePageSettings}
            disabled={saving}
            className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] disabled:bg-[#C5A059]/50 text-[#0A0A0B] text-xs font-semibold font-persian-nav rounded-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات صفحه'}</span>
          </button>
        </div>
      </div>

      {/* Page Configuration */}
      <div className="p-6 bg-[#0E0E14] border border-[#C5A059]/30 rounded-sm space-y-4">
        <h3 className="text-sm font-semibold text-[#EDE8DF] font-persian-heading pb-2 border-b border-[#C5A059]/15">
          تنظیمات عمومی صفحه جواهرات فاخر
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">عنوان صفحه (فارسی)</label>
            <input
              type="text"
              value={pageDraft.titleFa}
              onChange={(e) => setPageDraft({ ...pageDraft, titleFa: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">عنوان صفحه (انگلیسی)</label>
            <input
              type="text"
              value={pageDraft.titleEn}
              onChange={(e) => setPageDraft({ ...pageDraft, titleEn: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 focus:border-[#D4AF37] text-xs text-[#EDE8DF] rounded-sm focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A8A49C] mb-1.5 font-medium">تنظیمات ستون‌ها و گرید نمایش</label>
            <div className="px-3.5 py-2.5 bg-[#08080A] border border-[#C5A059]/20 text-[11px] text-[#A8A49C] rounded-sm leading-relaxed">
              تعداد ستون‌ها، فاصله کارت‌ها و صفحه‌بندی این صفحه از تب «چیدمان صفحات» قابل کنترل است.
            </div>
          </div>
        </div>
      </div>

      {/* Pieces Selection & Order */}
      <div className="p-6 bg-[#0E0E14] border border-[#C5A059]/30 rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#C5A059]/15 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#EDE8DF] font-persian-heading">
              انتخاب محصولات برای نمایش در صفحه جواهرات فاخر
            </h3>
            <p className="text-[11px] text-[#8C8880]">
              هر اثری که تیک آن فعال باشد با کارت عمودی و قاب تصویر مربعی در ردیف‌های سه‌تایی دسکتاپ نمایش داده می‌شود.
            </p>
          </div>

          <span className="text-xs text-[#C5A059] font-mono">
            {fineProducts.length} اثر منتخب
          </span>
        </div>

        <div className="divide-y divide-[#C5A059]/10">
          {products.filter((p) => !p.isTest).map((prod) => {
            const isSelected = Boolean(prod.showInFineJewelry || prod.featured);
            return (
              <div
                key={prod.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#12121A] px-2 rounded-sm transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-sm bg-[#171720] border border-[#C5A059]/20 overflow-hidden flex items-center justify-center shrink-0">
                    {prod.mainImage ? (
                      <img src={prod.mainImage} alt={prod.titleFa} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-[#8C8880]" />
                    )}
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-[#C5A059] block">{prod.productCode}</span>
                    <h4 className="text-xs font-semibold text-[#EDE8DF]">{prod.titleFa}</h4>
                    <span className="text-[10px] text-[#8C8880] block">
                      {prod.category} • {prod.specifications?.goldCarat || 'طلا ۱۸ عیار'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#8C8880]">ترتیب نمایش:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={productOrderMap[prod.id] || 1}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 1;
                        setProductOrderMap({ ...productOrderMap, [prod.id]: val });
                      }}
                      onBlur={(e) => {
                        const val = Number(e.target.value) || 1;
                        if (val !== (prod.fineJewelryOrder || prod.displayOrder || 1)) {
                          updateProductOrder(prod, val);
                        }
                      }}
                      className="w-14 px-2 py-1 bg-[#08080A] border border-[#C5A059]/20 text-xs text-[#EDE8DF] rounded-sm text-center"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFineJewelry(prod)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-persian-nav flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-[#C5A059] text-[#0A0A0B] font-semibold'
                        : 'bg-[#171720] hover:bg-[#20202A] text-[#8C8880] border border-[#C5A059]/20'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{isSelected ? 'نمایش در فاخر' : 'عدم نمایش'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
