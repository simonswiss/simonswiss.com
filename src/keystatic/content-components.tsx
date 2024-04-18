import { fields } from '@keystatic/core'
import { wrapper, block } from '@keystatic/core/content-components'

export const YouTubeVideo = block({
  label: 'YouTube Video',
  schema: {
    id: fields.text({ label: 'Video ID' }),
  },
  ContentView: (props) => (
    <iframe
      className="my-8 aspect-video w-full rounded-lg shadow-xl ring ring-black"
      title="youtube player"
      src={`https://www.youtube.com/embed/${props.value.id}`}
      frame-border="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allow-full-screen
    ></iframe>
  ),
})

export const VimeoVideo = block({
  label: 'Vimeo Video',
  schema: {
    id: fields.text({ label: 'Video ID' }),
  },
  ContentView: (props) => (
    <iframe
      className="my-8 aspect-video w-full rounded-lg shadow-xl ring ring-black"
      src={`https://player.vimeo.com/video/${props.value.id}`}
      frame-border="0"
      allow="autoplay; fullscreen"
      allow-full-screen
    ></iframe>
  ),
})

export const IntroText = wrapper({
  label: 'Intro Text',
  schema: {},
})

export const Tweet = block({
  label: 'Tweet',
  schema: { id: fields.text({ label: 'Tweet URL' }) },
})

export const captionImage = (collection: string) =>
  wrapper({
    label: 'Caption Image',
    schema: {
      src: fields.image({
        label: 'Image',
        validation: { isRequired: true },

        directory: `src/assets/images/${collection}`,
        publicPath: `/src/assets/images/${collection}`,
      }),
      alt: fields.text({ label: 'Alt', validation: { length: { min: 1 } } }),
      class: fields.text({ label: 'Class' }),
    },
  })
