import { z, defineCollection } from 'astro:content'

const homepageCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
})

const articlesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
  }),
})
const talksCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
  }),
})
const screencastsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
    thumbnail: z.string(),
  }),
})

export const collection = {
  homepage: homepageCollection,
  articles: articlesCollection,
  talks: talksCollection,
  screencasts: screencastsCollection,
}
