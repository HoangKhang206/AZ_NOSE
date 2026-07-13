/**
 * lib/mediapipe/init.ts — Module 1: Face Landmarking
 * Input : void
 * Output: singleton FaceMeshInstance đã khởi tạo xong
 * Load runtime từ CDN (không bundle WASM vào Next.js build)
 * CDN đã được whitelist trong next.config.js CSP header
 */

const CDN_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619';
const SCRIPT_URL = `${CDN_BASE}/face_mesh.js`;
const SCRIPT_ID = 'az-mediapipe-face-mesh';

/* ── Minimal types (CDN runtime, không import npm bundle vào client) ── */

export interface NormalizedLandmark {
  x: number; // [0, 1] normalized theo chiều rộng ảnh
  y: number; // [0, 1] normalized theo chiều cao ảnh
  z: number; // depth tương đối — KHÔNG phải khoảng cách thật
}

export interface FaceMeshResults {
  multiFaceLandmarks: NormalizedLandmark[][];
  image: HTMLCanvasElement;
}

export interface FaceMeshInstance {
  setOptions(options: {
    maxNumFaces?: number;
    refineLandmarks?: boolean;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
  }): void;
  onResults(callback: (results: FaceMeshResults) => void): void;
  send(inputs: {
    image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
  }): Promise<void>;
  close(): void;
}

declare global {
  interface Window {
    FaceMesh: new (config: {
      locateFile: (file: string) => string;
    }) => FaceMeshInstance;
  }
}

/* ── Singleton internals ── */

let scriptPromise: Promise<void> | null = null;
let instancePromise: Promise<FaceMeshInstance> | null = null;
let instance: FaceMeshInstance | null = null;

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  // Script có thể đã được chèn từ trước (hot-reload)
  if (document.getElementById(SCRIPT_ID)) {
    scriptPromise = Promise.resolve();
    return scriptPromise;
  }
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_URL;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(
          `Không tải được MediaPipe từ CDN.\n` +
            `Kiểm tra kết nối mạng hoặc thử lại sau.\n(${SCRIPT_URL})`,
        ),
      );
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Trả về FaceMeshInstance đã init và sẵn sàng nhận send().
 * Gọi nhiều lần → cùng 1 instance (singleton), không tải lại.
 * Lưu ý: lần gọi send() đầu tiên có thể mất 1-3s để init WASM.
 */
export async function getFaceMesh(): Promise<FaceMeshInstance> {
  if (instance) return instance;
  if (instancePromise) return instancePromise;

  instancePromise = (async () => {
    await loadScript();

    if (typeof window === 'undefined' || !window.FaceMesh) {
      throw new Error(
        'MediaPipe FaceMesh không khả dụng. Đảm bảo chạy trên browser (không phải SSR).',
      );
    }

    const mesh = new window.FaceMesh({
      locateFile: (file) => `${CDN_BASE}/${file}`,
    });

    mesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    instance = mesh;
    return mesh;
  })();

  return instancePromise;
}

/** Giải phóng instance (gọi khi page unload hoặc test teardown) */
export function destroyFaceMesh(): void {
  instance?.close();
  instance = null;
  instancePromise = null;
  scriptPromise = null;
}
