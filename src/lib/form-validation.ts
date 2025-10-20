'use client'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  min?: number
  max?: number
  custom?: (value: string) => string | null
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export class FormValidator {
  static validateField(
    name: string,
    value: string,
    rules: ValidationRule
  ): string | null {
    // Required validation
    if (rules.required && (!value || value.trim().length === 0)) {
      return `${name} is required`
    }

    // Skip other validations if value is empty and not required
    if (!value || value.trim().length === 0) {
      return null
    }

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      return `${name} must be at least ${rules.minLength} characters`
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${name} must be no more than ${rules.maxLength} characters`
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${name} format is invalid`
    }

    // Numeric validations
    if (rules.min !== undefined || rules.max !== undefined) {
      const num = parseFloat(value)
      if (isNaN(num)) {
        return `${name} must be a valid number`
      }

      if (rules.min !== undefined && num < rules.min) {
        return `${name} must be at least ${rules.min}`
      }

      if (rules.max !== undefined && num > rules.max) {
        return `${name} must be no more than ${rules.max}`
      }
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value)
    }

    return null
  }

  static validateForm(
    data: Record<string, string>,
    rules: Record<string, ValidationRule>
  ): ValidationResult {
    const errors: Record<string, string> = {}

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const value = data[fieldName] || ''
      const error = this.validateField(fieldName, value, fieldRules)
      if (error) {
        errors[fieldName] = error
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // Common validation rules
  static readonly rules = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 254
    },
    password: {
      required: true,
      minLength: 6,
      maxLength: 128
    },
    phone: {
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
      maxLength: 20
    },
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s\-'\.]+$/
    },
    price: {
      required: true,
      min: 0,
      pattern: /^\d+(\.\d{1,2})?$/
    },
    quantity: {
      required: true,
      min: 0,
      pattern: /^\d+$/
    },
    description: {
      maxLength: 500
    }
  }

  // Sanitize input
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000) // Limit length
  }

  // Validate and sanitize
  static validateAndSanitize(
    data: Record<string, string>,
    rules: Record<string, ValidationRule>
  ): { data: Record<string, string>; result: ValidationResult } {
    const sanitizedData: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(data)) {
      sanitizedData[key] = this.sanitizeInput(value)
    }

    const result = this.validateForm(sanitizedData, rules)

    return { data: sanitizedData, result }
  }
}


