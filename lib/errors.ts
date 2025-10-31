/**
 * Centralized Error Handling System
 * Provides consistent error responses and logging
 */

import { NextResponse } from 'next/server'

export enum ErrorCode {
  // Authentication & Authorization (1xxx)
  UNAUTHORIZED = 'AUTH_1001',
  FORBIDDEN = 'AUTH_1002',
  INVALID_CREDENTIALS = 'AUTH_1003',
  TOKEN_EXPIRED = 'AUTH_1004',
  EMAIL_NOT_VERIFIED = 'AUTH_1005',
  
  // Validation Errors (2xxx)
  VALIDATION_ERROR = 'VAL_2001',
  MISSING_REQUIRED_FIELDS = 'VAL_2002',
  INVALID_INPUT = 'VAL_2003',
  
  // Resource Errors (3xxx)
  NOT_FOUND = 'RES_3001',
  ALREADY_EXISTS = 'RES_3002',
  STOCK_INSUFFICIENT = 'RES_3003',
  
  // Business Logic Errors (4xxx)
  ORDER_EMPTY = 'BIZ_4001',
  DISCOUNT_INVALID = 'BIZ_4002',
  PAYMENT_FAILED = 'BIZ_4003',
  
  // Server Errors (5xxx)
  INTERNAL_ERROR = 'SRV_5001',
  DATABASE_ERROR = 'SRV_5002',
  EXTERNAL_SERVICE_ERROR = 'SRV_5003',
  
  // Rate Limiting (6xxx)
  RATE_LIMIT_EXCEEDED = 'RATE_6001',
}

export interface ApiError {
  code: ErrorCode
  message: string
  status: number
  details?: any
  timestamp: string
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  status: number = 500,
  details?: any
): NextResponse {
  const error: ApiError = {
    code,
    message,
    status,
    details,
    timestamp: new Date().toISOString(),
  }

  // Log error for debugging (in production, use proper logging service)
  if (status >= 500) {
    console.error('[SERVER ERROR]', {
      code: error.code,
      message: error.message,
      status: error.status,
      details: error.details,
      timestamp: error.timestamp,
    })
  } else {
    console.warn('[CLIENT ERROR]', {
      code: error.code,
      message: error.message,
      status: error.status,
      timestamp: error.timestamp,
    })
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(details && { details }),
      },
    },
    { status }
  )
}

/**
 * Handle errors in API routes
 * Wraps async functions to catch and format errors
 */
export function handleApiError(error: unknown): NextResponse {
  // If it's already an AppError, use it
  if (error instanceof AppError) {
    return createErrorResponse(error.code, error.message, error.status, error.details)
  }

  // If it's a known error type, handle it
  if (error instanceof Error) {
    // Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        'Database operation failed',
        500,
        process.env.NODE_ENV === 'development' ? error.message : undefined
      )
    }

    // Validation errors (Zod, etc.)
    if (error.name === 'ZodError') {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        400,
        process.env.NODE_ENV === 'development' ? error.message : undefined
      )
    }

    // Generic error
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      error.message || 'An unexpected error occurred',
      500,
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    )
  }

  // Unknown error type
  return createErrorResponse(
    ErrorCode.INTERNAL_ERROR,
    'An unexpected error occurred',
    500
  )
}

/**
 * Async route handler wrapper
 * Automatically catches and handles errors
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Predefined error responses for common cases
 */
export const ErrorResponses = {
  unauthorized: (message = 'Unauthorized') =>
    createErrorResponse(ErrorCode.UNAUTHORIZED, message, 401),

  forbidden: (message = 'Forbidden') =>
    createErrorResponse(ErrorCode.FORBIDDEN, message, 403),

  notFound: (resource = 'Resource') =>
    createErrorResponse(ErrorCode.NOT_FOUND, `${resource} not found`, 404),

  validationError: (message = 'Validation failed', details?: any) =>
    createErrorResponse(ErrorCode.VALIDATION_ERROR, message, 400, details),

  missingFields: (fields: string[]) =>
    createErrorResponse(
      ErrorCode.MISSING_REQUIRED_FIELDS,
      `Missing required fields: ${fields.join(', ')}`,
      400,
      { fields }
    ),

  internalError: (message = 'Internal server error') =>
    createErrorResponse(ErrorCode.INTERNAL_ERROR, message, 500),
}

