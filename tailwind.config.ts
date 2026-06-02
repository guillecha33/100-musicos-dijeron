import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-bebas)', 'impact', 'sans-serif'],
        body: ['var(--font-rajdhani)', 'sans-serif'],
        score: ['var(--font-oswald)', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#07071a',
          surface: '#0d0d2b',
          card: '#13133a',
          elevated: '#1a1a4a',
        },
        border: {
          DEFAULT: '#2a2a60',
          bright: '#4a4a9a',
        },
        gold: {
          DEFAULT: '#f5c518',
          light: '#ffd94a',
          dark: '#c9a010',
          glow: 'rgba(245,197,24,0.3)',
        },
        neon: {
          blue: '#00d4ff',
          green: '#00ff88',
          pink: '#ff0080',
        },
        strike: '#ff1744',
        team: {
          one: '#0099ff',
          two: '#ff6600',
        },
      },
      boxShadow: {
        gold: '0 0 20px rgba(245,197,24,0.4), 0 0 60px rgba(245,197,24,0.15)',
        'gold-sm': '0 0 10px rgba(245,197,24,0.3)',
        neon: '0 0 20px rgba(0,212,255,0.4)',
        strike: '0 0 30px rgba(255,23,68,0.6)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'reveal-answer': 'revealAnswer 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'strike-flash': 'strikeFlash 0.4s ease-out forwards',
        'score-pulse': 'scorePulse 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'scanline': 'scanline 4s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97)',
        'victory': 'victory 1s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'count-up': 'countUp 0.5s ease-out forwards',
      },
      keyframes: {
        revealAnswer: {
          '0%': { opacity: '0', transform: 'scaleX(0) translateX(-20px)', filter: 'blur(10px)' },
          '60%': { filter: 'blur(0px)' },
          '100%': { opacity: '1', transform: 'scaleX(1) translateX(0)', filter: 'blur(0px)' },
        },
        strikeFlash: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scorePulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-2px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(4px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-6px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(6px, 0, 0)' },
        },
        victory: {
          '0%': { opacity: '0', transform: 'scale(0.3) rotate(-10deg)' },
          '70%': { transform: 'scale(1.1) rotate(2deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        countUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
