# Code Patterns — AZ FACE INSIGHT

Lazy-load file này khi user hỏi về code cho 1 trong 4 module. Mỗi section chứa pattern code chuẩn, không copy-paste từ tutorial mà đã adapt cho ràng buộc dự án.

---

## Module 1 — Face Landmarking (MediaPipe Face Mesh)

### Input / Output
- **Input**: `HTMLImageElement` hoặc `HTMLVideoElement` (camera stream)
- **Output**: Array 468 landmark `{x: number, y: number, z: number}` normalized [0, 1]

### CDN load (thẻ `<head>`)
```html
<!-- TODO: điền CDN mediapipe/face_mesh -->
<!-- Note: dùng version pin, không dùng @latest để tránh breaking change -->
```

### Init & config
```typescript
// TODO: viết hàm initFaceMesh() với config maxNumFaces: 1
// Note: chạy trong Web Worker để không block UI thread trên máy yếu
```

### Điểm cần chú ý
- Confidence score `< 0.7` → hiện lại yêu cầu chụp lại
- Landmark indices quan trọng: chóp mũi (1), sống mũi (6, 168, 195, 197), cánh mũi (129, 358)
- Trục Z là depth tương đối, **không** phải khoảng cách thật

---

## Module 2 — Geometric Analysis

### Input / Output
- **Input**: Array 468 landmark từ Module 1
- **Output**: `{nasolabialAngle: number, nasofrontalAngle: number, symmetryRatio: number, faceProfile: string}`

### Công thức cốt lõi

**Euclidean distance** giữa 2 điểm (x1, y1) và (x2, y2):
```
d = sqrt((x2-x1)² + (y2-y1)²)
```

**Cosine law** để tính góc θ tạo bởi 3 điểm A, B, C (đỉnh B):
```
cos(θ) = (a² + b² - c²) / (2ab)
```
Trong đó a = |BC|, b = |BA|, c = |AC|.

### Skeleton
```typescript
// TODO: viết hàm calculateNasolabialAngle(landmarks)
// TODO: viết hàm calculateNasofrontalAngle(landmarks)
// TODO: viết hàm calculateSymmetry(landmarks)
// TODO: viết hàm classifyFaceProfile(measurements) → so với bảng chuẩn Á Đông
```

### Chuẩn Á Đông (KHÔNG dùng chuẩn phương Tây)
- Nasolabial: 90-100° (nam), 95-105° (nữ)
- Nasofrontal: 115-130°
- Tỷ lệ đối xứng: khoảng cách 2 mắt / độ rộng cánh mũi ≈ 1.0-1.3

---

## Module 3 — Silhouette AR Overlay

### Input / Output
- **Input**: Ảnh gốc user + landmark mũi + template dáng mũi được đề xuất
- **Output**: Ảnh gốc với đường viền dáng mũi mới vẽ chồng lên (không biến đổi ảnh gốc)

### Skeleton
```typescript
// TODO: viết hàm renderSilhouette(canvasEl, imageEl, noseLandmarks, silhouettePath)
// Note: dùng requestAnimationFrame cho slider Before/After
// Note: opacity 70%, màu tuỳ nền (cam trên nền sáng, trắng trên nền tối)
```

### Trade-off đã chốt
- **Chọn Cấp độ 2 (silhouette overlay), KHÔNG chọn Cấp độ 3 (photo-realistic warp)**
- Lý do: rủi ro pháp lý về quảng cáo gây hiểu nhầm + cần SDK trả phí + rủi ro chất lượng warp

### Watermark bắt buộc
- Text: "Hình mô phỏng — kết quả thực tế có thể khác biệt"
- Vị trí: góc dưới ảnh After, không thể tắt bằng CSS

---

## Module 4 — Dual-RAG Conversational AI

### Kiến trúc 2 tầng
- **AI-1 (Phân tích)**: sinh 3-4 câu đánh giá dựa trên `references/knowledge_base_medical.md`
- **AI-2 (Tư vấn)**: chatbot với `references/knowledge_base_business.md`

### Skeleton call LLM qua Serverless Function
```typescript
// api/analyze.ts (Vercel Function)
// TODO: đọc knowledge base + số liệu → build prompt → call LLM
// TODO: guardrails regex check output trước khi return
// TODO: fallback về template nếu output vi phạm
```

### Guardrails regex (blocklist)
```typescript
const BLOCKED_PATTERNS = [
  /chắc chắn/i,
  /cam kết/i,
  /100%/,
  /chữa khỏi/i,
  /không đau/i,
  /không biến chứng/i,
  // TODO: thêm khi phát hiện case mới
];
```

### Handoff logic (AI-2)
- Phát hiện intent "đặt lịch cụ thể" → chuyển sang CRM/Zalo
- Trả lời không thoả đáng 2 lần liên tiếp → gợi ý gặp nhân viên thật
- Câu hỏi y khoa chuyên sâu → gợi ý gặp bác sĩ

---

## Utility patterns cross-module

### Kiểm tra chất lượng ảnh (Laplacian variance cho độ nét)
```typescript
// TODO: viết hàm checkImageQuality(imageData) → {isBlurry, isDark, hasFace}
// Note: chạy trước khi feed vào MediaPipe để tiết kiệm tính toán
```

### Analytics tracking
```typescript
// TODO: wrap GA4 + Meta Pixel + Clarity trong 1 hàm track(eventName, props)
// Note: KHÔNG track landmark hoặc số liệu cá nhân — chỉ track hành vi (click, complete step)
```

---

## Lưu ý cuối

- **Không copy code từ tutorial trực tiếp** — mọi pattern phải qua adapter riêng của dự án.
- **Test trên iPhone 8 hoặc Android tầm trung** trước khi confirm hoàn thành module.
- **Đo p95 latency** cho mỗi module, không chỉ đo trung bình.
