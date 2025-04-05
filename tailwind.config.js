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
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          secondary: {
            50: '#f5f7fa',
            100: '#eaeef4',
            200: '#dce4ed',
            300: '#cbd3e0',
            400: '#a3b2cc',
            500: '#8094b8',
            600: '#5e7499',
            700: '#4a5c7b',
            800: '#3f4d66',
            900: '#2d3748',
          },
        },
        fontFamily: {
          sans: ['Inter var', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }