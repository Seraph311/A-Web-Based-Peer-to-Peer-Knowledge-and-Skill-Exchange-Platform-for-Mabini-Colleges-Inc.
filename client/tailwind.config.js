/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        warm: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Lato', 'sans-serif'],
        sans: ['Lato', 'sans-serif']
      },
      fontSize: {
        'display': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-sm': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'title': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      }
    }
  },
  plugins: [],
}
