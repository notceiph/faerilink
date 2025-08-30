// Security utilities for Faeri Link MVP
import crypto from 'crypto'

// Rate limiting store (in-memory for MVP, should use Redis in production)
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// TOTP (Time-based One-Time Password) utilities
export class TOTP {
  private static algorithm = 'sha1'
  private static digits = 6
  private static period = 30 // seconds

  static generateSecret(): string {
    return crypto.randomBytes(32).toString('base64').replace(/=/g, '').substring(0, 32)
  }

  static generateTOTP(secret: string, time: number = Date.now()): string {
    const counter = Math.floor(time / 1000 / this.period)
    const counterBuffer = Buffer.alloc(8)
    counterBuffer.writeBigUInt64BE(BigInt(counter), 0)

    const hmac = crypto.createHmac(this.algorithm, Buffer.from(secret, 'base64'))
    hmac.update(counterBuffer)
    const hash = hmac.digest()

    const offset = hash[hash.length - 1] & 0xf
    const code = ((hash[offset] & 0x7f) << 24) |
                 ((hash[offset + 1] & 0xff) << 16) |
                 ((hash[offset + 2] & 0xff) << 8) |
                 (hash[offset + 3] & 0xff)

    return (code % Math.pow(10, this.digits)).toString().padStart(this.digits, '0')
  }

  static verifyTOTP(secret: string, token: string, window: number = 1): boolean {
    const currentTime = Date.now()

    for (let i = -window; i <= window; i++) {
      const time = currentTime + (i * this.period * 1000)
      if (this.generateTOTP(secret, time) === token) {
        return true
      }
    }

    return false
  }

  static generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 8; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase())
    }
    return codes
  }
}

// Rate limiting utilities
export class RateLimiter {
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isRateLimited(key: string): boolean {
    const now = Date.now()
    const entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return false
    }

    if (entry.count >= this.maxRequests) {
      return true
    }

    // Increment counter
    entry.count++
    return false
  }

  getRemainingRequests(key: string): number {
    const entry = rateLimitStore.get(key)
    if (!entry) return this.maxRequests
    return Math.max(0, this.maxRequests - entry.count)
  }

  getResetTime(key: string): number {
    const entry = rateLimitStore.get(key)
    return entry?.resetTime || Date.now()
  }

  reset(key: string): void {
    rateLimitStore.delete(key)
  }
}

// Create rate limiter instances for different endpoints
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5) // 5 requests per 15 minutes for auth
export const apiRateLimiter = new RateLimiter(60 * 1000, 60) // 60 requests per minute for API
export const generalRateLimiter = new RateLimiter(60 * 1000, 100) // 100 requests per minute general

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googletagmanager.com *.google-analytics.com;
    style-src 'self' 'unsafe-inline' *.googlefonts.com;
    img-src 'self' data: https: *.google-analytics.com *.googletagmanager.com;
    font-src 'self' *.googlefonts.com *.gstatic.com;
    connect-src 'self' *.supabase.co *.google-analytics.com;
    frame-src 'self' *.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim(),
}

// Password security utilities
export class PasswordSecurity {
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static generatePassword(): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    const allChars = lowercase + uppercase + numbers + special
    let password = ''

    // Ensure at least one of each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    // Fill remaining characters
    for (let i = password.length; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }
}

// Session security utilities
export class SessionSecurity {
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  static hashSessionId(sessionId: string): string {
    return crypto.createHash('sha256').update(sessionId).digest('hex')
  }

  static validateSessionId(sessionId: string): boolean {
    // Check if session ID format is valid (64 hex characters)
    return /^[a-f0-9]{64}$/i.test(sessionId)
  }
}

// Input validation and sanitization
export class InputSecurity {
  static sanitizeString(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  static validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
    return usernameRegex.test(username)
  }

  static validateUrl(url: string): boolean {
    try {
      new URL(url)
      return url.startsWith('http://') || url.startsWith('https://')
    } catch {
      return false
    }
  }
}

// Encryption utilities for sensitive data
export class Encryption {
  private static algorithm = 'aes-256-gcm'
  private static key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.key.padEnd(32, '0').slice(0, 32)), iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()

    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    })
  }

  static decrypt(encryptedData: string): string {
    const { encrypted, iv, authTag } = JSON.parse(encryptedData)
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(this.key.padEnd(32, '0').slice(0, 32)), Buffer.from(iv, 'hex'))
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }
}
