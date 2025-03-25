import { z, defineCollection, getCollection } from 'astro:content'
import { glob } from 'astro/loaders'

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: 'src/data/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    thumbnail: z.string().optional(),
  }),
})
const talks = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: 'src/data/talks' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    thumbnail: z.string().optional(),
  }),
})

export const collections = { posts, talks }
