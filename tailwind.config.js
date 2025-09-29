import { type Config } from 'tailwindcss'

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0a0a',
        'purple-glow': '#8b5cf6',
      },
      fontFamily: {
        'nanum': ['Nanum Square Round', 'sans-serif'],
        'sans': ['Nanum Square Round', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
