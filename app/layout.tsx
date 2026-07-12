import type { Metadata } from 'next';
import './globals.css';

// Metadata mặc định — mỗi page có thể override
export const metadata: Metadata = {
  title: 'AZ FACE INSIGHT — Phân tích tỷ lệ khuôn mặt bằng AI',
  description:
    'Quét khuôn mặt trong 30 giây, nhận báo cáo tỷ lệ khuôn mặt cá nhân hoá theo chuẩn Á Đông và đề xuất dáng mũi phù hợp từ AZ NOSE.',
  robots: {
    index: true,
    follow: true,
  },
};

// TODO Sprint 5: thêm GA4 + Meta Pixel + Clarity script tags theo lib/utils/analytics.ts
// Load async, KHÔNG block render

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
