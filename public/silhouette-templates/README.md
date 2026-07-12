# Silhouette Templates — Static SVG Assets

Thư mục này chứa **file SVG thật** dùng runtime (khác với `docs/assets/silhouette_templates/` chỉ chứa hướng dẫn).

**Trạng thái**: 🚧 Chưa có file SVG — chờ designer + bác sĩ AZ NOSE.

---

## Danh sách file cần có (7-10 dáng × 3 góc = 21-30 SVG)

### S-line tự nhiên
- [ ] `sline-natural_frontal.svg`
- [ ] `sline-natural_45deg.svg`
- [ ] `sline-natural_90deg.svg`

### S-line Hàn Quốc
- [ ] `sline-korean_frontal.svg`
- [ ] `sline-korean_45deg.svg`
- [ ] `sline-korean_90deg.svg`

### L-line thẳng
- [ ] `lline-straight_frontal.svg`
- [ ] `lline-straight_45deg.svg`
- [ ] `lline-straight_90deg.svg`

### (các dáng khác)
Xem `docs/assets/silhouette_templates/README.md` cho spec chi tiết.

---

## Quy trình bổ sung

1. Bác sĩ vẽ đường viền dáng "sau khi làm" lên ảnh mẫu (case có consent)
2. Designer trace lại thành SVG path chuẩn (viewBox 0 0 100 100)
3. Đánh dấu `data-anchor` để Module 3 khớp vào landmark
4. Bác sĩ ký xác nhận đường viền đúng chuẩn
5. Commit file vào folder này

**KHÔNG commit file mà chưa có chữ ký bác sĩ.**
