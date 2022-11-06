import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import partytown from '@astrojs/partytown'

import { astroImageTools } from 'astro-imagetools'

export default defineConfig({
  site: 'https://simonswiss.com',
  integrations: [
    mdx(),
    sitemap(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    astroImageTools,
  ],
})
