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
          50:  '#eff5ff',
          100: '#dbe7fe',
          200: '#bfd5fe',
          300: '#93bbfd',
          400: '#4a7df0',
          500: '#285ccc', // Mid Blue
          600: '#1f4cb0',
          700: '#173b8a',
          800: '#14316f',
          900: '#142959',
          950: '#0c1a3b',
        },
        midblue: {
          50:  '#eff5ff',
          100: '#dbe7fe',
          200: '#bfd5fe',
          300: '#93bbfd',
          400: '#4a7df0',
          500: '#285ccc', // User requested hex #285ccc
          600: '#1f4cb0',
          700: '#173b8a',
          800: '#14316f',
          900: '#142959',
        },
        buttermilk: {
          50:  '#fffdf5',
          100: '#fff9db',
          200: '#fff2bd', // User requested hex #fff2bd
          300: '#fee88a',
          400: '#fde047',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
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
        display: ['Outfit', 'Poppins', 'sans-serif'],
        sans:    ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
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
        'glow-accent': '0 0 24px rgba(40, 92, 204, 0.45)',
        'glow-buttermilk': '0 0 24px rgba(255, 242, 189, 0.7)',
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
