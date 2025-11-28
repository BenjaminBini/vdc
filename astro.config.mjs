import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://benjaminbini.github.io',
  base: '/vdc',
  integrations: [tailwind(), react()],
  output: 'static',
});
