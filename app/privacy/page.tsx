import Link from 'next/link';

export const metadata = { title: 'Chính sách bảo mật — AZ FACE INSIGHT' };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/analyze"
          className="inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 mb-8 transition-colors"
        >
          <BackArrow />
          Quay lại
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Chính sách bảo mật</h1>
        <p className="text-xs text-neutral-400 mb-8">
          Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-neutral-700">

          <section>
            <h2 className="font-semibold text-neutral-900 mb-2">1. Cam kết không lưu ảnh khuôn mặt</h2>
            <p>
              AZ FACE INSIGHT xử lý ảnh khuôn mặt hoàn toàn <strong>trên thiết bị của bạn
              (client-side)</strong> thông qua thư viện MediaPipe Face Mesh của Google. Ảnh và
              dữ liệu landmark <strong>không được tải lên bất kỳ máy chủ nào</strong>. Blob URL
              chỉ tồn tại trong tab trình duyệt hiện tại và bị xóa khi bạn đóng tab hoặc kết
              thúc phiên phân tích.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-2">2. Dữ liệu được gửi lên server</h2>
            <p>
              Dữ liệu duy nhất được gửi lên server API là <strong>kết quả số</strong> (góc mũi
              môi, góc mũi trán, loại cấu trúc mặt) — không chứa ảnh, không chứa thông tin định
              danh. Dữ liệu này dùng để tạo tư vấn AI cá nhân hoá và <strong>không được lưu
              trữ sau khi phiên kết thúc</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-2">3. Quyền của bạn theo Nghị định 13/2023</h2>
            <p>
              Theo Nghị định 13/2023/NĐ-CP, bạn có quyền: biết về việc xử lý dữ liệu, tiếp cận
              dữ liệu của mình, chỉnh sửa và xóa dữ liệu, phản đối hoặc hạn chế xử lý, khiếu
              nại đến cơ quan có thẩm quyền. Vì ảnh và số liệu không được lưu trữ trên server,
              không có hành động xóa nào cần thực hiện sau khi bạn đóng tab.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-2">4. Cookie và Analytics</h2>
            <p>
              Ứng dụng này không sử dụng cookie theo dõi. Phiên bản demo không thu thập dữ
              liệu analytics. Phiên bản production sẽ dùng Google Analytics 4 và Meta Pixel
              theo mục đích cải thiện trải nghiệm người dùng — sẽ được thông báo riêng.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-2">5. Liên hệ</h2>
            <p>
              Mọi câu hỏi về bảo mật dữ liệu, vui lòng liên hệ:{' '}
              <span className="text-brand-500">aznose.vn</span> hoặc qua Zalo:
              <span className="text-brand-500"> zalo.me/aznose</span>.
            </p>
          </section>
        </div>

        <p className="mt-8 text-xs text-neutral-400">Cập nhật lần cuối: 12/07/2026</p>
      </div>
    </main>
  );
}

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
