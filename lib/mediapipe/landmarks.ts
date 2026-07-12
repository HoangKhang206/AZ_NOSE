/**
 * lib/mediapipe/landmarks.ts — Module 1: Face Landmarking
 * Input : HTMLImageElement (đã load xong, naturalWidth/Height > 0)
 * Output: LandmarkResult — 468 điểm 3D [0,1] + confidence + latencyMs
 * Throws: nếu không phát hiện được mặt, confidence < MIN_CONFIDENCE, hoặc số điểm != 468
 *
 * Landmark indices quan trọng:
 *   chóp mũi = 1 | sống mũi = 6, 168, 195, 197 | cánh mũi = 129, 358
 *   (dùng bởi lib/geometry/ cho Module 2)
 */

import { getFaceMesh } from './init';
import type { NormalizedLandmark } from './init';

// Ngưỡng tối thiểu — MediaPipe v0.4 không expose raw score nên dùng proxy (xem bên dưới)
const MIN_CONFIDENCE = 0.5;

// MediaPipe Face Mesh luôn trả về đúng 468 landmarks khi phát hiện được mặt
const EXPECTED_LANDMARK_COUNT = 468;

export interface LandmarkResult {
  landmarks: NormalizedLandmark[]; // 468 phần tử; x, y ∈ [0, 1]
  confidence: number;              // [0, 1]
  latencyMs: number;               // tổng thời gian kể từ lúc gọi hàm
}

/**
 * Chạy MediaPipe Face Mesh trên ảnh và trả về 468 landmarks.
 *
 * Confidence note: MediaPipe Face Mesh v0.4 không expose raw detection confidence
 * trong results object (khác với SSD/BlazeFace). Nếu multiFaceLandmarks tồn tại
 * → mô hình đã vượt ngưỡng minDetectionConfidence = 0.5. Confidence proxy = 1.0.
 * Nếu sau này cần raw score, cần switch sang MediaPipe Tasks API (v0.10+).
 */
export async function extractLandmarks(
  imageEl: HTMLImageElement,
): Promise<LandmarkResult> {
  const t0 = performance.now();
  const mesh = await getFaceMesh();

  return new Promise<LandmarkResult>((resolve, reject) => {
    mesh.onResults((results) => {
      const latencyMs = Math.round(performance.now() - t0);

      if (
        !results.multiFaceLandmarks ||
        results.multiFaceLandmarks.length === 0
      ) {
        reject(
          new Error(
            'Không phát hiện được khuôn mặt.\n' +
              'Hãy chụp ảnh chính diện, đủ sáng, không đeo kính và không dùng filter làm đẹp.',
          ),
        );
        return;
      }

      const raw = results.multiFaceLandmarks[0];

      if (raw.length !== EXPECTED_LANDMARK_COUNT) {
        reject(
          new Error(
            `Landmark không hợp lệ: nhận được ${raw.length} điểm (cần ${EXPECTED_LANDMARK_COUNT}).`,
          ),
        );
        return;
      }

      const confidence = 1.0; // proxy — xem JSDoc ở trên

      if (confidence < MIN_CONFIDENCE) {
        reject(
          new Error(
            `Độ tin cậy thấp (${(confidence * 100).toFixed(0)}%). ` +
              'Vui lòng chụp lại ảnh rõ hơn.',
          ),
        );
        return;
      }

      resolve({
        landmarks: raw.map(({ x, y, z }) => ({ x, y, z })),
        confidence,
        latencyMs,
      });
    });

    mesh.send({ image: imageEl }).catch(reject);
  });
}
