# AZ FACE INSIGHT

Web-app phân tích tỷ lệ khuôn mặt + AI tư vấn cho **AZ NOSE** (chuyên sâu nâng mũi). Xây dựng trong khuôn khổ môn Tư duy Tính toán, HCMUS.

Xem [`docs/AZ_FACE_INSIGHT_MoTaDuAn.docx`](./docs/AZ_FACE_INSIGHT_MoTaDuAn.docx) cho tài liệu mô tả đầy đủ.

---

## 🎯 Bản chất dự án

Phân hệ nhúng vào `aznose.vn`, hoạt động theo 4 bước:

1. **Input** — User upload 3 ảnh (chính diện, 45°, 90°)
2. **Analyze** — MediaPipe rải 468 landmark, tính góc/tỷ lệ theo chuẩn Á Đông
3. **Advise** — AI-1 sinh text đánh giá, AR silhouette overlay đường viền dáng mũi đề xuất
4. **Convert** — Chatbot AI-2 tư vấn → CTA đặt lịch chụp CT 3D miễn phí

**4 sub-problem theo computational nature**:
- Face Landmarking (MediaPipe)
- Geometric Analysis (Euclidean + Cosine law)
- Silhouette AR Overlay (Canvas 2D + SVG anchored on landmark)
- Dual-RAG Conversational AI (LLM + Retrieval + Guardrails)

---

## 🚀 Bắt đầu

### Yêu cầu môi trường

- Node.js ≥ 18.17
- npm hoặc pnpm
- Trình duyệt hỗ trợ Web Camera API + WebGL (Chrome/Safari/Firefox mới nhất)

### Cài đặt

```bash
# Clone và cài dependency
git clone <repo-url>
cd az-face-insight
npm install

# Copy env template và điền các key cần thiết
cp .env.local.example .env.local
# → Mở .env.local, điền GEMINI_API_KEY, GOOGLE_SHEETS_ID, ...

# Chạy dev server
npm run dev
```

Mở `http://localhost:3000` để xem app.

---

## 📂 Cấu trúc thư mục

```
az-face-insight/
├── CLAUDE.md              ← Context always-on cho AI/CLI (Claude Code tự đọc)
├── docs/                  ← Tài liệu dự án + kho tri thức RAG
│   ├── SKILL.md           ← Bản gốc của CLAUDE.md
│   ├── references/        ← Guide chi tiết cho từng khía cạnh
│   └── assets/            ← Master context, demo data, silhouette templates
├── app/                   ← Next.js App Router (UI)
│   └── analyze/           ← Trang phân tích khuôn mặt
├── lib/                   ← Business logic
│   ├── mediapipe/         ← Module 1: Face Landmarking
│   ├── geometry/          ← Module 2: Geometric Analysis
│   ├── silhouette/        ← Module 3: AR Overlay
│   ├── ai/                ← Module 4: Dual-RAG AI
│   └── utils/             ← Analytics, image quality...
├── api/                   ← Serverless Functions (proxy LLM, push lead)
└── public/                ← Static assets (SVG templates, ảnh...)
```

---

## 🧠 Cách làm việc với Claude Code CLI

Repo này được thiết kế để làm việc **cùng Claude Code**. File [`CLAUDE.md`](./CLAUDE.md) ở root sẽ được CLI tự động đọc, hiểu ngay context dự án.

Khi cần code 1 module cụ thể, bảo CLI: *"Đọc `docs/references/code_patterns.md` section Module X rồi implement..."*.

Xem playbook prompt đầy đủ cho từng sprint trong lịch sử trao đổi hoặc [`docs/references/code_patterns.md`](./docs/references/code_patterns.md).

---

## ⚠️ Ràng buộc bắt buộc

Trước khi commit code, kiểm tra:

- [ ] **KHÔNG** upload ảnh khuôn mặt lên server (Nghị định 13/2023)
- [ ] **KHÔNG** hardcode LLM API key trong client
- [ ] **KHÔNG** cam kết kết quả y khoa trong output AI (Luật Quảng cáo)
- [ ] AI chỉ sinh nội dung dựa trên knowledge base (không tự bịa)
- [ ] Guardrails regex + fallback template có mặt trước mọi output AI
- [ ] Consent + kiểm tra tuổi ≥ 18 trước khi start analysis
- [ ] Watermark cố định trên ảnh After của AR silhouette

Chi tiết xem [`docs/references/tech_constraints.md`](./docs/references/tech_constraints.md).

---

## 📜 Scripts

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Dev server tại localhost:3000 |
| `npm run build` | Build production |
| `npm run start` | Start production build |
| `npm run lint` | ESLint |
| `npm run test` | Unit test (Vitest) |
| `npm run test:e2e` | E2E test (Playwright) |

---

## 🚨 Kill Switch

Trong sự cố (AI trả lời sai lan truyền tiêu cực, chi phí LLM tăng đột biến…), đổi ngay biến môi trường trên Vercel/Cloudflare dashboard:

```bash
FEATURE_AI1_ENABLED=false    # Tắt AI phân tích, dùng template fallback
FEATURE_AI2_ENABLED=false    # Tắt chatbot, chuyển thẳng sang Zalo
MAINTENANCE_MODE=true        # Tắt toàn bộ /analyze route
```

Không cần redeploy code, đổi env vars là hiệu lực ngay.

---

## 📚 Đọc thêm

- [`CLAUDE.md`](./CLAUDE.md) — Context always-on cho AI/CLI
- [`docs/AZ_FACE_INSIGHT_MoTaDuAn.docx`](./docs/AZ_FACE_INSIGHT_MoTaDuAn.docx) — Tài liệu mô tả dự án đầy đủ
- [`docs/references/pa2_guide.md`](./docs/references/pa2_guide.md) — Cách viết báo cáo PA2
- [`docs/references/pa3_guide.md`](./docs/references/pa3_guide.md) — Cách viết báo cáo PA3
- [`docs/references/code_patterns.md`](./docs/references/code_patterns.md) — Pattern code cho từng module

---

## 📝 License

Đây là dự án học tập cho môn CT — HCMUS. Không dùng cho mục đích thương mại nếu chưa có sự đồng ý của AZ NOSE.
