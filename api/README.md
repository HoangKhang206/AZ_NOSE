# API Routes — Serverless Functions

Các endpoint chạy dưới dạng Vercel/Cloudflare Function. **Chỉ để proxy LLM và push lead**, không xử lý ảnh.

**Trạng thái**: 🚧 Chưa implement.

---

## File dự kiến

- `analyze.ts` — Sprint 2: Proxy AI-1 (Gemini call + guardrails)
- `chat.ts` — Sprint 4: Proxy AI-2 (chatbot với state)
- `lead.ts` — Sprint 5: Push lead sang Google Sheets

---

## Ràng buộc chung

**Bảo mật**:
- KHÔNG accept ảnh trong body (khách phải xử lý client-side)
- CORS chỉ allow origin `aznose.vn` và localhost cho dev
- Rate limit theo IP hoặc session

**API keys**:
- LLM API key CHỈ nằm trong environment variables
- Không log key vào console/monitoring

**Fallback**:
- Nếu LLM API fail → return template fallback, KHÔNG return 500 cho client

Chi tiết: `docs/references/tech_constraints.md` section 6.

Chi tiết prompt: `docs/references/prompt_library.md`.
