import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: '#0B0F1A', 900: '#070A12', 800: '#0B0F1A', 700: '#121829', 600: '#1A2236' },
        alert: { DEFAULT: '#FF3B4E', soft: '#FF6B79', deep: '#C41E30' },
        gold: { DEFAULT: '#FFB938', soft: '#FFD27A', deep: '#D98F0A' },
        teal: { DEFAULT: '#2DD4BF', soft: '#7CE8DA', deep: '#119E8D' },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 40px rgba(255,59,78,0.45)',
        'glow-gold': '0 0 40px rgba(255,185,56,0.35)',
        'glow-teal': '0 0 40px rgba(45,212,191,0.3)',
      },
      backgroundImage: {
        'gold-text': 'linear-gradient(90deg,#FFD27A 0%,#FFB938 50%,#FF9F1C 100%)',
        'red-btn': 'linear-gradient(135deg,#FF5A6A 0%,#FF3B4E 50%,#D41F33 100%)',
        'night-glow':
          'radial-gradient(60% 50% at 80% 20%, rgba(255,59,78,0.18) 0%, transparent 70%), radial-gradient(50% 40% at 10% 90%, rgba(255,185,56,0.12) 0%, transparent 70%)',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.4)', opacity: '0.7' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0) rotate(-6deg)' },
          '50%': { transform: 'translateY(-14px) rotate(-5deg)' },
        },
        rain: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-60px 400px' },
        },
        ecg: {
          '0%': { strokeDashoffset: '1200' },
          '100%': { strokeDashoffset: '0' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.25' },
          '50%': { opacity: '1' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        ripple: 'ripple 2.4s cubic-bezier(0.2,0.6,0.3,1) infinite',
        float: 'float 6s ease-in-out infinite',
        rain: 'rain 0.9s linear infinite',
        ecg: 'ecg 3s linear infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        orbit: 'orbit 18s linear infinite',
        shimmer: 'shimmer 4s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
