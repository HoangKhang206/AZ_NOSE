/**
 * Mini Knowledge Base cho AI-2 (Chatbot Ánh - Trợ lý tư vấn AZ NOSE)
 *
 * Đây là bản DEMO — chứa 15 FAQ điển hình để Gemini có RAG source.
 * Phase 2 sẽ thay bằng docs/references/knowledge_base_business.md
 * (sales/marketing AZ NOSE soạn đầy đủ 50-100 FAQ).
 *
 * ⚠️ Nội dung FAQ trong file này là GIẢ LẬP cho mục đích demo.
 * KHÔNG được dùng cho production khi chưa được AZ NOSE ký duyệt.
 */

export interface FAQ {
  id: string;
  category: 'PRICING' | 'PROCESS' | 'PAIN' | 'RECOVERY' | 'WARRANTY' | 'CONSULT' | 'GENERAL';
  keywords: string[];
  question: string;
  answer: string;
}

export const BUSINESS_KB: FAQ[] = [
  // ===== PRICING =====
  {
    id: 'p1',
    category: 'PRICING',
    keywords: ['giá', 'chi phí', 'bao nhiêu tiền', 'phí', 'triệu'],
    question: 'Nâng mũi S-line tại AZ NOSE giá bao nhiêu?',
    answer:
      'Dáng S-line tự nhiên dao động từ 25-45 triệu, tuỳ vào chất liệu sụn (sụn tự thân, sụn nhân tạo cao cấp) và độ phức tạp của cấu trúc. Bạn có thể chụp CT 3D miễn phí tại AZ NOSE để bác sĩ tư vấn giá chính xác nhất.',
  },
  {
    id: 'p2',
    category: 'PRICING',
    keywords: ['trả góp', 'trả dần', 'chia nhỏ', 'khoản vay'],
    question: 'Có trả góp không?',
    answer:
      'AZ NOSE có hỗ trợ trả góp 0% lãi suất trong 6-12 tháng qua thẻ tín dụng của các ngân hàng đối tác. Bạn có thể hỏi thêm chi tiết khi đến khám trực tiếp.',
  },
  {
    id: 'p3',
    category: 'PRICING',
    keywords: ['bao gồm', 'gồm gì', 'phí phát sinh', 'thêm'],
    question: 'Giá đã bao gồm những gì?',
    answer:
      'Giá đã bao gồm: khám tư vấn với bác sĩ, chi phí phẫu thuật, thuốc sau mổ, và các lần tái khám định kỳ. Không có phí phát sinh ngoài dự kiến.',
  },

  // ===== PAIN / SAFETY =====
  {
    id: 'pn1',
    category: 'PAIN',
    keywords: ['đau', 'khó chịu', 'sợ đau', 'cảm giác'],
    question: 'Nâng mũi có đau không?',
    answer:
      'Trong lúc phẫu thuật bạn sẽ được gây tê tại chỗ và gây mê nhẹ, nên hoàn toàn không có cảm giác đau. Sau đó có thể hơi khó chịu 2-3 ngày đầu — thuốc giảm đau sẽ giúp bạn thoải mái hơn.',
  },
  {
    id: 'pn2',
    category: 'PAIN',
    keywords: ['gây mê', 'gây tê', 'mê', 'tỉnh'],
    question: 'Có gây mê không?',
    answer:
      'AZ NOSE dùng phương pháp gây tê tại chỗ kết hợp gây mê nhẹ (sedation), bạn sẽ không đau nhưng vẫn có thể tỉnh lại nhanh sau ca. An toàn hơn so với gây mê toàn thân.',
  },
  {
    id: 'pn3',
    category: 'PAIN',
    keywords: ['biến chứng', 'rủi ro', 'nguy hiểm', 'lệch', 'bóng đỏ'],
    question: 'Có rủi ro gì không?',
    answer:
      'Mọi thủ thuật y khoa đều có rủi ro nhất định như sưng, bầm, hoặc phản ứng với thuốc mê. Rủi ro nghiêm trọng như lệch sống hay bóng đỏ đầu mũi rất hiếm và AZ NOSE có chính sách bảo hành để xử lý nếu xảy ra. Bác sĩ sẽ tư vấn cụ thể sau khi khám.',
  },

  // ===== RECOVERY =====
  {
    id: 'r1',
    category: 'RECOVERY',
    keywords: ['hồi phục', 'lành', 'bao lâu', 'nghỉ', 'đi làm'],
    question: 'Bao lâu thì hồi phục?',
    answer:
      'Thường 7-10 ngày là bạn có thể đi làm bình thường (còn sưng nhẹ, cần trang điểm nhẹ). Dáng đẹp tự nhiên sau khoảng 3 tháng khi sụn ổn định hoàn toàn.',
  },
  {
    id: 'r2',
    category: 'RECOVERY',
    keywords: ['ăn kiêng', 'kiêng', 'thức ăn', 'chế độ', 'ăn gì'],
    question: 'Ăn kiêng gì sau khi nâng mũi?',
    answer:
      'Trong 4-6 tuần đầu nên kiêng: đồ tanh (hải sản), thịt gà, thịt bò, rau muống, xôi, đồ cay nóng, rượu bia. Ưu tiên thịt heo nạc, cá sông, rau củ mềm và trái cây.',
  },
  {
    id: 'r3',
    category: 'RECOVERY',
    keywords: ['tập thể dục', 'chạy bộ', 'gym', 'thể thao', 'vận động'],
    question: 'Khi nào tập thể dục lại được?',
    answer:
      'Đi bộ nhẹ được sau 1 tuần. Tập gym, chạy bộ, yoga được sau 4 tuần. Các môn va chạm như bóng đá, boxing cần chờ ít nhất 3 tháng để đảm bảo sụn ổn định.',
  },

  // ===== PROCESS =====
  {
    id: 'pr1',
    category: 'PROCESS',
    keywords: ['ct 3d', 'chụp', 'quy trình', 'các bước', 'cần làm gì'],
    question: 'Quy trình khám ở AZ NOSE thế nào?',
    answer:
      'Quy trình gồm 3 bước: (1) Chụp CT 3D miễn phí để xem cấu trúc sụn xương bên trong, (2) Bác sĩ tư vấn dáng phù hợp và báo giá chính xác, (3) Bạn quyết định có làm hay không, không bị ép. Toàn bộ chỉ 45-60 phút.',
  },
  {
    id: 'pr2',
    category: 'PROCESS',
    keywords: ['thời gian', 'lâu', 'mấy tiếng', 'ca phẫu thuật'],
    question: 'Ca phẫu thuật kéo dài bao lâu?',
    answer:
      'Phẫu thuật nâng mũi cấu trúc thường 45-90 phút tuỳ độ phức tạp. Bạn sẽ nghỉ tại phòng hồi sức khoảng 1 giờ trước khi về.',
  },
  {
    id: 'pr3',
    category: 'PROCESS',
    keywords: ['sụn', 'chất liệu', 'silicon', 'tự thân', 'sườn'],
    question: 'AZ NOSE dùng chất liệu sụn nào?',
    answer:
      'AZ NOSE có 3 lựa chọn chính: (1) Sụn nhân tạo cao cấp Hàn Quốc, (2) Sụn tự thân từ vành tai, (3) Sụn sườn cho case tái tạo phức tạp. Bác sĩ sẽ tư vấn loại phù hợp nhất sau khi khám.',
  },

  // ===== WARRANTY =====
  {
    id: 'w1',
    category: 'WARRANTY',
    keywords: ['bảo hành', 'sửa lại', 'không đẹp', 'không ưng'],
    question: 'Có bảo hành không?',
    answer:
      'AZ NOSE có chính sách bảo hành 5 năm cho các dịch vụ nâng mũi. Trong thời gian này, nếu có vấn đề về kỹ thuật (lệch, tụt sụn...) sẽ được xử lý miễn phí. Chi tiết điều kiện bác sĩ sẽ tư vấn cụ thể.',
  },

  // ===== CONSULT / BOOKING =====
  {
    id: 'c1',
    category: 'CONSULT',
    keywords: ['đặt lịch', 'hẹn', 'khám', 'thời gian', 'giờ mở cửa'],
    question: 'Làm sao để đặt lịch khám?',
    answer:
      'Bạn có thể đặt lịch qua nút "Đặt lịch chụp CT 3D miễn phí" trên website, gọi hotline, hoặc chat qua Zalo. Giờ mở cửa 8:00-20:00 tất cả các ngày trong tuần.',
  },

  // ===== GENERAL - dùng cho intro / các câu chung =====
  {
    id: 'g1',
    category: 'GENERAL',
    keywords: ['az nose', 'giới thiệu', 'là gì', 'chuyên'],
    question: 'AZ NOSE là ai?',
    answer:
      'AZ NOSE là phòng khám chuyên sâu về nâng mũi tại Việt Nam với hơn 16 năm kinh nghiệm. Đội ngũ bác sĩ đã thực hiện hơn 52.000 ca nâng mũi thành công và 18.000 ca tái tạo mũi hỏng.',
  },
];

/**
 * Danh sách trigger cho handoff sang nhân viên thật
 * (theo docs/references/knowledge_base_business.md section 6)
 */
export const HANDOFF_TRIGGERS = [
  // Đặt lịch cụ thể
  /(?:đặt lịch|hẹn|khám).*(?:sáng mai|chiều nay|thứ|ngày|\d{1,2}[h:])/i,
  // Số điện thoại / SĐT
  /(?:sđt|điện thoại|số của tôi|liên hệ tôi)/i,
  // Bệnh nền
  /(?:tim mạch|tiểu đường|huyết áp|hen suyễn|dị ứng|đông máu)/i,
  // Đã phẫu thuật trước
  /(?:đã làm|phẫu thuật.*trước|sửa lại|hỏng.*trước)/i,
  // Bức xúc
  /(?:tệ|dở|kém|không hài lòng|báo báo chí|khiếu nại)/i,
  // Dưới 18
  /(?:tôi.*(?:1[0-7]|dưới 18)|con tôi.*(?:1[0-7]))/i,
];

/**
 * Tìm các FAQ liên quan để nhét vào prompt RAG.
 * Trả về top 3-5 FAQ khớp nhiều keyword nhất với user query.
 */
export function findRelevantFAQs(userQuery: string, topK = 4): FAQ[] {
  const query = userQuery.toLowerCase();
  const scored = BUSINESS_KB.map((faq) => {
    const matchCount = faq.keywords.filter((kw) =>
      query.includes(kw.toLowerCase())
    ).length;
    return { faq, score: matchCount };
  });

  // Nếu không có FAQ nào khớp, trả về top general FAQs
  const matched = scored.filter((s) => s.score > 0);
  if (matched.length === 0) {
    return BUSINESS_KB.slice(0, topK);
  }

  return matched
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.faq);
}

/**
 * Detect handoff intent — có nên chuyển cho nhân viên thật không.
 */
export function shouldHandoff(userMessage: string): boolean {
  return HANDOFF_TRIGGERS.some((pattern) => pattern.test(userMessage));
}

/**
 * Format FAQs thành text để nhét vào prompt LLM.
 */
export function formatKBForChatPrompt(faqs: FAQ[]): string {
  return faqs
    .map(
      (f, i) => `[Q&A ${i + 1}] (${f.category})
Q: ${f.question}
A: ${f.answer}`
    )
    .join('\n\n');
}
