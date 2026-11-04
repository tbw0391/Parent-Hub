import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: '#ffffff',
        panel: '#f5f5f5',
        acid: '#111111',
        acidDim: '#6b7280',
        pumpkin: '#ea580c',
        ink: '#111111',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      keyframes: {
        'logo-in': {
          '0%': { transform: 'translateY(16px) scale(0.85)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'logo-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'balloon-float': {
          '0%': { transform: 'translateY(0) rotate(-4deg)' },
          '50%': { transform: 'translateY(-10px) rotate(4deg)' },
          '100%': { transform: 'translateY(0) rotate(-4deg)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(60px) rotate(360deg)', opacity: '0' },
        },
      },
      animation: {
        'logo-in': 'logo-in 0.8s ease-out both, logo-float 4s ease-in-out 0.8s infinite',
        'balloon-float': 'balloon-float 2.4s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 2.2s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
