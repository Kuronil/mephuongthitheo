import jwt, { SignOptions } from 'jsonwebtoken'
import { getEnv } from './env'

// JWT Secret - đã được kiểm tra hợp lệ thông qua env.ts
const JWT_SECRET = getEnv.jwtSecret()
const JWT_EXPIRES_IN = getEnv.jwtExpiresIn()

export interface StoredUser {
  id: number
  name: string
  email: string
  address?: string
  isAdmin: boolean
}

export interface JWTPayload {
  id: number
  email: string
  isAdmin: boolean
}

/**
 * Tạo JWT token cho người dùng
 */
export function generateToken(user: { id: number; email: string; isAdmin: boolean }): string {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  } as SignOptions)
}

/**
 * Xác thực và giải mã JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Phía client: Lấy token từ localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

/**
 * Phía client: Lưu token vào localStorage
 */
export const setToken = (token: string) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('token', token)
}

/**
 * Phía client: Xóa token khỏi localStorage
 */
export const clearToken = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

/**
 * Phía client: Lấy người dùng đã lưu (để tương thích ngược)
 */
export const getStoredUser = (): StoredUser | null => {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem('user')
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

/**
 * Phía client: Lưu người dùng vào localStorage (để tương thích ngược)
 */
export const setStoredUser = (user: StoredUser) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearStoredUser = () => {
  clearToken()
}

export const isUserAdmin = (): boolean => {
  const user = getStoredUser()
  return user?.isAdmin === true
}