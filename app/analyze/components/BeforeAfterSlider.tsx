'use client';

/**
 * BeforeAfterSlider — Module 3 UI
 * Input : image (blob URL), landmarks (LandmarkResult)
 * Output: draggable before/after canvas with AR silhouette overlay
 *
 * Canvas dưới: ảnh gốc (before)
 * Canvas trên: ảnh gốc + silhouette, clip-path cắt phần phải theo slider
 * Drag via Pointer Events + setPointerCapture (hỗ trợ cả mouse và touch)
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { renderSilhouette } from '@/lib/silhouette/render';
import type { LandmarkResult } from '@/lib/mediapipe/landmarks';

interface BeforeAfterSliderProps {
  image: string;
  landmarks: LandmarkResult;
}

export default function BeforeAfterSlider({ image, landmarks }: BeforeAfterSliderProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const afterCanvasRef  = useRef<HTMLCanvasElement>(null);

  const [sliderPos, setSliderPos]     = useState(50);       // % from left
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 5);
  const [isReady, setIsReady]         = useState(false);

  /* ── Render both canvases once image is loaded ── */
  useEffect(() => {
    let cancelled = false;

    const img = new Image();
    img.onload = async () => {
      if (cancelled) return;

      const ar = img.naturalWidth / img.naturalHeight;
      setAspectRatio(ar);

      const W = containerRef.current?.offsetWidth ?? 280;
      const H = Math.round(W / ar);

      for (const ref of [beforeCanvasRef, afterCanvasRef]) {
        if (ref.current) {
          ref.current.width = W;
          ref.current.height = H;
        }
      }

      // Before: plain image
      const bCtx = beforeCanvasRef.current?.getContext('2d');
      if (bCtx) bCtx.drawImage(img, 0, 0, W, H);

      // After: image + silhouette
      if (!cancelled && afterCanvasRef.current) {
        await renderSilhouette({
          canvas: afterCanvasRef.current,
          image: img,
          landmarks: landmarks.landmarks,
        }).catch(() => {
          // Silhouette failed — after canvas keeps the base image at least
          const aCtx = afterCanvasRef.current?.getContext('2d');
          if (aCtx) aCtx.drawImage(img, 0, 0, W, H);
        });
      }

      if (!cancelled) setIsReady(true);
    };
    img.onerror = () => {
      if (!cancelled) setIsReady(true);
    };
    img.src = image;

    return () => { cancelled = true; };
  }, [image, landmarks]);

  /* ── Pointer drag on handle ── */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      setSliderPos(Math.max(2, Math.min(98, (x / rect.width) * 100)));
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    [],
  );

  /* ══════════════════════════════ RENDER ══════════════════════════════ */

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-md select-none"
      style={{ aspectRatio: `${aspectRatio}` }}
    >
      {/* Before canvas — always fully visible */}
      <canvas
        ref={beforeCanvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* After canvas — right side clipped by slider position */}
      <canvas
        ref={afterCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      />

      {/* ── Drag handle ── */}
      <div
        className="absolute inset-y-0 z-10 flex items-center justify-center touch-none"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)', width: 40 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Vertical divider line */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/80 shadow" />

        {/* Circle handle */}
        <div
          className="relative z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center cursor-col-resize"
          aria-label="Kéo để so sánh trước / sau"
        >
          <span className="text-[11px] font-semibold text-neutral-500 leading-none select-none">
            ◀▶
          </span>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute bottom-2.5 left-3 pointer-events-none text-[10px] text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
        Hiện tại
      </span>
      <span className="absolute bottom-2.5 right-3 pointer-events-none text-[10px] text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
        Mô phỏng
      </span>

      {/* Loading overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
