'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  name: string
  href: string
  current?: boolean
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Dashboard', href: '/dashboard' }
    ]
    
    if (paths.length > 1) {
      const currentPath = paths[paths.length - 1]
      const currentName = currentPath
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      breadcrumbs.push({
        name: currentName,
        href: pathname,
        current: true
      })
    }
    
    return breadcrumbs
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mb-6">
      <Link 
        href="/dashboard" 
        className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {breadcrumbs.map((breadcrumb) => (
        <div key={breadcrumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {breadcrumb.current ? (
            <span className="font-medium text-gray-900 dark:text-white">
              {breadcrumb.name}
            </span>
          ) : (
            <Link 
              href={breadcrumb.href}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
