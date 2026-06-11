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
          bg: '#0F1923',
          active: '#1B3A5C',
          hover: '#162537',
          border: '#1E2D3D',
          text: '#94A3B8',
          textActive: '#F1F5F9',
        },
        marine: {
          50: '#EFF8FF',
          100: '#DBEAFE',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          900: '#0C4A6E',
        },
        surface: {
          0: '#FFFFFF',
          1: '#F8FAFC',
          2: '#F1F5F9',
          3: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-md': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}
