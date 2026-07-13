/**
 * lib/geometry/distances.ts — Module 2: Geometric Analysis
 * Hàm đo khoảng cách Euclidean — nền tảng cho tất cả phép tính góc/tỷ lệ
 * Input : 2 điểm (2D hoặc 3D, normalize [0, 1])
 * Output: khoảng cách số thực không âm
 */

export interface Point {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/** Khoảng cách Euclidean 2D */
export function euclidean(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/** Khoảng cách Euclidean với z tùy chọn — z = 0 nếu không có (tương đương euclidean 2D) */
export function euclideanZ(
  p1: { x: number; y: number; z?: number },
  p2: { x: number; y: number; z?: number },
): number {
  const dz = (p2.z ?? 0) - (p1.z ?? 0);
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + dz * dz);
}

/**
 * Khoảng cách Euclidean 3D — dùng khi cần tính toán có z-depth
 * Lưu ý: z từ MediaPipe Face Mesh là depth tương đối, KHÔNG phải khoảng cách thật.
 * Dùng khi so sánh các cấu trúc ở cùng độ sâu (tương đối).
 */
export function euclidean3d(p1: Point3D, p2: Point3D): number {
  return Math.sqrt(
    (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2,
  );
}
