// Message type matching Prisma schema
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

// API Request types
export interface ChatRequest {
  message: string
}

// API Response types
export interface ChatResponse {
  success: true
  userMessage: Message
  assistantMessage: Message
}

export interface MessagesResponse {
  success: true
  messages: Message[]
}

export interface ResetResponse {
  success: true
  deletedCount: number
}

export interface ErrorResponse {
  success: false
  error: string
}

// Claude API types
export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}
