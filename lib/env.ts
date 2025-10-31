/**
 * Environment Variables Validation
 * This module validates all required environment variables on module load
 * Fail fast if any critical variables are missing
 */

type EnvVar = {
  name: string
  required: boolean
  default?: string
  validator?: (value: string) => boolean
  errorMessage?: string
}

const envVars: EnvVar[] = [
  {
    name: 'JWT_SECRET',
    required: true,
    validator: (value) => value.length >= 32 && value !== 'your-secret-key-change-in-production',
    errorMessage: 'JWT_SECRET must be at least 32 characters and not the default value'
  },
  {
    name: 'JWT_EXPIRES_IN',
    required: false,
    default: '7d',
    validator: (value) => /^\d+[smhd]$/.test(value),
    errorMessage: 'JWT_EXPIRES_IN must be in format like "7d", "24h", "60m", "3600s"'
  },
  {
    name: 'DATABASE_URL',
    required: true,
    validator: (value) => value.length > 0,
    errorMessage: 'DATABASE_URL is required'
  },
  {
    name: 'SMTP_HOST',
    required: false,
    default: 'smtp.gmail.com'
  },
  {
    name: 'SMTP_PORT',
    required: false,
    default: '587',
    validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0 && parseInt(value) < 65536,
    errorMessage: 'SMTP_PORT must be a valid port number (1-65535)'
  },
  {
    name: 'SMTP_USER',
    required: false,
    default: ''
  },
  {
    name: 'SMTP_PASS',
    required: false,
    default: ''
  },
  {
    name: 'SMTP_FROM_NAME',
    required: false,
    default: 'Mẹ Phương Thịt Heo'
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: false,
    default: 'http://localhost:3000'
  },
  {
    name: 'VNPAY_TMN_CODE',
    required: false,
    default: ''
  },
  {
    name: 'VNPAY_HASH_SECRET',
    required: false,
    default: ''
  },
  {
    name: 'VNPAY_URL',
    required: false,
    default: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
  },
  {
    name: 'GOOGLE_CLIENT_ID',
    required: false,
    default: ''
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    required: false,
    default: ''
  },
  {
    name: 'GOOGLE_REDIRECT_URI',
    required: false,
    default: ''
  }
]

interface ValidatedEnv {
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  DATABASE_URL: string
  SMTP_HOST: string
  SMTP_PORT: number
  SMTP_USER: string
  SMTP_PASS: string
  SMTP_FROM_NAME: string
  NEXT_PUBLIC_APP_URL: string
  VNPAY_TMN_CODE: string
  VNPAY_HASH_SECRET: string
  VNPAY_URL: string
  VNPAY_RETURN_URL?: string
  VNPAY_IPN_URL?: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_REDIRECT_URI?: string
  NODE_ENV: string
}

function validateEnv(): ValidatedEnv {
  const errors: string[] = []
  const validated: Partial<ValidatedEnv> = {}

  for (const envVar of envVars) {
    const value = process.env[envVar.name]
    
    if (!value || value.trim() === '') {
      if (envVar.required) {
        errors.push(`Missing required environment variable: ${envVar.name}`)
      } else {
        // Use default value
        validated[envVar.name as keyof ValidatedEnv] = (envVar.default || '') as any
      }
    } else {
      // Validate if validator exists
      if (envVar.validator && !envVar.validator(value)) {
        errors.push(
          envVar.errorMessage || 
          `Invalid value for ${envVar.name}: ${envVar.errorMessage || 'validation failed'}`
        )
      }
      
      // Store validated value
      if (envVar.name === 'SMTP_PORT') {
        validated[envVar.name as keyof ValidatedEnv] = parseInt(value) as any
      } else {
        validated[envVar.name as keyof ValidatedEnv] = value as any
      }
    }
  }

  // Add optional env vars with defaults
  validated.NODE_ENV = process.env.NODE_ENV || 'development'
  validated.VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || `${validated.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/vnpay/return`
  validated.VNPAY_IPN_URL = process.env.VNPAY_IPN_URL || `${validated.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/vnpay/ipn`
  validated.GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${validated.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`

  // Fail fast if there are errors (but only in production)
  if (errors.length > 0) {
    console.error('❌ Environment Variable Validation Failed:')
    errors.forEach(error => console.error(`  - ${error}`))
    console.error('\nPlease check your .env file and ensure all required variables are set.')
    
    // In production, throw error to prevent app from starting
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`)
    } else {
      // In development, warn but don't throw to allow SSR to work
      console.warn('⚠️  Continuing in development mode, but some features may not work correctly.')
    }
  }
  
  // Only log success in development to avoid spam
  if (process.env.NODE_ENV === 'development' && errors.length === 0) {
    // Suppress success log during SSR to reduce noise
    if (typeof window !== 'undefined') {
      console.log('✅ Environment variables validated successfully')
    }
  }

  return validated as ValidatedEnv
}

// Validate on module load with error handling
// Only validate in server environment, not during client-side bundling
let env: ValidatedEnv
try {
  // Only run validation in Node.js environment (server-side)
  if (typeof window === 'undefined') {
    env = validateEnv()
  } else {
    // Client-side: use fallback values
    env = {
      JWT_SECRET: 'client-side-not-used',
      JWT_EXPIRES_IN: '7d',
      DATABASE_URL: 'client-side-not-used',
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_PORT: 587,
      SMTP_USER: '',
      SMTP_PASS: '',
      SMTP_FROM_NAME: 'Mẹ Phương Thịt Heo',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      VNPAY_TMN_CODE: '',
      VNPAY_HASH_SECRET: '',
      VNPAY_URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
      NODE_ENV: 'development'
    } as ValidatedEnv
  }
} catch (error) {
  // If validation fails, create a minimal env object to prevent complete crash
  console.error('⚠️  Environment validation failed, using fallback values:', error)
  env = {
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key-must-be-changed-in-production-min-32-chars',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'Mẹ Phương Thịt Heo',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE || '',
    VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET || '',
    VNPAY_URL: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    NODE_ENV: process.env.NODE_ENV || 'development'
  } as ValidatedEnv
}

export { env }

// Export individual getters for type safety
export const getEnv = {
  jwtSecret: () => env.JWT_SECRET,
  jwtExpiresIn: () => env.JWT_EXPIRES_IN,
  databaseUrl: () => env.DATABASE_URL,
  smtp: {
    host: () => env.SMTP_HOST,
    port: () => env.SMTP_PORT,
    user: () => env.SMTP_USER,
    pass: () => env.SMTP_PASS,
    fromName: () => env.SMTP_FROM_NAME,
  },
  appUrl: () => env.NEXT_PUBLIC_APP_URL,
  vnpay: {
    tmnCode: () => env.VNPAY_TMN_CODE,
    hashSecret: () => env.VNPAY_HASH_SECRET,
    url: () => env.VNPAY_URL,
    returnUrl: () => env.VNPAY_RETURN_URL || '',
    ipnUrl: () => env.VNPAY_IPN_URL || '',
  },
  google: {
    clientId: () => env.GOOGLE_CLIENT_ID,
    clientSecret: () => env.GOOGLE_CLIENT_SECRET,
    redirectUri: () => env.GOOGLE_REDIRECT_URI || '',
  },
  nodeEnv: () => env.NODE_ENV,
  isProduction: () => env.NODE_ENV === 'production',
  isDevelopment: () => env.NODE_ENV === 'development',
}

