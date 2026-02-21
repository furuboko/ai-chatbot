import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ClaudeMessage } from '@/types'
import { env } from './env'
import { logger } from './logger'

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '')

// Gemini configuration
const GEMINI_MODEL = env.GEMINI_MODEL || 'gemini-1.5-flash'
const GEMINI_MAX_TOKENS = parseInt(env.GEMINI_MAX_TOKENS || '4096', 10)
const GEMINI_TEMPERATURE = parseFloat(env.GEMINI_TEMPERATURE || '1.0')

/**
 * Convert content (string or ContentBlock[]) to Gemini parts format
 */
function convertToGeminiParts(content: string | any[]) {
  // If content is a string, return as text part
  if (typeof content === 'string') {
    return [{ text: content }]
  }

  // If content is ContentBlock array, convert each block
  return content.map((block) => {
    if (block.type === 'text') {
      return { text: block.text }
    } else if (block.type === 'image') {
      return {
        inlineData: {
          mimeType: block.source.media_type,
          data: block.source.data,
        },
      }
    }
    return { text: '' }
  })
}

/**
 * Convert ClaudeMessage format to Gemini format
 * Claude uses 'assistant', Gemini uses 'model'
 * Supports both text-only and multimodal messages
 */
function convertToGeminiHistory(messages: ClaudeMessage[]) {
  return messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: convertToGeminiParts(msg.content),
  }))
}

/**
 * Send messages to Gemini API and get a response
 * Supports both text-only and multimodal (text + images) messages
 * @param messages - Array of messages (conversation history)
 * @returns Assistant's response text
 */
export async function sendMessageToGemini(
  messages: ClaudeMessage[]
): Promise<string> {
  const startTime = Date.now()

  try {
    // Count messages with images (for logging)
    const imageCount = messages.filter((msg) => Array.isArray(msg.content)).length

    logger.info('Calling Gemini API', {
      model: GEMINI_MODEL,
      messageCount: messages.length,
      multimodalMessages: imageCount,
    })

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        maxOutputTokens: GEMINI_MAX_TOKENS,
        temperature: GEMINI_TEMPERATURE,
      },
    })

    // Separate the last message (current user message) from history
    const history = messages.slice(0, -1)
    const currentMessage = messages[messages.length - 1]

    // Start chat with history
    const chat = model.startChat({
      history: convertToGeminiHistory(history),
    })

    // Send the current message (convert content to parts)
    const currentParts = convertToGeminiParts(currentMessage.content)
    const result = await chat.sendMessage(currentParts)
    const response = result.response
    const text = response.text()

    if (!text) {
      throw new Error('No text content in Gemini response')
    }

    const duration = Date.now() - startTime
    logger.info('Gemini API call successful', {
      duration,
      responseLength: text.length,
    })

    return text
  } catch (error) {
    const duration = Date.now() - startTime

    if (error instanceof Error) {
      logger.error('Gemini API Error', error, {
        duration,
      })
      throw new Error(`Gemini API Error: ${error.message}`)
    }

    logger.error('Error calling Gemini API', error as Error, { duration })
    throw new Error('Failed to get response from Gemini')
  }
}

export default genAI
