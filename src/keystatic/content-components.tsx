import { fields } from '@keystatic/core'
import { wrapper, block } from '@keystatic/core/content-components'
import { AspectRatio, Box } from '@keystar/ui/layout'
import { Text } from '@keystar/ui/typography'

import { ImagePreviewer } from '@utils/image-previewer'

export const YouTubeVideo = block({
  label: 'YouTube Video',
  schema: {
    id: fields.text({ label: 'Video ID' }),
  },
  ContentView: (props) => (
    <AspectRatio value="560 / 315">
      <Box
        padding="medium"
        border="muted"
        borderRadius="regular"
        elementType="iframe"
        title="youtube player"
        width="100%"
        src={`https://www.youtube.com/embed/${props.value.id}`}
        frame-border="0"
        allow-full-screen
      ></Box>
    </AspectRatio>
  ),
})

export const VimeoVideo = block({
  label: 'Vimeo Video',
  schema: {
    id: fields.text({ label: 'Video ID' }),
  },
  ContentView: (props) => (
    <AspectRatio value="16 / 9.3">
      <Box
        padding="medium"
        border="muted"
        borderRadius="regular"
        elementType="iframe"
        src={`https://player.vimeo.com/video/${props.value.id}`}
        frame-border="0"
        allow-full-screen
      ></Box>
    </AspectRatio>
  ),
})

export const IntroText = wrapper({
  label: 'Intro Text',
  schema: {},
  ContentView: (props) => <Box padding="large">{props.children}</Box>,
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
    ContentView: (props) => (
      <>
        <Box
          padding="small"
          maxWidth="container.xsmall"
          border="muted"
          borderRadius="regular"
        >
          <ImagePreviewer imgData={props.value.src} alt={props.value.alt} />
        </Box>
        <Text color="neutralTertiary">{props.value.alt}</Text>
      </>
    ),
  })
