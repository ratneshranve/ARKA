import typography from '@tailwindcss/typography';
import defaultTheme from 'tailwindcss/defaultTheme';

/** Design tokens matching the ARKA Solar Energy logo (Charcoal + Leaf Green + Solar Blue). */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Charcoal — "ARKA" wordmark, structure and roof in logo
        primary: {
          DEFAULT: '#263238',
          50: '#F2F5F6',
          100: '#E1E7EA',
          200: '#C5D0D5',
          300: '#9AA9B0',
          400: '#6B7D86',
          500: '#46575F',
          600: '#37474F',
          700: '#263238',
          800: '#1C262B',
          900: '#10181C',
        },
        // Leaf green — "SOLAR ENERGY" and leaves in logo
        brand: {
          DEFAULT: '#2E8B2E',
          light: '#5FAE2E',
          dark: '#23702A',
          50: '#EEF7EC',
          100: '#D7EDD2',
        },
        // Solar Blue — clean photovoltaic solar panel blue (replacing yellow)
        accent: {
          DEFAULT: '#0284C7',
          hover: '#0369A1',
          light: '#38BDF8',
          deep: '#075985',
          50: '#F0F9FF',
          100: '#E0F2FE',
        },
        // Solar panel teal
        panel: { DEFAULT: '#0E6E6B', light: '#13908B', 50: '#E7F4F3' },
        success: '#16A34A',
        danger: '#DC2626',
        surface: '#FFFFFF',
        muted: '#F5F7F6',
        border: '#E3E7EA',
        ink: { DEFAULT: '#1F2937', muted: '#5B6577' },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      maxWidth: { prose: '70ch' },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,28,.06), 0 4px 16px rgba(16,24,28,.06)',
        'card-hover': '0 4px 8px rgba(16,24,28,.08), 0 12px 32px rgba(16,24,28,.12)',
      },
      backgroundImage: {
        // Logo sun — orange to yellow
        'sun-gradient': 'linear-gradient(135deg, #F58A1F 0%, #F5A623 45%, #FFD66B 100%)',
        'solar-gradient': 'linear-gradient(135deg, #075985 0%, #0284C7 50%, #38BDF8 100%)',
        'brand-gradient': 'linear-gradient(135deg, #23702A 0%, #2E8B2E 50%, #5FAE2E 100%)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'scale-in': { from: { opacity: 0, transform: 'scale(.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in .2s ease-out',
        'slide-in-right': 'slide-in-right .25s ease-out',
        'slide-in-left': 'slide-in-left .25s ease-out',
        'scale-in': 'scale-in .2s ease-out',
      },
    },
  },
  plugins: [typography],
};
