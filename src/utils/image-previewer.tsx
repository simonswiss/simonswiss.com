import { useState, useEffect } from 'react'
import { Image } from '@keystar/ui/image'

//
/**
 * The useImageData hook is intended to be used within the ContentView(props) component available in
 * Keystatic's custom content fields. Within `props.value`, any image fields in the component schema
 * will produce an object that contains the filename, extension, and raw image data.
 * @param imgData - The `imgSrc` parameter is intended to map directly to the image field's object
 * in `props.value`- ie you would pass `props.value.imageFieldName` as imgData.
 * @returns a string containing a data URI, which could be used as either the `src`
 * for an <img> element, or inside `url()` for a CSS background image.
 */
export const useImageData = (
  imgData: {
    data: Uint8Array
    extension: string
    filename: string
  } | null,
): string => {
  const [imageDataUrl, setImageDataUrl] = useState<string>('')
  useEffect(() => {
    const fetchImage = async () => {
      if (imgData?.data) {
        const u8intArray = imgData.data
        const blob = new Blob([u8intArray], { type: 'image/png' })
        const reader = new FileReader()
        reader.onload = () => {
          setImageDataUrl(reader.result as string)
        }
        reader.readAsDataURL(blob)
      }
    }
    fetchImage()
  }, [])

  return imageDataUrl
}
export interface ImagePreviewerProps extends React.HTMLProps<HTMLImageElement> {
  imgData: {
    data: Uint8Array
    extension: string
    filename: string
  } | null
}

export const ImagePreviewer = ({ imgData, ...props }: ImagePreviewerProps) => {
  const imageDataUrl = useImageData(imgData)
  return (
    <div>
      <img src={imageDataUrl} {...props} style={{ display: 'block' }} />
    </div>
  )
}
