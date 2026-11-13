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
        canvas: '#090B10',
        surface: {
          DEFAULT: '#0F131F',
          raised: '#151B2C',
          inset: '#07090F',
          overlay: '#1A2237',
        },
        border: {
          subtle: '#171D2D',
          DEFAULT: '#1E2538',
          strong: '#2D3752',
          focus: '#6366F1',
        },
        content: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        accent: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#818CF8',
          glow: 'rgba(99, 102, 241, 0.25)',
        },
        severity: {
          high: '#F87171',
          medium: '#FBBF24',
          low: '#38BDF8',
          mint: '#34D399',
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
        DEFAULT: '7px',
        md: '10px',
        lg: '14px',
        full: '9999px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px -3px rgba(99, 102, 241, 0.3)',
      },
    },
  },
  plugins: [],
};
