'use client'

import { useState, useEffect } from 'react'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { ResetButton } from './ResetButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Message, ChatResponse, MessagesResponse, ResetResponse, ImageAttachment } from '@/types'

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load messages on mount
  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/messages')
      const data: MessagesResponse = await response.json()

      if (data.success) {
        setMessages(data.messages)
      } else {
        throw new Error('Failed to load messages')
      }
    } catch (err) {
      console.error('Error loading messages:', err)
      setError('メッセージの読み込みに失敗しました')
    }
  }

  const handleSendMessage = async (content?: string, images?: ImageAttachment[]) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          images: images,
        }),
      })

      const data: ChatResponse = await response.json()

      if (data.success) {
        setMessages((prev) => [...prev, data.userMessage, data.assistantMessage])
      } else {
        throw new Error('Failed to send message')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError('メッセージの送信に失敗しました')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    setError(null)

    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
      })

      const data: ResetResponse = await response.json()

      if (data.success) {
        setMessages([])
      } else {
        throw new Error('Failed to reset conversation')
      }
    } catch (err) {
      console.error('Error resetting conversation:', err)
      setError('会話のリセットに失敗しました')
      throw err
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card className="h-[calc(100vh-2rem)]">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            AI Chatbot - Claude
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[calc(100%-5rem)] flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex-1 overflow-hidden">
            <MessageList messages={messages} isLoading={isLoading} />
          </div>

          <div className="space-y-2">
            <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            <ResetButton onReset={handleReset} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
