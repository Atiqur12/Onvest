import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#EEF2FB',
          100: '#D6E0F7',
          500: '#1B4FBF',
          600: '#1644A8',
          700: '#0D2A6E',
          900: '#070F28',
        },
        ink: {
          900: '#0F1724',
          700: '#1F2937',
          500: '#6B7280',
          400: '#9CA3AF',
          200: '#E5E7EB',
          100: '#F3F4F6',
        },
        canvas: {
          DEFAULT: '#F8F7F4',
          card: '#FFFFFF',
          dark: '#0F1724',
          sidebar: '#111827',
        },
        accent: {
          teal: '#3ECFB2',
          amber: '#F59E0B',
          rose: '#EF4444',
          emerald: '#10B981',
        },
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        elevated: '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        lifted: '0 20px 40px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)',
        glow: '0 4px 20px rgba(27, 79, 191, 0.20)',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 400ms ease-out both',
        'slide-in-right': 'slide-in-right 300ms ease-out both',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
