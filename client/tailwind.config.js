/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stocksense: {
          navy: {
            DEFAULT: '#0F172A',
            light: '#1E293B',
            dark: '#020617',
          },
          teal: {
            DEFAULT: '#0D9488',
            hover: '#0F766E',
            light: '#14B8A6',
          },
          coral: {
            DEFAULT: '#F43F5E',
            hover: '#E11D48',
            light: '#FB7185',
          },
          canvas: '#F8FAFC',
        },
      },
    },
  },
  plugins: [],
}
