/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // New "Athletic Midnight Amber" palette
        'kk-primary': '#0f172a',      // Deep midnight blue (slate-900)
        'kk-secondary': '#1e293b',    // Surface dark (slate-800)
        'kk-accent': '#f59e0b',       // Vibrant amber
        'kk-accent-blue': '#3b82f6',  // Electric blue
        'kk-dark': '#0f172a',         // Same as primary for consistency
        'kk-surface': '#1e293b',      // Card backgrounds
        'kk-border': '#fbbf24',       // Border glow (amber-400)
        'kk-text': {
          'primary': '#ffffff',       // Pure white for better contrast
          'secondary': '#cbd5e1',     // Lighter muted text (slate-300)
          'dark': '#0f172a',          // Dark text on light
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Space Grotesk', 'Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.2)',
        'glow-amber-lg': '0 0 30px rgba(245, 158, 11, 0.4), 0 0 60px rgba(245, 158, 11, 0.3)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(245, 158, 11, 0.5), 0 0 60px rgba(245, 158, 11, 0.3)' },
        },
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        kktheme: {
          'primary': '#f59e0b',
          'secondary': '#3b82f6',
          'accent': '#10b981',
          'neutral': '#1e293b',
          'base-100': '#0f172a',
          'base-200': '#1e293b',
          'base-300': '#334155',
          'info': '#06b6d4',
          'success': '#10b981',
          'warning': '#f59e0b',
          'error': '#ef4444',
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
}

