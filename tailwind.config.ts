import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        fraunces: ['var(--font-fraunces)', 'Georgia', 'serif'],
        nunito: ['var(--font-nunito)', 'sans-serif'],
      },
      colors: {
        paper: '#FAF7F2',
        ink: '#2C2420',
        muted: '#A09488',
        rim: '#EDE8E0',
        sage: {
          DEFAULT: '#5B7E6B',
          dark: '#4A6B59',
          light: '#EBF2EE',
        },
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1', maxHeight: '80px', marginBottom: '8px' },
          '100%': { transform: 'translateX(16px)', opacity: '0', maxHeight: '0', marginBottom: '0' },
        },
        popIn: {
          '0%': { transform: 'scale(0.85)' },
          '55%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'slide-in': 'slideIn 0.25s ease-out',
        'slide-out': 'slideOut 0.28s ease-in forwards',
        'pop-in': 'popIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
