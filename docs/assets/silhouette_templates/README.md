# Silhouette Templates — SVG Library

Thư mục này chứa **template SVG đường viền dáng mũi** để render trong Module 3 (AR Silhouette Overlay). Mỗi template = 1 dáng mũi × 1 góc chụp.

**Cách dùng**: Module 3 load đúng file SVG tương ứng dựa trên `(recommended_shape, angle)`, sau đó anchor vào landmark mũi để vẽ chồng lên ảnh gốc.

---

## Naming convention

```
<shape-code>_<angle>.svg
```

- `<shape-code>`: mã dáng mũi (VD: `sline-natural`, `lline-straight`, `sline-korean`)
- `<angle>`: `frontal` / `45deg` / `90deg`

Ví dụ:
- `sline-natural_frontal.svg`
- `sline-natural_45deg.svg`
- `sline-natural_90deg.svg`
- `lline-straight_frontal.svg`
- …

---

## Danh sách template cần có (7-10 dáng × 3 góc = 21-30 file)

### Dáng mũi phổ biến của AZ NOSE
- [ ] `sline-natural` — S-line tự nhiên
- [ ] `sline-korean` — S-line Hàn Quốc
- [ ] `lline-straight` — L-line thẳng
- [ ] `lline-soft` — L-line mềm
- [ ] `sline-high` — S-line sống cao
- [ ] `structured` — Nâng cấu trúc
- [ ] `semi-structured` — Nâng bán cấu trúc
- [ ] TODO — bổ sung khi bác sĩ tư vấn thêm

### Cho mỗi dáng, cần 3 góc
- `_frontal.svg` — chính diện, đối xứng
- `_45deg.svg` — nghiêng 45°, thấy 1 bên cánh mũi
- `_90deg.svg` — nghiêng 90° (side profile), thấy đường sống từ trán → chóp → chân mũi

---

## SVG format chuẩn

Mỗi file SVG phải:
1. Có `viewBox="0 0 100 100"` (normalized coordinate)
2. Chỉ chứa `<path>` (không `<rect>`, `<circle>`, `<image>` để giữ đơn giản)
3. Path có `stroke="currentColor"`, `fill="none"`, `stroke-width="2"` để dễ đổi màu ở runtime
4. Path có `data-anchor` attribute để Module 3 biết cách khớp landmark:
   - `data-anchor="nose-tip"` → điểm chóp mũi
   - `data-anchor="nose-bridge-top"` → sống mũi trên
   - `data-anchor="alar-left"` / `data-anchor="alar-right"` → cánh mũi

### Ví dụ file `sline-natural_frontal.svg`

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Đường sống mũi từ trên xuống chóp -->
  <path
    d="M 50 20 L 50 65"
    data-anchor="nose-bridge-top,nose-tip"
    stroke="currentColor"
    fill="none"
    stroke-width="2"
  />
  <!-- Đường cánh mũi 2 bên -->
  <path
    d="M 42 68 Q 50 78 58 68"
    data-anchor="alar-left,nose-tip,alar-right"
    stroke="currentColor"
    fill="none"
    stroke-width="2"
  />
</svg>
```

*(Đây chỉ là ví dụ minh hoạ. Template thật cần bác sĩ vẽ trên ảnh mẫu rồi trace lại.)*

---

## Quy trình tạo template

**Người phụ trách**: Designer + Bác sĩ AZ NOSE

**Các bước**:
1. Bác sĩ chọn ảnh mẫu điển hình cho mỗi dáng (từ case study đã có consent)
2. Bác sĩ vẽ đường viền dáng "sau khi làm" lên ảnh mẫu
3. Designer trace lại thành SVG path, normalize về viewBox 100×100
4. Đánh dấu `data-anchor` cho từng path
5. Bác sĩ ký xác nhận đường viền đúng chuẩn
6. Deploy vào folder này

---

## Testing

Sau khi có template, chạy `test/silhouette_render_test.html` (chưa có, cần tạo) để:
- Load ảnh test → chạy MediaPipe → lấy landmark
- Chọn template → render overlay
- So sánh với ảnh mẫu bác sĩ vẽ tay
- Sai số vị trí ≤ 5 pixel là đạt

---

## Version log

| Template | Version | Ngày duyệt | Bác sĩ ký |
|---|---|---|---|
| TODO | TODO | TODO | TODO |
