import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { applyPageSeo } from '../utils/seo';

export const NotFoundPage: React.FC = () => {
  const { lang, settings } = useApp();
  const location = useLocation();

  useEffect(() => {
    const brandName = settings?.brandNameFa || 'جواهری سعیدنیا';
    applyPageSeo({
      browserTitle: `${lang === 'fa' ? 'صفحه یافت نشد (404)' : 'Page Not Found'} | ${brandName}`,
      metaDescription: 'صفحه مورد نظر در وب‌سایت جواهری سعیدنیا یافت نشد.',
      robots: 'noindex, nofollow',
      canonicalPath: location.pathname,
    });
  }, [lang, settings, location.pathname]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#070709] text-[#1F1A16] dark:text-[#EDE8DF] flex flex-col items-center justify-center px-4 pt-32 pb-32 text-center">
      <div className="max-w-md mx-auto">
        <Sparkles className="w-12 h-12 text-[#906D2D] dark:text-[#C5A059] mx-auto mb-4 opacity-80" />
        <span className="font-cinzel text-xs text-[#906D2D] dark:text-[#C5A059] tracking-[0.3em] uppercase block mb-2 font-medium">
          PAGE NOT FOUND
        </span>
        <h1 className="text-3xl sm:text-4xl font-persian-heading text-[#1F1A16] dark:text-[#EDE8DF] mb-4">
          {lang === 'fa' ? 'صفحه مورد نظر یافت نشد' : 'Page Not Found'}
        </h1>
        <p className="text-xs sm:text-sm text-[#4A3F35] dark:text-[#8C8880] font-persian-body mb-8 leading-relaxed">
          {lang === 'fa'
            ? 'نشانی وارد شده در دسترس نمی‌باشد یا ممکن است به بخش دیگری انتقال یافته باشد.'
            : 'The requested address does not exist or may have been relocated.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#906D2D] hover:bg-[#7D5E26] dark:bg-[#C5A059] dark:hover:bg-[#D4AF37] text-white dark:text-[#070709] text-xs font-persian-nav tracking-wider uppercase rounded-sm luxury-btn-tactile-primary transition-colors shadow-sm"
        >
          <span>{lang === 'fa' ? 'بازگشت به صفحه اصلی' : 'Back to Home'}</span>
          {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
        </Link>
      </div>
    </div>
  );
};
