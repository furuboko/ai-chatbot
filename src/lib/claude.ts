import Anthropic from '@anthropic-ai/sdk'
import type { ClaudeMessage } from '@/types'
import { env } from './env'
import { logger } from './logger'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})

// Claude configuration
const CLAUDE_MODEL = env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022'
const CLAUDE_MAX_TOKENS = parseInt(env.CLAUDE_MAX_TOKENS || '4096', 10)
const CLAUDE_TEMPERATURE = parseFloat(env.CLAUDE_TEMPERATURE || '1.0')

/**
 * Send messages to Claude API and get a response
 * @param messages - Array of messages (conversation history)
 * @returns Assistant's response text
 */
export async function sendMessageToClaude(
  messages: ClaudeMessage[]
): Promise<string> {
  const startTime = Date.now()

  try {
    logger.info('Calling Claude API', {
      model: CLAUDE_MODEL,
      messageCount: messages.length,
    })

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      temperature: CLAUDE_TEMPERATURE,
      messages: messages,
    })

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === 'text')

    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response')
    }

    const duration = Date.now() - startTime
    logger.info('Claude API call successful', {
      duration,
      responseLength: textContent.text.length,
      usage: response.usage,
    })

    return textContent.text
  } catch (error) {
    const duration = Date.now() - startTime

    if (error instanceof Anthropic.APIError) {
      logger.error('Claude API Error', error, {
        status: error.status,
        duration,
      })
      throw new Error(`Claude API Error: ${error.message}`)
    }

    logger.error('Error calling Claude API', error as Error, { duration })
    throw new Error('Failed to get response from Claude')
  }
}

export default anthropic
