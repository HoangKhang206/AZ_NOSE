/**
 * Unit tests — Module 2: Geometric Analysis
 *
 * NOTE về docs/assets/demo_landmarks.json:
 *   File này chứa tọa độ PLACEHOLDER (chưa chụp ảnh thật).
 *   Các điểm midline (mũi, môi) đều có x=0.5 → collinear → bất kỳ angle nào
 *   cũng ra 0° hoặc 180° với phép toán 2D.
 *   Bên cạnh đó, ratio má/chiều cao = 0.30/0.65 ≈ 0.46 → LONG, không phải OVAL.
 *   Giá trị expected trong JSON (92.5°, 118°, OVAL) là TARGET từ đo tay bác sĩ
 *   trên ảnh thật — KHÔNG thể reproduce từ tọa độ placeholder.
 *
 *   Các test dưới đây dùng tọa độ được TÍNH TOÁN để reproduce đúng expected values,
 *   xác nhận algorithm đúng. Khi có MediaPipe output thật, các test real-data
 *   sẽ thay thế trong Sprint 2+.
 */

import { describe, it, expect } from 'vitest';
import { euclidean, euclidean3d } from '../distances';
import { angleFromThreePoints, calculateNasolabial, calculateNasofrontal } from '../angles';
import { classifyProfile, faceWidthHeightRatio } from '../faceProfile';

/* ── Helper ── */

type Lm = { x: number; y: number; z: number };

/** Tạo mảng 468 landmarks, điền override tại các index chỉ định */
function mockLandmarks(overrides: Record<number, Lm>): Lm[] {
  const base = Array.from({ length: 468 }, () => ({ x: 0, y: 0, z: 0 }));
  for (const [idx, val] of Object.entries(overrides)) {
    base[Number(idx)] = val;
  }
  return base;
}

const lm = (x: number, y: number, z = 0): Lm => ({ x, y, z });
const ANGLE_TOL = 0.5; // độ — tolerance cho phép tính góc

/* ══════════════════════════════════════════
   euclidean / euclidean3d
══════════════════════════════════════════ */

describe('euclidean', () => {
  it('same point → 0', () => {
    expect(euclidean({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
  });

  it('3-4-5 right triangle → hypotenuse = 5', () => {
    expect(euclidean({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5, 5);
  });

  it('horizontal segment', () => {
    expect(euclidean({ x: 0, y: 0.5 }, { x: 0.3, y: 0.5 })).toBeCloseTo(0.3, 5);
  });
});

describe('euclidean3d', () => {
  it('same point → 0', () => {
    expect(euclidean3d({ x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 1 })).toBe(0);
  });

  it('sqrt(1+4+4) = 3 (1-2-2 in xyz)', () => {
    expect(euclidean3d({ x: 0, y: 0, z: 0 }, { x: 1, y: 2, z: 2 })).toBeCloseTo(3, 5);
  });
});

/* ══════════════════════════════════════════
   angleFromThreePoints
══════════════════════════════════════════ */

describe('angleFromThreePoints', () => {
  it('right angle at B = 90°', () => {
    // A=(1,0), B=(0,0), C=(0,1) → góc tại B giữa BA và BC = 90°
    const θ = angleFromThreePoints({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 });
    expect(θ).toBeCloseTo(90, 3);
  });

  it('equilateral triangle → 60° at each vertex', () => {
    const A = { x: 0,   y: 0 };
    const B = { x: 1,   y: 0 };
    const C = { x: 0.5, y: Math.sqrt(3) / 2 };
    expect(angleFromThreePoints(A, B, C)).toBeCloseTo(60, 3);
    expect(angleFromThreePoints(B, A, C)).toBeCloseTo(60, 3);
    expect(angleFromThreePoints(A, C, B)).toBeCloseTo(60, 3);
  });

  it('collinear points → 180°', () => {
    // A=(0,0), B=(1,0), C=(2,0) — B nằm giữa A và C
    const θ = angleFromThreePoints({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 });
    expect(θ).toBeCloseTo(180, 3);
  });

  it('throws when two points coincide', () => {
    expect(() =>
      angleFromThreePoints({ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.6, y: 0.6 }),
    ).toThrow();
  });
});

/* ══════════════════════════════════════════
   calculateNasolabial — góc mũi môi ≈ 92.5°
   Vertex = subnasale (index 2), A=nose_tip(1), C=upper_lip(0)
   Tọa độ được tính để reproduce 92.3° (trong biên ±0.5°)
══════════════════════════════════════════ */

describe('calculateNasolabial', () => {
  /**
   * Test landmarks:
   *   index 2 (subnasale, vertex) = (0.500, 0.600)
   *   index 1 (nose tip, lệch phải để tránh collinear) = (0.600, 0.596)
   *   index 0 (upper lip) = (0.500, 0.650)
   * Verified: angle ≈ 92.3° (node script)
   */
  const lms = mockLandmarks({
    0: lm(0.500, 0.650), // upper_lip
    1: lm(0.600, 0.596), // nose_tip
    2: lm(0.500, 0.600), // subnasale (vertex)
  });

  it('returns ~92.5° (target chuẩn Á Đông 90-100°)', () => {
    const angle = calculateNasolabial(lms);
    expect(Math.abs(angle - 92.5)).toBeLessThan(ANGLE_TOL);
  });

  it('kết quả nằm trong chuẩn Á Đông [90°, 105°]', () => {
    const angle = calculateNasolabial(lms);
    expect(angle).toBeGreaterThanOrEqual(90);
    expect(angle).toBeLessThanOrEqual(105);
  });
});

/* ══════════════════════════════════════════
   calculateNasofrontal — góc mũi trán ≈ 118°
   Vertex = nasion (index 6), A=glabella(168), C=nose_tip(1)
   Tọa độ được tính để reproduce 118.2° (trong biên ±0.5°)
══════════════════════════════════════════ */

describe('calculateNasofrontal', () => {
  /**
   * Test landmarks:
   *   index 6 (nasion, vertex) = (0.500, 0.420)
   *   index 168 (glabella, lệch phải) = (0.571, 0.382)
   *   index 1 (nose_tip) = (0.500, 0.560)
   * Verified: angle ≈ 118.2° (node script)
   */
  const lms = mockLandmarks({
    1:   lm(0.500, 0.560), // nose_tip
    6:   lm(0.500, 0.420), // nasion (vertex)
    168: lm(0.571, 0.382), // glabella
  });

  it('returns ~118° (target chuẩn Á Đông 115-130°)', () => {
    const angle = calculateNasofrontal(lms);
    expect(Math.abs(angle - 118)).toBeLessThan(ANGLE_TOL);
  });

  it('kết quả nằm trong chuẩn Á Đông [115°, 130°]', () => {
    const angle = calculateNasofrontal(lms);
    expect(angle).toBeGreaterThanOrEqual(115);
    expect(angle).toBeLessThanOrEqual(130);
  });
});

/* ══════════════════════════════════════════
   classifyProfile
══════════════════════════════════════════ */

describe('classifyProfile', () => {
  /**
   * Xây dựng landmark với width/height ratio mong muốn.
   * Cheeks ở y=0.55, height = 0.65 (trán y=0.20, cằm y=0.85).
   * Để ratio = r: width = r × 0.65 → mỗi cheek cách midline (0.5) là r×0.65/2.
   */
  function cheekLandmarks(ratio: number): Record<number, Lm> {
    const height = 0.65;
    const halfW = (ratio * height) / 2;
    return {
      234: lm(0.5 - halfW, 0.55), // left cheek
      454: lm(0.5 + halfW, 0.55), // right cheek
      10:  lm(0.50, 0.20),         // forehead
      152: lm(0.50, 0.85),         // chin
    };
  }

  it('OVAL: ratio 0.80', () => {
    const lms = mockLandmarks(cheekLandmarks(0.80));
    expect(classifyProfile(lms)).toBe('OVAL');
    expect(faceWidthHeightRatio(lms)).toBeCloseTo(0.80, 2);
  });

  it('ROUND: ratio 0.92 (> 0.85)', () => {
    const lms = mockLandmarks(cheekLandmarks(0.92));
    expect(classifyProfile(lms)).toBe('ROUND');
  });

  it('LONG: ratio 0.65 (< 0.75)', () => {
    const lms = mockLandmarks(cheekLandmarks(0.65));
    expect(classifyProfile(lms)).toBe('LONG');
  });

  it('ranh giới OVAL/ROUND: ratio = 0.85 → OVAL (inclusive lower)', () => {
    // 0.85 ≥ minRatio(OVAL) = 0.75 nhưng < 0.85 của ROUND?
    // ROUND band: ratio >= 0.85 → tại đúng 0.85 → ROUND
    const lms = mockLandmarks(cheekLandmarks(0.85));
    expect(classifyProfile(lms)).toBe('ROUND');
  });

  it('ranh giới OVAL/LONG: ratio = 0.75 → OVAL', () => {
    const lms = mockLandmarks(cheekLandmarks(0.75));
    expect(classifyProfile(lms)).toBe('OVAL');
  });

  it('throws khi height = 0', () => {
    const lms = mockLandmarks({ 234: lm(0,0), 454: lm(1,0), 10: lm(0.5,0.5), 152: lm(0.5,0.5) });
    expect(() => classifyProfile(lms)).toThrow();
  });
});

/* ══════════════════════════════════════════
   Demo JSON cross-check — documenting known mismatch
══════════════════════════════════════════ */

describe('Demo JSON cross-check (placeholder data)', () => {
  /**
   * Landmark positions từ docs/assets/demo_landmarks.json.
   * Tất cả midline points có x=0.5 → collinear → không tính được nasolabial/nasofrontal 2D.
   * faceProfile từ demo data cho LONG (ratio ≈ 0.46), không phải OVAL như expected_measurements.
   * Đây là behavior đúng của algorithm — mismatch nằm ở placeholder data, không phải code.
   */
  const demoSubset = mockLandmarks({
    0:   lm(0.500, 0.640, -0.020), // upper_lip_top
    1:   lm(0.500, 0.560, -0.030), // nose_tip
    6:   lm(0.500, 0.420, -0.020), // nose_bridge_top
    10:  lm(0.500, 0.200,  0.020), // forehead
    152: lm(0.500, 0.850,  0.030), // chin
    168: lm(0.500, 0.480, -0.025), // nose_bridge_mid
    234: lm(0.350, 0.550,  0.050), // left_cheek
    454: lm(0.650, 0.550,  0.050), // right_cheek
  });

  it('faceProfile từ demo coords = LONG (placeholder, không phải OVAL)', () => {
    // Cheeks quá hẹp trong placeholder: width/height ≈ 0.30/0.65 ≈ 0.46
    expect(classifyProfile(demoSubset)).toBe('LONG');
    const ratio = faceWidthHeightRatio(demoSubset);
    expect(ratio).toBeCloseTo(0.46, 1);
  });

  it('nasofrontal từ collinear midline points = 0° (degenerate)', () => {
    // index 168 (y=0.48) nằm DƯỚI vertex index 6 (y=0.42) → BA và BC cùng chiều → 0°
    // Trong screen coords y tăng xuống dưới: B(y=0.42) → A(y=0.48) → C(y=0.56) cùng hướng.
    // Để có góc có nghĩa, cần dữ liệu thật với index 168 ở trán (y < 0.42).
    const angle = calculateNasofrontal(demoSubset);
    expect(angle).toBeCloseTo(0, 0);
  });
});
