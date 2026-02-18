/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Remove potentially dangerous HTML tags and attributes
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')

  // Remove script-like content
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')

  // Trim and normalize whitespace
  sanitized = sanitized.trim()

  return sanitized
}

/**
 * Escape HTML special characters to prevent XSS
 * @param str - String to escape
 * @returns Escaped string
 */
export function escapeHtml(str: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  return str.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char)
}

/**
 * Validate message content
 * @param message - Message to validate
 * @returns Validation result with error message if invalid
 */
export function validateMessage(message: string): {
  valid: boolean
  error?: string
} {
  // Check if empty
  if (!message || message.trim().length === 0) {
    return {
      valid: false,
      error: 'Message cannot be empty',
    }
  }

  // Check length
  const MAX_LENGTH = 10000
  if (message.length > MAX_LENGTH) {
    return {
      valid: false,
      error: `Message must be less than ${MAX_LENGTH} characters`,
    }
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /onload=/i,
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(message)) {
      return {
        valid: false,
        error: 'Message contains potentially dangerous content',
      }
    }
  }

  return { valid: true }
}

/**
 * Security headers for API responses
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}
