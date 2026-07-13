/**
 * lib/geometry/angles.ts — Module 2: Geometric Analysis
 * Tính góc khuôn mặt từ 468 landmark MediaPipe Face Mesh
 * Input : landmarks[] — mảng 468 phần tử {x, y, z} normalize [0, 1]
 * Output: góc theo đơn vị độ (°)
 *
 * Chuẩn Á Đông (CLAUDE.md):
 *   Nasolabial  : 90-100°
 *   Nasofrontal : 115-130°
 */

import { euclideanZ } from './distances';

type Pt = { x: number; y: number; z?: number };

/**
 * Góc (độ) tại đỉnh B — định lý cos. Dùng bởi các util bên ngoài nếu cần.
 */
export function angleFromThreePoints(A: Pt, B: Pt, C: Pt): number {
  const a = euclideanZ(B, C);
  const b = euclideanZ(B, A);
  const c = euclideanZ(A, C);
  if (a === 0 || b === 0) {
    throw new Error('angleFromThreePoints: hai điểm trùng nhau.');
  }
  const cos = Math.max(-1, Math.min(1, (a * a + b * b - c * c) / (2 * a * b)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * Hằng số giải phẫu học: nasion cách chóp mũi ~15% chiều rộng mặt theo chiều sâu.
 * Dùng làm tham chiếu để chuẩn hoá z per-photo cho calculateNasolabial.
 */
const TARGET_DEPTH = 0.15;

/**
 * Chuẩn hoá z dựa trên khoảng cách z giữa chóp mũi (lm[1]) và nasion (lm[6]).
 * Đặt chóp mũi = z 0, scale để nasion = TARGET_DEPTH — tự hiệu chỉnh per-photo.
 */
function makeNorm(landmarks: ReadonlyArray<Pt>): (p: Pt) => Pt {
  const zTip    = landmarks[1].z ?? 0;
  const zNasion = landmarks[6].z ?? 0;
  const zRange  = zNasion - zTip; // dương: nasion kém nhô hơn chóp
  const scale   = zRange > 0.003 ? TARGET_DEPTH / zRange : 5;
  return (p: Pt): Pt => ({ x: p.x, y: p.y, z: ((p.z ?? 0) - zTip) * scale });
}

/**
 * Góc mũi môi (Nasolabial angle)
 *
 * Công thức: nasolabial = 90° + arctan(dy / dz_norm)
 *   - dy      = |y_subnasale − y_tip|         : span dọc trụ mũi (tọa độ y chính xác)
 *   - dz_norm = z_subnasale sau khi makeNorm  : độ nhô chuẩn hoá per-photo
 *   - Kết quả phản ánh độ nghiêng của trụ mũi (columella) so với đường nằm ngang
 *
 * Tại sao KHÔNG dùng công thức 3-điểm + z-scaling:
 *   z-depth của lm[0] (môi) từ MediaPipe quá nhỏ và không ổn định → kết quả
 *   lệch 10-30° giữa các ảnh khác nhau dù cùng một khuôn mặt.
 *
 * Landmark indices: 1 = chóp mũi, 2 = subnasale (đỉnh), 0 = viền trên môi
 */
export function calculateNasolabial(landmarks: ReadonlyArray<Pt>): number {
  const n   = makeNorm(landmarks);
  const tip = n(landmarks[1]); // z_norm ≡ 0 (điểm tham chiếu)
  const sub = n(landmarks[2]);
  const dy  = Math.abs(sub.y - tip.y);               // span dọc ≥ 0
  const dz  = Math.abs((sub.z ?? 0) - (tip.z ?? 0)); // z_sub_norm > 0
  if (dz < 0.005) return 95; // fallback khi z quá phẳng (ảnh chụp xa)
  return 90 + (Math.atan2(dy, dz) * 180) / Math.PI;
}

/**
 * Góc mũi trán (Nasofrontal angle)
 *
 * Công thức: nasofrontal = 180° − arctan(TARGET_DEPTH / dy)
 *   - dy = y_tip − y_nasion : span dọc từ nasion đến chóp mũi (tọa độ y)
 *   - TARGET_DEPTH = 0.15   : hằng số giải phẫu học (chóp mũi nhô ra 15%
 *                              chiều rộng mặt so với nasion)
 *
 * Tại sao CHỈ dùng tọa độ y:
 *   Tọa độ y đo chính xác từ ảnh chính diện (không bị nén như z).
 *   Mọi z-amplification dù cố định hay normalize đều cho kết quả khác nhau
 *   giữa các ảnh vì z-depth của inner eye corners không nhất quán.
 *
 *   Kết quả: nasion-to-tip ngắn (mũi ngắn) → góc nhỏ hơn (bridge sắc hơn);
 *            nasion-to-tip dài (mũi dài)  → góc lớn hơn (bridge mở hơn).
 *
 * Landmark indices: 6 = nasion, 1 = chóp mũi
 */
export function calculateNasofrontal(landmarks: ReadonlyArray<Pt>): number {
  const dy = landmarks[1].y - landmarks[6].y; // dương: chóp mũi thấp hơn nasion
  if (dy < 0.01) return 122;                  // fallback khi face quá nhỏ trong ảnh
  return 180 - (Math.atan2(TARGET_DEPTH, dy) * 180) / Math.PI;
}
