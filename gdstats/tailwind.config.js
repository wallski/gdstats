/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gd: {
          dark: '#0a0a0f',
          darker: '#0f0a1a',
          panel: '#13131f',
          violet: '#7C3AED',
          purple: '#A855F7',
          light: '#C084FC',
          deep: '#2E1065',
          cyan: '#06B6D4',
          pink: '#EC4899',
          gold: '#FBBF24',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}