'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard
} from 'lucide-react'
// import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Patients', href: '/dashboard/patients', icon: Users },
  { name: 'Billing', href: '/dashboard/billing', icon: Receipt },
  { name: 'Revenue', href: '/dashboard/revenue', icon: TrendingUp },
  { name: 'Expenses', href: '/dashboard/expenses', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  // const { signOut, profile } = useAuth()

  return (
    <div className={`flex flex-col bg-gray-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className={`flex items-center h-16 bg-gray-800 ${isCollapsed ? 'px-2 justify-center' : 'px-4'}`}>
        {!isCollapsed && <h1 className="text-xl font-bold">ClinicSync</h1>}
        {isCollapsed && (
          <div className="h-8 w-8 rounded-lg bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-bold">C</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-md hover:bg-gray-700 transition-colors ${
            isCollapsed ? 'absolute top-2 right-2' : 'ml-auto'
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center  rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isCollapsed 
                  ? 'px-3 py-3 w-12 h-12' 
                  : 'px-3 py-2 w-full'
              } ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'}`} />
              {!isCollapsed && <span>{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-600">
                  {item.name}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={`border-t border-gray-700 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''} ${isCollapsed ? 'mb-0' : 'mb-3'}`}>
          <div className="flex-shrink-0">
            <div className={`rounded-full bg-gray-600 flex items-center justify-center ${
              isCollapsed ? 'h-10 w-10' : 'h-8 w-8'
            }`}>
              <span className={`font-medium ${isCollapsed ? 'text-base' : 'text-sm'}`}>
                A
              </span>
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                Admin User
              </p>
              <p className="text-xs text-gray-400 capitalize">
                Administrator
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="text-xs text-gray-400">
            ClinicSync System
          </div>
        )}
      </div>
    </div>
  )
}
