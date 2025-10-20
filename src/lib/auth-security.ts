'use client'

interface LoginAttempt {
  email: string
  attempts: number
  lastAttempt: number
  lockedUntil?: number
}

class AuthSecurity {
  private static instance: AuthSecurity
  private loginAttempts: Map<string, LoginAttempt> = new Map()
  private readonly MAX_ATTEMPTS = 5
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

  static getInstance(): AuthSecurity {
    if (!AuthSecurity.instance) {
      AuthSecurity.instance = new AuthSecurity()
    }
    return AuthSecurity.instance
  }

  validateEmail(email: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      return { isValid: false, error: 'Email is required' }
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' }
    }
    if (email.length > 254) {
      return { isValid: false, error: 'Email is too long' }
    }
    return { isValid: true }
  }

  validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password.trim()) {
      return { isValid: false, error: 'Password is required' }
    }
    if (password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters' }
    }
    if (password.length > 128) {
      return { isValid: false, error: 'Password is too long' }
    }
    return { isValid: true }
  }

  checkRateLimit(email: string): { allowed: boolean; error?: string; remainingAttempts?: number } {
    const now = Date.now()
    const attempt = this.loginAttempts.get(email)

    if (!attempt) {
      return { allowed: true }
    }

    // Check if account is locked
    if (attempt.lockedUntil && now < attempt.lockedUntil) {
      const lockoutMinutes = Math.ceil((attempt.lockedUntil - now) / (60 * 1000))
      return { 
        allowed: false, 
        error: `Account locked. Try again in ${lockoutMinutes} minutes.` 
      }
    }

    // Reset attempts if lockout period has passed
    if (attempt.lockedUntil && now >= attempt.lockedUntil) {
      this.loginAttempts.delete(email)
      return { allowed: true }
    }

    // Check if max attempts reached
    if (attempt.attempts >= this.MAX_ATTEMPTS) {
      attempt.lockedUntil = now + this.LOCKOUT_DURATION
      return { 
        allowed: false, 
        error: 'Too many failed attempts. Account locked for 15 minutes.' 
      }
    }

    return { 
      allowed: true, 
      remainingAttempts: this.MAX_ATTEMPTS - attempt.attempts 
    }
  }

  recordFailedAttempt(email: string): void {
    const now = Date.now()
    const attempt = this.loginAttempts.get(email) || {
      email,
      attempts: 0,
      lastAttempt: now
    }

    attempt.attempts += 1
    attempt.lastAttempt = now

    this.loginAttempts.set(email, attempt)
  }

  recordSuccessfulLogin(email: string): void {
    this.loginAttempts.delete(email)
  }

  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000) // Limit length
  }

  generateCSRFToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken
  }
}

export const authSecurity = AuthSecurity.getInstance()


