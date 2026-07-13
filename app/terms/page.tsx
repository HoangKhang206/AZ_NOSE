import Link from 'next/link';

export const metadata = { title: 'Điều khoản sử dụng — AZ FACE INSIGHT' };

export default function TermsPage() {
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

        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Điều khoản sử dụng</h1>

        <div className="prose prose-neutral text-sm leading-relaxed space-y-5 text-neutral-700">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>

          <p>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a
            odio. Nullam varius, turpis molestie dictum semper, diam lectus gravida nisi, a
            facilisis dui lacus id erat.
          </p>

          <p>
            Praesent egestas tristique nibh. Sed a libero. Cras varius. Donec vitae orci sed
            dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus
            eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus interdum semper.
            Phasellus elit. Maecenas ipsum velit, consectetuer eu lobortis ut, dictum at dui.
          </p>
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
