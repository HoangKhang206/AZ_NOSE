# /analyze — Phân hệ phân tích khuôn mặt

Trang chính của dự án — nơi user upload ảnh và nhận kết quả.

**Trạng thái**: 🚧 Chưa implement — sẽ code trong Sprint 1-5.

---

## Cấu trúc dự kiến

```
app/analyze/
├── page.tsx                       ← Server component, wrap toàn bộ flow
└── components/
    ├── ConsentBanner.tsx          ← Sprint 0 (Nghị định 13)
    ├── InputZone.tsx              ← Sprint 1 (upload + camera)
    ├── ProcessingScreen.tsx       ← Sprint 1 (landmark animation)
    ├── Dashboard.tsx              ← Sprint 2 (kết quả + AI text)
    ├── BeforeAfterSlider.tsx      ← Sprint 3 (AR silhouette)
    ├── MetricCard.tsx             ← Sprint 2 (hiển thị góc/tỷ lệ)
    ├── Chatbot.tsx                ← Sprint 4 (chat với AI-2)
    ├── ProductCard.tsx            ← Sprint 4 (card trong chat)
    └── PopupCTA.tsx               ← Sprint 5 (đặt lịch)
```

---

## Flow state machine (dự kiến)

```
IDLE
  → CONSENT_GRANTED (user tick consent)
    → UPLOADING (đang chụp/upload)
      → PROCESSING (MediaPipe + Geometric)
        → SHOW_RESULT (Dashboard hiện ra)
          → CHATTING (Chatbot mở)
            → HANDOFF hoặc BOOKING
```

Đọc `docs/references/code_patterns.md` để biết chi tiết implement.
