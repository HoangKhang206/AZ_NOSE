'use client';

/**
 * ProcessingScreen — Module 1 UI (Sprint 1)
 * Input : image (blob URL), onComplete(LandmarkResult) callback
 * Output: vẽ 468 landmark dots lên SVG overlay; gọi onComplete sau max(3s, extraction time)
 * Landmark positions: object-fit:cover mapping → tọa độ canvas pixel
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { extractLandmarks } from '@/lib/mediapipe/landmarks';
import type { LandmarkResult } from '@/lib/mediapipe/landmarks';

const MIN_DISPLAY_MS = 3000;

const MESSAGES = [
  'Đang phát hiện khuôn mặt…',
  'Đang đo góc mũi môi…',
  'Đang đánh giá tỷ lệ 1/3 khuôn mặt…',
] as const;

// Kích thước container cố định — dùng để tính tọa độ SVG
const CONTAINER_W = 280;
const CONTAINER_H = 340;

interface DotPos {
  cx: number;
  cy: number;
}

interface ProcessingScreenProps {
  image: string; // blob URL từ InputZone
  onComplete: (result: LandmarkResult) => void;
  onError?: (err: Error) => void;
}

export default function ProcessingScreen({
  image,
  onComplete,
  onError,
}: ProcessingScreenProps) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots, setDots] = useState<DotPos[]>([]);
  const [landmarks, setLandmarks] = useState<LandmarkResult | null>(null);
  const [timerDone, setTimerDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const completedRef = useRef(false);

  // Text cycling — every 1 s
  useEffect(() => {
    const id = setInterval(
      () => setMsgIdx((prev) => (prev + 1) % MESSAGES.length),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  // 3-second minimum timer
  useEffect(() => {
    const id = setTimeout(() => setTimerDone(true), MIN_DISPLAY_MS);
    return () => clearTimeout(id);
  }, []);

  // MediaPipe extraction
  useEffect(() => {
    let cancelled = false;

    const img = new Image();
    img.onload = async () => {
      try {
        const result = await extractLandmarks(img);
        if (cancelled) return;

        // Map landmark [0,1] coords → SVG pixel coords (object-fit: cover)
        const { naturalWidth: natW, naturalHeight: natH } = img;
        const scale = Math.max(CONTAINER_W / natW, CONTAINER_H / natH);
        const displayW = natW * scale;
        const displayH = natH * scale;
        const offsetX = (CONTAINER_W - displayW) / 2; // negative → cropped portion
        const offsetY = (CONTAINER_H - displayH) / 2;

        setDots(
          result.landmarks.map((lm) => ({
            cx: lm.x * displayW + offsetX,
            cy: lm.y * displayH + offsetY,
          })),
        );
        setLandmarks(result);
      } catch (err) {
        if (cancelled) return;
        const e = err instanceof Error ? err : new Error(String(err));
        setErrorMsg(e.message);
        onError?.(e);
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        const e = new Error('Không đọc được blob URL ảnh.');
        setErrorMsg(e.message);
        onError?.(e);
      }
    };
    img.src = image;

    return () => {
      cancelled = true;
    };
  }, [image, onError]);

  // Fire onComplete when both conditions met
  useEffect(() => {
    if (timerDone && landmarks && !completedRef.current) {
      completedRef.current = true;
      onComplete(landmarks);
    }
  }, [timerDone, landmarks, onComplete]);

  if (errorMsg) {
    return <ErrorState message={errorMsg} />;
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      {/* Oval image frame + SVG landmark overlay */}
      <div
        className="relative overflow-hidden bg-neutral-100 shadow-lg"
        style={{
          width: CONTAINER_W,
          height: CONTAINER_H,
          borderRadius: '50%',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Ảnh đang phân tích"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* SVG landmark dots — dùng class .landmark-dot từ globals.css */}
        {dots.length > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${CONTAINER_W} ${CONTAINER_H}`}
            aria-hidden="true"
          >
            {dots.map((dot, i) => (
              <circle
                key={i}
                className="landmark-dot"
                cx={dot.cx.toFixed(2)}
                cy={dot.cy.toFixed(2)}
                r="2"
              />
            ))}
          </svg>
        )}
      </div>

      {/* Cycling status text */}
      <p
        className="text-base font-medium text-neutral-700 text-center"
        style={{ minHeight: '24px' }}
        aria-live="polite"
        aria-atomic="true"
      >
        {MESSAGES[msgIdx]}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500"
            style={{
              animation: `progressGrow ${MIN_DISPLAY_MS}ms linear forwards`,
            }}
          />
        </div>
        <p className="mt-1.5 text-right text-[11px] text-neutral-400">
          {landmarks ? '100%' : '…'}
        </p>
      </div>

      {/* Privacy footer */}
      <p className="flex items-center gap-1.5 text-xs text-neutral-400">
        <LockIcon />
        Ảnh không rời khỏi máy bạn
      </p>
    </div>
  );
}

/* ── Error state ── */

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </span>
      <div>
        <p className="text-base font-semibold text-neutral-900">
          Không phân tích được
        </p>
        <p className="mt-1 text-sm text-neutral-500 whitespace-pre-line leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}

/* ── Icons ── */

function LockIcon() {
  return (
    <svg
      width="12"
      height="12"
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
