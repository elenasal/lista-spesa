/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fresh Blue Design System
        snow: '#F8FAFC',
        cloud: '#F1F5F9',
        sky: {
          light: '#BAE6FD',
          DEFAULT: '#38BDF8',
          dark: '#0EA5E9',
        },
        ocean: {
          light: '#7DD3FC',
          DEFAULT: '#0EA5E9',
          dark: '#0284C7',
        },
        deep: {
          light: '#0EA5E9',
          DEFAULT: '#0284C7',
          dark: '#0369A1',
        },
        slate: {
          light: '#94A3B8',
          DEFAULT: '#64748B',
          dark: '#475569',
        },
        night: {
          light: '#334155',
          DEFAULT: '#1E293B',
          dark: '#0F172A',
        },
        // Semantic colors
        success: {
          light: '#DCFCE7',
          DEFAULT: '#22C55E',
          dark: '#15803D',
        },
        warning: {
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
          dark: '#B45309',
        },
        error: {
          light: '#FEE2E2',
          DEFAULT: '#EF4444',
          dark: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 12px -2px rgba(14, 165, 233, 0.15), 0 2px 6px -2px rgba(14, 165, 233, 0.1)',
        'soft-lg': '0 8px 24px -4px rgba(14, 165, 233, 0.18), 0 4px 10px -4px rgba(14, 165, 233, 0.12)',
        'soft-xl': '0 16px 40px -8px rgba(14, 165, 233, 0.22), 0 8px 16px -8px rgba(14, 165, 233, 0.14)',
        'glow': '0 0 20px rgba(56, 189, 248, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'check': 'check 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        check: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
