# Module 1 — Face Landmarking

Wrapper cho MediaPipe Face Mesh, chạy client-side qua CDN.

**Trạng thái**: 🚧 Chưa implement — Sprint 1.

---

## File dự kiến

- `init.ts` — load MediaPipe qua CDN, config maxNumFaces: 1
- `landmarks.ts` — hàm `extractLandmarks(image)` return 468 điểm 3D
- `worker.ts` — Web Worker chạy MediaPipe không block UI
- `constants.ts` — landmark indices quan trọng (mũi, mắt, môi, cằm)

---

## Input / Output

```typescript
// Input
type Input = HTMLImageElement | HTMLVideoElement;

// Output
type Landmark = { x: number; y: number; z: number };  // normalized [0, 1]
type LandmarkResult = {
  landmarks: Landmark[];      // 468 phần tử
  confidence: number;         // [0, 1]
  latencyMs: number;
};
```

---

## Ràng buộc

- Confidence < 0.7 → throw, buộc user chụp lại
- Phải chạy < 500ms trên iPhone 8
- KHÔNG cache landmark của user (privacy)

Chi tiết: `docs/references/code_patterns.md` section Module 1.
