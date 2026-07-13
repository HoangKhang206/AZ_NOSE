/**
 * lib/silhouette/render.ts — Module 3: AR Silhouette Overlay
 * Input : canvas, imageEl (loaded), landmarks[468], opacity
 * Output: canvas vẽ ảnh gốc + SVG overlay dạng soft-light blend
 *
 * Technique: soft-light compositing (không vẽ đường viền)
 *   - Vùng trắng trong SVG → làm sáng da bên dưới (bridge/tip trông nhô cao)
 *   - Vùng đen trong SVG  → làm tối da bên dưới (cánh mũi trông thu hẹp)
 *   - Kết quả blend với màu da thật → trông tự nhiên hơn line-art
 *
 * Anchor points:
 *   landmarks[168] (nose_bridge_top) → SVG (50, 20)
 *   landmarks[1]   (nose_tip)        → SVG (50, 65)
 * Scale = pixel_dist(168→1) / 45 SVG_units
 * Rotate = atan2(dy, dx) - π/2
 */

import type { NormalizedLandmark } from '@/lib/mediapipe/init';

const SVG_URL = '/silhouette-templates/sline-natural_frontal.svg';
const WATERMARK_TEXT = 'Hình mô phỏng — kết quả thực tế có thể khác biệt';

/* Anchor positions in SVG coordinate space (viewBox 0 0 100 100) */
const SVG_BRIDGE = { x: 50, y: 20 };
const SVG_TIP_Y = 65;
const SVG_BRIDGE_TO_TIP = SVG_TIP_Y - SVG_BRIDGE.y; // = 45

let svgCache: HTMLImageElement | null = null;

async function loadSvgImage(): Promise<HTMLImageElement> {
  if (svgCache) return svgCache;

  const res = await fetch(SVG_URL);
  if (!res.ok) throw new Error(`SVG fetch failed: ${res.status}`);

  const text = await res.text();
  const blob = new Blob([text], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      svgCache = img;
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG image failed to load'));
    };
    img.src = url;
  });
}

export interface RenderSilhouetteParams {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  landmarks: NormalizedLandmark[];
  opacity?: number;
}

export async function renderSilhouette({
  canvas,
  image,
  landmarks,
  opacity = 0.85,
}: RenderSilhouetteParams): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // 1. Draw base image
  ctx.drawImage(image, 0, 0, W, H);

  // 2. Load SVG template
  let svgImg: HTMLImageElement;
  try {
    svgImg = await loadSvgImage();
  } catch {
    drawWatermark(ctx, W, H);
    return;
  }

  // 3. Resolve anchor landmarks → canvas pixel coords
  const bridge = landmarks[168];
  const tip = landmarks[1];
  if (!bridge || !tip) {
    drawWatermark(ctx, W, H);
    return;
  }

  const bridgeX = bridge.x * W;
  const bridgeY = bridge.y * H;
  const tipX = tip.x * W;
  const tipY = tip.y * H;

  // 4. Compute scale and rotation
  const dx = tipX - bridgeX;
  const dy = tipY - bridgeY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) {
    drawWatermark(ctx, W, H);
    return;
  }

  const scale = dist / SVG_BRIDGE_TO_TIP;
  const angle = Math.atan2(dy, dx) - Math.PI / 2;

  // 5. Soft-light pass — white areas brighten, black areas darken underlying skin
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = opacity;
  ctx.translate(bridgeX, bridgeY);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.translate(-SVG_BRIDGE.x, -SVG_BRIDGE.y);
  ctx.drawImage(svgImg, 0, 0, 100, 100);
  ctx.restore();

  // 6. Mandatory watermark — cannot be suppressed via CSS
  drawWatermark(ctx, W, H);
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
): void {
  const fontSize = 11;
  const padH = 8;
  const padV = 5;
  const margin = 8;

  ctx.font = `${fontSize}px sans-serif`;
  const textW = ctx.measureText(WATERMARK_TEXT).width;
  const boxW = textW + padH * 2;
  const boxH = fontSize + padV * 2;
  const boxX = W - boxW - margin;
  const boxY = H - boxH - margin;

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.fillStyle = 'white';
  ctx.fillText(WATERMARK_TEXT, boxX + padH, boxY + padV + fontSize - 2);
}
