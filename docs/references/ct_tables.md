# CT Tables — Templates dùng chung

Các bảng tái sử dụng nhiều lần trong PA2, PA3 và báo cáo cuối kỳ. Load file này khi user hỏi về stakeholder, requirements, hoặc WBS.

---

## 1. Stakeholder Analysis Table

Template chuẩn 4 cột. Với AZ FACE INSIGHT phải có ≥ 9 stakeholder.

| Bên liên quan | Vai trò | Nhu cầu chính | Mức ảnh hưởng |
|---|---|---|---|
| Ban giám đốc AZ NOSE | Chủ dự án, phê duyệt ngân sách | ROI rõ ràng, tăng doanh thu, hình ảnh thương hiệu tốt | Rất cao |
| Bác sĩ AZ NOSE | Cung cấp tri thức chuyên môn cho RAG | Nội dung đúng y đức, không bị AI làm giả danh tính | Rất cao |
| Đội Sales | Nhận và chốt lead từ chatbot | Lead chất lượng có context sẵn, không bị spam | Cao |
| Khách hàng (18-30, mobile) | Người sử dụng cuối | Trải nghiệm mượt, riêng tư, thông tin trung thực | Rất cao |
| Đội Marketing | Truyền thông và thu hút traffic | Có material chia sẻ (shareable card), insight khách hàng | Trung bình |
| Đội Dev / triển khai | Xây dựng và vận hành | Spec rõ ràng, ổn định, không thay đổi liên tục | Cao |
| Luật sư / Compliance | Giám sát tuân thủ | Consent chuẩn, không cam kết y khoa, có kill switch | Cao |
| Cơ quan quản lý | Giám sát pháp lý bên ngoài | Tuân thủ Nghị định 13, Luật Quảng cáo | Rất cao |
| Đối thủ cạnh tranh | Không trực tiếp tham gia | Có thể copy giao diện, không copy được kho tri thức | Gián tiếp |

**Lưu ý**: Cột "Nhu cầu" phải cụ thể, KHÔNG viết chung chung như "muốn app tốt".

---

## 2. MoSCoW Requirements Table

Phân loại yêu cầu theo 4 nhóm ưu tiên.

### Must have (thiếu = fail)
- Upload/chụp 3 góc ảnh (chính diện, 45°, 90°)
- MediaPipe rải landmark chính xác
- Tính 3 chỉ số cốt lõi + so chuẩn Á Đông
- Consent minh bạch + kiểm tra tuổi ≥ 18
- Client-side processing (tuân thủ Nghị định 13)
- Text kết quả (template hoặc RAG đều được)
- CTA đặt lịch dẫn đến flow của aznose.vn
- Responsive mobile-first
- GA4 tracking cơ bản

### Should have (nên có ngay MVP)
- AR silhouette overlay (Cấp độ 2) + Before/After slider
- Chatbot AI-2 với KB kinh doanh
- Shareable result card cho viral loop
- Meta Pixel retargeting
- Handoff sang Zalo/Messenger
- Case tương tự (Before/After khách cũ)

### Could have (nếu thời gian cho phép)
- Đa ngôn ngữ EN/KR
- Video bác sĩ giải thích kết quả
- Referral tracking
- Voice input cho chatbot
- Đặt lịch inline
- So sánh nhiều dáng mũi cùng lúc

### Won't have (MVP không làm)
- AR 3D photo-realistic (Cấp độ 3)
- Native app iOS/Android
- Model AI tự huấn luyện
- Tích hợp CRM full-scale
- Payment inline

---

## 3. Work Breakdown Structure (WBS)

Phân theo 6 module × 5 giai đoạn.

### Module A — Frontend & UX
- A1. Điểm vào + smooth-scroll trong aznose.vn
- A2. Input zone (upload + camera + quality check)
- A3. Consent popup + age verification
- A4. Processing screen animation
- A5. Dashboard output (mobile + desktop layout)
- A6. Chatbot UI
- A7. Popup CTA + shareable card
- A8. Multi-angle switcher

### Module B — Xử lý ảnh & Đo lường
- B1. Image quality validator
- B2. MediaPipe integration
- B3. Landmark extraction
- B4. Geometric calculations
- B5. So chuẩn Á Đông
- B6. Face profile classification

### Module C — AI Phân tích (AI-1)
- C1. Knowledge base structure
- C2. Prompt template + guardrails
- C3. LLM API integration
- C4. Output validation + fallback
- C5. A/B testing framework

### Module D — AI Tư vấn (AI-2)
- D1. Business KB structure
- D2. Conversation state management
- D3. Intent classification
- D4. Product card rendering trong chat
- D5. Handoff mechanism
- D6. Chat log analysis pipeline

### Module E — AR Silhouette Overlay
- E1. Nose landmark identification per angle
- E2. Silhouette template library (7-10 dáng × 3 góc)
- E3. Canvas rendering
- E4. Before/After slider control
- E5. Watermark + disclaimer

### Module F — Tích hợp & Vận hành
- F1. CRM lead pushing
- F2. Analytics setup
- F3. Content moderation layer
- F4. Legal compliance (consent log, terms, privacy policy)
- F5. Monitoring + alerting + kill switch

---

## 4. Success Criteria Table (định lượng)

Sau 3 tháng go-live:

| Metric | Target | Cách đo |
|---|---|---|
| Tỷ lệ hoàn thành flow | ≥ 30% | GA4 event chain |
| Tỷ lệ chat sau kết quả | ≥ 20% | Chatbot open event |
| Tỷ lệ đặt lịch | ≥ 5% traffic | Form submit event |
| Vụ khiếu nại nội dung AI | 0 | Log thủ công + feedback button |
| Chi phí/lead giảm | ≥ 30% vs kênh hiện tại | Cost/conversion từ CRM |
| p95 latency landmarking | < 500ms | Performance API |
| p95 latency AI response | < 3000ms | Serverless log |

---

## 5. Risk Matrix (Impact × Probability)

| Rủi ro | Xác suất | Tác động | Đối phó |
|---|---|---|---|
| AI ảo giác | Cao | Rất cao | Guardrails + RAG cứng + human review |
| Bị Bộ Y tế xử lý | Trung | Rất cao | Luật sư review, disclaimer, không cam kết |
| Vi phạm Nghị định 13 | Trung | Cao | Client-side, consent, không lưu ảnh |
| Bác sĩ không có thời gian soạn KB | Cao | Cao | Booking cứng lịch, ghi âm |
| Chatbot bị prompt injection | Trung | Cao | System prompt phòng thủ, moderation |
| MediaPipe lag máy yếu | Cao | Trung | Web Worker, giảm landmark render |
| User cảm thấy bị chấm điểm | Trung | Trung | Ngôn ngữ khuyến khích, opt-out |
| Chi phí LLM vượt free tier | Thấp (MVP) | Trung | Monitor daily, kill switch |
| Đối thủ copy giao diện | Cao | Thấp | Moat = knowledge base |

---

## 6. Team Role Assignment Template

Điền tên thành viên nhóm N07 vào cột "Người phụ trách" khi triển khai.

| Vai trò | Module thuộc về | Người phụ trách | Backup |
|---|---|---|---|
| Frontend Lead | A, E | TODO | TODO |
| CV/Math Engineer | B | TODO | TODO |
| AI/Prompt Engineer | C, D | TODO | TODO |
| Content Curator (làm việc với bác sĩ) | C1, D1, E2 | TODO | TODO |
| DevOps/Integration | F | TODO | TODO |
| PM/QA | Toàn dự án | TODO | TODO |

---

## Lưu ý khi dùng các bảng này

- Copy sang báo cáo PA2/PA3 → **cần adapt câu chữ**, không paste nguyên xi.
- Số liệu Success Criteria phải khớp với ngân sách/timeline thật của nhóm.
- Team Role phải có backup để tránh mất người là mất module.
