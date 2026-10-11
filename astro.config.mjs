// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://opoto.jp',
  integrations: [
    sitemap({
      filter: (page) =>
        page !== 'https://opoto.jp/event/' && page !== 'https://opoto.jp/thanks/',
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
