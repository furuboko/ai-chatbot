import type { ImageAttachment, ValidationResult } from '@/types'

// Constants
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
export const MAX_IMAGES_PER_MESSAGE = 5
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

// Magic number signatures for file type verification
const MAGIC_NUMBERS: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
}

/**
 * Validate MIME type
 *
 * @param mimeType - MIME type to validate
 * @returns true if valid, false otherwise
 */
export function validateImageMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as any)
}

/**
 * Validate image size from base64 data
 *
 * @param base64Data - Base64 encoded image data
 * @returns true if size is within limits, false otherwise
 */
export function validateImageSize(base64Data: string): boolean {
  // Calculate size in bytes (base64 is ~4/3 of original size)
  const sizeInBytes = (base64Data.length * 3) / 4
  return sizeInBytes <= MAX_IMAGE_SIZE
}

/**
 * Validate base64 format
 *
 * @param data - Base64 string to validate
 * @returns true if valid base64, false otherwise
 */
export function validateBase64Format(data: string): boolean {
  // Basic base64 regex (alphanumeric, +, /, and = padding)
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Regex.test(data)
}

/**
 * Validate image magic number (file signature)
 * Detects file type spoofing (e.g., .html renamed to .jpg)
 *
 * @param base64Data - Base64 encoded image data
 * @param declaredMimeType - MIME type from file metadata
 * @returns true if magic number matches declared type, false otherwise
 */
export function validateImageMagicNumber(
  base64Data: string,
  declaredMimeType: string
): boolean {
  try {
    // Decode first few bytes to check magic number
    const buffer = Buffer.from(base64Data.slice(0, 100), 'base64')

    const expectedSignature = MAGIC_NUMBERS[declaredMimeType]
    if (!expectedSignature) {
      return false
    }

    // Check if buffer starts with expected signature
    return expectedSignature.every((byte, index) => buffer[index] === byte)
  } catch {
    return false
  }
}

/**
 * Detect potentially malicious content in image data
 *
 * @param base64Data - Base64 encoded image data
 * @returns true if suspicious content detected, false otherwise
 */
export function detectMaliciousImage(base64Data: string): boolean {
  try {
    // Decode a portion of the image to check for malicious patterns
    const decoded = Buffer.from(base64Data.slice(0, 1000), 'base64').toString('ascii')

    // Check for common malicious patterns
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /<iframe/i,
      /onerror=/i,
      /onload=/i,
      /<object/i,
      /<embed/i,
    ]

    return maliciousPatterns.some((pattern) => pattern.test(decoded))
  } catch {
    // If decoding fails, consider it suspicious
    return true
  }
}

/**
 * Validate a single image attachment
 *
 * @param image - Image attachment to validate
 * @returns Validation result
 */
export function validateImage(image: ImageAttachment): ValidationResult {
  // Validate MIME type
  if (!validateImageMimeType(image.mimeType)) {
    return {
      valid: false,
      error: `Invalid image type: ${image.mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }
  }

  // Validate base64 format
  if (!validateBase64Format(image.data)) {
    return {
      valid: false,
      error: 'Invalid image data format',
    }
  }

  // Validate size
  if (!validateImageSize(image.data)) {
    const maxSizeMB = MAX_IMAGE_SIZE / (1024 * 1024)
    return {
      valid: false,
      error: `Image size exceeds ${maxSizeMB}MB limit`,
    }
  }

  // Validate magic number (detect file type spoofing)
  if (!validateImageMagicNumber(image.data, image.mimeType)) {
    return {
      valid: false,
      error: 'Image file type does not match its content',
    }
  }

  // Check for malicious content
  if (detectMaliciousImage(image.data)) {
    return {
      valid: false,
      error: 'Suspicious content detected in image',
    }
  }

  return { valid: true }
}

/**
 * Validate a batch of images
 *
 * @param images - Array of image attachments to validate
 * @returns Validation result
 */
export function validateImageBatch(images: ImageAttachment[]): ValidationResult {
  // Check image count
  if (images.length === 0) {
    return {
      valid: false,
      error: 'No images provided',
    }
  }

  if (images.length > MAX_IMAGES_PER_MESSAGE) {
    return {
      valid: false,
      error: `Too many images. Maximum ${MAX_IMAGES_PER_MESSAGE} images allowed per message`,
    }
  }

  // Validate each image
  for (let i = 0; i < images.length; i++) {
    const result = validateImage(images[i])
    if (!result.valid) {
      return {
        valid: false,
        error: `Image ${i + 1}: ${result.error}`,
      }
    }
  }

  return { valid: true }
}
