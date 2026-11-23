import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Server,
  Cloud,
  FileCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { safeParseJsonResponse } from '../../lib/api';
import { AdminModal } from './AdminModal';

export const BackupTab: React.FC = () => {
  const { token, showToast, refreshData, persistenceInfo } = useApp();
  const isSupabaseMode = persistenceInfo?.mode === 'supabase';

  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = async () => {
    if (!token) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/admin/backup', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const parsedErr = await safeParseJsonResponse(res);
        throw new Error(parsedErr.errorMessage || 'خطا در دریافت فایل پشتیبان');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saeednia-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('نسخه پشتیبان کامل با موفقیت دانلود شد', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRestoreFile(file);
      setShowRestoreModal(true);
    }
  };

  const handleExecuteRestore = async () => {
    if (!token || !restoreFile) return;
    if (restoreConfirmText !== 'RESTORE') {
      showToast('لطفاً عبارت RESTORE را برای تأیید وارد فرمایید', 'error');
      return;
    }

    setRestoring(true);
    try {
      const text = await restoreFile.text();
      const parsed = JSON.parse(text);

      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsed),
      });

      if (!res.ok) {
        const parsedErr = await safeParseJsonResponse(res);
        throw new Error(parsedErr.errorMessage || 'خطا در بازیابی نسخه پشتیبان');
      }

      showToast('پایگاه‌داده با موفقیت از فایل پشتیبان بازگردانی شد', 'success');
      setShowRestoreModal(false);
      setRestoreFile(null);
      setRestoreConfirmText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'فایل نامعتبر است', 'error');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-light text-[#EDE8DF] font-vazir flex items-center gap-2">
            <Database className="w-5 h-5 text-[#C5A059]" />
            <span>پشتیبان‌گیری، بازیابی و پایداری پایگاه‌داده</span>
          </h2>
          <p className="text-xs text-[#8C8880] mt-1 leading-relaxed">
            تهیه نسخه پشتیبان کامل از تمامی محصولات، صفحات، دسته‌بندی‌ها، مقالات، تصاویر و تنظیمات سامانه
          </p>
        </div>
      </div>

      {/* Main Grid: Backup & Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Download Backup */}
        <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-sm bg-[#15151C] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
              <Download className="w-6 h-6" />
            </div>

            <h3 className="text-base font-medium text-[#EDE8DF] font-vazir">
              دانلود نسخه پشتیبان کامل (JSON)
            </h3>

            <p className="text-xs text-[#8C8880] leading-relaxed">
              با کلیک بر روی این دکمه، تمام داده‌های فعلی سایت شامل محصولات، مشخصات زرگری، دسته‌بندی‌ها، وبلاگ، صفحات و تنظیمات در قالب یک فایل JSON معتبر و رمزنگاری‌شده در کامپیوتر شما ذخیره می‌شود.
            </p>

            <ul className="text-xs text-[#A8A49C] space-y-1.5 pt-2 list-disc list-inside">
              <li>شامل تمام ۵+ قطعه جواهرات و تصاویر آنها</li>
              <li>شامل عناوین H1 و سئوی صفحات ۶ گانه</li>
              <li>شامل آدرس‌ها و ریدایرکت‌های ۳۰۱</li>
              <li>فرمت استاندارد و قابل انتقال به هر سرور دیگر</li>
            </ul>
          </div>

          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadBackup}
            className="w-full py-3 bg-[#C5A059] hover:bg-[#D4AF37] disabled:bg-[#C5A059]/50 text-[#0A0A0B] text-xs font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            {downloading ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{downloading ? 'در حال تهیه خروجی...' : 'دانلود فایل پشتیبان (Backup.json)'}</span>
          </button>
        </div>

        {/* Card 2: Restore from Backup */}
        <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-sm bg-[#15151C] border border-[#C5A059]/30 flex items-center justify-center text-amber-400">
              <Upload className="w-6 h-6" />
            </div>

            <h3 className="text-base font-medium text-[#EDE8DF] font-vazir">
              بازیابی پایگاه‌داده از فایل پشتیبان
            </h3>

            <p className="text-xs text-[#8C8880] leading-relaxed">
              اگر قبلاً فایلی را به عنوان نسخه پشتیبان دانلود کرده‌اید، می‌توانید آن را انتخاب و در سامانه بارگذاری نمایید. سیستم به‌طور خودکار قبل از بازیابی، یک نسخه ایمنی موقت از وضعیت فعلی ذخیره می‌نماید.
            </p>

            <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded text-[11px] text-amber-300 leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 inline me-1.5" />
              <span>عملیات بازیابی داده‌های فعلی را با داده‌های موجود در فایل پشتیبان جایگزین خواهد کرد.</span>
            </div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-[#171720] hover:bg-[#20202C] text-[#EDE8DF] border border-[#C5A059]/30 text-xs font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Upload className="w-4 h-4 text-[#C5A059]" />
              <span>انتخاب فایل پشتیبان جهت بازیابی</span>
            </button>
          </div>
        </div>

      </div>

      {/* Cloud Persistence & Supabase Architecture Status */}
      <div className="bg-[#0D0D10] border border-[#C5A059]/20 rounded-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-[#C5A059]/15">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-[#C5A059]" />
            <h3 className="text-sm font-semibold text-[#EDE8DF] font-vazir">
              وضعیت اتصال به Supabase PostgreSQL و Storage
            </h3>
          </div>
          <span
            className={`px-2.5 py-1 text-[11px] font-mono rounded-sm border ${
              isSupabaseMode
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/40'
                : 'bg-amber-950/40 text-amber-300 border-amber-700/40'
            }`}
          >
            {isSupabaseMode ? 'SUPABASE ACTIVE' : 'WAITING FOR SECRETS (LOCAL JSON)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#121216] border border-[#C5A059]/15 rounded-sm space-y-2">
            <span className="text-[#C5A059] font-medium block">
              ۱. وضعیت پایگاه‌داده ({isSupabaseMode ? 'متصل به کلاد' : 'حالت محلی موقت'}):
            </span>
            <p className="text-[#A8A49C] leading-relaxed">
              {isSupabaseMode
                ? 'تمامی محصولات، دسته‌بندی‌ها، مقالات، صفحات، تنظیمات و تاریخچه رویدادها مستقیماً در PostgreSQL سوپابیس ذخیره و بازیابی می‌شوند.'
                : 'متغیرهای اتصال سرور سوپابیس (آدرس پروژه و کلید سرویس) هنوز در Secrets تنظیم نشده‌اند؛ لذا سیستم به‌طور موقت از data/store.json استفاده می‌کند.'}
            </p>
          </div>

          <div className="p-4 bg-[#121216] border border-[#C5A059]/15 rounded-sm space-y-2">
            <span className="text-[#C5A059] font-medium block">
              ۲. مخزن فایل‌ها (Bucket: {persistenceInfo?.storageBucket || 'saeednia-media'}):
            </span>
            <p className="text-[#A8A49C] leading-relaxed">
              اسکریپت Migration نسخه کامل در مسیر <code className="text-[#C5A059]">supabase/migrations/</code> و ابزار انتقال داده در <code className="text-[#C5A059]">scripts/migrate-to-supabase.ts</code> آماده اجرا هستند.
            </p>
          </div>
        </div>
      </div>

      {/* RESTORE CONFIRMATION MODAL */}
      <AdminModal
        isOpen={Boolean(showRestoreModal && restoreFile)}
        onClose={() => {
          if (!restoring) {
            setShowRestoreModal(false);
            setRestoreFile(null);
            setRestoreConfirmText('');
          }
        }}
        title={
          <span className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>تأیید نهایی بازیابی پایگاه‌داده</span>
          </span>
        }
        maxWidth="max-w-md"
        zLevel="confirm"
      >
        {restoreFile && (
          <div className="space-y-4">
            <p className="text-xs text-[#C8C4BC] leading-relaxed">
              شما در حال بازگردانی پایگاه‌داده از فایل «<strong className="text-white">{restoreFile.name}</strong>» هستید.
            </p>

            <div className="p-3 bg-amber-950/30 border border-amber-900/30 rounded text-[11px] text-amber-300 leading-relaxed">
              جهت جلوگیری از عملیات اشتباه، لطفاً کلمه <strong>RESTORE</strong> را در کادر زیر وارد کنید:
            </div>

            <input
              type="text"
              dir="ltr"
              value={restoreConfirmText}
              onChange={(e) => setRestoreConfirmText(e.target.value)}
              placeholder="RESTORE"
              className="w-full px-3 py-2 bg-[#14141A] border border-[#C5A059]/30 rounded-sm text-center font-mono text-sm tracking-widest text-[#EDE8DF] focus:outline-none focus:border-[#C5A059]"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={restoring}
                onClick={() => {
                  setShowRestoreModal(false);
                  setRestoreFile(null);
                  setRestoreConfirmText('');
                }}
                className="px-4 py-2 border border-[#C5A059]/20 text-xs text-[#C8C4BC] rounded-sm hover:text-white"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={restoring || restoreConfirmText !== 'RESTORE'}
                onClick={handleExecuteRestore}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/30 text-black text-xs font-semibold rounded-sm transition-colors flex items-center gap-1.5"
              >
                {restoring ? <Sparkles className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{restoring ? 'در حال بازیابی...' : 'تأیید و اجرای بازیابی'}</span>
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};
