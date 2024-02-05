import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'
import { astroImageTools } from 'astro-imagetools'
import react from '@astrojs/react'
import keystaticAstro from '@keystatic/astro'
import vercel from '@astrojs/vercel/serverless'

// https://astro.build/config
export default defineConfig({
  site: 'https://simonswiss.com/',
  integrations: [mdx(), sitemap(), robotsTxt(), astroImageTools, react(), keystaticAstro()],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
  output: 'hybrid',
  adapter: vercel(),
})
