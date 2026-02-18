import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendMessageToClaude } from '@/lib/claude'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { sanitizeInput, validateMessage, securityHeaders } from '@/lib/security'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import type { ChatResponse, MessagesResponse, ResetResponse, ErrorResponse } from '@/types'

// Create Hono app with base path
const app = new Hono().basePath('/api')

// CORS middleware
app.use('/*', cors({
  origin: process.env.NODE_ENV === 'production'
    ? (origin) => {
        // In production, restrict to your domain
        // For now, allow all origins for Cloud Run
        return origin
      }
    : '*',
  credentials: true,
}))

// Security headers middleware
app.use('/*', async (c, next) => {
  await next()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    c.res.headers.set(key, value)
  })
})

// Validation schemas
const chatSchema = z.object({
  message: z.string().min(1).max(10000),
})

// Error handler
const handleError = (error: unknown, context?: Record<string, unknown>): ErrorResponse => {
  if (error instanceof Error) {
    logger.error('API Error', error, context)
  } else {
    logger.error('Unknown API Error', undefined, { error, ...context })
  }

  // In production, don't expose internal error details
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: 'An error occurred while processing your request',
    }
  }

  // In development, provide detailed error messages
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: false,
    error: 'An unexpected error occurred',
  }
}

// POST /api/chat - Send a message and get Claude's response
app.post('/chat', zValidator('json', chatSchema), async (c) => {
  const startTime = Date.now()
  const clientId = getClientIdentifier(c.req.raw)

  try {
    logger.info('Chat request received', { clientId })

    // Rate limiting check
    const rateLimitResult = checkRateLimit(clientId)

    if (rateLimitResult.limited) {
      logger.warn('Rate limit exceeded', { clientId })
      return c.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        } as ErrorResponse,
        429,
        {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
        }
      )
    }

    const { message } = c.req.valid('json')

    // Validate message content
    const validation = validateMessage(message)
    if (!validation.valid) {
      return c.json(
        {
          success: false,
          error: validation.error,
        } as ErrorResponse,
        400
      )
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(message)

    // 1. Save user message to database
    const userMessage = await prisma.message.create({
      data: {
        role: 'user',
        content: sanitizedMessage,
      },
    })

    // 2. Fetch conversation history
    const historyLimit = parseInt(env.CONVERSATION_HISTORY_LIMIT || '50', 10)
    const history = await prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
      take: historyLimit,
    })

    // 3. Prepare messages for Claude API
    const claudeMessages = history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // 4. Call Claude API
    const assistantContent = await sendMessageToClaude(claudeMessages)

    // 5. Save assistant response to database
    const assistantMessage = await prisma.message.create({
      data: {
        role: 'assistant',
        content: assistantContent,
      },
    })

    // 6. Return both messages
    const response: ChatResponse = {
      success: true,
      userMessage: {
        id: userMessage.id,
        role: userMessage.role as 'user' | 'assistant',
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      assistantMessage: {
        id: assistantMessage.id,
        role: assistantMessage.role as 'user' | 'assistant',
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt,
      },
    }

    const duration = Date.now() - startTime
    logger.info('Chat request completed', {
      clientId,
      duration,
      messageLength: sanitizedMessage.length,
      responseLength: assistantContent.length,
    })

    return c.json(response, 200)
  } catch (error) {
    const duration = Date.now() - startTime
    return c.json(handleError(error, { clientId, duration }), 500)
  }
})

// GET /api/messages - Get all messages
app.get('/messages', async (c) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
    })

    const response: MessagesResponse = {
      success: true,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        createdAt: msg.createdAt,
      })),
    }

    return c.json(response, 200)
  } catch (error) {
    return c.json(handleError(error), 500)
  }
})

// POST /api/reset - Delete all messages
app.post('/reset', async (c) => {
  try {
    const result = await prisma.message.deleteMany({})

    const response: ResetResponse = {
      success: true,
      deletedCount: result.count,
    }

    return c.json(response, 200)
  } catch (error) {
    return c.json(handleError(error), 500)
  }
})

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Export HTTP method handlers
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
