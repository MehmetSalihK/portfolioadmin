import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#a1b5fa',
          400: '#7089f5',
          500: '#4f46e5', // Brand Indigo (Premium SaaS)
          600: '#3e35cc',
          700: '#312aab',
          800: '#2a248a',
          900: '#252173',
          950: '#161344',
          DEFAULT: '#4f46e5',
        },
        background: {
          light: '#ffffff',
          dark: '#020617',    // Deep Slate
          card: '#0f172a',    // Slate 900
          surface: '#1e293b', // Slate 800
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.05)',
          strong: '#1e293b',
        }
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0,0,0,0.1), 0 5px 20px -5px rgba(0,0,0,0.05)',
        'premium-lg': '0 25px 60px -12px rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
