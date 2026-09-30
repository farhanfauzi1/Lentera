/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#EEF6F1',
          200: '#CFE8D8',
          500: '#3FA86A',
          700: '#1B6B3F',
          900: '#0F4D2E',
        },
        bg: '#F3F4F3',
        surface: '#FFFFFF',
        text: '#111827',
        muted: '#9CA3AF',
        border: '#E5E7EB',
        warning: '#F59E0B',
        danger: '#DC2626',
      },
      borderRadius: {
        'card': '16px',
        'pill': '999px',
        'input': '12px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      width: {
        sidebar: '240px',
      },
      height: {
        header: '64px',
      }
    },
  },
  plugins: [],
}
