'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { LoadingState, StatusIndicator } from './ui/AdvancedLoading'

interface DataLoaderProps<T = unknown> {
  queryKey: string[]
  queryFn: () => Promise<T>
  children: (data: T) => ReactNode
  fallback?: ReactNode
  retryCount?: number
  retryDelay?: number
  staleTime?: number
  gcTime?: number
}

export function DataLoader<T = unknown>({
  queryKey,
  queryFn,
  children,
  fallback,
  retryCount = 3,
  retryDelay = 1000,
  staleTime = 5 * 60 * 1000, // 5 minutes
  gcTime = 10 * 60 * 1000, // 10 minutes
}: DataLoaderProps<T>) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isStale,
    failureCount,
  } = useQuery({
    queryKey,
    queryFn,
    retry: retryCount,
    retryDelay: (attemptIndex) => Math.min(retryDelay * 2 ** attemptIndex, 30000),
    staleTime,
    gcTime,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  // Network status detection
  const [isOnline, setIsOnline] = useState(true)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LoadingState type="spinner" text="Loading data..." size="lg" />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Please wait while we fetch your data
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
            Failed to Load Data
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
            {error?.message || 'An unexpected error occurred while loading data.'}
          </p>

          <div className="flex items-center justify-center space-x-2 mb-4">
            {isOnline ? (
              <StatusIndicator status="success" text="Online" size="sm" />
            ) : (
              <StatusIndicator status="error" text="Offline" size="sm" />
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => refetch()}
              disabled={!isOnline || isFetching}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Retrying...' : 'Try Again'}
            </button>
          </div>

          {failureCount > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Attempt {failureCount} of {retryCount + 1}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (!data) {
    return fallback || (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No data found for the current request.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {children(data)}
      
      {/* Stale data indicator */}
      {isStale && (
        <div className="absolute top-2 right-2">
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-1">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Data may be outdated
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for manual data loading
export function useDataLoader<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean
    retryCount?: number
    retryDelay?: number
  }
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
    retry: options?.retryCount ?? 3,
    retryDelay: (attemptIndex) => 
      Math.min((options?.retryDelay ?? 1000) * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}
