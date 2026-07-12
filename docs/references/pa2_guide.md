# PA2 Guide — First Draft Problem Analysis

Hướng dẫn viết PA2 (First Draft) cho AZ FACE INSIGHT theo framework CT của thầy Hồ Tuấn Thành. PA2 = **định hình bài toán từ ill-defined sang well-defined**, chưa cần pseudocode chi tiết.

---

## Cấu trúc PA2 chuẩn (theo slide LN02)

### Section 1 — Ill-defined Problem Statement
Nêu bài toán ở dạng khách hàng/user hỏi. **KHÔNG được** đưa ra giải pháp ở đây.

Với AZ FACE INSIGHT, câu ill-defined mẫu:
> "Làm thế nào để nhiều khách hàng biết đến AZ NOSE hơn và chủ động đến phòng khám tư vấn?"

Chỉ ra 3 lý do câu này ill-defined:
1. Không có tiêu chí đo lường ("nhiều hơn" là bao nhiêu?)
2. Không xác định ràng buộc (ngân sách, thời gian, kênh)
3. Nhiều giải pháp khả dĩ hoàn toàn khác nhau (TVC, KOLs, web-app…)

### Section 2 — Stakeholder Analysis
Bảng ≥ 5 stakeholder với 4 cột: vai trò, nhu cầu, mức ảnh hưởng, mức quan tâm.

Xem template chi tiết ở `references/ct_tables.md`.

### Section 3 — Initial Requirements (MoSCoW draft)
Chưa cần hoàn chỉnh, chỉ liệt kê được các Must-have cốt lõi.

Với AZ FACE INSIGHT, Must-have cốt lõi:
- Upload/chụp 3 góc ảnh
- MediaPipe rải landmark trên ảnh thật
- Tính 3 chỉ số cơ bản
- Consent + kiểm tra tuổi
- Client-side processing (tuân thủ Nghị định 13)
- CTA đặt lịch dẫn về flow có sẵn của aznose.vn

### Section 4 — Assumptions & Constraints
Liệt kê ≥ 5 assumption và ≥ 3 constraint pháp lý.

Với AZ FACE INSIGHT:
- Assumption: 85-90% traffic mobile, bác sĩ có ≥ 3 buổi × 2 giờ soạn KB, có dev full-stack…
- Constraint: Nghị định 13/2023, Luật Quảng cáo 2012, Luật Khám bệnh 2023, free tier budget…

### Section 5 — Success Criteria (định lượng)
**Cấm định tính** — mọi criteria phải có con số + đơn vị + mốc thời gian.

Với AZ FACE INSIGHT (sau 3 tháng go-live):
- Tỷ lệ hoàn thành flow ≥ 30%
- Tỷ lệ chat sau xem kết quả ≥ 20%
- Tỷ lệ đặt lịch ≥ 5% traffic
- 0 vụ khiếu nại về nội dung AI
- Chi phí/lead giảm ≥ 30% so với kênh hiện tại

### Section 6 — Well-defined Problem Statement
Tổng hợp Section 1-5 thành 1 đoạn văn có ràng buộc rõ ràng, đo lường được, và dẫn tới quyết định thiết kế cụ thể.

Xem mẫu trong tài liệu `AZ_FACE_INSIGHT_MoTaDuAn.docx` — Section 2.2.

---

## Checklist trước khi nộp PA2

- [ ] Câu ill-defined chưa gợi ý giải pháp?
- [ ] Có ≥ 5 stakeholder được phân tích?
- [ ] Có ≥ 5 assumption ghi rõ ràng?
- [ ] Success criteria đều **có con số + đơn vị**?
- [ ] Well-defined statement dẫn tới quyết định thiết kế được?
- [ ] Chưa đưa pseudocode/thuật toán chi tiết (đó là PA3)?

---

## Sai lầm phổ biến khi viết PA2 (thầy thường trừ điểm)

1. **Đưa giải pháp vào Section 1** — mất -1 điểm ngay.
2. **Success criteria mơ hồ** — "cải thiện trải nghiệm", "tăng doanh thu" mà không có số → -0.5 đến -1 điểm.
3. **Stakeholder chỉ liệt kê, không phân tích nhu cầu** — nhóm mình dễ mắc.
4. **Bỏ constraint pháp lý** — với dự án y tế/thẩm mỹ, đây là mistake fatal.
5. **Assumption sai lệch** với thực tế demo (VD: giả định 100% desktop nhưng traffic thật là mobile).

---

## Trích nguồn thầy cho phép

- Slide LN01, LN02 (Problem Framing, Stakeholder Analysis)
- Slide LN03 (MoSCoW, Assumption)
- Nguyên tắc "định lượng mọi thứ" — được lặp lại trong nhiều lecture

---

## Sau khi PA2 xong

Chuyển sang `references/pa3_guide.md` để viết Well-defined + Pseudocode + Decomposition theo computational nature.
