/**
 * Mini Knowledge Base cho AI-1 (Chuyên gia phân tích)
 *
 * Đây là bản DEMO — chứa 10 case điển hình để Gemini có dữ liệu RAG.
 * Phase 2 sẽ thay bằng docs/references/knowledge_base_medical.md
 * (bác sĩ AZ NOSE soạn đầy đủ).
 *
 * Structure: mỗi case là 1 tổ hợp {faceProfile, nasolabialRange, nasofrontalRange}
 * kèm với đoạn text tư vấn mẫu do bác sĩ ký duyệt (giả lập trong demo).
 */

export type FaceProfile = 'ROUND' | 'OVAL' | 'LONG' | 'SQUARE' | 'HEART';

export interface KnowledgeCase {
  id: string;
  faceProfile: FaceProfile;
  nasolabialRange: [number, number];
  nasofrontalRange: [number, number];
  recommendedShape: string;
  sampleAdvice: string; // Đoạn văn mẫu cho phong cách - AI-1 học phong cách này
  medicalNote: string;  // Ghi chú kỹ thuật cho AI-1 hiểu ngữ cảnh
}

export const MINI_KB: KnowledgeCase[] = [
  {
    id: 'case-01',
    faceProfile: 'ROUND',
    nasolabialRange: [70, 89],
    nasofrontalRange: [100, 114],
    recommendedShape: 'S-line tự nhiên',
    sampleAdvice:
      'Với cấu trúc mặt tròn và góc mũi môi hơi thấp, dáng S-line tự nhiên sẽ giúp gương mặt thanh thoát hơn. Đường cong mềm mại của dáng này phù hợp với đường nét khuôn mặt bạn. Đây là phân tích 2D sơ bộ, để đánh giá chính xác cần chụp CT 3D cùng bác sĩ.',
    medicalNote: 'Mặt tròn + góc thấp thường phù hợp dáng có độ cong nhẹ để tạo cảm giác dài mặt.',
  },
  {
    id: 'case-02',
    faceProfile: 'ROUND',
    nasolabialRange: [90, 100],
    nasofrontalRange: [115, 130],
    recommendedShape: 'S-line tự nhiên',
    sampleAdvice:
      'Tỷ lệ khuôn mặt của bạn đã khá hài hoà theo chuẩn Á Đông. Nếu muốn tôn thêm nét thanh tú, dáng S-line tự nhiên nhẹ nhàng sẽ là lựa chọn tinh tế. Bác sĩ tại AZ NOSE có thể đánh giá cụ thể hơn qua CT 3D.',
    medicalNote: 'Case gần chuẩn — nên gợi ý dáng nhẹ để không phá vỡ hài hoà tự nhiên.',
  },
  {
    id: 'case-03',
    faceProfile: 'OVAL',
    nasolabialRange: [70, 89],
    nasofrontalRange: [100, 114],
    recommendedShape: 'S-line Hàn Quốc',
    sampleAdvice:
      'Cấu trúc mặt oval của bạn là nền tảng lý tưởng cho nhiều dáng mũi. Với góc mũi hiện tại, dáng S-line Hàn Quốc có sống mũi cao hơn một chút sẽ tôn dáng mặt. Phân tích 2D chỉ mang tính tham khảo, khám trực tiếp sẽ chính xác hơn nhiều.',
    medicalNote: 'Mặt oval linh hoạt, có thể gợi ý dáng đa dạng theo sở thích cá nhân.',
  },
  {
    id: 'case-04',
    faceProfile: 'OVAL',
    nasolabialRange: [90, 105],
    nasofrontalRange: [115, 130],
    recommendedShape: 'S-line tự nhiên',
    sampleAdvice:
      'Bạn có tỷ lệ khuôn mặt rất cân đối theo chuẩn Á Đông. Nếu muốn nâng cấp nhẹ, S-line tự nhiên sẽ giữ được nét đặc trưng của bạn. Đây là phân tích sơ bộ 2D, kết quả thật cần được bác sĩ đánh giá qua CT 3D.',
    medicalNote: 'Case ideal — user không cần can thiệp mạnh, chỉ dáng nhẹ.',
  },
  {
    id: 'case-05',
    faceProfile: 'LONG',
    nasolabialRange: [90, 100],
    nasofrontalRange: [115, 130],
    recommendedShape: 'L-line thẳng',
    sampleAdvice:
      'Với khuôn mặt hơi dài của bạn, dáng L-line thẳng sẽ tạo điểm nhấn cân đối cho các đường nét. Sống mũi thẳng vừa phải sẽ hài hoà với tổng thể. Bác sĩ AZ NOSE sẽ đánh giá cấu trúc sụn cụ thể qua CT 3D.',
    medicalNote: 'Mặt dài cần tránh sống quá cao vì làm mặt càng dài hơn.',
  },
  {
    id: 'case-06',
    faceProfile: 'LONG',
    nasolabialRange: [70, 89],
    nasofrontalRange: [100, 114],
    recommendedShape: 'L-line mềm',
    sampleAdvice:
      'Cấu trúc mặt dài kết hợp với góc mũi hiện tại của bạn phù hợp với dáng L-line mềm — đường nét dứt khoát nhưng vẫn tự nhiên. Chi tiết cần bác sĩ khám và tư vấn qua CT 3D.',
    medicalNote: 'Mặt dài + góc thấp cần nâng nhẹ tạo điểm cân đối.',
  },
  {
    id: 'case-07',
    faceProfile: 'SQUARE',
    nasolabialRange: [90, 105],
    nasofrontalRange: [115, 130],
    recommendedShape: 'S-line mềm',
    sampleAdvice:
      'Đặc điểm mặt vuông của bạn có nét cá tính riêng. Dáng S-line mềm với đường cong tự nhiên sẽ làm dịu các đường nét sắc cạnh. Đây chỉ là phân tích bề mặt 2D, khám trực tiếp cho kết quả chính xác nhất.',
    medicalNote: 'Mặt vuông cần dáng mềm để giảm cảm giác góc cạnh.',
  },
  {
    id: 'case-08',
    faceProfile: 'HEART',
    nasolabialRange: [90, 100],
    nasofrontalRange: [115, 130],
    recommendedShape: 'S-line tự nhiên',
    sampleAdvice:
      'Mặt trái tim của bạn có nét thanh tú vốn có. Dáng S-line tự nhiên sẽ tôn thêm sự nữ tính và cân đối cho phần dưới khuôn mặt. Bác sĩ AZ NOSE sẽ đưa ra phương án cụ thể sau khi chụp CT 3D.',
    medicalNote: 'Mặt trái tim thường có cằm nhọn — chọn dáng vừa phải để không mất cân đối.',
  },
  {
    id: 'case-09',
    faceProfile: 'ROUND',
    nasolabialRange: [106, 120],
    nasofrontalRange: [131, 145],
    recommendedShape: 'S-line tự nhiên',
    sampleAdvice:
      'Góc mũi hiện tại của bạn hơi cao so với chuẩn Á Đông. Dáng S-line tự nhiên sẽ điều chỉnh về tỷ lệ hài hoà. Đây là phân tích 2D, cần bác sĩ đánh giá cấu trúc bên trong qua CT 3D để có phương án chuẩn xác.',
    medicalNote: 'Góc cao thường do sống mũi hơi quá — cần điều chỉnh về tự nhiên.',
  },
  {
    id: 'case-10',
    faceProfile: 'OVAL',
    nasolabialRange: [70, 89],
    nasofrontalRange: [131, 145],
    recommendedShape: 'S-line mềm',
    sampleAdvice:
      'Cấu trúc khuôn mặt của bạn có nét thú vị — góc mũi trán khá cao trong khi góc mũi môi thấp. Dáng S-line mềm sẽ tạo sự chuyển tiếp tự nhiên. Bác sĩ AZ NOSE có thể tư vấn chi tiết hơn qua CT 3D miễn phí.',
    medicalNote: 'Case phức tạp — cần bác sĩ khám trực tiếp, AI chỉ gợi ý tham khảo.',
  },
];

/**
 * Tìm case phù hợp nhất với measurements của user.
 * Trả về null nếu measurements bất thường (chống chỉ định).
 */
export function findMatchingCase(
  faceProfile: FaceProfile,
  nasolabial: number,
  nasofrontal: number
): KnowledgeCase | null {
  // Chống chỉ định: số liệu quá bất thường → không đề xuất, chuyển bác sĩ
  if (nasolabial < 60 || nasolabial > 130) return null;
  if (nasofrontal < 90 || nasofrontal > 150) return null;

  // Tìm case khớp cả 3 tiêu chí
  const exactMatch = MINI_KB.find(
    (c) =>
      c.faceProfile === faceProfile &&
      nasolabial >= c.nasolabialRange[0] &&
      nasolabial <= c.nasolabialRange[1] &&
      nasofrontal >= c.nasofrontalRange[0] &&
      nasofrontal <= c.nasofrontalRange[1]
  );

  if (exactMatch) return exactMatch;

  // Fallback: tìm case cùng faceProfile gần nhất
  const sameProfile = MINI_KB.filter((c) => c.faceProfile === faceProfile);
  if (sameProfile.length > 0) return sameProfile[0];

  // Fallback cuối cùng: case oval chuẩn
  return MINI_KB.find((c) => c.id === 'case-04') || MINI_KB[0];
}

/**
 * Format knowledge base thành text để nhét vào prompt LLM.
 * Chỉ gửi 3-5 case liên quan nhất, không gửi hết 10 để tiết kiệm token.
 */
export function formatKBForPrompt(matchedCase: KnowledgeCase): string {
  const relatedCases = MINI_KB.filter(
    (c) => c.faceProfile === matchedCase.faceProfile
  ).slice(0, 3);

  return relatedCases
    .map(
      (c, i) => `
[Case ${i + 1}]
- Cấu trúc mặt: ${c.faceProfile}
- Góc mũi môi: ${c.nasolabialRange[0]}-${c.nasolabialRange[1]}°
- Góc mũi trán: ${c.nasofrontalRange[0]}-${c.nasofrontalRange[1]}°
- Dáng phù hợp: ${c.recommendedShape}
- Ghi chú chuyên môn: ${c.medicalNote}
- Phong cách tư vấn mẫu: "${c.sampleAdvice}"
`
    )
    .join('\n');
}
