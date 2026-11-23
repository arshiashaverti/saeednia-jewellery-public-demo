import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

// Global modal stack ensures nested dialogs manage body scroll lock and Escape safely
const openModalStack: symbol[] = [];

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  zLevel?: 'base' | 'nested' | 'confirm';
  closeLabel?: string;
  closeOnBackdropClick?: boolean;
  bodyClassName?: string;
  children: React.ReactNode;
}

const Z_CLASS_MAP: Record<NonNullable<AdminModalProps['zLevel']>, string> = {
  base: 'z-50',
  nested: 'z-[60]',
  confirm: 'z-[70]',
};

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  headerActions,
  footer,
  maxWidth = 'max-w-3xl',
  zLevel = 'base',
  closeLabel = 'بستن پنجره',
  closeOnBackdropClick = true,
  bodyClassName = 'p-4 sm:p-6',
  children,
}) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalIdRef = useRef<symbol>(Symbol('admin-modal'));
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const modalId = modalIdRef.current;
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    if (!openModalStack.includes(modalId)) {
      openModalStack.push(modalId);
    }
    document.body.style.overflow = 'hidden';

    const rafId = window.requestAnimationFrame(() => {
      if (panelRef.current) {
        const firstFocusable = panelRef.current.querySelector<HTMLElement>(
          'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          closeButtonRef.current?.focus();
        }
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const topId = openModalStack[openModalStack.length - 1];
        if (topId === modalId) {
          e.stopPropagation();
          onCloseRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown, true);

      const idx = openModalStack.lastIndexOf(modalId);
      if (idx !== -1) {
        openModalStack.splice(idx, 1);
      }
      if (openModalStack.length === 0) {
        document.body.style.overflow = '';
      }

      const prev = previousFocusRef.current;
      if (prev && prev.isConnected && typeof prev.focus === 'function') {
        prev.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${Z_CLASS_MAP[zLevel]} bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4`}
      onMouseDown={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        dir="rtl"
        className={`bg-[#0D0D10] border border-[#C5A059]/30 rounded-sm shadow-2xl w-full ${maxWidth} max-h-[92dvh] flex flex-col overflow-hidden text-right outline-none`}
      >
        {/* Pinned sticky modal header: always visible above scrollable form body */}
        <div className="flex-shrink-0 sticky top-0 z-20 px-4 sm:px-6 py-3.5 bg-[#121218] border-b border-[#C5A059]/20 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              id={titleId}
              className="text-sm sm:text-base font-medium text-[#EDE8DF] font-vazir truncate"
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-[#8C8880] mt-0.5 truncate">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              title={closeLabel}
              className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-sm border border-[#C5A059]/20 bg-[#0A0A0D] text-[#C8C4BC] hover:text-white hover:border-[#C5A059]/60 hover:bg-[#1A1A22] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Independent scrollable modal body */}
        <div className={`flex-1 min-h-0 overflow-y-auto overscroll-contain ${bodyClassName}`}>
          {children}
        </div>

        {footer && (
          <div className="flex-shrink-0 px-4 sm:px-6 py-3.5 bg-[#121218] border-t border-[#C5A059]/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
