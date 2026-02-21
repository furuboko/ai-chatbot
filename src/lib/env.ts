import { z } from 'zod'

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // AI API Keys (at least one required)
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // AI Provider selection
  AI_PROVIDER: z.enum(['claude', 'gemini']).default('gemini'),

  // Claude settings
  CLAUDE_MODEL: z.string().default('claude-3-5-sonnet-20241022'),
  CLAUDE_MAX_TOKENS: z.string().default('4096'),
  CLAUDE_TEMPERATURE: z.string().default('1.0'),

  // Gemini settings
  GEMINI_MODEL: z.string().default('gemini-1.5-flash-latest'),
  GEMINI_MAX_TOKENS: z.string().default('4096'),
  GEMINI_TEMPERATURE: z.string().default('1.0'),

  // Performance settings
  CONVERSATION_HISTORY_LIMIT: z.string().default('50'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
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
 * Inferred environment variables type
 */
export type Env = z.infer<typeof envSchema>

/**
 * Validated environment variables
 */
export const env = validateEnv()
