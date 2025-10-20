'use client'

import { ReactNode } from 'react'

interface EnhancedCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  clickable?: boolean
  variant?: 'default' | 'elevated' | 'outlined' | 'filled'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function EnhancedCard({ 
  children, 
  className = '', 
  hover = false,
  clickable = false,
  variant = 'default',
  padding = 'md'
}: EnhancedCardProps) {
  const baseClasses = "rounded-lg transition-all duration-200"
  
  const variantClasses = {
    default: "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700",
    elevated: "bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700",
    outlined: "bg-transparent border-2 border-gray-300 dark:border-gray-600",
    filled: "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
  }
  
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  }
  
  const interactiveClasses = hover || clickable 
    ? "hover:shadow-md hover:-translate-y-1 cursor-pointer" 
    : ""
  
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`
  
  return (
    <div className={cardClasses}>
      {children}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  trend = 'neutral',
  className = '' 
}: MetricCardProps) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  }
  
  return (
    <EnhancedCard className={`${className}`} hover>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {change && (
            <p className={`text-sm ${trendColors[trend]}`}>
              {change.type === 'increase' ? '+' : '-'}{change.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>
    </EnhancedCard>
  )
}
