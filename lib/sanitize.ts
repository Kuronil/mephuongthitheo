/**
 * Input Sanitization Utilities for XSS Protection
 * Uses DOMPurify for HTML sanitization
 */

// DOMPurify configuration for server-side
let purify: any = null

// Initialize DOMPurify for server-side
if (typeof window === 'undefined') {
  try {
    const { JSDOM } = require('jsdom')
    const { window } = new JSDOM('')
    const DOMPurify = require('dompurify')
    purify = DOMPurify(window as any)
  } catch (error) {
    // Fallback if jsdom is not available
    console.warn('jsdom not available, using basic sanitization')
  }
} else {
  // Client-side: use DOMPurify directly
  const DOMPurify = require('dompurify')
  purify = DOMPurify
}

/**
 * Sanitize HTML string to prevent XSS attacks
 * Allows safe HTML tags but removes scripts and dangerous attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
  })
}

/**
 * Sanitize plain text - removes all HTML tags
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return purify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

/**
 * Escape HTML special characters
 * Use for displaying user input as plain text
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }

  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Sanitize user name - removes HTML and limits length
 */
export function sanitizeName(name: string, maxLength: number = 100): string {
  if (!name || typeof name !== 'string') {
    return ''
  }

  const sanitized = sanitizeText(name.trim())
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized
}

/**
 * Sanitize email - basic validation and sanitization
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  // Remove any HTML
  const cleaned = sanitizeText(email.trim().toLowerCase())
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(cleaned)) {
    return ''
  }

  return cleaned
}

/**
 * Sanitize phone number - removes non-numeric characters except + at start
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return ''
  }

  // Remove HTML and dangerous chars
  let cleaned = sanitizeText(phone.trim())
  
  // Keep only numbers and + at start
  cleaned = cleaned.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.substring(1).replace(/\D/g, '')
  } else {
    cleaned = cleaned.replace(/\D/g, '')
  }

  return cleaned
}

/**
 * Sanitize address - allows basic punctuation but removes HTML
 */
export function sanitizeAddress(address: string, maxLength: number = 500): string {
  if (!address || typeof address !== 'string') {
    return ''
  }

  const sanitized = sanitizeText(address.trim())
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized
}

/**
 * Sanitize review comment - allows some HTML formatting but removes scripts
 */
export function sanitizeReview(comment: string, maxLength: number = 5000): string {
  if (!comment || typeof comment !== 'string') {
    return ''
  }

  const sanitized = sanitizeHtml(comment.trim())
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized
}

/**
 * Sanitize URL - validates and sanitizes URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  const sanitized = sanitizeText(url.trim())
  
  try {
    const parsed = new URL(sanitized)
    // Only allow http and https
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString()
    }
  } catch {
    // Invalid URL
    return ''
  }

  return ''
}

/**
 * Client-side sanitization (for browser use)
 * DOMPurify works directly in browser
 */
export function sanitizeClientSide(html: string): string {
  if (typeof window === 'undefined') {
    return sanitizeText(html) // Fallback to text-only on server
  }

  // Import DOMPurify dynamically for client-side
  const DOMPurify = require('dompurify')
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
  })
}

