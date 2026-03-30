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
          red: '#dc2626',
          amber: '#f59e0b',
          rose: '#fb7185',
          yellow: '#facc15',
        },
        charcoal: {
          50: '#f5f0eb',
          100: '#d4c4b0',
          200: '#a8a29e',
          300: '#78716c',
          400: '#57534e',
          500: '#44403c',
          600: '#292524',
          700: '#1c1917',
          800: '#111111',
          900: '#0c0c0c',
          950: '#080808',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
