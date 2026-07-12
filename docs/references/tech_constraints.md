# Tech Constraints — Ràng buộc pháp lý + Free tier limits

File tra cứu nhanh mọi ràng buộc kỹ thuật + pháp lý. Load khi user hỏi về giới hạn, hạn ngạch, hoặc rủi ro tuân thủ.

---

## 1. Ràng buộc pháp lý (Việt Nam)

### 1.1 Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân
**Hiệu lực**: 1/7/2023

**Ảnh hưởng đến AZ FACE INSIGHT**:
- Ảnh khuôn mặt = **dữ liệu sinh trắc học nhạy cảm** (Điều 2, khoản 4)
- Cần **consent minh bạch** trước khi xử lý (Điều 11)
- Nếu vi phạm: phạt tối đa **5% doanh thu năm liền trước**

**Cách tuân thủ trong dự án**:
- Xử lý ảnh **client-side** (không gửi lên server) → giảm rủi ro vi phạm
- Popup consent tường minh, dùng ngôn ngữ đơn giản
- Không lưu ảnh sau khi phân tích xong
- Cho phép user xóa lịch sử chat bất cứ lúc nào

### 1.2 Luật Quảng cáo 2012 (sửa đổi 2018)
**Ảnh hưởng**:
- **CẤM cam kết kết quả** trong quảng cáo dịch vụ y tế/thẩm mỹ (Điều 8, khoản 11)
- Không được dùng hình ảnh trước-sau nếu **gây hiểu nhầm**

**Cách tuân thủ**:
- Không có từ "chắc chắn", "100%", "cam kết" trong output AI
- Watermark "Hình mô phỏng — kết quả thực tế có thể khác biệt" trên ảnh After
- Không dùng ảnh Before/After của user để marketing công khai

### 1.3 Luật Khám bệnh, Chữa bệnh 2023
**Ảnh hưởng**:
- Chỉ **bác sĩ có chứng chỉ hành nghề** mới được chẩn đoán y khoa (Điều 24)
- AI không được đóng vai bác sĩ

**Cách tuân thủ**:
- AI-1 CHỈ nói về "tỷ lệ khuôn mặt", KHÔNG dùng từ "chẩn đoán", "bệnh lý"
- AI-2 handoff sang bác sĩ khi câu hỏi vượt phạm vi tư vấn thẩm mỹ

### 1.4 Thông tư 09/2015/TT-BYT về quảng cáo y tế
**Ảnh hưởng**:
- Nội dung quảng cáo dịch vụ y tế phải được **Sở Y tế duyệt** trước khi phát hành
- Nội dung phải khớp với giấy phép hoạt động của phòng khám

**Cách tuân thủ**:
- Kho tri thức AI-2 (danh mục dịch vụ) phải khớp giấy phép AZ NOSE
- Text tư vấn của AI được coi là "nội dung quảng cáo" → nên có kiểm duyệt định kỳ

---

## 2. Free Tier Limits (các dịch vụ dự án dùng)

### 2.1 Vercel (hosting Next.js)
- Bandwidth: 100 GB/tháng
- Function invocations: 100K/tháng
- Function duration: 10 giây/lần
- Function memory: 1024 MB

**Khi nào cần lo**: khi lượng user >10K/tháng → cân nhắc upgrade Pro ($20/tháng)

### 2.2 Cloudflare Pages
- Bandwidth: **unlimited** (miễn phí)
- Requests: 100K/ngày
- Workers: 100K request/ngày
- Build: 500 build/tháng

**Khuyến nghị**: Ưu tiên Cloudflare cho MVP vì bandwidth không giới hạn.

### 2.3 Google Gemini 1.5 Flash (LLM cho AI-1 và AI-2)
- Free tier: **15 request/phút**
- Daily quota: 1M tokens/ngày (~500-1000 lượt phân tích)
- Rate limit: 1500 request/ngày

**Khi nào cần lo**:
- >500 lượt phân tích/ngày → cần cache hoặc paid tier
- Peak burst quá 15 req/phút → cần queue

### 2.4 Groq (Llama 3.3 70B, alternative)
- Free tier: 30 req/phút, 6000 tokens/phút
- Rate limit: 14400 req/ngày
- **Latency**: cực nhanh (~500ms), phù hợp chat real-time

### 2.5 Google Sheets API (lead storage MVP)
- 300 request/phút/project
- 60 request/phút/user
- Storage: **unlimited** rows (miễn phí)

### 2.6 Zapier (automation MVP)
- Free tier: **100 tasks/tháng**
- Multi-step Zap: chỉ Pro

**Khi nào cần lo**: nếu lead >100/tháng → chuyển sang webhook direct.

### 2.7 Microsoft Clarity (analytics)
- **Miễn phí unlimited** — không có quota

### 2.8 Google Analytics 4
- **Miễn phí** cho data <10M event/tháng

---

## 3. Kỹ thuật — Ràng buộc thực tế của MediaPipe

### 3.1 Kích thước ảnh input
- Tối thiểu: 128 × 128 pixel
- Khuyến nghị: 640 × 480 pixel
- Tối đa hiệu quả: 1920 × 1080 pixel

### 3.2 Confidence score
- `< 0.5`: không đủ tin cậy, yêu cầu chụp lại
- `0.5 - 0.7`: tin cậy trung bình, cảnh báo user
- `> 0.7`: dùng được

### 3.3 Điều kiện chụp
- **Đủ sáng**: > 200 lux (không quá tối)
- **Không đeo kính**
- **Không dùng filter làm đẹp** (Beauty Cam, Meitu…) — filter phá vỡ landmark
- **Góc khuôn mặt** không quá lệch (< 30° so với ống kính cho ảnh "chính diện")

### 3.4 Performance trên thiết bị thật
| Thiết bị | Landmark rendering time |
|---|---|
| iPhone 15 Pro | ~50 ms |
| iPhone SE (2020) | ~150 ms |
| iPhone 8 | ~400 ms |
| Android tầm trung (SD 700 series) | ~300 ms |
| Android rẻ (SD 400 series) | ~800 ms |

→ **Ràng buộc**: MVP phải chạy được trên iPhone 8 với p95 latency < 500ms.

---

## 4. Ngôn ngữ + tone constraints (đưa vào Prompt SYSTEM)

### 4.1 Cấm dùng
- "chắc chắn", "cam kết", "100%", "hoàn toàn"
- "chữa khỏi", "không đau", "không biến chứng"
- "khuyết điểm", "xấu"
- So sánh với phòng khám khác

### 4.2 Phải dùng
- "hài hoà hơn" thay cho "đẹp hơn"
- "đặc điểm" thay cho "khuyết điểm"
- "phân tích 2D sơ bộ" (nhắc nhở giới hạn)
- "để đánh giá chính xác cần chụp CT 3D"

---

## 5. Chi phí LLM ước tính (để plan ngân sách)

Với 1 lượt phân tích trung bình:
- Input tokens: ~2000 (KB + prompt + số liệu)
- Output tokens: ~200 (3-4 câu tư vấn)
- **Total**: ~2200 tokens/lượt

Với 1 cuộc chat trung bình:
- 10 lượt × 1500 tokens/lượt = ~15,000 tokens/cuộc

### Bảng chi phí (Gemini 1.5 Flash paid tier: $0.075/1M input, $0.30/1M output)
| Scale | Tokens/tháng | Chi phí |
|---|---|---|
| 100 phân tích + 20 chat/ngày | ~15M/tháng | ~$2-3 |
| 500 phân tích + 100 chat/ngày | ~75M/tháng | ~$10-15 |
| 2000 phân tích + 500 chat/ngày | ~350M/tháng | ~$45-60 |

**Ngân sách MVP**: dùng free tier → $0/tháng. Khi vượt free, chi phí vẫn cực thấp so với giá 1 lead thật (~200-500K).

---

## 6. Bảo mật — Ràng buộc bắt buộc

### 6.1 API Keys
- LLM API key: **CHỈ ở Serverless Function environment variable**
- Google Sheets API: OAuth flow, không hardcode credentials
- Meta Pixel ID: có thể lộ (public)

### 6.2 CORS
- Serverless Function chỉ nhận request từ domain aznose.vn
- Không cho phép wildcard `*`

### 6.3 Rate limiting per user
- Landmarking: 5 lần/phút/IP (chống spam quét)
- LLM call: 3 lần/phút/session (chống bot chat)

### 6.4 Content Security Policy (CSP)
- Chỉ cho phép load script từ:
  - cdn.jsdelivr.net (MediaPipe)
  - googletagmanager.com (GA4)
  - connect.facebook.net (Meta Pixel)

---

## 7. Kill Switch — Cách tắt nhanh khi có sự cố

Trong dashboard ban giám đốc AZ NOSE, cần có nút:
- **Tắt AI-1** → fallback về template
- **Tắt AI-2** → chatbot chuyển thẳng sang Zalo
- **Tắt cả web-app** → hiện thông báo bảo trì

Điều kiện activate kill switch:
- AI xuất hiện trên báo/mạng xã hội vì lỗi
- Có khiếu nại pháp lý
- Chi phí LLM vượt ngưỡng cảnh báo
- MediaPipe/Gemini có downtime kéo dài

---

## Cập nhật file này

**Owner**: PM dự án
**Tần suất**: mỗi khi có thay đổi luật hoặc thay đổi free tier từ nhà cung cấp
**Trigger cập nhật**: đọc changelog của Vercel/Google/Cloudflare hàng tháng
