/** @type {import('tailwindcss').Config} */
module.exports = {
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
          DEFAULT: '#6366f1', // Indigo 500
          hover: '#818cf8',   // Indigo 400
          dark: '#4f46e5',    // Indigo 600
        },
        secondary: '#71717a', // Zinc 500
        background: {
          light: '#ffffff',
          dark: '#09090b',    // Rich Black (SaaS Style)
          card: '#18181b',    // Zinc 900
          surface: '#121214',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          strong: '#27272a',  // Zinc 800
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
