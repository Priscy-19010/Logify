/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: { 50:'#f2f8f4',100:'#e0f0e6',200:'#bde0c9',300:'#8fc9a6',400:'#5cab7e',500:'#398f61',600:'#28724c',700:'#215c3f',800:'#1c4933',900:'#173c2b'},
        clay: { 50:'#fff7ed',100:'#ffedd3',200:'#ffd6a5',300:'#ffb75d',400:'#ff9d3d',500:'#f77f1a',600:'#e06310',700:'#ba4a10',800:'#953a14',900:'#7a3113'},
        ink: { 50:'#f4f6f8',100:'#e4e9ee',200:'#c9d3dd',300:'#a3b3c2',400:'#7590a5',500:'#56748c',600:'#445c73',700:'#394c5e',800:'#2f3f4e',900:'#1c2833'},
        trust: { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8'},
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
