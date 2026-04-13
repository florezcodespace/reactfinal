/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        space: {
          950: '#050505',
          900: '#090B13',
          800: '#10172A',
          700: '#18233D',
        },
        aurora: {
          400: '#6EE7F9',
          500: '#38BDF8',
          600: '#0EA5E9',
        },
        nebula: {
          400: '#C084FC',
          500: '#A855F7',
        },
      },
      boxShadow: {
        glow: '0 0 30px rgba(56, 189, 248, 0.18)',
      },
      backgroundImage: {
        stars:
          'radial-gradient(circle at 20% 20%, rgba(192, 132, 252, 0.18), transparent 30%), radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.22), transparent 25%), radial-gradient(circle at 50% 80%, rgba(14, 165, 233, 0.16), transparent 35%)',
      },
    },
  },
  plugins: [],
}
