/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22AA66',
          dark: '#1a8850',
          light: '#2bc47a'
        }
      }
    },
  },
  plugins: [],
}

