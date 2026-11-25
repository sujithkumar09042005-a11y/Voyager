/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        accent: {
          50:  'rgb(var(--accent-500-rgb) / 0.06)',
          100: 'rgb(var(--accent-500-rgb) / 0.12)',
          200: 'rgb(var(--accent-500-rgb) / 0.25)',
          300: 'rgb(var(--accent-400-rgb) / <alpha-value>)',
          400: 'rgb(var(--accent-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--accent-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--accent-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--accent-600-rgb) / <alpha-value>)',
          800: 'rgb(var(--accent-600-rgb) / <alpha-value>)',
          900: 'rgb(var(--accent-600-rgb) / <alpha-value>)',
          950: 'rgb(var(--accent-600-rgb) / <alpha-value>)',
        },
        midblue: {
          400: 'var(--accent-tertiary)',
          500: 'var(--accent-tertiary)',
          600: 'var(--accent-tertiary)',
        },
        onaccent: 'var(--on-accent)',
        ink: 'var(--text-primary)',
        paper: 'var(--bg-color)',
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        dark: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#060a14',
        },
      },
      fontFamily: {
        display: ['Fraunces Variable', 'Fraunces', 'Georgia', 'serif'],
        sans:    ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 var(--glass-shadow)',
        'glass-md': '0 8px 32px 0 var(--glass-shadow)',
        'glass-lg': '0 16px 48px 0 var(--glass-shadow)',
        'glow-accent': '0 0 0 3px var(--accent-glow)',
        'glow-buttermilk': '0 0 0 3px var(--accent-glow)',
      },
      animation: {
        'mesh-float': 'meshFloat 20s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite alternate',
        'ken-burns': 'kenBurns 10s ease-in-out infinite alternate',
      },
      keyframes: {
        meshFloat: {
          '0%':   { transform: 'translate(0px, 0px) scale(1)' },
          '50%':  { transform: 'translate(30px, -20px) scale(1.08)' },
          '100%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        pulseGlow: {
          '0%':   { opacity: '0.4', transform: 'scale(0.98)' },
          '100%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        kenBurns: {
          '0%':   { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
}
