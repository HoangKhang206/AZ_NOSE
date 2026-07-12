# Shared Utilities

Các helper dùng chung cho nhiều module.

**Trạng thái**: 🚧 Chưa implement.

---

## File dự kiến

- `imageQuality.ts` — Sprint 1: check độ sáng, độ nét (Laplacian variance)
- `analytics.ts` — Sprint 5: wrapper cho GA4 + Meta Pixel + Clarity
- `rateLimit.ts` — Sprint 2: in-memory rate limiter cho API routes
- `shareableCard.ts` — Sprint 5: generate ảnh 9:16 để chia sẻ TikTok/IG
- `consent.ts` — Sprint 0: manage consent state trong localStorage

---

## Ràng buộc chung

- KHÔNG track landmark hoặc số liệu cá nhân trong analytics
- Chỉ track hành vi (click, complete step)
- Consent log ghi timestamp + version, KHÔNG ghi IP/CCCD

Chi tiết: `docs/references/tech_constraints.md` section 6.
