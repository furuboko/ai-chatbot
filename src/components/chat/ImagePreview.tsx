import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ImageAttachment } from '@/types'

interface ImagePreviewProps {
  image: ImageAttachment
  onRemove?: () => void
  onClick?: () => void
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function ImagePreview({
  image,
  onRemove,
  onClick,
  size = 'medium',
  className,
}: ImagePreviewProps) {
  const imageSrc = `data:${image.mimeType};base64,${image.data}`

  const sizeClasses = {
    small: 'h-16 w-16',
    medium: 'h-24 w-24',
    large: 'h-48 w-48',
  }

  return (
    <div className={cn('relative group', className)}>
      {/* Image thumbnail */}
      <div
        className={cn(
          'relative rounded-md overflow-hidden border-2 border-border bg-muted',
          sizeClasses[size],
          onClick && 'cursor-pointer hover:border-primary transition-colors'
        )}
        onClick={onClick}
      >
        <img
          src={imageSrc}
          alt={image.fileName}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Remove button (only shown when editing) */}
      {onRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label="画像を削除"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Filename */}
      <div className="mt-1 text-xs text-muted-foreground truncate max-w-[100px]">
        {image.fileName}
      </div>
    </div>
  )
}
