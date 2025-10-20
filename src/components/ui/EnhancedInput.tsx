'use client'

import { useState, forwardRef } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: boolean
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled' | 'outlined'
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    label, 
    error, 
    success, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    className = '',
    type = 'text',
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [, setIsFocused] = useState(false)
    
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type
    
    const baseClasses = "block w-full rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
    const variantClasses = {
      default: "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500",
      filled: "border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500",
      outlined: "border-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
    }
    
    const stateClasses = error 
      ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
      : success 
      ? "border-green-500 focus:ring-green-500 focus:border-green-500"
      : ""
    
    const inputClasses = `${baseClasses} ${variantClasses[variant]} ${stateClasses} ${className}`
    
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={`${inputClasses} ${leftIcon ? 'pl-10' : 'pl-3'} ${rightIcon || isPassword ? 'pr-10' : 'pr-3'} py-2`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {(rightIcon || isPassword) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              ) : (
                <div className="h-5 w-5 text-gray-400">
                  {rightIcon}
                </div>
              )}
            </div>
          )}
          
          {(error || success) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="flex items-center space-x-1">
            {error && (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </>
            )}
            {!error && helperText && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = 'EnhancedInput'
