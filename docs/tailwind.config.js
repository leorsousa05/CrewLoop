import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#000000",
          surface: "#0b0a0f",
          elevated: "#121117",
        },
        text: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
          muted: "#475569",
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'glow-drift': 'glowDrift 20s infinite ease-in-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 4px rgba(6, 182, 212, 0.1), 0 0 12px rgba(6, 182, 212, 0.05)' },
          '50%': { boxShadow: '0 0 16px rgba(6, 182, 212, 0.3), 0 0 32px rgba(6, 182, 212, 0.15)' },
        },
        glowDrift: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [typography],
}
