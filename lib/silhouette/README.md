# Module 3 — Silhouette AR Overlay

Vẽ đường viền dáng mũi đề xuất chồng lên ảnh gốc (Cấp độ 2, KHÔNG biến đổi ảnh).

**Trạng thái**: 🚧 Chưa implement — Sprint 3.

---

## File dự kiến

- `render.ts` — hàm `renderSilhouette(canvas, image, landmarks, template)`
- `templates.ts` — registry các dáng mũi (S-line, L-line...)
- `anchors.ts` — mapping landmark → điểm anchor trên SVG path
- `watermark.ts` — vẽ watermark cố định (không thể ẩn qua CSS)

---

## Input / Output

```typescript
type SilhouetteTemplate = {
  id: string;
  shape: 'SLINE_NATURAL' | 'LLINE_STRAIGHT' | ...;
  angle: 'FRONTAL' | 'DEG45' | 'DEG90';
  paths: Array<{ d: string; anchors: string[] }>;
};

// Render vào canvas 2D, không return giá trị
function renderSilhouette(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  landmarks: Landmark[],
  template: SilhouetteTemplate
): void;
```

---

## Ràng buộc

- Đường viền lệch ≤ 5px so với vị trí mũi thật
- Watermark BẮT BUỘC: "Hình mô phỏng — kết quả thực tế có thể khác biệt"
- KHÔNG biến đổi ảnh gốc (đây là điểm khác Cấp độ 3)
- Opacity 0.7, màu tuỳ nền (cam trên sáng, trắng trên tối)

Chi tiết: `docs/references/code_patterns.md` section Module 3.

Template SVG lưu tại: `public/silhouette-templates/`.
