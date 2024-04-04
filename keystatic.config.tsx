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
    kind: 'local',
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
  singletons: {
    homepage: singleton({
      label: 'Homepage',
      path: 'src/content/homepage/index',
      schema: {
        title: fields.text({ label: 'Title' }),
        description: fields.text({ label: 'Description', multiline: true }),
      },
    }),
  },
  collections: {
    articles: collection({
      label: 'Articles',
      path: 'src/content/articles/*/',
      slugField: 'title',
      format: {
        contentField: 'content',
      },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        pubDate: fields.date({ label: 'Pub Date' }),
        content: fields.mdx({
          label: 'Content',
          components: {
            YouTubeVideo,
            VimeoVideo,
            Tweet,
            IntroText,
            CaptionImage: captionImage('articles'),
          },
        }),
      },
    }),
    screencasts: collection({
      label: 'Screencasts',
      path: 'src/content/screencasts/*/',
      slugField: 'title',
      format: {
        contentField: 'content',
      },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        pubDate: fields.date({ label: 'Pub Date' }),
        thumbnail: fields.text({ label: 'Thumbnail URL' }),
        content: fields.mdx({
          label: 'Content',
          components: {
            YouTubeVideo,
            VimeoVideo,
            Tweet,
            IntroText,
            CaptionImage: captionImage('screencasts'),
          },
        }),
      },
    }),
    talks: collection({
      label: 'Talks',
      path: 'src/content/talks/*/',
      slugField: 'title',
      format: {
        contentField: 'content',
      },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        pubDate: fields.date({ label: 'Pub Date' }),
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
