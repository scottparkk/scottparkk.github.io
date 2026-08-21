// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Used for canonical URLs and absolute og:image/og:url values.
  site: 'https://scottparkk.github.io',

  // /projects was retired in favour of the Technical and Creative listings.
  // Kept as a redirect so existing links and search results don't 404.
  redirects: {
    '/projects': '/projects/technical',
  },
});
