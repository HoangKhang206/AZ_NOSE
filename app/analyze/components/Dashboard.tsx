'use client';

/**
 * Dashboard — Module 2 UI (Sprint 2)
 * Input : landmarks (LandmarkResult), image (blob URL), onFinish callback
 * Output: số liệu góc mũi + AI advice + CTA đặt lịch
 * Flow  : compute measurements → POST /api/analyze → typing animation → CTA
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { calculateNasolabial, calculateNasofrontal } from '@/lib/geometry/angles';
import { classifyProfile } from '@/lib/geometry/faceProfile';
import { findMatchingCase, type KnowledgeCase, type FaceProfile } from '@/lib/ai/mini-kb';
import type { LandmarkResult } from '@/lib/mediapipe/landmarks';
import BeforeAfterSlider from './BeforeAfterSlider';
import Chatbot from './Chatbot';
import PopupCTA from './PopupCTA';

/* ── Config ── */

const IS_DEV = process.env.NODE_ENV !== 'production';
const TYPING_MS = 20;
const FETCH_TIMEOUT_MS = 6_000;

const NASOLABIAL_STANDARD: [number, number] = [90, 100];
const NASOFRONTAL_STANDARD: [number, number] = [115, 130];

const PROFILE_LABEL: Record<FaceProfile, string> = {
  ROUND: 'Mặt tròn',
  OVAL: 'Mặt oval',
  LONG: 'Mặt dài',
  SQUARE: 'Mặt vuông',
  HEART: 'Mặt trái tim',
};

/* ── Types ── */

interface DashboardProps {
  landmarks: LandmarkResult;
  image: string;
  onFinish: () => void;
}

interface AdviceResult {
  advice: string;
  usedFallback: boolean;
}

interface Measurements {
  nasolabial: number;
  nasofrontal: number;
  faceProfile: FaceProfile;
}

/* ── Fetch helper with 1 retry on network error ── */

async function fetchAdvice(payload: Measurements, attempt = 0): Promise<AdviceResult> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(tid);
    if (!res.ok) throw new Error(`http:${res.status}`);
    return (await res.json()) as AdviceResult;
  } catch (err) {
    clearTimeout(tid);
    const isNetwork = !(err instanceof Error && err.message.startsWith('http:'));
    if (isNetwork && attempt === 0) return fetchAdvice(payload, 1);
    throw err;
  }
}

/* ══════════════════════════════════════════
   Main component
══════════════════════════════════════════ */

export default function Dashboard({ landmarks, image, onFinish }: DashboardProps) {
  /* ── Compute measurements ── */
  const measurements = useMemo<Measurements | null>(() => {
    try {
      return {
        nasolabial:  calculateNasolabial(landmarks.landmarks),
        nasofrontal: calculateNasofrontal(landmarks.landmarks),
        faceProfile: classifyProfile(landmarks.landmarks) as FaceProfile,
      };
    } catch {
      return null;
    }
  }, [landmarks]);

  const matchedCase = useMemo<KnowledgeCase | null>(() => {
    if (!measurements) return null;
    return findMatchingCase(
      measurements.faceProfile,
      measurements.nasolabial,
      measurements.nasofrontal,
    );
  }, [measurements]);

  /* ── Advice state ── */
  const [advice, setAdvice]           = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [isLoading, setIsLoading]     = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping]       = useState(false);

  /* ── Fetch on mount ── */
  useEffect(() => {
    if (!measurements) {
      setAdvice(matchedCase?.sampleAdvice ?? 'Không thể phân tích. Vui lòng thử lại.');
      setUsedFallback(true);
      setIsLoading(false);
      return;
    }

    fetchAdvice(measurements)
      .then(({ advice, usedFallback }) => {
        setAdvice(advice);
        setUsedFallback(usedFallback);
      })
      .catch(() => {
        setAdvice(
          matchedCase?.sampleAdvice ?? 'Không thể kết nối AI. Vui lòng thử lại sau.',
        );
        setUsedFallback(true);
      })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // chỉ chạy 1 lần khi mount

  /* ── Typing animation ── */
  useEffect(() => {
    if (!advice) return;
    setIsTyping(true);
    setDisplayedText('');
    let idx = 0;
    const id = setInterval(() => {
      idx++;
      setDisplayedText(advice.slice(0, idx));
      if (idx >= advice.length) {
        clearInterval(id);
        setIsTyping(false);
      }
    }, TYPING_MS);
    return () => clearInterval(id);
  }, [advice]);

  const handleCTA = useCallback(() => {
    alert('Chuyển đến flow đặt lịch aznose.vn');
    onFinish();
  }, [onFinish]);

  /* ── Chat count — trigger PopupCTA sau 3 lượt ── */
  const [chatCount, setChatCount] = useState(0);
  const handleUserMessage = useCallback(() => setChatCount((c) => c + 1), []);

  /* ── Derived display values ── */
  const nasolabial  = measurements?.nasolabial  ?? 0;
  const nasofrontal = measurements?.nasofrontal ?? 0;
  const faceProfile = measurements?.faceProfile ?? 'OVAL';

  /* ══════════════════════════════ RENDER ══════════════════════════════ */

  /* Metric cards dùng ở cả mobile và desktop — extract để tránh lặp JSX */
  const metricCards = (
    <div className="grid grid-cols-2 gap-3">
      <MetricCard
        label="Góc mũi môi"
        value={nasolabial}
        standard="90–100°"
        inRange={nasolabial >= NASOLABIAL_STANDARD[0] && nasolabial <= NASOLABIAL_STANDARD[1]}
      />
      <MetricCard
        label="Góc mũi trán"
        value={nasofrontal}
        standard="115–130°"
        inRange={nasofrontal >= NASOFRONTAL_STANDARD[0] && nasofrontal <= NASOFRONTAL_STANDARD[1]}
      />
    </div>
  );

  const adviceBox = (
    <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4 min-h-[96px]">
      {isLoading ? (
        <AdviceSkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-brand-500 uppercase tracking-wider">
              Tư vấn AI
            </span>
            {usedFallback && IS_DEV && (
              <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                Bản mẫu
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-neutral-700">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-0.5 h-[14px] bg-brand-400 ml-0.5 animate-pulse align-middle" />
            )}
          </p>
        </>
      )}
    </div>
  );

  const sliderBlock = (
    <div className="flex flex-col gap-3">
      <BeforeAfterSlider image={image} landmarks={landmarks} />
      <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
        <FaceIcon />
        <span>{PROFILE_LABEL[faceProfile]}</span>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8">

      {/* ═══ MOBILE ONLY: Metric cards at very top ═══ */}
      <div className="md:hidden mb-5">
        <h2 className="text-xl font-bold text-neutral-900 mb-4 leading-snug">
          Báo cáo tỷ lệ khuôn mặt
        </h2>
        {metricCards}
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">

        {/* ── Desktop LEFT: sticky slider ── */}
        <div className="hidden md:block sticky top-4 self-start">
          {sliderBlock}
        </div>

        {/* ── Right column (desktop) / Full column (mobile) ── */}
        <div className="flex flex-col gap-5">

          {/* Desktop: h2 + metrics (hidden on mobile — shown at top instead) */}
          <div className="hidden md:flex flex-col gap-4">
            <h2 className="text-xl font-bold text-neutral-900 leading-snug">
              Báo cáo tỷ lệ khuôn mặt
            </h2>
            {metricCards}
          </div>

          {/* Mobile: slider between metrics and advice */}
          <div className="md:hidden">
            {sliderBlock}
          </div>

          {/* AI advice — all sizes */}
          {adviceBox}

          {/* Shape card — all sizes */}
          {matchedCase && <ShapeCard matchedCase={matchedCase} />}

          {/* CTA — all sizes */}
          <button
            type="button"
            onClick={handleCTA}
            className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] py-4 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
          >
            Đặt lịch chụp CT 3D miễn phí
          </button>
        </div>
      </div>

      {/* ═══ CASE TƯƠNG TỰ — full width, dưới grid ═══ */}
      <div className="mt-10 md:mt-14">
        <h3 className="text-base font-bold text-neutral-900 mb-4">Case tương tự bạn</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SimilarCasePlaceholder
            n={1} shape="S-line tự nhiên" profile="Mặt oval" angle={95} recovery={8}
          />
          <SimilarCasePlaceholder
            n={2} shape="S-line nâng" profile="Mặt tròn" angle={87} recovery={10}
          />
          <SimilarCasePlaceholder
            n={3} shape="Natural tip" profile="Mặt dài" angle={102} recovery={7}
          />
        </div>
      </div>

      {/* ── Chatbot floating panel ── */}
      <Chatbot
        context={{
          faceProfile: PROFILE_LABEL[faceProfile],
          recommendedShape: matchedCase?.recommendedShape ?? 'S-line tự nhiên',
          nasolabial,
          nasofrontal,
        }}
        onUserMessage={handleUserMessage}
      />

      {/* ── PopupCTA: sau 30s HOẶC sau 3 lượt chat ── */}
      <PopupCTA chatCount={chatCount} />
    </div>
  );
}

/* ══════════════════════════════════════════
   Sub-components
══════════════════════════════════════════ */

interface MetricCardProps {
  label: string;
  value: number;
  standard: string;
  inRange: boolean;
}

function MetricCard({ label, value, standard, inRange }: MetricCardProps) {
  return (
    <div
      className={[
        'rounded-xl p-3 border',
        inRange
          ? 'bg-white border-neutral-200'
          : 'bg-amber-50 border-amber-200',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="text-xs text-neutral-500 leading-tight">{label}</span>
        {!inRange && <WarningIcon />}
      </div>
      <p className="text-2xl font-bold text-neutral-900 leading-none">
        {value > 0 ? value.toFixed(1) : '—'}
        <span className="text-sm font-normal text-neutral-500">°</span>
      </p>
      <p className="mt-1 text-[11px] text-neutral-400">Chuẩn: {standard}</p>
    </div>
  );
}

interface SimilarCasePlaceholderProps {
  n: number;
  shape: string;
  profile: string;
  angle: number;
  recovery: number;
}

function SimilarCasePlaceholder({ n, shape, profile, angle, recovery }: SimilarCasePlaceholderProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-white">
      {/* Before / After placeholder thumbnails */}
      <div className="grid grid-cols-2 gap-px bg-neutral-200">
        <div className="aspect-[4/5] bg-neutral-100 flex flex-col items-center justify-center gap-1.5">
          <ImagePlaceholderIcon color="#a3a3a3" />
          <span className="text-[10px] text-neutral-400">Trước</span>
        </div>
        <div className="aspect-[4/5] bg-brand-50 flex flex-col items-center justify-center gap-1.5">
          <ImagePlaceholderIcon color="#D85A30" />
          <span className="text-[10px] text-brand-400">Sau</span>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs font-bold text-neutral-800">Case #{n} · {shape}</p>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          {profile} · Góc mũi môi {angle}° · Hồi phục {recovery} ngày
        </p>
      </div>
    </div>
  );
}

function ImagePlaceholderIcon({ color = '#a3a3a3' }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function AdviceSkeleton() {
  return (
    <div className="animate-pulse space-y-2.5 pt-1" aria-label="Đang tải tư vấn…">
      <div className="h-2.5 bg-brand-100 rounded-full w-full" />
      <div className="h-2.5 bg-brand-100 rounded-full w-5/6" />
      <div className="h-2.5 bg-brand-100 rounded-full w-4/5" />
      <div className="h-2.5 bg-brand-100 rounded-full w-3/5" />
    </div>
  );
}

function ShapeCard({ matchedCase }: { matchedCase: KnowledgeCase }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white">
      <div className="flex items-center gap-3 p-3">
        {/* Shape thumbnail */}
        <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
          {!imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/shapes/${matchedCase.id}.jpg`}
              alt={matchedCase.recommendedShape}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <NoseShapeIcon />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] text-neutral-400 mb-0.5">Đề xuất phù hợp</p>
          <p className="text-sm font-bold text-neutral-900 truncate">
            {matchedCase.recommendedShape}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">
            {matchedCase.medicalNote}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Icons
══════════════════════════════════════════ */

function WarningIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#d97706"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 mt-0.5"
      aria-label="Ngoài chuẩn"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function FaceIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function NoseShapeIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#D85A30"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3c0 0-4 6-4 11a4 4 0 0 0 8 0c0-5-4-11-4-11Z" />
      <path d="M8 14c-1.5 1-2 2-2 2h12s-.5-1-2-2" />
    </svg>
  );
}
