/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tactical: {
          dark: '#080c14',
          panel: '#0d1527',
          card: '#121d34',
          border: '#1e293b',
          accent: '#06b6d4',
          neon: '#00f0ff',
          warn: '#f59e0b',
          danger: '#ef4444',
          success: '#10b981',
          radar: '#14b8a6'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'radar-sweep': 'spin 4s linear infinite',
      }
    },
  },
  plugins: [],
}
