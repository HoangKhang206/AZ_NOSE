import type { Config } from 'tailwindcss';

// Brand palette AZ NOSE (từ mockup)
// Sử dụng qua class Tailwind: bg-brand-500, text-brand-600, border-brand-100...
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAECE7',
          100: '#F5C4B3',
          200: '#F0997B',
          400: '#D85A30',   // Primary orange
          500: '#D85A30',   // Alias
          600: '#993C1D',
          700: '#712B13',
          800: '#4A1B0C',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'landmark-appear': 'landmarkAppear 0.5s ease-out forwards',
      },
      keyframes: {
        landmarkAppear: {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '100%': { opacity: '0.85', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
