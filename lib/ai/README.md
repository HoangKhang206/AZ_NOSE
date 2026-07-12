# Module 4 — Dual-RAG Conversational AI

Kiến trúc AI 2 tầng với 2 vai trò tách biệt.

**Trạng thái**: 🚧 Chưa implement — Sprint 2 (AI-1) và Sprint 4 (AI-2).

---

## File dự kiến

- `analyzer.ts` — AI-1: sinh text đánh giá cá nhân hoá
- `advisor.ts` — AI-2: chatbot tư vấn kinh doanh
- `guardrails.ts` — Regex blocklist + validation
- `knowledgeBase.ts` — Load KB từ `docs/references/knowledge_base_*.md`
- `promptBuilder.ts` — Build system prompt theo template
- `fallback.ts` — Template fallback khi guardrails phát hiện vi phạm
- `handoff.ts` — Detect intent chuyển sang nhân viên thật

---

## Kiến trúc

```
AI-1 (Phân tích)
  ├── Input: measurements + faceProfile
  ├── KB: docs/references/knowledge_base_medical.md
  ├── Output: 3-4 câu tư vấn cá nhân hoá
  └── Guardrails: chặn từ cấm y khoa

AI-2 (Ngọc - Trợ lý tư vấn)
  ├── Input: user message + chat history + context
  ├── KB: docs/references/knowledge_base_business.md
  ├── Output: reply + optional product card + optional handoff
  └── Guardrails: chặn cam kết, so sánh đối thủ, giá sai
```

---

## Ràng buộc

- **CẤM ảo giác**: AI chỉ nói dựa trên KB, không tự bịa
- **CẤM cam kết y khoa**: guardrails regex chặn "chắc chắn", "100%", v.v.
- Guardrails phát hiện vi phạm → fallback template (không show error)
- p95 latency < 3000ms
- KHÔNG log ảnh, KHÔNG log measurements cá nhân hoá

Chi tiết: `docs/references/prompt_library.md` cho template prompt.

Chi tiết pháp lý: `docs/references/tech_constraints.md` section 1.
