import { collection, config, fields, singleton } from '@keystatic/core'

import {
  YouTubeVideo,
  VimeoVideo,
  IntroText,
  Tweet,
  captionImage,
} from './src/keystatic/content-components'

export default config({
  storage: {
    kind: process.env.NODE_ENV === 'production' ? 'cloud' : 'local',
  },
  cloud: {
    project: 'simonswiss/simonswiss-website',
  },
  ui: {
    brand: {
      name: 'simonswiss.com',
      mark: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-Width="2"
          stroke-Linecap="round"
          stroke-Linejoin="round"
        >
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        </svg>
      ),
    },
  },
  collections: {
    posts: collection({
      label: 'Posts',
      path: 'src/data/posts/*/',
      slugField: 'title',
      format: {
        contentField: 'content',
      },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        pubDate: fields.date({ label: 'Pub Date' }),
        thumbnail: fields.text({ label: 'Thumbnail URL (if YouTube video)' }),
        content: fields.mdx({
          label: 'Content',
          components: {
            YouTubeVideo,
            VimeoVideo,
            Tweet,
            IntroText,
            CaptionImage: captionImage('posts'),
          },
        }),
      },
    }),
    talks: collection({
      label: 'Talks',
      path: 'src/data/talks/*/',
      slugField: 'title',
      format: {
        contentField: 'content',
      },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        pubDate: fields.date({ label: 'Pub Date' }),
        thumbnail: fields.text({ label: 'Thumbnail URL (if YouTube video)' }),
        content: fields.mdx({
          label: 'Content',
          components: {
            YouTubeVideo,
            VimeoVideo,
            Tweet,
            IntroText,
            CaptionImage: captionImage('talks'),
          },
        }),
      },
    }),
  },
})
