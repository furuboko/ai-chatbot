import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert'

interface ResetButtonProps {
  onReset: () => Promise<void>
}

export function ResetButton({ onReset }: ResetButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await onReset()
      setShowConfirm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'リセットに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="space-y-2">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Alert>
          <AlertDescription>
            本当に会話履歴をすべて削除しますか？この操作は取り消せません。
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? '削除中...' : '削除する'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowConfirm(false)
              setError(null)
            }}
            disabled={isLoading}
            className="flex-1"
          >
            キャンセル
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={() => setShowConfirm(true)}
      className="w-full"
    >
      会話をリセット
    </Button>
  )
}
