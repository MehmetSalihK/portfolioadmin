import type { Config } from 'tailwindcss'

/**
 * TRACÉ — Direction artistique « Editorial Engineering »
 * Les teintes indigo / rose / amber sont reconverties vers les trois
 * dimensions de l'identité (Dev / Creative / Maker) via variables CSS,
 * ce qui les fait basculer automatiquement d'un thème à l'autre.
 */
const rgbVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`

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
          500: '#4f46e5',
          600: '#3e35cc',
          700: '#312aab',
          800: '#2a248a',
          900: '#252173',
          950: '#161344',
          DEFAULT: '#4f46e5',
        },
        accent: {
          DEFAULT: '#ff4a17',
          hover: '#e63f0f',
          ink: '#c0330a',
        },
        background: {
          light: '#efeae1',
          dark: '#0c0c0b',
          card: '#131312',
          surface: '#1a1a18',
        },
        border: {
          subtle: 'rgba(20, 19, 15, 0.07)',
          strong: 'rgba(20, 19, 15, 0.18)',
        },
        /* Dimension DEV — bleu de méthode */
        indigo: {
          300: rgbVar('--c-dev-300'),
          400: rgbVar('--c-dev-400'),
          500: rgbVar('--c-dev-500'),
          600: rgbVar('--c-dev-600'),
          700: rgbVar('--c-dev-700'),
        },
        /* Dimension CREATIVE — vermillon */
        rose: {
          300: rgbVar('--c-creative-300'),
          400: rgbVar('--c-creative-400'),
          500: rgbVar('--c-creative-500'),
          600: rgbVar('--c-creative-600'),
          700: rgbVar('--c-creative-700'),
        },
        /* Dimension MAKER — ocre */
        amber: {
          300: rgbVar('--c-maker-300'),
          400: rgbVar('--c-maker-400'),
          500: rgbVar('--c-maker-500'),
          600: rgbVar('--c-maker-600'),
          700: rgbVar('--c-maker-700'),
        },
      },
      fontFamily: {
        display: ['Satoshi', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['Satoshi', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        jakarta: ['Satoshi', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        sans: ['Satoshi', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        tech: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'premium': '0 1px 0 rgba(20,19,15,0.05)',
        'premium-lg': '0 18px 40px -28px rgba(20,19,15,0.55)',
        'lift': '18px 18px 0 -12px rgba(20,19,15,0.08)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'snappy': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
