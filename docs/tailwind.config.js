import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        inset: 'var(--bg-inset)',
        'border-default': 'var(--border-default)',
        'border-strong': 'var(--border-strong)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-strong': 'var(--accent-strong)',
        'accent-dim': 'var(--accent-dim)',
        'accent-subtle': 'var(--accent-subtle)',
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        running: 'var(--running)',
        focus: 'var(--focus)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        prose: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      fontSize: {
        'display-3xl': ['var(--text-display-3xl)', { lineHeight: 'var(--leading-display)' }],
        'display-2xl': ['var(--text-display-2xl)', { lineHeight: 'var(--leading-display)' }],
        'display-xl': ['var(--text-display-xl)', { lineHeight: 'var(--leading-display)' }],
        'display-lg': ['var(--text-display-lg)', { lineHeight: 'var(--leading-tight)' }],
        heading: ['var(--text-heading)', { lineHeight: 'var(--leading-tight)' }],
        body: ['var(--text-body)', { lineHeight: 'var(--leading-normal)' }],
        label: ['var(--text-label)', { lineHeight: 'var(--leading-normal)' }],
        caption: ['var(--text-caption)', { lineHeight: 'var(--leading-normal)' }],
        micro: ['var(--text-micro)', { lineHeight: 'var(--leading-normal)' }],
        prose: ['var(--text-prose)', { lineHeight: 'var(--leading-prose)' }],
        'prose-sm': ['var(--text-prose-sm)', { lineHeight: 'var(--leading-normal)' }],
      },
      animation: {
        pulse: 'pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [typography],
}
