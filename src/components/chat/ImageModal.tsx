import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ImageAttachment } from '@/types'

interface ImageModalProps {
  image: ImageAttachment | null
  onClose: () => void
}

export function ImageModal({ image, onClose }: ImageModalProps) {
  // Handle ESC key press
  useEffect(() => {
    if (!image) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [image, onClose])

  if (!image) return null

  const imageSrc = `data:${image.mimeType};base64,${image.data}`

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Image */}
        <img
          src={imageSrc}
          alt={image.fileName}
          className="max-w-full max-h-full object-contain rounded-lg"
        />

        {/* Filename */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-md text-sm">
          {image.fileName}
        </div>
      </div>
    </div>
  )
}
