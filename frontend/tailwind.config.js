import typography from '@tailwindcss/typography';
import defaultTheme from 'tailwindcss/defaultTheme';

/**
 * Design tokens — theme "White + Green":
 * navy blue for headings/text, deep green for primary actions, orange accent, white/light surfaces.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Navy blue — headings, body emphasis, top bar, footer, secondary buttons
        primary: {
          DEFAULT: '#123F73',
          50: '#EEF4FB',
          100: '#D7E4F3',
          200: '#AFC8E6',
          300: '#7FA4D2',
          400: '#4D7DB9',
          500: '#2A5F9E',
          600: '#1B4F8A',
          700: '#123F73',
          800: '#0C305A',
          900: '#082343',
        },
        // Deep green — primary call-to-action buttons, "SOLAR ENERGY", success accents
        brand: {
          DEFAULT: '#1E7B34',
          light: '#43A047',
          dark: '#176128',
          50: '#ECF7EE',
          100: '#D2ECD7',
        },
        // Orange — underlines, highlights, active indicators, focus rings
        accent: {
          DEFAULT: '#F57C1F',
          hover: '#DD6A0F',
          light: '#FFB067',
          deep: '#C2570A',
          50: '#FFF4EA',
          100: '#FFE4CC',
        },
        // Solar-panel blue — project-type chips and info notes
        panel: { DEFAULT: '#1D6FB0', light: '#3B8FD0', 50: '#EAF3FB' },
        success: '#16A34A',
        danger: '#DC2626',
        surface: '#FFFFFF',
        muted: '#F5F8FB',
        border: '#E2E8F0',
        ink: { DEFAULT: '#1E293B', muted: '#55657A' },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      maxWidth: { prose: '70ch' },
      boxShadow: {
        card: '0 1px 2px rgba(8,35,67,.06), 0 4px 16px rgba(8,35,67,.06)',
        'card-hover': '0 4px 8px rgba(8,35,67,.08), 0 12px 32px rgba(8,35,67,.12)',
      },
      backgroundImage: {
        // Logo sun — orange to yellow
        'sun-gradient': 'linear-gradient(135deg, #F58A1F 0%, #F5A623 45%, #FFD66B 100%)',
        'solar-gradient': 'linear-gradient(135deg, #0C305A 0%, #123F73 50%, #2A5F9E 100%)',
        'brand-gradient': 'linear-gradient(135deg, #176128 0%, #1E7B34 50%, #43A047 100%)',
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
