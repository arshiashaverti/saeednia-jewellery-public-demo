import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { EntranceScreen } from './components/EntranceScreen';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { FineJewelryPage } from './pages/FineJewelryPage';
import { BlogPage } from './pages/BlogPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CustomPage } from './pages/CustomPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LuxuryAtmosphericBackdrop } from './components/LuxuryAtmosphericBackdrop';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage }))
);

const AppContent: React.FC = () => {
  const { toast, settings, dataError, refreshData } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Automatic scroll-to-top on every route change: ensures every page opens at the top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [location.pathname]);

  // Landing page toggle from CMS settings (defaults to true)
  const isLandingEnabled = settings?.landingPage?.enabled !== false;

  // Entry experience state: bypass entrance on direct admin or deep-linked sub-pages
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p !== '/' && p.length > 1) {
        return true;
      }
    }
    return false;
  });

  const [isEntering, setIsEntering] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const showEntrance = !hasEntered && !isAdminRoute && isLandingEnabled;

  const handleStartEntranceTransition = () => {
    setIsEntering(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleEntranceComplete = () => {
    setHasEntered(true);
    setIsEntering(false);
  };

  return (
    <>
      {/* Main Routed Content (Mounted underneath for continuous luxury reveal) */}
      <div
        className={`min-h-screen bg-[#FFFFFF] dark:bg-[#0A0A0B] text-[#171513] dark:text-[#EDE8DF] selection:bg-[#C5A059] selection:text-[#0A0A0B] flex flex-col justify-between ${
          isEntering
            ? 'animate-luxury-page-reveal'
            : showEntrance
            ? 'opacity-0 pointer-events-none'
            : 'opacity-100'
        }`}
        aria-hidden={showEntrance && !isEntering}
      >
        {/* Keyboard Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#C5A059] focus:text-[#0A0A0B] focus:rounded-sm focus:text-xs focus:font-semibold shadow-lg"
        >
          پرش به محتوای اصلی
        </a>

        {/* Global Header */}
        {!isAdminRoute && <Header />}

        {/* Main Routed Content */}
        <main id="main-content" tabIndex={-1} className="relative flex-grow overflow-x-clip focus:outline-none">
          {/* Global Ambient Decorative Luxury Light Halos & Facets in Empty Margins */}
          <LuxuryAtmosphericBackdrop />

          {dataError && (
            <div
              role="alert"
              className="relative z-40 max-w-4xl mx-auto mt-24 mb-4 px-4"
            >
              <div className="p-4 bg-red-950/85 border border-red-500/40 text-red-100 rounded-sm shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-persian-nav leading-relaxed">{dataError}</span>
                </div>
                <button
                  type="button"
                  onClick={refreshData}
                  className="px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 rounded-sm text-xs font-persian-nav shrink-0 cursor-pointer transition-colors"
                >
                  تلاش مجدد
                </button>
              </div>
            </div>
          )}

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CollectionPage />} />
            <Route path="/categories/:categorySlug" element={<CollectionPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/fine-jewelry" element={<FineJewelryPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<ArticleDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route
              path="/admin/*"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-xs text-[#C5A059] font-persian-nav">
                      در حال بارگذاری سامانه مدیریت...
                    </div>
                  }
                >
                  <AdminPage />
                </Suspense>
              }
            />
            <Route path="/:slug" element={<CustomPage />} />
            <Route path="/:categorySlug/:id" element={<ProductDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Footer (shown on all public views) */}
        {!isAdminRoute && <Footer />}

        {/* Global Product Detail Modal */}
        <ProductDetailModal />

        {/* Global Luxury Toast Notification */}
        {toast && (
          <div
            id="global-toast"
            className="fixed bottom-6 start-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#121216]/95 border border-[#C5A059]/40 backdrop-blur-md rounded-sm shadow-2xl shadow-black text-xs text-[#EDE8DF] animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-sm sm:max-w-md"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#C5A059] flex-shrink-0" />}
            <span className="flex-1 leading-snug font-persian-nav">{toast.message}</span>
          </div>
        )}
      </div>

      {/* Signature Luxury Entrance Screen (Overlays during initial state and transition) */}
      {showEntrance && (
        <EntranceScreen
          onStartTransition={handleStartEntranceTransition}
          onComplete={handleEntranceComplete}
        />
      )}
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
