/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          950: '#08090c',
          900: '#0e1117',
          800: '#151922',
          700: '#1e2430',
          600: '#2b3345',
          accent: '#e50914',
          'accent-hover': '#f43f5e',
          gold: '#f59e0b',
          cyan: '#06b6d4',
          emerald: '#10b981',
          purple: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-crimson': '0 0 25px -5px rgba(229, 9, 20, 0.45)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.45)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.45)',
        'screen-glow': '0 15px 40px -10px rgba(6, 182, 212, 0.35)',
      },
      backgroundImage: {
        'cinema-gradient': 'linear-gradient(180deg, rgba(14, 17, 23, 0.8) 0%, #08090c 100%)',
        'crimson-gradient': 'linear-gradient(135deg, #e50914 0%, #991b1b 100%)',
      },
    },
  },
  plugins: [],
};
