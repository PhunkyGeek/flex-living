/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#21A47C',
          light: '#40C78D',
          dark: '#1C8D6C',
        },
      },
    },
  },
  plugins: [],
};