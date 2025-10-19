'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome to ClinicSync
            </h1>
            <p className="text-sm text-gray-600">
              Secure clinic management system
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || 'User'}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
