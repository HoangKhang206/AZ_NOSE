import Link from 'next/link';

// TODO Sprint 0: đây là placeholder trang chủ để dev server chạy được.
// Trong thực tế, phân hệ này sẽ được nhúng vào aznose.vn dưới dạng iframe hoặc component,
// không phải trang standalone. Xem docs/references/code_patterns.md.

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-2xl border border-neutral-200 bg-brand-50 p-8">
        <h1 className="text-3xl font-bold text-brand-700">
          AZ FACE INSIGHT
        </h1>
        <p className="mt-2 text-brand-600">
          Web-app đang trong giai đoạn phát triển.
        </p>
        <p className="mt-6 text-sm text-neutral-700">
          Đây là placeholder trang chủ. Phân hệ chính nằm ở đường dẫn:
        </p>
        <Link
          href="/analyze"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 font-medium text-white hover:bg-brand-600"
        >
          → Phân tích khuôn mặt (/analyze)
        </Link>
        <div className="mt-8 border-t border-brand-100 pt-6 text-xs text-neutral-500">
          <p>Xem <code className="rounded bg-white px-1.5 py-0.5">CLAUDE.md</code> và <code className="rounded bg-white px-1.5 py-0.5">docs/</code> để biết thêm chi tiết dự án.</p>
        </div>
      </div>
    </main>
  );
}
