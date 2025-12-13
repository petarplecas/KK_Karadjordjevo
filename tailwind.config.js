/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'kk-primary': '#1a5490',      // Košarkaška plava
        'kk-secondary': '#f97316',    // Košarkaška narandžasta
        'kk-dark': '#1e293b',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ['light'],
    base: true,
    styled: true,
    utils: true,
  },
}

