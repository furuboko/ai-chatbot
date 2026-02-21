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

/**
 * Sanitize file name to prevent path traversal and other attacks
 * @param fileName - File name to sanitize
 * @returns Sanitized file name
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\./g, '')

  // Remove directory separators
  sanitized = sanitized.replace(/[\/\\]/g, '')

  // Remove special characters that could be dangerous
  sanitized = sanitized.replace(/[<>:"|?*]/g, '')

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Trim whitespace
  sanitized = sanitized.trim()

  // Limit length (max 255 characters, preserve extension)
  if (sanitized.length > 255) {
    const parts = sanitized.split('.')
    const ext = parts.length > 1 ? parts.pop() : ''
    const name = parts.join('.')

    if (ext) {
      sanitized = name.slice(0, 250) + '.' + ext
    } else {
      sanitized = sanitized.slice(0, 255)
    }
  }

  // If empty after sanitization, use default name
  if (!sanitized) {
    sanitized = 'image'
  }

  return sanitized
}
