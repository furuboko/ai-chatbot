import { useState, useRef, KeyboardEvent, CompositionEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ImageUpload } from './ImageUpload'
import type { ImageAttachment } from '@/types'

interface MessageInputProps {
  onSendMessage: (message?: string, images?: ImageAttachment[]) => Promise<void>
  isLoading: boolean
}

const MAX_MESSAGE_LENGTH = 10000

export function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [images, setImages] = useState<ImageAttachment[]>([])
  const [error, setError] = useState<string | null>(null)
  const isComposingRef = useRef(false)

  const handleSubmit = async () => {
    const trimmed = message.trim()

    // Validate: must have either message or images
    if (!trimmed && images.length === 0) {
      setError('メッセージまたは画像を追加してください')
      return
    }

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setError(`メッセージは${MAX_MESSAGE_LENGTH}文字以内で入力してください`)
      return
    }

    setError(null)

    try {
      await onSendMessage(
        trimmed || undefined,
        images.length > 0 ? images : undefined
      )
      setMessage('')
      setImages([])
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleCompositionStart = () => {
    isComposingRef.current = true
  }

  const handleCompositionEnd = (e: CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false
    setMessage(e.currentTarget.value)
  }

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Image upload section */}
      <ImageUpload
        images={images}
        onImagesChange={setImages}
        disabled={isLoading}
      />

      {/* Text input section */}
      <div className="flex gap-2">
        <Input
          placeholder="メッセージを入力... (Enterで送信)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          disabled={isLoading}
          className="flex-1"
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading || (!message.trim() && images.length === 0)}
        >
          {isLoading ? '送信中...' : '送信'}
        </Button>
      </div>
      <div className="text-xs text-muted-foreground">
        {message.length} / {MAX_MESSAGE_LENGTH} 文字
        {images.length > 0 && ` • ${images.length}枚の画像`}
      </div>
    </div>
  )
}
