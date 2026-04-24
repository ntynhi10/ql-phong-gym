/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./public/js/**/*.js"
  ],
  safelist: [
    "hidden",
    "flex",
    "md:flex",
    "md:ml-[-30px]",
  ],
  theme: {
    extend: {
      colors: {
        primaryBtn: "#1E5AA6",
        primaryHover: "#174a87",
        background: "#143F76",
        glass: "rgba(255,255,255,0.7)",

        textMain: "#374151",

        textSub: "#8F8E8E"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],

        textSub: "#8F8E8E",

        checkinBg: "#B8D3F8",
        checkinHover: "#9BBEF5"

      }
    }
  },
  plugins: [],
}