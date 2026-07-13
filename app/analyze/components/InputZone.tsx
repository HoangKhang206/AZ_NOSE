'use client';

/**
 * InputZone — Module 1 input step (Sprint 1)
 * Input : void
 * Output: onStart(images: UploadedImages) — blob URLs; front bắt buộc, 45°/90° tuỳ chọn (DEMO_MODE)
 * Constraint: client-side only; validate ≥ 200×200 px và ≤ 10 MB; không gửi ảnh lên server
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_PX = 200;

/* ── Types ── */

type SlotKey = 'front' | 'angle45' | 'angle90';

interface SlotConfig {
  key: SlotKey;
  label: string;
  required: boolean;
}

interface ImageSlot {
  blobUrl: string | null;
  error: string | null;
}

type SlotsState = Record<SlotKey, ImageSlot>;

export interface UploadedImages {
  front: string;
  angle45: string | null;
  angle90: string | null;
}

interface InputZoneProps {
  onStart: (images: UploadedImages) => void;
}

/* ── Static config ── */

const SLOT_CONFIGS: SlotConfig[] = [
  { key: 'front',   label: 'Chính diện', required: true },
  { key: 'angle45', label: 'Nghiêng 45°', required: !DEMO_MODE },
  { key: 'angle90', label: 'Nghiêng 90°', required: !DEMO_MODE },
];

const INIT_SLOTS: SlotsState = {
  front:   { blobUrl: null, error: null },
  angle45: { blobUrl: null, error: null },
  angle90: { blobUrl: null, error: null },
};

/* ── Validation ── */

type ValidateResult = { ok: true; blobUrl: string } | { ok: false; error: string };

async function validateFile(file: File): Promise<ValidateResult> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'Ảnh quá lớn (tối đa 10 MB)' };
  }
  const blobUrl = URL.createObjectURL(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth < MIN_PX || img.naturalHeight < MIN_PX) {
        URL.revokeObjectURL(blobUrl);
        resolve({ ok: false, error: `Ảnh quá nhỏ (tối thiểu ${MIN_PX}×${MIN_PX} px)` });
      } else {
        resolve({ ok: true, blobUrl });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      resolve({ ok: false, error: 'Không đọc được file ảnh' });
    };
    img.src = blobUrl;
  });
}

/* ── Main component ── */

export default function InputZone({ onStart }: InputZoneProps) {
  const [slots, setSlots] = useState<SlotsState>(INIT_SLOTS);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  // Khi onStart được gọi, blob URLs đã được handoff → không revoke khi unmount
  const handedOffRef = useRef(false);

  // Revoke all blob URLs on unmount (chỉ khi chưa handoff)
  useEffect(() => {
    return () => {
      if (!handedOffRef.current) {
        Object.values(slotsRef.current).forEach((s) => {
          if (s.blobUrl) URL.revokeObjectURL(s.blobUrl);
        });
      }
    };
  }, []);

  // Stop camera stream when stream state changes (handles unmount + manual close)
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const updateSlot = useCallback((key: SlotKey, data: Partial<ImageSlot>) => {
    setSlots((prev) => {
      const old = prev[key];
      // Revoke old URL when replacing
      if ('blobUrl' in data && old.blobUrl && old.blobUrl !== data.blobUrl) {
        URL.revokeObjectURL(old.blobUrl);
      }
      return { ...prev, [key]: { ...old, ...data } };
    });
  }, []);

  const handleFile = useCallback(
    async (key: SlotKey, file: File) => {
      updateSlot(key, { error: null });
      const result = await validateFile(file);
      if (result.ok) {
        updateSlot(key, { blobUrl: result.blobUrl, error: null });
      } else {
        updateSlot(key, { blobUrl: null, error: result.error });
      }
    },
    [updateSlot],
  );

  const handleRemove = useCallback((key: SlotKey) => {
    setSlots((prev) => {
      if (prev[key].blobUrl) URL.revokeObjectURL(prev[key].blobUrl!);
      return { ...prev, [key]: { blobUrl: null, error: null } };
    });
  }, []);

  async function openCamera() {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(ms);
    } catch {
      alert(
        'Không thể truy cập camera.\n' +
          'Kiểm tra quyền trình duyệt hoặc đảm bảo dùng HTTPS / localhost.',
      );
    }
  }

  function closeCamera() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setSlots((prev) => {
          if (prev.front.blobUrl) URL.revokeObjectURL(prev.front.blobUrl);
          return { ...prev, front: { blobUrl: url, error: null } };
        });
      },
      'image/jpeg',
      0.92,
    );
    closeCamera();
  }

  const canStart = !!slots.front.blobUrl;

  function handleStart() {
    if (!canStart) return;
    handedOffRef.current = true;
    onStart({
      front: slots.front.blobUrl!,
      angle45: slots.angle45.blobUrl,
      angle90: slots.angle90.blobUrl,
    });
  }

  return (
    <div className="w-full">
      {/* 3-zone grid */}
      <div className="flex flex-col md:flex-row gap-4">
        {SLOT_CONFIGS.map((config) => (
          <UploadZone
            key={config.key}
            config={config}
            slot={slots[config.key]}
            onFile={(file) => handleFile(config.key, file)}
            onRemove={() => handleRemove(config.key)}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={openCamera}
          className="flex items-center justify-center gap-2 flex-1 rounded-xl border-2 border-neutral-200 py-3.5 text-sm font-medium text-neutral-700 hover:border-brand-400 hover:text-brand-400 transition-colors"
        >
          <CameraIcon />
          Chụp trực tiếp
        </button>
        <button
          type="button"
          onClick={handleStart}
          disabled={!canStart}
          className={[
            'flex-1 rounded-xl py-3.5 text-sm font-semibold text-white transition-all',
            canStart
              ? 'bg-brand-500 hover:bg-brand-600 cursor-pointer shadow-md hover:shadow-lg'
              : 'bg-neutral-300 cursor-not-allowed',
          ].join(' ')}
          aria-disabled={!canStart}
        >
          Bắt đầu phân tích
        </button>
      </div>

      {DEMO_MODE && (
        <p className="mt-3 text-center text-xs text-neutral-400">
          Demo: chỉ cần ảnh chính diện. Góc 45° và 90° là tuỳ chọn.
        </p>
      )}

      {stream && (
        <CameraModal
          stream={stream}
          videoRef={videoRef}
          onCapture={captureFrame}
          onClose={closeCamera}
        />
      )}
    </div>
  );
}

/* ── UploadZone ── */

interface UploadZoneProps {
  config: SlotConfig;
  slot: ImageSlot;
  onFile: (file: File) => void;
  onRemove: () => void;
}

function UploadZone({ config, slot, onFile, onRemove }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isPrimary = config.key === 'front';
  const isOptional = DEMO_MODE && !config.required;

  function handleClick() {
    if (!slot.blobUrl) inputRef.current?.click();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = ''; // allow re-selecting same file
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-sm font-semibold text-neutral-800">{config.label}</span>
        {isOptional ? (
          <span className="text-[11px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
            Tuỳ chọn
          </span>
        ) : (
          isPrimary && (
            <span className="text-[11px] font-medium text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">
              Bắt buộc
            </span>
          )
        )}
      </div>

      {/* Drop zone */}
      <div
        role={slot.blobUrl ? undefined : 'button'}
        tabIndex={slot.blobUrl ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={[
          'relative flex-1 min-h-[200px] md:min-h-[240px] rounded-xl border-2 border-dashed overflow-hidden transition-all',
          slot.blobUrl
            ? 'border-transparent cursor-default'
            : isPrimary
              ? 'bg-brand-50 border-brand-400 hover:border-brand-500 cursor-pointer active:opacity-80'
              : 'bg-neutral-50 border-neutral-300 hover:border-neutral-400 cursor-pointer active:opacity-80',
        ].join(' ')}
        aria-label={slot.blobUrl ? undefined : `Chọn ảnh ${config.label}`}
      >
        {slot.blobUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slot.blobUrl}
              alt={`Ảnh ${config.label}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label={`Xoá ảnh ${config.label}`}
            >
              <XIcon />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-4 select-none">
            <span
              className={[
                'flex h-12 w-12 items-center justify-center rounded-full',
                isPrimary ? 'bg-brand-100' : 'bg-neutral-100',
              ].join(' ')}
            >
              <PlusIcon brand={isPrimary} />
            </span>
            <span
              className={[
                'text-sm font-medium',
                isPrimary ? 'text-brand-500' : 'text-neutral-400',
              ].join(' ')}
            >
              Nhấn để chọn ảnh
            </span>
            <span className="text-xs text-neutral-400 text-center">
              JPEG · PNG · WebP · tối đa 10 MB
            </span>
          </div>
        )}
      </div>

      {slot.error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertIcon />
          {slot.error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleChange}
        aria-label={`Upload ảnh ${config.label}`}
      />
    </div>
  );
}

/* ── CameraModal ── */

interface CameraModalProps {
  stream: MediaStream;
  videoRef: React.RefObject<HTMLVideoElement>;
  onCapture: () => void;
  onClose: () => void;
}

function CameraModal({ stream, videoRef, onCapture, onClose }: CameraModalProps) {
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Camera chụp ảnh chính diện"
    >
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-[4/3] object-cover bg-black"
        />
        <div className="flex gap-3 p-4 bg-neutral-900">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-neutral-600 py-3 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={onCapture}
            className="flex-1 rounded-xl bg-brand-500 hover:bg-brand-600 py-3 text-sm font-semibold text-white transition-colors"
          >
            Chụp ảnh
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Icons ── */

function PlusIcon({ brand }: { brand: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={brand ? '#D85A30' : '#9ca3af'}
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function XIcon() {
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
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function AlertIcon() {
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
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
