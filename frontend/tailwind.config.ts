import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'solana-green': '#14F195',
        'solana-purple': '#9945FF',
        'sol-gradient-from': '#4E46E5',
        'sol-gradient-to': '#14F195',
        'dark': {
          DEFAULT: '#121212',
          'lighter': '#1E1E1E',
          'card': '#232328',
          'card-secondary': '#2a2a32',
          'background': '#16161e',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'sol-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      dropShadow: {
        'glow': '0 0 10px rgba(168, 85, 247, 0.35)',
      },
    },
  },
  plugins: [],
}
export default config 