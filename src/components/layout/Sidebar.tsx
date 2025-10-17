'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  DollarSign, 
  Receipt,
  Settings
} from 'lucide-react'
// import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Patients', href: '/dashboard/patients', icon: Users },
  { name: 'Visits', href: '/dashboard/visits', icon: FileText },
  { name: 'Billing', href: '/dashboard/billing', icon: Receipt },
  { name: 'Revenue', href: '/dashboard/revenue', icon: DollarSign },
  { name: 'Expenses', href: '/dashboard/expenses', icon: DollarSign },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  // const { signOut, profile } = useAuth()

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white">
      <div className="flex items-center h-16 px-4 bg-gray-800">
        <h1 className="text-xl font-bold">ClinicSync</h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-sm font-medium">
                A
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              Admin User
            </p>
            <p className="text-xs text-gray-400 capitalize">
              Administrator
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          ClinicSync System
        </div>
      </div>
    </div>
  )
}
