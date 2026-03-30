/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#ff8c4a',
          500: '#ff6b1a',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        fire: {
          orange: '#ff6b1a',
          red: '#ef4444',
          amber: '#f59e0b',
          rose: '#fb7185',
          yellow: '#facc15',
        },
      },
    },
  },
  plugins: [],
}
