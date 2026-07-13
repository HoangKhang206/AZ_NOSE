/**
 * lib/geometry/faceProfile.ts — Module 2: Geometric Analysis
 * Phân loại hình dạng khuôn mặt từ tỷ lệ chiều rộng/cao
 * Input : landmarks[] — mảng 468 phần tử {x, y, z} normalize [0, 1]
 * Output: FaceProfile enum string
 *
 * Demo mode: chỉ phân biệt ROUND / OVAL / LONG.
 * SQUARE và HEART cần thêm feature (góc hàm, đường chân tóc) — phase 2.
 *
 * Landmark indices dùng:
 *   234 = má trái (bizygomatic left)
 *   454 = má phải (bizygomatic right)
 *   10  = trán (trichion / forehead center)
 *   152 = cằm (menton)
 */

import { euclidean, type Point } from './distances';

export type FaceProfile = 'ROUND' | 'OVAL' | 'LONG' | 'SQUARE' | 'HEART';

interface ProfileBand {
  type: FaceProfile;
  minRatio: number; // inclusive lower bound
}

// Bands xếp từ cao xuống thấp; khớp với band đầu tiên thoả điều kiện ratio >= minRatio
//
// Ngưỡng được hiệu chỉnh theo tọa độ image-normalized của MediaPipe:
// Mặt thường chiếm 35-60% chiều rộng ảnh nhưng 60-80% chiều cao → ratio thực tế
// thấp hơn tỷ lệ cm thật (~0.78 oval) khoảng 10-25%. Do đó:
//   ROUND   ≥ 0.70  (clinical ≥ 0.88, bù trừ framing ~80%)
//   OVAL  0.55-0.70 (clinical 0.70-0.88)
//   LONG    < 0.55  (clinical < 0.70)
const PROFILE_BANDS: ProfileBand[] = [
  { type: 'ROUND', minRatio: 0.70 },
  { type: 'OVAL',  minRatio: 0.55 },
  { type: 'LONG',  minRatio: 0.00 }, // catch-all
];

/**
 * Phân loại hình dạng khuôn mặt.
 *
 * ratio = width / height
 *   > 0.85  → ROUND (mặt tròn)
 *   0.75-0.85 → OVAL (mặt oval, chuẩn)
 *   < 0.75  → LONG (mặt dài)
 *
 * Note: Demo JSON placeholder coords cho ratio ≈ 0.46 → LONG.
 * Kết quả OVAL chỉ đạt được với tọa độ từ MediaPipe thật (cheeks rộng hơn).
 */
export function classifyProfile(landmarks: ReadonlyArray<Point>): FaceProfile {
  const width  = euclidean(landmarks[234], landmarks[454]); // má trái → má phải
  const height = euclidean(landmarks[10],  landmarks[152]); // trán → cằm

  if (height === 0) {
    throw new Error('classifyProfile: khoảng cách trán-cằm = 0, dữ liệu landmark không hợp lệ.');
  }

  const ratio = width / height;
  const band = PROFILE_BANDS.find((b) => ratio >= b.minRatio)!;
  return band.type;
}

/** Trả về tỷ lệ thô để hiển thị trong Dashboard */
export function faceWidthHeightRatio(landmarks: ReadonlyArray<Point>): number {
  const width  = euclidean(landmarks[234], landmarks[454]);
  const height = euclidean(landmarks[10],  landmarks[152]);
  return height > 0 ? width / height : 0;
}
