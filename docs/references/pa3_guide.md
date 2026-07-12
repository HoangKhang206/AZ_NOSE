# PA3 Guide — Well-defined + Pseudocode + Decomposition

Hướng dẫn viết PA3 cho AZ FACE INSIGHT. PA3 = **đi sâu vào bản chất tính toán** của bài toán đã được well-defined ở PA2.

**Nguyên tắc số 1**: Phân rã theo *computational nature*, KHÔNG theo màn hình UI.

---

## Cấu trúc PA3 chuẩn (theo slide LN04)

### Section 1 — Well-defined Problem Statement
Copy từ PA2 Section 6. Không viết lại từ đầu.

### Section 2 — Computational Decomposition
4 sub-problem theo bản chất tính toán:

| # | Module | Bản chất tính toán | Input | Output | Ràng buộc chính |
|---|---|---|---|---|---|
| 1 | Face Landmarking | Pre-trained CNN inference | HTMLImageElement | 468 landmark {x, y, z} | ≤ 500ms trên iPhone 8 |
| 2 | Geometric Analysis | Toán học không gian (Euclidean + Cosine law) | Array landmark | 3 chỉ số + face profile | Sai số ≤ 2° so đo tay |
| 3 | Silhouette AR Overlay | Đồ hoạ 2D (Canvas + SVG) anchored on landmark | Ảnh + landmark + template | Ảnh có đường viền chồng lên | Lệch ≤ 5px vị trí mũi |
| 4 | Dual-RAG Conversational AI | Controlled generative AI (LLM + Retrieval + Guardrails) | Số liệu + KB + user query | Text tư vấn / câu trả lời chat | 0 output vi phạm từ cấm |

**KHÔNG được phân rã kiểu**:
- ❌ "Màn hình Upload / Màn hình Xử lý / Màn hình Kết quả / Màn hình Chat" (đó là UI, không phải computation)
- ❌ "Module Frontend / Module Backend / Module Database" (đó là kiến trúc, không phải bản chất bài toán)

### Section 3 — Formal Input/Output cho từng module
Với mỗi trong 4 module, viết:

```
Module #N: <tên>

Input: <kiểu dữ liệu + ràng buộc>
Output: <kiểu dữ liệu + ràng buộc>
Operators: <phép toán/thuật toán chính được dùng>
Evaluation: <cách đo lường success>
Constraints: <ràng buộc phi chức năng>
```

Ví dụ cho Module 2:
```
Module 2: Geometric Analysis

Input: Array<{x: float, y: float, z: float}> có 468 phần tử, mỗi tọa độ ∈ [0, 1]
Output: {
  nasolabialAngle: float ∈ [0, 180]°,
  nasofrontalAngle: float ∈ [0, 180]°,
  symmetryRatio: float ∈ [0, 2],
  faceProfile: enum {ROUND, LONG, SQUARE, OVAL, HEART}
}
Operators: Euclidean distance, Cosine law, table lookup
Evaluation: |giá trị AI - giá trị bác sĩ đo tay| ≤ 2° trên 30 test case
Constraints: chạy đồng bộ ≤ 50ms, không call API bên ngoài
```

### Section 4 — Pseudocode cho từng module
Dùng pseudocode chuẩn (không dùng syntax cụ thể như Python hay JS).

Ví dụ Module 2:
```
FUNCTION calculateNasolabialAngle(landmarks):
    A = landmarks[chóp mũi index]        // điểm 1
    B = landmarks[đỉnh môi trên index]   // điểm 0
    C = landmarks[chân môi index]        // điểm 17

    a = EuclideanDistance(B, C)
    b = EuclideanDistance(A, B)
    c = EuclideanDistance(A, C)

    cosTheta = (a² + b² - c²) / (2 * a * b)
    theta = arccos(cosTheta) * (180 / π)

    RETURN theta
```

### Section 5 — Complexity Analysis
Với mỗi module, ước lượng độ phức tạp:

- Module 1: O(n) với n = số pixel, dominated bởi MediaPipe inference (~50-500ms tuỳ máy)
- Module 2: O(1) — chỉ vài phép toán trên tập cố định landmark
- Module 3: O(k) với k = số điểm trên silhouette path (~30-50)
- Module 4: O(t) với t = số token trong prompt + response

### Section 6 — Trade-off Analysis
Mỗi quyết định thiết kế lớn phải có trade-off table:

Ví dụ: **Chọn AR Cấp độ 2 (silhouette) thay vì Cấp độ 3 (photo-realistic warp)**

| Tiêu chí | Cấp độ 2 (chọn) | Cấp độ 3 (từ chối) |
|---|---|---|
| Độ ấn tượng | ★★★ | ★★★★★ |
| Chi phí SDK | Free | 100-300 triệu/năm |
| Rủi ro pháp lý | Thấp | Cao (quảng cáo gây hiểu nhầm) |
| Thời gian dev | 2 tuần | 8-12 tuần |
| Rủi ro chất lượng | Thấp | Cao (warp lỗi = phản tác dụng) |

### Section 7 — Verification & Validation Plan
Cách kiểm tra mỗi module chạy đúng:

- **Unit test**: mỗi hàm toán học test với input cố định + expected output
- **Integration test**: pipeline end-to-end trên 20 ảnh mẫu
- **User acceptance test**: 50 users thật, feedback UX ≥ 4/5
- **Legal compliance test**: 100 câu hỏi khó cho AI, 0 output vi phạm

---

## Checklist trước khi nộp PA3

- [ ] Có đúng 4 sub-problem theo computational nature?
- [ ] Không có module nào là "màn hình" hay "database"?
- [ ] Mỗi module có Input/Output/Operators/Evaluation/Constraints đầy đủ?
- [ ] Có pseudocode cho ≥ 2 hàm cốt lõi mỗi module?
- [ ] Có complexity analysis?
- [ ] Có ≥ 2 trade-off analysis được argue rõ ràng?
- [ ] Có V&V plan đo lường được?

---

## Sai lầm phổ biến khi viết PA3

1. **Pseudocode = Python** — pseudocode phải trừu tượng, không được có `import`, `def`, `print()`.
2. **Copy MediaPipe doc** vào section thuật toán — thầy trừ điểm vì không phải tư duy của mình.
3. **Trade-off một chiều** — chỉ nêu lý do chọn A mà không nêu tại sao không chọn B, C.
4. **Complexity Big-O sai** — VD: nói "O(n)" khi thực ra là O(1) vì n cố định.
5. **Không có V&V plan** — thầy chấm rất kỹ phần này, dễ bị -1 điểm.

---

## Sau khi PA3 xong

Chuyển sang giai đoạn implement. Load `references/code_patterns.md` để lấy pattern code cho từng module.
