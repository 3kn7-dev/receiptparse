/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        bg: '#0a0a0f',
        surface: '#0f0f18',
        border: '#1e1e2e',
        green: {
          dim: '#1a3a26',
          mid: '#2a5a3a',
          bright: '#3a6b4a',
          text: '#7dd4a0',
        },
      },
    },
  },
  plugins: [],
}
