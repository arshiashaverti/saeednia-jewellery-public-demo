import React, { useState, useEffect } from 'react';
import {
  Sliders,
  LayoutGrid,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { LayoutSettings, LayoutGridConfig } from '../../types';

export const LayoutTab: React.FC = () => {
  const { layoutSettings, refreshLayoutSettings, showToast, token } = useApp();

  const [activePageKey, setActivePageKey] = useState<'collectionPage' | 'fineJewelryPage'>('collectionPage');
  const [localSettings, setLocalSettings] = useState<LayoutSettings | null>(layoutSettings);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (layoutSettings) {
      setLocalSettings(layoutSettings);
    }
  }, [layoutSettings]);

  if (!localSettings) {
    return (
      <div className="py-16 text-center text-[#8C8880]">
        <Sparkles className="w-6 h-6 text-[#C5A059] animate-spin mx-auto mb-2" />
        <span className="text-xs">در حال بارگذاری تنظیمات چیدمان...</span>
      </div>
    );
  }

  const currentConfig: LayoutGridConfig = localSettings[activePageKey];

  const updateConfig = (updates: Partial<LayoutGridConfig>) => {
    setLocalSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [activePageKey]: {
          ...prev[activePageKey],
          ...updates,
        },
      };
    });
  };

  const calculatedRows = Math.ceil(currentConfig.itemsPerPage / currentConfig.columnsDesktop);

  const handleSave = async () => {
    if (!token || !localSettings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/layout-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(localSettings),
      });

      if (!res.ok) throw new Error('خطا در ذخیره تنظیمات چیدمان');

      showToast('تنظیمات چیدمان و تعداد ستون‌ها با موفقیت ذخیره شد', 'success');
      refreshLayoutSettings();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-light text-[#EDE8DF] font-vazir flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#C5A059]" />
            <span>مدیریت چیدمان و گرید محصولات در صفحات</span>
          </h2>
          <p className="text-xs text-[#8C8880] mt-1 leading-relaxed">
            تنظیم مستقل تعداد ستون‌ها، ردیف‌ها، اندازه کارت‌ها و صفحه بندی برای هر بخش از سایت با پیش‌نمایش زنده تعاملی
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] disabled:bg-[#C5A059]/50 text-[#0A0A0B] text-xs font-semibold rounded-sm flex items-center gap-2 shadow-md transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تنظیمات چیدمان'}</span>
        </button>
      </div>

      {/* Page Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'collectionPage', label: 'صفحه دسته‌بندی و کالکشن جواهرات' },
          { key: 'fineJewelryPage', label: 'صفحه جواهرات فاخر (Haute Joaillerie)' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActivePageKey(tab.key as any)}
            className={`px-4 py-2.5 text-xs rounded-sm whitespace-nowrap transition-all border ${
              activePageKey === tab.key
                ? 'bg-[#C5A059] text-[#0A0A0B] border-[#D4AF37] font-semibold'
                : 'bg-[#121216] text-[#A8A49C] hover:text-[#EDE8DF] border-[#C5A059]/15'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Configuration Options + Live Preview split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-5 space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/15">
            <span className="text-[#C5A059] font-medium text-sm flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              <span>تنظیمات ستون‌ها و ردیف‌ها</span>
            </span>
            <span className="text-[11px] text-[#A8A49C]">
              {calculatedRows} ردیف محاسباتی
            </span>
          </div>

          {/* Columns Setup */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[#EDE8DF] flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>تعداد ستون‌های دسکتاپ:</span>
                </span>
                <span className="font-mono text-[#C5A059] font-bold">{currentConfig.columnsDesktop} ستون</span>
              </div>
              <input
                type="range"
                min={2}
                max={5}
                step={1}
                value={currentConfig.columnsDesktop}
                onChange={(e) => updateConfig({ columnsDesktop: Number(e.target.value) })}
                className="w-full accent-[#C5A059] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8C8880] mt-1 font-mono">
                <span>۲ ستون</span>
                <span>۳ ستون</span>
                <span>۴ ستون</span>
                <span>۵ ستون</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[#EDE8DF] flex items-center gap-1.5">
                  <Tablet className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>تعداد ستون‌های تبلت:</span>
                </span>
                <span className="font-mono text-[#C5A059] font-bold">{currentConfig.columnsTablet} ستون</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={1}
                value={currentConfig.columnsTablet}
                onChange={(e) => updateConfig({ columnsTablet: Number(e.target.value) })}
                className="w-full accent-[#C5A059] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[#EDE8DF] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>تعداد ستون‌های موبایل:</span>
                </span>
                <span className="font-mono text-[#C5A059] font-bold">{currentConfig.columnsMobile} ستون</span>
              </div>
              <input
                type="range"
                min={1}
                max={2}
                step={1}
                value={currentConfig.columnsMobile}
                onChange={(e) => updateConfig({ columnsMobile: Number(e.target.value) })}
                className="w-full accent-[#C5A059] cursor-pointer"
              />
            </div>
          </div>

          {/* Items Per Page & Gap */}
          <div className="pt-3 border-t border-[#C5A059]/15 space-y-3">
            <div>
              <label className="block text-[#EDE8DF] mb-1">تعداد محصولات در هر صفحه:</label>
              <input
                type="number"
                min={2}
                max={48}
                value={currentConfig.itemsPerPage}
                onChange={(e) => updateConfig({ itemsPerPage: Number(e.target.value) || 12 })}
                className="w-full px-3 py-2 bg-[#121216] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] text-center font-mono focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#EDE8DF] mb-1">فاصله بین کارت‌ها:</label>
                <select
                  value={currentConfig.cardGap}
                  onChange={(e) => updateConfig({ cardGap: Number(e.target.value) })}
                  className="w-full px-2.5 py-2 bg-[#121216] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] focus:outline-none"
                >
                  <option value={16}>۱۶ پیکسل (فشرده)</option>
                  <option value={24}>۲۴ پیکسل (متعادل)</option>
                  <option value={32}>۳۲ پیکسل (باز و لوکس)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#EDE8DF] mb-1">نسبت تصویر کارت:</label>
                <select
                  value={currentConfig.imageAspectRatio}
                  onChange={(e) => updateConfig({ imageAspectRatio: e.target.value as any })}
                  className="w-full px-2.5 py-2 bg-[#121216] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] focus:outline-none"
                >
                  <option value="portrait">عمودی (۳:۴)</option>
                  <option value="square">مربعی (۱:۱)</option>
                  <option value="wide">افقی (۱۶:۹)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#EDE8DF] mb-1">نحوه صفحه‌بندی:</label>
              <select
                value={currentConfig.paginationMode}
                onChange={(e) => updateConfig({ paginationMode: e.target.value as any })}
                className="w-full px-2.5 py-2 bg-[#121216] border border-[#C5A059]/20 rounded-sm text-[#EDE8DF] focus:outline-none"
              >
                <option value="pagination">صفحه‌بندی عددی (۱، ۲، ۳...)</option>
                <option value="view_all">نمایش تمام آثار در یک صفحه</option>
                <option value="infinite">دکمه بارگذاری بیشتر</option>
              </select>
            </div>
          </div>

          {/* Visibility Toggles */}
          <div className="pt-3 border-t border-[#C5A059]/15 space-y-2">
            <span className="text-[#A8A49C] block text-[11px] mb-2 font-medium">المان‌های نمایشی کارت:</span>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentConfig.showProductName}
                onChange={(e) => updateConfig({ showProductName: e.target.checked })}
                className="rounded border-[#C5A059]/30 text-[#C5A059]"
              />
              <span className="text-[#EDE8DF]">نمایش نام اثر</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentConfig.showProductCode}
                onChange={(e) => updateConfig({ showProductCode: e.target.checked })}
                className="rounded border-[#C5A059]/30 text-[#C5A059]"
              />
              <span className="text-[#EDE8DF]">نمایش کد قطعه (مانند SN-R-101)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentConfig.showShortDescription}
                onChange={(e) => updateConfig({ showShortDescription: e.target.checked })}
                className="rounded border-[#C5A059]/30 text-[#C5A059]"
              />
              <span className="text-[#EDE8DF]">نمایش توضیحات کوتاه و مشخصات گوهر</span>
            </label>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#C5A059]/15">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#C5A059]" />
              <span className="text-xs font-semibold text-[#EDE8DF]">پیش‌نمایش زنده چیدمان</span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-[#14141A] p-1 rounded border border-[#C5A059]/20">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  previewDevice === 'desktop' ? 'bg-[#C5A059] text-black font-semibold' : 'text-[#8C8880] hover:text-white'
                }`}
                title="نمای دسکتاپ"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  previewDevice === 'tablet' ? 'bg-[#C5A059] text-black font-semibold' : 'text-[#8C8880] hover:text-white'
                }`}
                title="نمای تبلت"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  previewDevice === 'mobile' ? 'bg-[#C5A059] text-black font-semibold' : 'text-[#8C8880] hover:text-white'
                }`}
                title="نمای موبایل"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mock Preview Canvas */}
          <div className="flex-grow bg-[#060608] border border-[#C5A059]/15 rounded-sm p-4 overflow-y-auto max-h-[550px] scrollbar-thin flex justify-center">
            <div
              className={`transition-all duration-300 w-full ${
                previewDevice === 'desktop'
                  ? 'max-w-full'
                  : previewDevice === 'tablet'
                  ? 'max-w-md'
                  : 'max-w-xs'
              }`}
            >
              {/* Dynamic Mock Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${
                    previewDevice === 'desktop'
                      ? currentConfig.columnsDesktop
                      : previewDevice === 'tablet'
                      ? currentConfig.columnsTablet
                      : currentConfig.columnsMobile
                  }, minmax(0, 1fr))`,
                  gap: `${currentConfig.cardGap}px`,
                }}
              >
                {Array.from({ length: Math.min(currentConfig.itemsPerPage, 12) }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0E0E12] border border-[#C5A059]/25 rounded-sm overflow-hidden flex flex-col shadow-sm"
                  >
                    {/* Mock Image Box */}
                    <div
                      className={`w-full bg-[#1A1A22] relative flex items-center justify-center ${
                        currentConfig.imageAspectRatio === 'portrait'
                          ? 'aspect-[3/4]'
                          : currentConfig.imageAspectRatio === 'square'
                          ? 'aspect-square'
                          : 'aspect-video'
                      }`}
                    >
                      <Package className="w-6 h-6 text-[#C5A059]/40" />
                      <span className="absolute top-2 start-2 text-[9px] px-1 bg-black/70 text-[#C5A059] rounded">
                        اثر #{idx + 1}
                      </span>
                    </div>

                    {/* Mock Card Content */}
                    <div className="p-2.5 space-y-1 text-start">
                      {currentConfig.showProductCode && (
                        <span className="text-[10px] font-mono text-[#C5A059] block">
                          SN-R-10{idx + 1}
                        </span>
                      )}
                      {currentConfig.showProductName && (
                        <span className="text-[11px] font-medium text-[#EDE8DF] block truncate font-vazir">
                          انگشتر سولیتر برلیان اشرافی
                        </span>
                      )}
                      {currentConfig.showShortDescription && (
                        <p className="text-[10px] text-[#8C8880] truncate font-light">
                          طلای ۱۸ عیار با الماس طبیعی شناسنامه‌دار GIA
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock Pagination Bar */}
              {currentConfig.paginationMode === 'pagination' && (
                <div className="mt-6 pt-4 border-t border-[#C5A059]/15 flex items-center justify-center gap-1 text-[11px]">
                  <span className="px-2 py-1 rounded bg-[#C5A059] text-black font-semibold">۱</span>
                  <span className="px-2 py-1 rounded bg-[#14141A] text-[#A8A49C]">۲</span>
                  <span className="px-2 py-1 rounded bg-[#14141A] text-[#A8A49C]">۳</span>
                  <span className="px-2 py-1 text-[#8C8880]">...</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
