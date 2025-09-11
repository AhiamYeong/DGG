/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'dp-1': '1px',
        'dp-2': '2px',
        'dp-4': '4px',
        'dp-8': '8px',
        'dp-12': '12px',
        'dp-16': '16px',
        'dp-20': '20px',
        'dp-24': '24px',
        'dp-32': '32px',
        'dp-40': '40px',
        'dp-48': '48px',
        'dp-56': '56px',
        'dp-64': '64px',
        'dp-72': '72px',
        'dp-80': '80px',
        'dp-96': '96px',
      },
      fontSize: {
        'dp-12': ['12px', '16px'],
        'dp-14': ['14px', '20px'],
        'dp-16': ['16px', '24px'],
        'dp-18': ['18px', '28px'],
        'dp-20': ['20px', '28px'],
        'dp-24': ['24px', '32px'],
        'dp-28': ['28px', '36px'],
        'dp-32': ['32px', '40px'],
        'dp-36': ['36px', '44px'],
        'dp-48': ['48px', '56px'],
      },
    },
  },
  plugins: [],
}
