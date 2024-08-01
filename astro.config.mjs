import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import react from '@astrojs/react'
import vercel from '@astrojs/vercel/serverless'

import robotsTxt from 'astro-robots-txt'
import keystaticAstro from '@keystatic/astro'

export default defineConfig({
  site: 'https://simonswiss.com/',
  integrations: [mdx(), sitemap(), robotsTxt(), react(), keystaticAstro()],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
  output: 'hybrid',
  adapter: vercel(),
})
