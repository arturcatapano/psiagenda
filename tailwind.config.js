/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'psi-primary': '#efc9c1',
        'psi-btn': '#c6444c',
        'psi-dark': '#2d2d2d',
      },
    },
  },
  plugins: [],
}