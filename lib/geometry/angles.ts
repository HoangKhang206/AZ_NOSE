/**
 * lib/geometry/angles.ts — Module 2: Geometric Analysis
 * Tính góc khuôn mặt từ 468 landmark MediaPipe Face Mesh
 * Input : landmarks[] — mảng 468 phần tử {x, y, z} normalize [0, 1]
 * Output: góc theo đơn vị độ (°)
 *
 * Chuẩn Á Đông (CLAUDE.md):
 *   Nasolabial  : 90-100° (nam), 95-105° (nữ)
 *   Nasofrontal : 115-130°
 */

import { euclidean, type Point } from './distances';

/**
 * Góc (độ) tại đỉnh B trong tam giác ABC — định lý cos:
 *   cos(θ) = (a² + b² - c²) / (2ab)
 *   a = |BC|, b = |BA|, c = |AC|
 */
export function angleFromThreePoints(A: Point, B: Point, C: Point): number {
  const a = euclidean(B, C); // |BC|
  const b = euclidean(B, A); // |BA|
  const c = euclidean(A, C); // |AC|

  if (a === 0 || b === 0) {
    throw new Error(
      'angleFromThreePoints: hai điểm trùng nhau, không tính được góc.',
    );
  }

  // Clamp về [-1, 1] để tránh NaN do floating-point ở tam giác gần thoái hóa
  const cosTheta = Math.max(-1, Math.min(1, (a * a + b * b - c * c) / (2 * a * b)));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

/**
 * Góc mũi môi (Nasolabial angle) — đo tại đỉnh = subnasale (chân mũi, index 2)
 *
 * Cách đo: góc giữa trụ mũi (đến chóp mũi, index 1) và viền môi trên (index 0).
 * Vertex = index 2 (subnasale — điểm nối trụ mũi và môi).
 *
 * Landmark indices:
 *   1   = chóp mũi (pronasale)
 *   2   = chân mũi / subnasale
 *   0   = điểm giữa viền trên môi
 */
export function calculateNasolabial(
  landmarks: ReadonlyArray<Point>,
): number {
  return angleFromThreePoints(landmarks[1], landmarks[2], landmarks[0]);
}

/**
 * Góc mũi trán (Nasofrontal angle) — đo tại đỉnh = gốc mũi (nasion, index 6)
 *
 * Cách đo: góc giữa đường từ vùng trán/glabella (index 168) xuống nasion
 * và đường từ nasion đến chóp mũi (index 1).
 * Vertex = index 6 (nasion — điểm trũng nối trán và sống mũi).
 *
 * Landmark indices:
 *   168 = glabella / vùng trán gần gốc mũi
 *   6   = gốc mũi / nasion (đỉnh góc)
 *   1   = chóp mũi
 */
export function calculateNasofrontal(
  landmarks: ReadonlyArray<Point>,
): number {
  return angleFromThreePoints(landmarks[168], landmarks[6], landmarks[1]);
}
