/**
 * Ghi log có cấu trúc với Winston
 * Cung cấp ghi log sẵn sàng cho môi trường production với transport file và console
 */

import winston from 'winston'
import path from 'path'
import fs from 'fs'

// Đảm bảo thư mục logs tồn tại
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Định nghĩa định dạng log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

// Định dạng console cho môi trường phát triển
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
 * Tạo instance Winston logger
 */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Log lỗi
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Log tổng hợp
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Console cho môi trường phát triển
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
 * Các mức log:
 * - error: Sự kiện lỗi (0)
 * - warn: Cảnh báo (1)
 * - info: Thông tin (2)
 * - http: Yêu cầu HTTP (3)
 * - verbose: Chi tiết (4)
 * - debug: Gỡ lỗi (5)
 * - silly: Vặt vãnh (6)
 */

/**
 * Hàm trợ giúp cho các mẫu ghi log phổ biến
 */
export const loggerHelpers = {
  /**
   * Ghi log lỗi kèm ngữ cảnh
   */
  logError(message: string, error: Error | any, context?: Record<string, any>) {
    logger.error(message, {
      error: error?.message || error,
      stack: error?.stack,
      ...context,
    })
  },

  /**
   * Ghi log thông tin request
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
   * Ghi log lỗi API
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
   * Ghi log thao tác cache
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
   * Ghi log thao tác cơ sở dữ liệu
   */
  logDatabase(operation: string, table: string, duration?: number) {
    logger.debug('Database Operation', {
      operation,
      table,
      duration,
    })
  },

  /**
   * Ghi log sự kiện xác thực (auth)
   */
  logAuth(event: string, userId?: number, success?: boolean) {
    logger.info('Auth Event', {
      event,
      userId,
      success,
    })
  },

  /**
   * Ghi log hành động của admin
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
   * Ghi log chỉ số hiệu năng
   */
  logPerformance(metric: string, value: number, unit: string = 'ms') {
    logger.info('Performance', {
      metric,
      value,
      unit,
    })
  },
}

// Xuất logger và các hàm trợ giúp
export default logger

