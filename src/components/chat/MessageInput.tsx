import { useState, useRef, KeyboardEvent, CompositionEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>
  isLoading: boolean
}

const MAX_MESSAGE_LENGTH = 10000

export function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const isComposingRef = useRef(false)

  const handleSubmit = async () => {
    const trimmed = message.trim()

    if (!trimmed) {
      setError('メッセージを入力してください')
      return
    }

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setError(`メッセージは${MAX_MESSAGE_LENGTH}文字以内で入力してください`)
      return
    }

    setError(null)

    try {
      await onSendMessage(trimmed)
      setMessage('')
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
        <Button onClick={handleSubmit} disabled={isLoading || !message.trim()}>
          {isLoading ? '送信中...' : '送信'}
        </Button>
      </div>
      <div className="text-xs text-muted-foreground">
        {message.length} / {MAX_MESSAGE_LENGTH} 文字
      </div>
    </div>
  )
}
