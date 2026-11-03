import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './data/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: '#0F1535',
        indigo: {
          DEFAULT: '#4F6BFF',
          50: '#EEF1FF',
          100: '#E0E6FF',
          200: '#C2CCFF',
          500: '#4F6BFF',
          600: '#3A55E6',
          700: '#2B41BF',
        },
        board: '#F5F7FB',
        sky: { DEFAULT: '#2E9BE0', 100: '#E3F1FD' },
        slate: { DEFAULT: '#5B6B8C', 100: '#E7EAF0' },
        mint: { DEFAULT: '#1FA389', 100: '#E1F5EF' },
        violet: { DEFAULT: '#6E5BE8', 100: '#ECE8FF' },
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(15, 21, 53, 0.18), 0 2px 6px -2px rgba(15, 21, 53, 0.08)',
        lift: '0 18px 40px -12px rgba(15, 21, 53, 0.28), 0 4px 10px -4px rgba(15, 21, 53, 0.1)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
