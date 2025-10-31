/**
 * Security Headers Utilities
 * Provides Content Security Policy and other security headers
 */

import { NextResponse } from 'next/server'

/**
 * Content Security Policy configuration
 */
export const CSP_POLICY = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Needed for Next.js
    "'unsafe-eval'", // Needed for Next.js in dev
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://maps.googleapis.com",
    "https://va.vercel-scripts.com", // Vercel Analytics
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Needed for TailwindCSS and inline styles
    "https://fonts.googleapis.com",
    "https://maps.googleapis.com",
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "data:",
  ],
  imgSrc: [
    "'self'",
    "data:",
    "https:",
    "http:",
    "blob:",
    "https://maps.gstatic.com",
  ],
  connectSrc: [
    "'self'",
    "https://api.vnpayment.vn",
    "https://sandbox.vnpayment.vn",
    "https://maps.googleapis.com",
    "https://maps.gstatic.com",
    "https://va.vercel-scripts.com", // Vercel Analytics
  ],
  frameSrc: [
    "'self'",
    "https://www.google.com",
  ],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: process.env.NODE_ENV === 'production',
}

/**
 * Convert CSP object to header string
 */
function buildCSPHeader(policy: typeof CSP_POLICY): string {
  const directives: string[] = []

  if (policy.defaultSrc) {
    directives.push(`default-src ${policy.defaultSrc.join(' ')}`)
  }
  if (policy.scriptSrc) {
    directives.push(`script-src ${policy.scriptSrc.join(' ')}`)
  }
  if (policy.styleSrc) {
    directives.push(`style-src ${policy.styleSrc.join(' ')}`)
  }
  if (policy.fontSrc) {
    directives.push(`font-src ${policy.fontSrc.join(' ')}`)
  }
  if (policy.imgSrc) {
    directives.push(`img-src ${policy.imgSrc.join(' ')}`)
  }
  if (policy.connectSrc) {
    directives.push(`connect-src ${policy.connectSrc.join(' ')}`)
  }
  if (policy.frameSrc) {
    directives.push(`frame-src ${policy.frameSrc.join(' ')}`)
  }
  if (policy.objectSrc) {
    directives.push(`object-src ${policy.objectSrc.join(' ')}`)
  }
  if (policy.baseUri) {
    directives.push(`base-uri ${policy.baseUri.join(' ')}`)
  }
  if (policy.formAction) {
    directives.push(`form-action ${policy.formAction.join(' ')}`)
  }
  if (policy.frameAncestors) {
    directives.push(`frame-ancestors ${policy.frameAncestors.join(' ')}`)
  }
  if (policy.upgradeInsecureRequests) {
    directives.push('upgrade-insecure-requests')
  }

  return directives.join('; ')
}

/**
 * Add security headers to NextResponse
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    buildCSPHeader(CSP_POLICY)
  )

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY')

  // X-XSS-Protection (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  )

  // Strict Transport Security (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  return response
}

