'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, Shield, AlertTriangle } from 'lucide-react'
import { authSecurity } from '@/lib/auth-security'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const router = useRouter()

  // Generate CSRF token on component mount
  useEffect(() => {
    const token = authSecurity.generateCSRFToken()
    setCsrfToken(token)
    sessionStorage.setItem('csrf_token', token)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setEmailError('')
    setPasswordError('')

    // Validate inputs
    const emailValidation = authSecurity.validateEmail(email)
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error!)
      setIsLoading(false)
      return
    }

    const passwordValidation = authSecurity.validatePassword(password)
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error!)
      setIsLoading(false)
      return
    }

    // Check rate limiting
    const rateLimitCheck = authSecurity.checkRateLimit(email)
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.error!)
      setIsLoading(false)
      return
    }

    if (rateLimitCheck.remainingAttempts) {
      setRemainingAttempts(rateLimitCheck.remainingAttempts)
    }

    try {
      const sanitizedEmail = authSecurity.sanitizeInput(email)
      const sanitizedPassword = authSecurity.sanitizeInput(password)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ 
          email: sanitizedEmail, 
          password: sanitizedPassword,
          csrfToken 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Record successful login
        authSecurity.recordSuccessfulLogin(email)
        
        // Store token and user data
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Clear CSRF token
        sessionStorage.removeItem('csrf_token')
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        // Record failed attempt
        authSecurity.recordFailedAttempt(email)
        setError(data.error || 'Login failed')
      }
    } catch {
      authSecurity.recordFailedAttempt(email)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ClinicSync Login</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Secure access to your clinic management system</p>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div><strong>Admin:</strong> admin@clinic.com / admin123</div>
              <div><strong>Doctor:</strong> doctor@clinic.com / doctor123</div>
              <div><strong>Staff:</strong> staff@clinic.com / staff123</div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError('')
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 ${
                    emailError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError('')
                  }}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 ${
                    passwordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {error}
                </p>
                {remainingAttempts && remainingAttempts > 0 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {remainingAttempts} attempts remaining
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 Your data is protected with enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
