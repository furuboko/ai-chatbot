import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import type { Message } from '@/types'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">会話を始めましょう</p>
          <p className="text-sm">メッセージを入力してClaude AIと対話できます</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full pr-4" ref={scrollRef}>
      <div className="space-y-4 pb-4">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={`p-4 ${
              message.role === 'user'
                ? 'ml-auto max-w-[80%] bg-primary text-primary-foreground'
                : 'mr-auto max-w-[80%]'
            }`}
          >
            <div className="mb-1 text-xs font-semibold opacity-70">
              {message.role === 'user' ? 'あなた' : 'Claude'}
            </div>
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
            <div className="mt-2 text-xs opacity-50">
              {new Date(message.createdAt).toLocaleString('ja-JP')}
            </div>
          </Card>
        ))}
        {isLoading && (
          <Card className="mr-auto max-w-[80%] p-4">
            <div className="mb-1 text-xs font-semibold opacity-70">Claude</div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.4s]"></div>
            </div>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}
