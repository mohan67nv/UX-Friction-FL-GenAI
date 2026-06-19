import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Supabase-inspired dark theme
        background: {
          DEFAULT: '#121212',
          panel: '#1C1C1C',
          elevated: '#232323',
          hover: '#2A2A2A',
        },
        border: {
          DEFAULT: '#2E2E2E',
          hover: '#3E3E3E',
        },
        text: {
          primary: '#EDEDED',
          secondary: '#8B949E',
          tertiary: '#6E7681',
        },
        brand: {
          DEFAULT: '#3ECF8E',
          hover: '#24B47E',
          light: '#5AE5A6',
        },
        success: '#3ECF8E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        DEFAULT: '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};

export default config;
