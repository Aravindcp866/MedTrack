import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
  role: 'admin' | 'doctor' | 'staff'
  permissions: string[]
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, role: user.role, permissions: user.permissions },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string; permissions?: string[] }
    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as 'admin' | 'doctor' | 'staff',
      permissions: decoded.permissions || []
    }
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}