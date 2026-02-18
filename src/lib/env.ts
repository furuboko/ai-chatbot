import { z } from 'zod'

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Anthropic API
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),

  // Optional settings
  CLAUDE_MODEL: z.string().optional().default('claude-3-5-sonnet-20241022'),
  CLAUDE_MAX_TOKENS: z.string().optional().default('4096'),
  CLAUDE_TEMPERATURE: z.string().optional().default('1.0'),

  // Performance settings
  CONVERSATION_HISTORY_LIMIT: z.string().optional().default('50'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
})

/**
 * Validate environment variables
 * @throws Error if validation fails
 */
export function validateEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    console.error(result.error.format())
    throw new Error('Invalid environment variables')
  }

  return result.data
}

/**
 * Validated environment variables
 */
export const env = validateEnv()
