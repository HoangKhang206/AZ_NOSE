'use client';

/**
 * app/analyze/page.tsx — Flow orchestrator (Sprint 2)
 * State machine: CONSENT → INPUT → PROCESSING → RESULT
 * Không upload ảnh lên server — blob URLs chỉ tồn tại trong tab (Nghị định 13/2023)
 */

import { useState, useCallback } from 'react';
import ConsentBanner from './components/ConsentBanner';
import InputZone, { type UploadedImages } from './components/InputZone';
import ProcessingScreen from './components/ProcessingScreen';
import Dashboard from './components/Dashboard';
import type { LandmarkResult } from '@/lib/mediapipe/landmarks';

/* ── Flow states ── */

type FlowState = 'CONSENT' | 'INPUT' | 'PROCESSING' | 'RESULT';

interface SessionData {
  images: UploadedImages;
  landmarks: LandmarkResult;
}

/* ══════════════════════════════════════════
   Page
══════════════════════════════════════════ */

export default function AnalyzePage() {
  const [flow, setFlow]         = useState<FlowState>('CONSENT');
  const [images, setImages]     = useState<UploadedImages | null>(null);
  const [session, setSession]   = useState<SessionData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ── Transitions ── */

  const handleConsent = useCallback(() => {
    setFlow('INPUT');
  }, []);

  const handleStart = useCallback((imgs: UploadedImages) => {
    setImages(imgs);
    setErrorMsg(null);
    setFlow('PROCESSING');
  }, []);

  const handleComplete = useCallback(
    (landmarks: LandmarkResult) => {
      if (!images) return;
      setSession({ images, landmarks });
      setFlow('RESULT');
    },
    [images],
  );

  const handleError = useCallback((err: Error) => {
    setErrorMsg(err.message);
    setFlow('INPUT');
  }, []);

  const handleFinish = useCallback(() => {
    setFlow('INPUT');
    setImages(null);
    setSession(null);
    setErrorMsg(null);
  }, []);

  /* ══════════════════════════════ RENDER ══════════════════════════════ */

  if (flow === 'CONSENT') {
    return <ConsentBanner onGranted={handleConsent} />;
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-100 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-sm font-bold text-brand-500 tracking-tight">
            AZ FACE INSIGHT
          </span>
          <span className="text-xs text-neutral-400">
            {flow === 'INPUT'      && 'Bước 1 / 3 — Tải ảnh'}
            {flow === 'PROCESSING' && 'Bước 2 / 3 — Phân tích'}
            {flow === 'RESULT'     && 'Bước 3 / 3 — Kết quả'}
          </span>
        </div>
      </header>

      {/* ── Step progress bar ── */}
      <div className="w-full h-0.5 bg-neutral-100">
        <div
          className="h-full bg-brand-500 transition-all duration-500"
          style={{
            width:
              flow === 'INPUT'      ? '33%'  :
              flow === 'PROCESSING' ? '66%'  :
              flow === 'RESULT'     ? '100%' : '0%',
          }}
        />
      </div>

      {/* ── Error toast ── */}
      {errorMsg && (
        <div
          role="alert"
          className="max-w-[1200px] mx-auto mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
        >
          {errorMsg}
        </div>
      )}

      {/* ── Flow steps ── */}
      {flow === 'INPUT' && (
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
          <InputZone onStart={handleStart} />
        </div>
      )}

      {flow === 'PROCESSING' && images && (
        <div className="flex items-center justify-center min-h-[calc(100vh-60px)] py-8">
          <ProcessingScreen
            image={images.front}
            onComplete={handleComplete}
            onError={handleError}
          />
        </div>
      )}

      {flow === 'RESULT' && session && (
        <Dashboard
          landmarks={session.landmarks}
          image={session.images.front}
          onFinish={handleFinish}
        />
      )}
    </main>
  );
}
