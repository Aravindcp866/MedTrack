'use client'

import { ReactNode } from 'react'
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface LoadingStateProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress'
  size?: 'sm' | 'md' | 'lg'
  text?: string
  progress?: number
  className?: string
}

export function LoadingState({ 
  type = 'spinner', 
  size = 'md', 
  text = 'Loading...', 
  progress,
  className = '' 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        <Loader2 className={`animate-spin ${sizeClasses[size]} text-indigo-600`} />
        <span className={`${textSizes[size]} text-gray-600 dark:text-gray-400`}>{text}</span>
      </div>
    )
  }

  if (type === 'dots') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className={`${textSizes[size]} text-gray-600 dark:text-gray-400`}>{text}</span>
      </div>
    )
  }

  if (type === 'pulse') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        <div className={`${sizeClasses[size]} bg-indigo-600 rounded-full animate-pulse`}></div>
        <span className={`${textSizes[size]} text-gray-600 dark:text-gray-400`}>{text}</span>
      </div>
    )
  }

  if (type === 'progress' && progress !== undefined) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`${textSizes[size]} text-gray-600 dark:text-gray-400`}>{text}</span>
          <span className={`${textSizes[size]} text-gray-600 dark:text-gray-400`}>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    )
  }

  return null
}

interface StatusIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'pending'
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusIndicator({ 
  status, 
  text, 
  size = 'md', 
  className = '' 
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const statusConfig = {
    loading: {
      icon: Loader2,
      color: 'text-indigo-600',
      animation: 'animate-spin'
    },
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
      animation: ''
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      animation: ''
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      animation: 'animate-pulse'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Icon className={`${sizeClasses[size]} ${config.color} ${config.animation}`} />
      {text && (
        <span className={`${textSizes[size]} text-gray-600 dark:text-gray-400`}>{text}</span>
      )}
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: ReactNode
  text?: string
  type?: 'spinner' | 'dots' | 'pulse'
  className?: string
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  text = 'Loading...', 
  type = 'spinner',
  className = '' 
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <LoadingState type={type} text={text} size="lg" />
          </div>
        </div>
      )}
    </div>
  )
}

interface SkeletonLoaderProps {
  lines?: number
  height?: string
  className?: string
  animate?: boolean
}

export function SkeletonLoader({ 
  lines = 3, 
  height = 'h-4', 
  className = '',
  animate = true 
}: SkeletonLoaderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 dark:bg-gray-700 rounded ${height} ${
            animate ? 'animate-pulse' : ''
          } ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}


