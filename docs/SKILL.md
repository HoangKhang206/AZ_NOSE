---
name: az-face-insight
description: "Use this skill when working on the AZ FACE INSIGHT project — a web-app for facial ratio analysis + AI advisory built for AZ NOSE (chuyên sâu nâng mũi), as a Computational Thinking course project (HCMUS). Triggers: mentions of 'AZ FACE INSIGHT', 'AZ NOSE web-app', 'PA2', 'PA3', 'báo cáo Problem Analysis', or requests to (1) generate Next.js/React/MediaPipe/RAG code for the four core modules — Face Landmarking, Geometric Analysis, Silhouette AR Overlay, Dual-RAG Conversational AI; (2) write or review Problem Analysis & Decomposition reports following the CT framework (ill-defined → well-defined, Stakeholder Mapping, Requirements MoSCoW, Decomposition by computational nature); (3) produce the Master Context block to paste into another LLM. Do NOT use for unrelated web-dev questions, other course assignments, or general cosmetic surgery topics."
version: 1.0.0
author: AZ FACE INSIGHT Team
---

# AZ FACE INSIGHT — Computational Thinking Project Skill

Skill này nén toàn bộ context dự án AZ FACE INSIGHT vào một nơi duy nhất, giúp Claude trả lời chính xác mà **không cần user paste lại context mỗi lần**.

## Project Snapshot (always-on context)

```
=== AZ FACE INSIGHT PROJECT CONTEXT ===
App      : Web-app phân tích tỷ lệ khuôn mặt + AI tư vấn nhúng trong aznose.vn
Target   : Mobile-first (85-90% traffic), desktop responsive
Frontend : Next.js hoặc React SPA (static hosting Vercel/Cloudflare Pages)
CV       : MediaPipe Face Mesh (Google, client-side, CDN load)
Backend  : Serverless Functions (Vercel/Cloudflare Workers) — chỉ proxy LLM API
LLM      : Gemini 1.5 Flash (free tier 1M tokens/ngày) hoặc Groq Llama 3.3
Storage  : Google Sheets API + Zapier (MVP), CRM AZ NOSE sau
Analytics: GA4 + Meta Pixel + Microsoft Clarity
Course   : Tư duy Tính toán (CT) — HCMUS

Hard constraints:
- KHÔNG upload ảnh khuôn mặt lên server → xử lý client-side (Nghị định 13/2023)
- KHÔNG hardcode LLM API keys trong client → proxy qua Serverless Function
- KHÔNG cam kết kết quả y khoa trong output AI (Luật Quảng cáo 2012)
- KHÔNG chẩn đoán y khoa cá nhân (Luật Khám bệnh, Chữa bệnh 2023)
- AI CHỈ được sinh nội dung dựa trên knowledge base (RAG, cấm ảo giác)
- Bắt buộc guardrails regex + fallback template trước khi hiển thị output AI
- Bắt buộc consent + kiểm tra tuổi ≥ 18 trước khi start analysis
- Bắt buộc watermark cố định trên ảnh After của AR silhouette

Reference standards:
- Nasolabial angle chuẩn Á Đông: 90-100° (không dùng chuẩn phương Tây 90-105°)
- Nasofrontal angle chuẩn Á Đông: 115-130°
- MediaPipe landmark indices: chóp mũi = 1, sống mũi = 6/168/195/197, cánh mũi = 129/358
- Free tier LLM quota để không vượt: Gemini 15 req/phút, 1M tokens/ngày
=== END CONTEXT ===
```

## 4 Computational Sub-problems (Decomposition theo nature, KHÔNG theo UI)

| # | Module | Core Computation | Key Threshold / Metric |
|---|---|---|---|
| 1 | **Face Landmarking** | Pre-trained CNN inference (MediaPipe Face Mesh) → 468 landmark 3D (x, y, z) | Confidence score ≥ 0.7, xử lý ≤ 500ms trên iPhone 8 |
| 2 | **Geometric Analysis** | Euclidean distance + Cosine law → góc/tỷ lệ + phân loại theo chuẩn Á Đông | Sai số góc ≤ 2° so với đo tay của bác sĩ |
| 3 | **Silhouette AR Overlay** | Landmark-anchored SVG path rendering trên Canvas 2D | Đường viền lệch ≤ 5px so với vị trí mũi thật |
| 4 | **Dual-RAG Conversational AI** | LLM + Knowledge Retrieval + Guardrails; 2 vai trò tách biệt: phân tích + tư vấn | 0 output vi phạm từ cấm, p95 latency < 3000ms |

## Routing logic — Load reference theo nhu cầu (token-saving)

| Nếu user hỏi về... | CHỈ load file này | Vì sao tách |
|---|---|---|
| Code Next.js/React/MediaPipe/RAG cho 1 module | `references/code_patterns.md` | Code dài → lazy load |
| Cách viết PA2 (First Draft) | `references/pa2_guide.md` | Chỉ dùng giai đoạn đầu |
| Cách viết PA3 (Well-defined + Pseudocode) | `references/pa3_guide.md` | Chỉ dùng sau MVP |
| Stakeholder / MoSCoW / WBS templates | `references/ct_tables.md` | Bảng riêng, dùng nhiều lần |
| Prompt mẫu cho AI-1 (phân tích) và AI-2 (tư vấn) | `references/prompt_library.md` | Tách để paste nhanh |
| Kho tri thức chuyên môn bác sĩ (RAG source cho AI-1) | `references/knowledge_base_medical.md` | Content dài, chỉ load khi bàn nội dung AI-1 |
| Kho tri thức kinh doanh (RAG source cho AI-2) | `references/knowledge_base_business.md` | Content dài, chỉ load khi bàn nội dung AI-2 |
| Nghị định 13, Luật QC, free tier limits, MediaPipe quota | `references/tech_constraints.md` | Tra cứu khi cần |
| Prompt/context để paste sang LLM khác | `assets/master_context.txt` | Tách để paste nhanh |
| Sample MediaPipe landmark output | `assets/demo_landmarks.json` | Chỉ khi debug/test |
| SVG template đường viền dáng mũi | `assets/silhouette_templates/` | Chỉ khi code module 3 |

> **Quy tắc tiết kiệm token**: chỉ đọc đúng 1 reference cần thiết. Không load nhiều file song song trừ khi câu hỏi giao thoa.

## 5 Pitfalls phải chặn ngay (theo slide LN02 thầy Hồ Tuấn Thành)

1. **Misframing** — Mô tả app & UI thay vì bài toán tính toán → luôn quy về `Input / Output / Operators / Evaluation / Constraints`.
2. **Decomposition theo màn hình** — sai. Phải chia theo *computational nature*: landmarking, geometric math, graphics rendering, controlled generative AI.
3. **Non-measurable definitions** — "đẹp", "hài hoà", "phù hợp" → phải định lượng (độ, tỷ lệ, ms, % lệch chuẩn).
4. **API key LLM trong client** — luôn proxy qua Serverless Function; client chỉ biết endpoint của mình.
5. **AI ảo giác nội dung y khoa** — luôn RAG cứng + guardrails regex + fallback template; không tin LLM mù quáng.

## Output style mặc định

- **Ngôn ngữ**: Tiếng Việt cho giải thích, English cho thuật ngữ kỹ thuật & code (đúng phong cách thầy chấm).
- **Code**: TypeScript/React ở client, Node.js cho Serverless Functions, đầu file luôn có comment ngắn nêu module + input/output.
- **Báo cáo**: Theo đúng thứ tự section trong `references/pa2_guide.md` hoặc `references/pa3_guide.md`. Mỗi claim định tính phải kèm tiêu chí đo lường được.
- **Trade-off**: Khi đề xuất giải pháp, luôn nêu rõ trade-off (chi phí, độ trễ, độ chính xác, rủi ro pháp lý).
- **Pháp lý first**: Bất kỳ đề xuất nào liên quan lưu trữ ảnh, đưa nội dung AI ra user, hoặc cam kết kết quả → luôn kiểm tra đối chiếu với `references/tech_constraints.md` trước.

## Cấu trúc thư mục skill (progressive disclosure)

```
az_face_insight/
├── SKILL.md                              ← file này (luôn load khi trigger)
├── references/                            ← lazy-load theo bảng routing ở trên
│   ├── code_patterns.md                  ← Next.js/React/MediaPipe/RAG template cho 4 module
│   ├── pa2_guide.md                      ← Hướng dẫn PA2 (First Draft)
│   ├── pa3_guide.md                      ← Hướng dẫn PA3 (Well-defined + Pseudocode)
│   ├── ct_tables.md                      ← Stakeholder, MoSCoW, WBS templates
│   ├── prompt_library.md                 ← Prompt mẫu cho AI-1 & AI-2, kèm guardrails
│   ├── knowledge_base_medical.md         ← Kho tri thức chuyên môn bác sĩ (RAG cho AI-1)
│   ├── knowledge_base_business.md        ← Kho tri thức kinh doanh (RAG cho AI-2)
│   └── tech_constraints.md               ← Nghị định 13, Luật QC, free tier limits
└── assets/
    ├── master_context.txt                ← Block paste nhanh sang LLM khác
    ├── demo_landmarks.json               ← Sample MediaPipe output cho test
    └── silhouette_templates/             ← SVG template 7-10 dáng mũi × 3 góc
        └── README.md                     ← Hướng dẫn cấu trúc SVG template
```

## Self-check trước khi trả lời (Claude tự kiểm)

- [ ] Đã quy bài toán về *Input / Output / Operators*?
- [ ] Đã định lượng mọi tiêu chí (độ, ms, %, count)?
- [ ] Có hardcode LLM API key không?
- [ ] Có gợi ý upload ảnh khuôn mặt lên server không?
- [ ] Output AI đã có guardrails + fallback chưa?
- [ ] Có cam kết kết quả y khoa trong nội dung không?
- [ ] Có nêu trade-off không?
- [ ] Có vượt free tier (Gemini 1M tokens/ngày, Vercel 100GB bandwidth/tháng) không?

Nếu bất kỳ ô nào không đạt → sửa trước khi trả lời user.
