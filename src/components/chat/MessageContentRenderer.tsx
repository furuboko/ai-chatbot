import { ImagePreview } from './ImagePreview'
import type { MessageContent, ImageAttachment } from '@/types'

interface MessageContentRendererProps {
  content: MessageContent
  onImageClick?: (image: ImageAttachment) => void
}

export function MessageContentRenderer({
  content,
  onImageClick,
}: MessageContentRendererProps) {
  // Backward compatible: plain text string
  if (typeof content === 'string') {
    return <div className="whitespace-pre-wrap break-words">{content}</div>
  }

  // New format: content blocks array
  return (
    <div className="space-y-2">
      {content.map((block, index) => {
        if (block.type === 'text') {
          return (
            <div key={index} className="whitespace-pre-wrap break-words">
              {block.text}
            </div>
          )
        }

        if (block.type === 'image' && block.source) {
          const imageAttachment: ImageAttachment = {
            data: block.source.data,
            mimeType: block.source.media_type,
            fileName: `image-${index}`,
            size: 0,
          }

          return (
            <ImagePreview
              key={index}
              image={imageAttachment}
              onClick={() => onImageClick?.(imageAttachment)}
              size="medium"
              className="inline-block"
            />
          )
        }

        return null
      })}
    </div>
  )
}
