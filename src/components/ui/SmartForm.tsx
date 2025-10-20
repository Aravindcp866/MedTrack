'use client'

import { useState, useEffect, useRef } from 'react'
import { EnhancedInput } from './EnhancedInput'
import { EnhancedButton } from './EnhancedButton'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface FormField {
  name: string
  label: string
  type: string
  required?: boolean
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: string) => string | null
  }
  placeholder?: string
  helperText?: string
}

interface SmartFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, string>) => Promise<void> | void
  submitText?: string
  className?: string
}

export function SmartForm({ fields, onSubmit, submitText = 'Submit', className = '' }: SmartFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const formRef = useRef<HTMLFormElement>(null)

  // Real-time validation
  const validateField = (name: string, value: string): string | null => {
    const field = fields.find(f => f.name === name)
    if (!field?.validation) return null

    const { validation } = field

    if (field.required && !value.trim()) {
      return `${field.label} is required`
    }

    if (validation.minLength && value.length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      return `${field.label} must be no more than ${validation.maxLength} characters`
    }

    if (validation.pattern && !validation.pattern.test(value)) {
      return `${field.label} format is invalid`
    }

    if (validation.custom) {
      return validation.custom(value)
    }

    return null
  }

  // Handle field changes with real-time validation
  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validate field if it's been touched
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error || '' }))
    }
  }

  // Handle field blur
  const handleFieldBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name] || '')
    setErrors(prev => ({ ...prev, [name]: error || '' }))
  }

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    fields.forEach(field => {
      const value = formData[field.name] || ''
      const error = validateField(field.name, value)
      if (error) {
        newErrors[field.name] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {}))
    return isValid
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await onSubmit(formData)
      setSubmitStatus('success')
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({})
        setErrors({})
        setTouched({})
        setSubmitStatus('idle')
      }, 2000)
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        localStorage.setItem('form-autosave', JSON.stringify(formData))
      }
    }, 1000)

    return () => clearTimeout(autoSave)
  }, [formData])

  // Load auto-saved data
  useEffect(() => {
    const saved = localStorage.getItem('form-autosave')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(parsed)
      } catch (error) {
        console.error('Failed to load auto-saved form data:', error)
      }
    }
  }, [])

  const isFormValid = Object.values(errors).every(error => !error) && 
                     fields.every(field => !field.required || formData[field.name]?.trim())

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {fields.map((field) => (
        <EnhancedInput
          key={field.name}
          label={field.label}
          type={field.type}
          value={formData[field.name] || ''}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          onBlur={() => handleFieldBlur(field.name)}
          error={errors[field.name]}
          helperText={field.helperText}
          required={field.required}
          placeholder={field.placeholder}
          success={touched[field.name] && !errors[field.name] && !!formData[field.name]}
        />
      ))}

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2">
          {submitStatus === 'success' && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Form submitted successfully!</span>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Please fix the errors above</span>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <EnhancedButton
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({})
              setErrors({})
              setTouched({})
              localStorage.removeItem('form-autosave')
            }}
            disabled={isSubmitting}
          >
            Clear
          </EnhancedButton>
          
          <EnhancedButton
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={!isFormValid || isSubmitting}
            rightIcon={submitStatus === 'success' ? <CheckCircle className="h-4 w-4" /> : undefined}
          >
            {isSubmitting ? 'Submitting...' : submitText}
          </EnhancedButton>
        </div>
      </div>
    </form>
  )
}
