import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

import { astroImageTools } from 'astro-imagetools'

export default defineConfig({
  site: 'https://simonswiss.com',
  integrations: [mdx(), sitemap(), astroImageTools],
})
