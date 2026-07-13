'use client';

/**
 * PopupCTA — Đặt lịch floating prompt
 * Hiện sau 30 giây HOẶC sau khi user chat ≥ 3 lượt
 * Không hiện lại sau khi dismiss (session state — unmount reset là OK cho demo)
 */

import { useState, useEffect } from 'react';

interface PopupCTAProps {
  chatCount: number;
}

const TIMER_MS = 30_000;

export default function PopupCTA({ chatCount }: PopupCTAProps) {
  const [timerFired, setTimerFired] = useState(false);
  const [dismissed, setDismissed]   = useState(false);

  useEffect(() => {
    const tid = setTimeout(() => setTimerFired(true), TIMER_MS);
    return () => clearTimeout(tid);
  }, []);

  const visible = !dismissed && (timerFired || chatCount >= 3);

  if (!visible) return null;

  const handleCTA = () => {
    alert('Chức năng sẽ dẫn về form đặt lịch aznose.vn');
  };

  /* ══════════════════════════════ RENDER ══════════════════════════════ */

  return (
    <>
      {/* Backdrop — desktop only, click ngoài để đóng */}
      <div
        className="hidden md:block fixed inset-0 bg-black/40 z-40 animate-[fadeIn_0.2s_ease]"
        onClick={() => setDismissed(true)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Đặt lịch khám"
        className={[
          'fixed z-50 bg-white shadow-2xl',
          /* Mobile: bottom sheet, slide-up */
          'bottom-0 inset-x-0 rounded-t-2xl px-5 pt-5 pb-8',
          /* Desktop: centered card */
          'md:bottom-auto md:inset-x-auto md:left-1/2 md:top-1/2',
          'md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] md:rounded-2xl md:px-7 md:py-7',
        ].join(' ')}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Đóng"
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 flex items-center justify-center transition-colors"
        >
          <CloseIcon />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <BellIcon />
          </div>
          <h2 className="text-base font-bold text-neutral-900 leading-snug">
            Sẵn sàng gặp bác sĩ chưa?
          </h2>
        </div>

        {/* Body */}
        <p className="text-sm text-neutral-600 leading-relaxed mb-5">
          Đặt lịch chụp CT 3D miễn phí — xem cấu trúc sụn thật bên trong.
        </p>

        {/* CTA button */}
        <button
          type="button"
          onClick={handleCTA}
          className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] py-4 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
        >
          Đặt lịch ngay
        </button>

        {/* Dismiss link */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="w-full mt-3 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          Để sau
        </button>
      </div>
    </>
  );
}

/* ── Icons ── */

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#D85A30"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
