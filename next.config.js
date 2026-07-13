/** @type {import('next').NextConfig} */

// CSP headers theo docs/references/tech_constraints.md section 6.4
// Chỉ cho phép load script từ các domain đã whitelist
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.jsdelivr.net *.googletagmanager.com *.facebook.net *.clarity.ms;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: *.aznose.vn;
  media-src 'self' blob:;
  connect-src 'self' cdn.jsdelivr.net *.googleapis.com *.facebook.com *.clarity.ms *.google-analytics.com;
  worker-src 'self' blob:;
  frame-ancestors 'none';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig = {
  reactStrictMode: false, // MediaPipe WASM không tương thích với Strict Mode double-mount

  // Headers bảo mật cho toàn bộ route
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Cho phép import MediaPipe từ CDN, đồng thời hạn chế bundle size
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
};

module.exports = nextConfig;
