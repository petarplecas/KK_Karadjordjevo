// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: 'https://kkkaradjordjevo.com',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    preact(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
  devToolbar: {
    enabled: false
  }
});