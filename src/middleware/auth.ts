import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, User } from '@/lib/auth'

export function authMiddleware(request: NextRequest): User | NextResponse {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
  }
  
  const user = verifyToken(token)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
  }
  
  return user
}

export function requireAuth(handler: (request: NextRequest, user: User) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = authMiddleware(request)
    if (auth instanceof NextResponse) return auth
    
    return handler(request, auth)
  }
}
