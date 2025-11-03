/**
 * Structured Logging with Winston
 * Provides production-ready logging with file and console transports
 */

import winston from 'winston'
import path from 'path'
import fs from 'fs'

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`
    }
    return msg
  })
)

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Console for development
    ...(process.env.NODE_ENV !== 'production'
      ? [
          new winston.transports.Console({
            format: consoleFormat,
          }),
        ]
      : []),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
  ],
})

/**
 * Log levels:
 * - error: Error events (0)
 * - warn: Warning events (1)
 * - info: Informational events (2)
 * - http: HTTP requests (3)
 * - verbose: Verbose events (4)
 * - debug: Debug messages (5)
 * - silly: Silly events (6)
 */

/**
 * Helper functions for common logging patterns
 */
export const loggerHelpers = {
  /**
   * Log an error with context
   */
  logError(message: string, error: Error | any, context?: Record<string, any>) {
    logger.error(message, {
      error: error?.message || error,
      stack: error?.stack,
      ...context,
    })
  },

  /**
   * Log request information
   */
  logRequest(method: string, url: string, userId?: number, duration?: number) {
    logger.info('API Request', {
      method,
      url,
      userId,
      duration,
    })
  },

  /**
   * Log API error
   */
  logApiError(
    method: string,
    url: string,
    statusCode: number,
    error: string | Error,
    userId?: number
  ) {
    logger.error('API Error', {
      method,
      url,
      statusCode,
      error: error instanceof Error ? error.message : error,
      userId,
    })
  },

  /**
   * Log cache operations
   */
  logCache(operation: string, key: string, hit?: boolean, metadata?: Record<string, any>) {
    logger.debug('Cache Operation', {
      operation,
      key,
      hit,
      ...metadata,
    })
  },

  /**
   * Log database operations
   */
  logDatabase(operation: string, table: string, duration?: number) {
    logger.debug('Database Operation', {
      operation,
      table,
      duration,
    })
  },

  /**
   * Log authentication events
   */
  logAuth(event: string, userId?: number, success?: boolean) {
    logger.info('Auth Event', {
      event,
      userId,
      success,
    })
  },

  /**
   * Log admin actions
   */
  logAdmin(action: string, adminId: number, entity?: string, entityId?: number) {
    logger.info('Admin Action', {
      action,
      adminId,
      entity,
      entityId,
    })
  },

  /**
   * Log performance metrics
   */
  logPerformance(metric: string, value: number, unit: string = 'ms') {
    logger.info('Performance', {
      metric,
      value,
      unit,
    })
  },
}

// Export logger and helpers
export default logger

