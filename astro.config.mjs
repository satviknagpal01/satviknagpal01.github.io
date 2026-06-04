import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// Keystatic's admin needs on-demand (server) routes, which a static GitHub Pages
// build can't serve. We only load the integration during `astro dev`, so the
// production build stays 100% static — the pages just read the content files.
const isDev = process.argv.includes('dev');

export default defineConfig({
  site: 'https://satviknagpal01.github.io',
  devToolbar: { enabled: false },
  integrations: [
    react(),
    ...(isDev ? [keystatic()] : []),
  ],
});
