import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

export default defineConfig({
  integrations: [pagefind()],
  vite: {
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },
});
