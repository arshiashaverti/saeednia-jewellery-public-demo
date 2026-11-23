import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, Globe, Phone, Instagram, Search, Sparkles, Moon, Sun } from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';
import { DEFAULT_HEADER_LINKS, resolveNavLinks } from '../utils/contactAndArticles';

export const Header: React.FC = () => {
  const { lang, setLang, settings, theme, toggleTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const navLinks = resolveNavLinks(settings?.navigation?.headerLinks, DEFAULT_HEADER_LINKS);
  const drawerBrandFa = settings?.brandNameFa || 'جواهری سعیدنیا';
  const drawerBrandEn = (settings?.brandNameEn || 'SAEEDNIA JEWELLERY').toUpperCase();
  const drawerBranchEn = (settings?.branchNameEn || 'GRAND BAZAAR').toUpperCase();



  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        id="main-header"
        data-surface={theme === 'light' ? 'light' : 'dark'}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 backdrop-blur-md ${
          theme === 'light'
            ? 'bg-[#E4DBCB]/95 border-b border-[#AC9262]/25 text-[#1F1A16]'
            : 'bg-[#0A0A0B]/96 on-dark border-b border-[#C5A059]/20 text-[#EDE8DF]'
        } ${
          scrolled
            ? (theme === 'light' ? 'py-3 shadow-[0_4px_20px_rgba(74,63,53,0.06)]' : 'py-3 shadow-2xl shadow-black/80')
            : 'py-3.5 sm:py-4.5'
        }`}
      >
        {/* Soft Faded Light Halo on Left ~10% & Right ~10% Edges in Light Mode */}
        <div
          id="header-side-light-halos"
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          {/* Left flank soft diffused light halo */}
          <div className={`absolute inset-y-0 left-0 pointer-events-none ${
            theme === 'light'
              ? 'w-[10%] sm:w-[10%] bg-gradient-to-r from-[#FFE8A3]/24 via-[#F6DF95]/12 to-transparent blur-md'
              : 'w-[25%] bg-gradient-to-r from-[#FAF0DC]/24 via-[#E5C378]/12 to-transparent blur-md'
          }`} />
          {/* Right flank soft diffused light halo */}
          <div className={`absolute inset-y-0 right-0 pointer-events-none ${
            theme === 'light'
              ? 'w-[10%] sm:w-[10%] bg-gradient-to-l from-[#FFE8A3]/24 via-[#F6DF95]/12 to-transparent blur-md'
              : 'w-[25%] bg-gradient-to-l from-[#FAF0DC]/24 via-[#E5C378]/12 to-transparent blur-md'
          }`} />
        </div>

        {/* Soft blurred / feathered transition boundary between header and page below */}
        <div
          id="header-soft-boundary"
          className="absolute bottom-0 inset-x-0 pointer-events-none overflow-visible"
          aria-hidden="true"
        >
          {/* Delicate champagne-gold hairline */}
          <div className={`w-full h-[1px] bg-gradient-to-r from-transparent ${
            theme === 'light' ? 'via-[#AC9262]/40' : 'via-[#C5A059]/25'
          } to-transparent`} />
          {/* Faded soft blur shadow veil extending downward into the page */}
          <div className={`header-feather-shadow absolute top-[1px] inset-x-0 ${
            theme === 'light'
              ? 'h-3 bg-gradient-to-b from-[#AC9262]/10 via-[#E4DBCB]/05 to-transparent'
              : 'h-3 bg-gradient-to-b from-black/25 via-black/10 to-transparent'
          } pointer-events-none`} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left/Right Slot: Mobile Menu Trigger + Brand Logo */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile Drawer Trigger (Mobile Only) */}
              <button
                id="btn-main-menu-toggle"
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className={`lg:hidden flex items-center gap-2 px-2.5 py-1.5 rounded-sm transition-all focus:outline-none ${
                  theme === 'light'
                    ? 'text-[#1F1A16] hover:text-[#906D2D] border border-[#AC9262]/35 bg-white'
                    : 'text-[#EDE8DF] hover:text-[#D4AF37] border border-[#C5A059]/30 bg-[#0E0E12]/90'
                }`}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <X className={`w-5 h-5 ${theme === 'light' ? 'text-[#906D2D]' : 'text-[#D4AF37]'}`} />
                ) : (
                  <Menu className={`w-5 h-5 ${theme === 'light' ? 'text-[#906D2D]' : 'text-[#C5A059]'}`} />
                )}
              </button>

              {/* Official Brand Logo Presentation */}
              <Link
                to="/"
                className="flex items-center justify-center group transition-transform duration-300 hover:scale-[1.02] py-0.5 text-center focus:outline-none"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Saeednia Jewellery Home"
              >
                {/* Official Logo (~25% larger, with golden halo removed for crisp, clean presentation) */}
                <div className="relative flex items-center justify-center h-10 sm:h-11 md:h-12 max-h-14">
                  <img
                    src={settings?.logoUrl || '/images/7.png'}
                    alt="Saeednia Logo"
                    className="h-full w-auto object-contain transition-all duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </Link>
            </div>

            {/* =======================================================
                DESKTOP DIRECT HORIZONTAL NAVIGATION (Visible on Desktop)
                Direct links: خانه, دسته‌بندی‌ها, جواهرات فاخر, وبلاگ, درباره ما, تماس با ما
               ======================================================= */}
            <nav
              aria-label="Desktop Navigation"
              className="hidden lg:flex items-center gap-6 xl:gap-8"
            >
              {navLinks.map((item) => {
                const isExternal = /^https:\/\//i.test(item.to);
                const active = !isExternal && isActive(item.to);
                const classes = `relative py-1 text-sm font-persian-nav tracking-wide transition-all duration-300 ${
                  active
                    ? (theme === 'light' ? 'text-[#906D2D] font-bold' : 'text-[#D4AF37] font-bold')
                    : (theme === 'light' ? 'text-[#1F1A16] hover:text-[#906D2D]' : 'text-[#C8C4BC] hover:text-[#EDE8DF]')
                }`;
                if (isExternal) {
                  return (
                    <a
                      key={item.id || item.to}
                      href={item.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes}
                    >
                      <span>{lang === 'fa' ? item.labelFa : item.labelEn}</span>
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.id || item.to}
                    to={item.to}
                    className={classes}
                  >
                    <span>{lang === 'fa' ? item.labelFa : item.labelEn}</span>
                    {active && (
                      <span className={`absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${
                        theme === 'light' ? 'via-[#906D2D]' : 'via-[#D4AF37]'
                      } to-transparent rounded-full`} />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions: Global Search Trigger + Direct Contact + Language Switcher */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Global Search Button */}
              <button
                id="btn-header-search"
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs rounded-sm transition-all luxury-btn-tactile-secondary ${
                  theme === 'light'
                    ? 'text-[#1F1A16] hover:text-[#906D2D] border border-[#AC9262]/35 hover:border-[#906D2D] bg-white'
                    : 'text-[#C8C4BC] hover:text-[#D4AF37] border border-[#C5A059]/25 hover:border-[#D4AF37] bg-[#121216]/80'
                }`}
                title={lang === 'fa' ? 'جستجوی سراسری' : 'Global Search'}
                aria-label="Open search"
              >
                <Search className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-[#906D2D]' : 'text-[#C5A059]'}`} />
                <span className="hidden md:inline font-persian-nav text-xs">
                  {lang === 'fa' ? 'جستجو' : 'Search'}
                </span>
              </button>

              {/* Direct Telephone Contact (Hidden on very small screens) */}
              <Link
                to="/contact"
                className={`hidden sm:inline-flex items-center gap-1.5 text-xs transition-colors py-1.5 px-3 rounded-sm luxury-btn-tactile-secondary font-persian-nav ${
                  theme === 'light'
                    ? 'text-[#1F1A16] hover:text-[#906D2D] border border-[#AC9262]/35 hover:border-[#906D2D] bg-white'
                    : 'text-[#C8C4BC] hover:text-[#D4AF37] border border-[#C5A059]/25 hover:border-[#C5A059]/55 bg-[#141416]/60'
                }`}
              >
                <Phone className={`w-3 h-3 ${theme === 'light' ? 'text-[#906D2D]' : 'text-[#C5A059]'}`} />
                <span>{lang === 'fa' ? 'تماس با ما' : 'Contact'}</span>
              </Link>

              {/* Minimal Dark/Light Theme Toggle (Lucide Moon / Sun) */}
              <button
                id="btn-theme-toggle"
                type="button"
                onClick={toggleTheme}
                className={`flex items-center justify-center w-8 h-8 text-xs rounded-sm luxury-btn-tactile-secondary focus:outline-none transition-all ${
                  theme === 'light'
                    ? 'border border-[#AC9262]/35 hover:border-[#906D2D] text-[#1F1A16] hover:text-[#906D2D] bg-white focus:ring-1 focus:ring-[#906D2D]'
                    : 'border border-[#C5A059]/30 hover:border-[#D4AF37] text-[#EDE8DF] hover:text-[#D4AF37] bg-[#141416]/80 focus:ring-1 focus:ring-[#D4AF37]'
                }`}
                title={theme === 'dark' ? (lang === 'fa' ? 'تغییر به پوسته عاجی روشن' : 'Switch to Light Theme') : (lang === 'fa' ? 'تغییر به پوسته ابسیدین تیره' : 'Switch to Dark Theme')}
                aria-label={theme === 'dark' ? 'فعال‌سازی حالت روشن' : 'فعال‌سازی حالت تاریک'}
              >
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-[#C5A059] transition-transform duration-300 hover:rotate-12" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-[#906D2D] transition-transform duration-300 hover:rotate-45" />
                )}
              </button>

              {/* Language Switch */}
              <button
                id="btn-language-switch"
                type="button"
                onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-sm luxury-btn-tactile-secondary transition-all ${
                  theme === 'light'
                    ? 'border border-[#AC9262]/35 hover:border-[#906D2D] text-[#1F1A16] hover:text-[#906D2D] bg-white'
                    : 'border border-[#C5A059]/30 hover:border-[#C5A059] text-[#EDE8DF] hover:text-[#D4AF37] bg-[#141416]/80'
                }`}
                title="تغییر زبان / Switch Language"
              >
                <Globe className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-[#906D2D]' : 'text-[#C5A059]'}`} />
                <span className="font-cinzel uppercase font-medium">{lang === 'fa' ? 'EN' : 'FA'}</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* =======================================================
          MOBILE NAVIGATION DRAWER (Cleaned up, luxury focused)
         ======================================================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="منوی موبایل جواهری سعیدنیا"
            dir={lang === 'fa' ? 'rtl' : 'ltr'}
            className="fixed inset-y-0 start-0 z-50 w-full max-w-[320px] sm:max-w-[350px] drawer-surface border-e border-[#C5A059]/25 flex flex-col justify-between overflow-y-auto animate-slide-in text-start rtl:text-right ltr:text-left shadow-2xl"
          >
            {/* Drawer Top Bar & Centered Brand Header */}
            <div className="p-6 pb-5 border-b border-[#C5A059]/15">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 min-h-[36px] px-2 py-1.5 text-drawer-muted hover:text-drawer-gold transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                  aria-label={lang === 'fa' ? 'بستن منو' : 'Close menu'}
                >
                  <X className="w-5 h-5 text-drawer-gold" aria-hidden="true" />
                  <span className="text-xs font-persian-nav">
                    {lang === 'fa' ? 'بستن منو' : 'Close'}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="min-w-[36px] min-h-[36px] p-2 border border-[#C5A059]/25 text-drawer-text hover:text-drawer-gold rounded-sm bg-drawer-control transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                    title={theme === 'dark' ? 'حالت روشن' : 'حالت تیره'}
                    aria-label="تغییر تم"
                  >
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-[#C5A059]" aria-hidden="true" />
                    ) : (
                      <Sun className="w-4 h-4 text-[#A77B36]" aria-hidden="true" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#C5A059]/25 text-drawer-text hover:text-drawer-gold rounded-sm bg-drawer-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                  >
                    <Search className="w-3.5 h-3.5 text-drawer-gold" aria-hidden="true" />
                    <span className="font-persian-nav">{lang === 'fa' ? 'جستجو' : 'Search'}</span>
                  </button>
                </div>
              </div>

              {/* Centered Brand Label: جواهری سعیدنیا */}
              <div className="mt-6 pt-2 text-center flex flex-col items-center justify-center">
                <div className="mb-2 w-10 h-10 flex items-center justify-center">
                  <img
                    src={settings?.logoUrl || '/images/7.png'}
                    alt="Saeednia Logo"
                    className="w-full h-full object-contain logo-contrast-dark"
                  />
                </div>

                <h2 className="font-persian-artistic text-2xl sm:text-3xl text-drawer-heading font-normal tracking-wide">
                  {drawerBrandFa}
                </h2>

                <span className="font-cinzel text-[9px] sm:text-[10px] text-drawer-gold tracking-[0.22em] uppercase mt-1">
                  {drawerBrandEn}
                </span>
              </div>
            </div>

            {/* Middle Nav Items: Direct Links Only */}
            <div className="p-6 py-6 flex-1 overflow-y-auto">
              <nav aria-label="Mobile Navigation Links" className="flex flex-col space-y-1.5">
                {navLinks.map((item) => {
                  const isExternal = /^https:\/\//i.test(item.to);
                  const active = !isExternal && isActive(item.to);
                  const classes = `w-full py-3 px-4 text-start transition-all rounded-sm flex items-center justify-between text-sm sm:text-base font-persian-heading ${
                    active
                      ? 'bg-drawer-active text-drawer-gold font-bold border-s-2 border-drawer-gold'
                      : 'text-drawer-text hover:text-drawer-gold hover:bg-drawer-hover'
                  }`;
                  if (isExternal) {
                    return (
                      <a
                        key={item.id || item.to}
                        href={item.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className={classes}
                      >
                        <span>{lang === 'fa' ? item.labelFa : item.labelEn}</span>
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={item.id || item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={classes}
                    >
                      <span>{lang === 'fa' ? item.labelFa : item.labelEn}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-drawer-gold" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Section: Minimal Copyright & Language Switch */}
            <div className="p-5 border-t border-[#C5A059]/15 flex items-center justify-between text-xs text-drawer-muted">
              <button
                type="button"
                onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#C5A059]/25 text-drawer-text hover:text-drawer-gold font-cinzel text-[11px]"
              >
                <Globe className="w-3.5 h-3.5 text-drawer-gold" />
                <span>{lang === 'fa' ? 'English' : 'فارسی'}</span>
              </button>

              <span className="font-cinzel text-[10px] tracking-wider text-drawer-muted">
                {drawerBranchEn}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
