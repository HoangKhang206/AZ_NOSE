'use client';

/**
 * ConsentBanner — Module 0 (Nghị định 13/2023/NĐ-CP, Điều 11)
 * Input : void
 * Output: onGranted() callback khi user đồng ý đủ 3 điều kiện
 *         onExit() callback khi user từ chối → redirect về /
 * Tuân thủ: consent minh bạch trước khi xử lý ảnh sinh trắc học
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CONSENT_KEY = 'az_consent';
const CONSENT_VERSION = '1.0';
const CONSENT_TTL_DAYS = 30;

interface ConsentRecord {
  granted: boolean;
  timestamp: string;
  version: string;
}

interface ConsentBannerProps {
  onGranted: () => void;
}

function isConsentValid(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const record: ConsentRecord = JSON.parse(raw);
    if (!record.granted || record.version !== CONSENT_VERSION) return false;
    const age = Date.now() - new Date(record.timestamp).getTime();
    return age < CONSENT_TTL_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function saveConsent(): void {
  const record: ConsentRecord = {
    granted: true,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
}

export default function ConsentBanner({ onGranted }: ConsentBannerProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [checks, setChecks] = useState({ clientSide: false, age: false, terms: false });

  useEffect(() => {
    if (isConsentValid()) {
      onGranted();
    } else {
      setShow(true);
    }
  }, [onGranted]);

  const allChecked = checks.clientSide && checks.age && checks.terms;

  function handleStart() {
    if (!allChecked) return;
    saveConsent();
    setShow(false);
    onGranted();
  }

  function handleExit() {
    router.push('/');
  }

  function toggle(key: keyof typeof checks) {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="consent-title"
    >
      <div className="w-full max-w-[500px] rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100">
          <h2
            id="consent-title"
            className="text-lg font-bold text-neutral-900 leading-snug"
          >
            Trước khi bắt đầu
          </h2>
          {/* Privacy assurance line */}
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#D85A30]">
            <LockIcon />
            Ảnh của bạn không rời khỏi thiết bị này
          </p>
        </div>

        {/* Checkboxes */}
        <div className="px-6 py-5 flex flex-col gap-5">
          <CheckItem
            id="check-client"
            checked={checks.clientSide}
            onChange={() => toggle('clientSide')}
          >
            Tôi đồng ý phân tích ảnh của tôi ngay trên trình duyệt.{' '}
            <span className="font-semibold">
              Ảnh KHÔNG được tải lên máy chủ AZ NOSE.
            </span>
          </CheckItem>

          <CheckItem
            id="check-age"
            checked={checks.age}
            onChange={() => toggle('age')}
          >
            Tôi đã đủ <span className="font-semibold">18 tuổi</span>.
          </CheckItem>

          <CheckItem
            id="check-terms"
            checked={checks.terms}
            onChange={() => toggle('terms')}
          >
            Tôi đã đọc và đồng ý với{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#D85A30] hover:text-[#993C1D] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#D85A30] hover:text-[#993C1D] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Chính sách bảo mật
            </a>
            .
          </CheckItem>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleExit}
            className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Thoát
          </button>
          <button
            type="button"
            onClick={handleStart}
            disabled={!allChecked}
            className={[
              'flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-all',
              allChecked
                ? 'bg-[#D85A30] hover:bg-[#993C1D] cursor-pointer shadow-md hover:shadow-lg'
                : 'bg-neutral-300 cursor-not-allowed',
            ].join(' ')}
            aria-disabled={!allChecked}
          >
            Bắt đầu phân tích
          </button>
        </div>

        {/* Legal footnote */}
        <p className="px-6 pb-5 text-[11px] text-neutral-400 leading-relaxed">
          Dữ liệu sinh trắc học được bảo vệ theo{' '}
          <span className="font-medium">Nghị định 13/2023/NĐ-CP</span>. AZ NOSE
          không lưu trữ ảnh của bạn sau phiên phân tích.
        </p>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

interface CheckItemProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}

function CheckItem({ id, checked, onChange, children }: CheckItemProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 cursor-pointer group"
    >
      {/* Custom checkbox */}
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <span
          className={[
            'flex h-5 w-5 items-center justify-center rounded border-2 transition-all',
            checked
              ? 'border-[#D85A30] bg-[#D85A30]'
              : 'border-neutral-300 bg-white group-hover:border-[#D85A30]',
          ].join(' ')}
          aria-hidden="true"
        >
          {checked && (
            <svg
              width="11"
              height="9"
              viewBox="0 0 11 9"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 4L4 7.5L10 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
      <span className="text-sm leading-relaxed text-neutral-700">{children}</span>
    </label>
  );
}
