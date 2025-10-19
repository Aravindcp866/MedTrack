'use client'

import { X, AlertTriangle } from 'lucide-react'

interface ConfirmationPopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export default function ConfirmationPopup({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmationPopupProps) {
  if (!isOpen) return null

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirm: 'bg-red-600 hover:bg-red-700 text-white',
          icon: 'text-red-600'
        }
      case 'warning':
        return {
          confirm: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          icon: 'text-yellow-600'
        }
      case 'info':
        return {
          confirm: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: 'text-blue-600'
        }
      default:
        return {
          confirm: 'bg-red-600 hover:bg-red-700 text-white',
          icon: 'text-red-600'
        }
    }
  }

  const buttonStyles = getButtonStyles()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-gray-100 ${buttonStyles.icon}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${buttonStyles.confirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

