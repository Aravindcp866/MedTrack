'use client'

import { useState } from 'react'
import { EnhancedButton } from './EnhancedButton'
import { EnhancedInput } from './EnhancedInput'
import { SmartForm } from './SmartForm'
import { HoverCard, ClickableButton, GlowCard } from './MicroInteractions'
import { LoadingState, StatusIndicator } from './AdvancedLoading'
import { EnhancedCard } from './EnhancedCard'
import { ToastContainer } from './EnhancedToast'

export function UIShowcase() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
  }>>([])

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, type, title, message }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const formFields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50
      },
      placeholder: 'Enter your full name'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      placeholder: 'Enter your email'
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'tel',
      validation: {
        pattern: /^[\+]?[1-9][\d]{0,15}$/
      },
      placeholder: 'Enter your phone number'
    }
  ]

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Enhanced UI Components Showcase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Experience the delightful micro-interactions and enhanced UX features
          </p>
        </div>

        {/* Micro-interactions */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Micro-interactions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HoverCard>
              <EnhancedCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hover Card</h3>
                <p className="text-gray-600 dark:text-gray-400">Hover over this card to see the lift effect</p>
              </EnhancedCard>
            </HoverCard>

            <ClickableButton>
              <EnhancedCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Clickable Button</h3>
                <p className="text-gray-600 dark:text-gray-400">Click to see the scale animation</p>
              </EnhancedCard>
            </ClickableButton>

            <GlowCard>
              <EnhancedCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Glow Card</h3>
                <p className="text-gray-600 dark:text-gray-400">Hover to see the glow effect</p>
              </EnhancedCard>
            </GlowCard>
          </div>
        </section>

        {/* Enhanced Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Enhanced Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <EnhancedButton variant="primary">Primary Button</EnhancedButton>
            <EnhancedButton variant="secondary">Secondary Button</EnhancedButton>
            <EnhancedButton variant="outline">Outline Button</EnhancedButton>
            <EnhancedButton variant="ghost">Ghost Button</EnhancedButton>
            <EnhancedButton variant="danger">Danger Button</EnhancedButton>
            <EnhancedButton loading>Loading Button</EnhancedButton>
            <EnhancedButton leftIcon={<span>🎉</span>}>With Icon</EnhancedButton>
          </div>
        </section>

        {/* Enhanced Inputs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Enhanced Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedInput
              label="Success Input"
              value="Valid input"
              success
              helperText="This input is valid"
            />
            <EnhancedInput
              label="Error Input"
              value="invalid"
              error="This field has an error"
            />
            <EnhancedInput
              label="Password Input"
              type="password"
              placeholder="Enter password"
            />
            <EnhancedInput
              label="With Helper Text"
              placeholder="Enter some text"
              helperText="This is helpful information"
            />
          </div>
        </section>

        {/* Loading States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Spinner</h3>
              <LoadingState type="spinner" text="Loading..." />
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Dots</h3>
              <LoadingState type="dots" text="Processing..." />
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Pulse</h3>
              <LoadingState type="pulse" text="Syncing..." />
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Progress</h3>
              <LoadingState type="progress" text="Uploading..." progress={65} />
            </div>
          </div>
        </section>

        {/* Status Indicators */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Status Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatusIndicator status="loading" text="Loading data..." />
            <StatusIndicator status="success" text="Operation successful" />
            <StatusIndicator status="error" text="Operation failed" />
            <StatusIndicator status="pending" text="Waiting for approval" />
          </div>
        </section>

        {/* Smart Form */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Smart Form with Validation</h2>
          <div className="max-w-2xl">
            <SmartForm
              fields={formFields}
              onSubmit={async (data) => {
                console.log('Form submitted:', data)
                addToast('success', 'Form submitted successfully!', 'Your information has been saved.')
              }}
              submitText="Submit Form"
            />
          </div>
        </section>

        {/* Toast Demo */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Toast Notifications</h2>
          <div className="flex space-x-4">
            <EnhancedButton
              onClick={() => addToast('success', 'Success!', 'Operation completed successfully')}
              variant="primary"
            >
              Success Toast
            </EnhancedButton>
            <EnhancedButton
              onClick={() => addToast('error', 'Error!', 'Something went wrong')}
              variant="danger"
            >
              Error Toast
            </EnhancedButton>
            <EnhancedButton
              onClick={() => addToast('warning', 'Warning!', 'Please check your input')}
              variant="outline"
            >
              Warning Toast
            </EnhancedButton>
            <EnhancedButton
              onClick={() => addToast('info', 'Info', 'Here is some information')}
              variant="ghost"
            >
              Info Toast
            </EnhancedButton>
          </div>
        </section>

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </div>
  )
}
