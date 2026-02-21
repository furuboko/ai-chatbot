// Message type matching Prisma schema
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

// Image attachment types
export interface ImageAttachment {
  data: string // base64 encoded image data
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  fileName: string
  size: number // bytes
}

// Content block types for multimodal messages
export interface TextContentBlock {
  type: 'text'
  text: string
}

export interface ImageContentBlock {
  type: 'image'
  source: {
    type: 'base64'
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    data: string // base64 encoded
  }
}

export type ContentBlock = TextContentBlock | ImageContentBlock

// Message content can be plain text (backward compatible) or content blocks
export type MessageContent = string | ContentBlock[]

// API Request types
export interface ChatRequest {
  message?: string // Now optional
  images?: ImageAttachment[] // New: optional images array
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
  content: string | ContentBlock[] // Support both formats
}

// Validation result type
export interface ValidationResult {
  valid: boolean
  error?: string
}
