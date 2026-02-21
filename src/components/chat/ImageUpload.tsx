import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ImagePreview } from './ImagePreview'
import { cn } from '@/lib/utils'
import type { ImageAttachment } from '@/types'

interface ImageUploadProps {
  images: ImageAttachment[]
  onImagesChange: (images: ImageAttachment[]) => void
  maxImages?: number
  disabled?: boolean
}

// Constants
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DIMENSION = 1024 // Max width/height in pixels
const QUALITY = 0.85 // JPEG quality (85%)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Error messages (Japanese)
const ERROR_MESSAGES = {
  FILE_TOO_LARGE: '画像サイズは5MB以下にしてください',
  TOO_MANY_IMAGES: '画像は最大5枚まで添付できます',
  INVALID_FILE_TYPE: 'JPG、PNG、GIF、WebP形式の画像のみ対応しています',
  UPLOAD_FAILED: '画像のアップロードに失敗しました',
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Compress image using Canvas API
   */
  const compressImage = async (file: File): Promise<ImageAttachment> => {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('Canvas context not available'))
            return
          }

          // Calculate new dimensions (maintain aspect ratio)
          let { width, height } = img

          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height / width) * MAX_DIMENSION)
              width = MAX_DIMENSION
            } else {
              width = Math.round((width / height) * MAX_DIMENSION)
              height = MAX_DIMENSION
            }
          }

          // Set canvas size and draw image
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to base64 with compression
          const dataUrl = canvas.toDataURL(file.type, QUALITY)
          const base64Data = dataUrl.split(',')[1]

          resolve({
            data: base64Data,
            mimeType: file.type as ImageAttachment['mimeType'],
            fileName: file.name,
            size: base64Data.length,
          })
        } catch (err) {
          reject(err)
        } finally {
          // Clean up
          URL.revokeObjectURL(img.src)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(img.src)
        reject(new Error('Failed to load image'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Validate a single file
   */
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return ERROR_MESSAGES.INVALID_FILE_TYPE
    }

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      return ERROR_MESSAGES.FILE_TOO_LARGE
    }

    return null
  }

  /**
   * Process selected files
   */
  const processFiles = async (files: File[]) => {
    setError(null)
    setIsProcessing(true)

    try {
      // Check total image count
      if (images.length + files.length > maxImages) {
        setError(ERROR_MESSAGES.TOO_MANY_IMAGES)
        return
      }

      // Validate and compress each file
      const processedImages: ImageAttachment[] = []

      for (const file of files) {
        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          return
        }

        // Compress image
        try {
          const compressed = await compressImage(file)
          processedImages.push(compressed)
        } catch (err) {
          setError(ERROR_MESSAGES.UPLOAD_FAILED)
          return
        }
      }

      // Update images state
      onImagesChange([...images, ...processedImages])
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Handle file selection from file input
   */
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      processFiles(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  /**
   * Handle drag and drop
   */
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled || isProcessing) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFiles(files)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled && !isProcessing) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  /**
   * Remove image at index
   */
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
    setError(null)
  }

  /**
   * Open file picker
   */
  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-2">
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <ImagePreview
              key={index}
              image={image}
              onRemove={() => removeImage(index)}
              size="medium"
            />
          ))}
        </div>
      )}

      {/* Upload zone (only show if can add more) */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
            isDragging && 'border-primary bg-primary/5',
            !isDragging && 'border-muted-foreground/25 hover:border-muted-foreground/50',
            (disabled || isProcessing) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            multiple
            onChange={handleFileSelect}
            disabled={disabled || isProcessing}
            className="hidden"
          />

          {isProcessing ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">画像を処理中...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={disabled}
                  className="text-primary hover:underline font-medium"
                >
                  ファイルを選択
                </button>
                または画像をドラッグ&ドロップ
              </div>
              <div className="text-xs text-muted-foreground">
                JPG、PNG、GIF、WebP（最大5MB、{maxImages}枚まで）
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
