# Knowledge Base — Medical (RAG source cho AI-1)

Đây là kho tri thức chuyên môn do **bác sĩ AZ NOSE** cung cấp và ký duyệt. AI-1 CHỈ được sinh nội dung dựa trên file này.

**Quy tắc soạn**:
- Mỗi mục phải được bác sĩ AZ NOSE review và ký tên xác nhận (có thể là chữ ký số hoặc email confirm)
- Ngôn ngữ: ấm áp, không phán xét, không cam kết
- Không đề cập giá cụ thể ở đây (giá thuộc knowledge base kinh doanh)
- Update version + ngày mỗi khi bác sĩ chỉnh sửa

**Trạng thái hiện tại**: SKELETON — cần bác sĩ AZ NOSE điền vào 3 buổi × 2 giờ theo lịch đã chốt.

---

## Version log

| Version | Ngày | Người duyệt | Ghi chú |
|---|---|---|---|
| 0.1 (skeleton) | TODO | TODO | Placeholder, chờ bác sĩ điền |

---

## 1. Chuẩn tỷ lệ khuôn mặt Á Đông

### 1.1 Nasolabial Angle (góc mũi môi)
- **Nam**: 90-100° được coi là hài hoà
- **Nữ**: 95-105° được coi là hài hoà
- **Ghi chú của bác sĩ**: TODO

### 1.2 Nasofrontal Angle (góc mũi trán)
- **Chung**: 115-130° được coi là hài hoà
- Nếu < 115° → sống mũi hơi thấp
- Nếu > 130° → sống mũi hơi cao
- **Ghi chú của bác sĩ**: TODO

### 1.3 Tính đối xứng
- Tỷ lệ khoảng cách 2 mắt / độ rộng cánh mũi: 1.0-1.3
- Nếu > 1.3: cánh mũi hẹp so với khuôn mặt
- Nếu < 1.0: cánh mũi rộng so với khuôn mặt
- **Ghi chú của bác sĩ**: TODO

### 1.4 Tỷ lệ 1/3 khuôn mặt
- Trán / Mũi / Cằm nên gần bằng nhau
- **Ghi chú của bác sĩ**: TODO

---

## 2. Phân loại cấu trúc khuôn mặt

### 2.1 Mặt tròn (ROUND)
- Đặc điểm: TODO
- Dáng mũi thường phù hợp: TODO
- Ghi chú: TODO

### 2.2 Mặt dài (LONG)
- Đặc điểm: TODO
- Dáng mũi thường phù hợp: TODO
- Ghi chú: TODO

### 2.3 Mặt vuông (SQUARE)
- Đặc điểm: TODO
- Dáng mũi thường phù hợp: TODO
- Ghi chú: TODO

### 2.4 Mặt oval (OVAL)
- Đặc điểm: TODO
- Dáng mũi thường phù hợp: TODO
- Ghi chú: TODO

### 2.5 Mặt trái tim (HEART)
- Đặc điểm: TODO
- Dáng mũi thường phù hợp: TODO
- Ghi chú: TODO

---

## 3. Lookup Table — Đề xuất dáng mũi

Bảng ánh xạ (cấu trúc mặt) × (góc mũi hiện tại) → dáng mũi đề xuất.

| Cấu trúc mặt | Góc mũi môi | Góc mũi trán | Dáng đề xuất | Lý do bác sĩ |
|---|---|---|---|---|
| Mặt tròn | Thấp | Thấp | S-line tự nhiên | TODO |
| Mặt tròn | Cao | Cao | L-line thẳng | TODO |
| Mặt dài | Thấp | Bất kỳ | TODO | TODO |
| Mặt vuông | Bất kỳ | Bất kỳ | TODO | TODO |
| Mặt oval | Bất kỳ | Bất kỳ | TODO | TODO |
| Mặt trái tim | Bất kỳ | Bất kỳ | TODO | TODO |

**Ghi chú**: Bảng này quyết định dáng mũi đưa vào prompt AI-1. Cần bác sĩ điền đầy đủ trước launch.

---

## 4. Đoạn văn tư vấn mẫu (do bác sĩ soạn)

30 đoạn văn mẫu ứng với 30 tổ hợp thường gặp. AI-1 sẽ **học phong cách** từ các đoạn này, không copy nguyên xi.

### Ví dụ đoạn mẫu #1
**Tổ hợp**: Mặt tròn + Góc mũi môi 85° + Góc mũi trán 110° + Dáng đề xuất S-line tự nhiên

```
TODO: Bác sĩ điền đoạn văn 3-4 câu, ấm áp, không cam kết, có mở về đặc điểm mặt + gợi mở về dáng phù hợp + nhắc chụp CT 3D.
```

### Ví dụ đoạn mẫu #2
**Tổ hợp**: TODO

```
TODO
```

### (Cần 28 đoạn mẫu nữa)

---

## 5. Danh sách các cụm từ CẦN dùng

- "đặc điểm khuôn mặt" (thay cho "khuyết điểm")
- "hài hoà hơn" (thay cho "đẹp hơn")
- "sơ bộ 2D" (nhắc user đây không phải chẩn đoán)
- "cần bác sĩ đánh giá trực tiếp" (câu handoff mềm)

---

## 6. Danh sách các cụm từ CẤM dùng

- "chắc chắn", "cam kết", "100%", "hoàn toàn"
- "chữa khỏi", "không đau", "không biến chứng"
- "đẹp hơn hẳn", "khuyết điểm", "xấu"
- Bất kỳ so sánh với phòng khám khác

---

## 7. Chống chỉ định (bác sĩ đánh dấu để AI biết flag)

Khi phát hiện các số liệu bất thường sau, AI-1 phải:
- KHÔNG đề xuất dáng cụ thể
- KHUYẾN CÁO gặp bác sĩ trực tiếp

| Số liệu bất thường | Cách xử lý |
|---|---|
| Nasolabial < 70° hoặc > 130° | TODO — có thể là dấu hiệu bệnh lý |
| Symmetry ratio > 1.6 hoặc < 0.7 | TODO — cần khám kỹ trước tư vấn |
| Confidence MediaPipe < 0.7 | Yêu cầu chụp lại |

---

## Cách bác sĩ AZ NOSE update file này

**Quy trình chuẩn**:
1. Bác sĩ dictate nội dung → team scribe transcribe vào file
2. Bác sĩ review lại từng mục, edit trực tiếp
3. Bác sĩ ký xác nhận (email hoặc chữ ký số)
4. Update version log ở đầu file
5. Deploy lên KB → AI-1 tự động dùng phiên bản mới

**Không được**:
- Team dev tự chỉnh nội dung y khoa
- Marketing viết thêm câu quảng cáo
- AI tự tạo đoạn văn không có trong file này

---

## TODO tổng thể trước khi launch

- [ ] Bác sĩ điền đầy đủ 3 buổi × 2 giờ
- [ ] Ký xác nhận từng section
- [ ] 30 đoạn văn mẫu đã đủ
- [ ] Lookup table 5 cấu trúc mặt × 3-4 góc = ≥ 15 rows
- [ ] Chống chỉ định đã liệt kê đủ
- [ ] Version log update
