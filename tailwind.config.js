/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#0D0E11',
        surface: {
          DEFAULT: '#16181D',
          raised: '#1F222A',
          overlay: '#252932',
        },
        border: {
          DEFAULT: '#282C37',
          strong: '#3E4452',
          focus: '#60A5FA',
        },
        content: {
          primary: '#F1F3F5',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
        severity: {
          high: '#F87171',
          medium: '#FBBF24',
          low: '#60A5FA',
          review: '#818CF8',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"IBM Plex Mono"',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        xs: '3px',
        sm: '5px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        popover: '0 4px 12px 0 rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
};

