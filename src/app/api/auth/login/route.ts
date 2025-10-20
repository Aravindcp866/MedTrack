import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth'
import { getUserPermissions } from '@/lib/permissions'
import { authSecurity } from '@/lib/auth-security'

export async function POST(request: NextRequest) {
  try {
    const { email, password, csrfToken } = await request.json()
    
    // Validate CSRF token
    const sessionToken = request.headers.get('X-CSRF-Token')
    if (!authSecurity.validateCSRFToken(csrfToken, sessionToken || '')) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }
    
    // Validate inputs
    const emailValidation = authSecurity.validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    const passwordValidation = authSecurity.validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

    // Check rate limiting
    const rateLimitCheck = authSecurity.checkRateLimit(email)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: 429 }
      )
    }
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // For demo purposes, we'll use a simple hardcoded admin user
    // In production, you should implement proper user authentication
    if (email === 'admin@clinic.com' && password === 'admin123') {
      const user = {
        id: 'admin-user-id',
        email: 'admin@clinic.com',
        role: 'admin' as const,
        permissions: getUserPermissions('admin')
      }

      const token = generateToken(user)
      
      // Record successful login
      authSecurity.recordSuccessfulLogin(email)

      return NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        }
      })
    }

    // Check for doctor user
    if (email === 'doctor@clinic.com' && password === 'doctor123') {
      const user = {
        id: 'doctor-user-id',
        email: 'doctor@clinic.com',
        role: 'doctor' as const,
        permissions: getUserPermissions('doctor')
      }

      const token = generateToken(user)
      
      // Record successful login
      authSecurity.recordSuccessfulLogin(email)

      return NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        }
      })
    }

    // Check for staff user
    if (email === 'staff@clinic.com' && password === 'staff123') {
      const user = {
        id: 'staff-user-id',
        email: 'staff@clinic.com',
        role: 'staff' as const,
        permissions: getUserPermissions('staff')
      }

      const token = generateToken(user)
      
      // Record successful login
      authSecurity.recordSuccessfulLogin(email)

      return NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        }
      })
    }

    // Record failed attempt for rate limiting
    authSecurity.recordFailedAttempt(email)
    
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
