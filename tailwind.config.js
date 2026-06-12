/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#111827',
          active: '#1F2937',
          hover: '#1F2937',
          border: '#1F2937',
          text: '#9CA3AF',
          textActive: '#F9FAFB',
        },
        bento: {
          bg: '#F5F5F7',
          card: '#FFFFFF',
        },
        accent: {
          blue: '#5B8DEF',
          'blue-soft': '#EBF2FF',
          green: '#34C759',
          'green-soft': '#DCFCE7',
          orange: '#FF9F0A',
          'orange-soft': '#FFF3DC',
          red: '#FF453A',
          'red-soft': '#FFE5E4',
          purple: '#BF5AF2',
          'purple-soft': '#F3E8FF',
          teal: '#5AC8FA',
          'teal-soft': '#E0F7FF',
        },
        marine: {
          50: '#EFF8FF',
          100: '#DBEAFE',
          500: '#5B8DEF',
          600: '#4A7DE0',
          700: '#3A6DD0',
          900: '#1E3A6E',
        },
        surface: {
          0: '#FFFFFF',
          1: '#F5F5F7',
          2: '#F5F5F7',
          3: '#E5E5EA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'bento': '16px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        'card-md': '0 4px 20px rgba(0,0,0,0.08)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
