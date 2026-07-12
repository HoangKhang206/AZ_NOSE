# Module 2 — Geometric Analysis

Tính toán góc/khoảng cách/tỷ lệ từ landmark của Module 1.

**Trạng thái**: 🚧 Chưa implement — Sprint 1.

---

## File dự kiến

- `distances.ts` — `euclideanDistance(p1, p2)`
- `angles.ts` — `angleFromThreePoints(A, B, C)` (định lý hàm cos)
- `faceProfile.ts` — `classifyProfile(measurements)` → enum face profile
- `standards.ts` — bảng chuẩn Á Đông

---

## Input / Output

```typescript
type Measurements = {
  nasolabialAngle: number;    // độ
  nasofrontalAngle: number;   // độ
  symmetryRatio: number;      // [0, 2]
  faceProfile: 'ROUND' | 'LONG' | 'SQUARE' | 'OVAL' | 'HEART';
};
```

---

## Ràng buộc

- Sai số ≤ 2° so với đo tay bác sĩ (test trên 30 case)
- Chạy đồng bộ ≤ 50ms (không call external)
- Dùng chuẩn Á Đông (KHÔNG chuẩn phương Tây)

Chi tiết: `docs/references/code_patterns.md` section Module 2.
