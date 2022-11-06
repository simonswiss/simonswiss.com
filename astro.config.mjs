import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
import partytown from '@astrojs/partytown'

// https://astro.build/config
export default defineConfig({
  site: 'https://simonswiss.com',
  integrations: [mdx(), sitemap(), partytown()],
})
