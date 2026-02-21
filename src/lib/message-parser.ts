import type { MessageContent, ContentBlock, ImageAttachment } from '@/types'

/**
 * Parse stored message content
 * Handles backward compatibility: plain text strings OR JSON content blocks
 *
 * @param content - Stored content string (plain text or JSON)
 * @returns Parsed content (string or ContentBlock array)
 */
export function parseMessageContent(content: string): MessageContent {
  // Try to parse as JSON (new format)
  try {
    const parsed = JSON.parse(content)

    // Validate it's an array of content blocks
    if (Array.isArray(parsed)) {
      return parsed as ContentBlock[]
    }
  } catch {
    // Not JSON or invalid JSON, treat as plain text (backward compatible)
  }

  // Return as plain text (backward compatible)
  return content
}

/**
 * Serialize message content for storage
 *
 * @param content - Message content (string or ContentBlock array)
 * @returns JSON string for storage
 */
export function serializeMessageContent(content: MessageContent): string {
  // If already a string, return as-is (backward compatible)
  if (typeof content === 'string') {
    return content
  }

  // Serialize content blocks to JSON
  return JSON.stringify(content)
}

/**
 * Convert frontend format (message + images) to Claude API content blocks
 *
 * @param message - Optional text message
 * @param images - Optional array of image attachments
 * @returns Array of content blocks for Claude API
 */
export function toClaudeContentBlocks(
  message?: string,
  images?: ImageAttachment[]
): ContentBlock[] {
  const blocks: ContentBlock[] = []

  // Add text block if message provided
  if (message && message.trim()) {
    blocks.push({
      type: 'text',
      text: message.trim(),
    })
  }

  // Add image blocks if images provided
  if (images && images.length > 0) {
    images.forEach((image) => {
      blocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: image.mimeType,
          data: image.data,
        },
      })
    })
  }

  return blocks
}

/**
 * Extract text summary from message content (for logging)
 *
 * @param content - Message content
 * @returns Text summary
 */
export function extractTextSummary(content: MessageContent): string {
  if (typeof content === 'string') {
    return content.slice(0, 100)
  }

  // Extract text from content blocks
  const textBlocks = content.filter((block) => block.type === 'text') as TextContentBlock[]
  const textContent = textBlocks.map((block) => block.text).join(' ')

  return textContent.slice(0, 100) || '[images only]'
}

// Type guard for TextContentBlock
type TextContentBlock = Extract<ContentBlock, { type: 'text' }>
