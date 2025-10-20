import { useState } from 'react'

interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'success' | 'info'
  onConfirm?: () => void
  onCancel?: () => void
  isLoading?: boolean
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    isLoading: false
  })

  const showConfirm = (config: Omit<ConfirmDialogState, 'isOpen'>) => {
    setDialogState({
      ...config,
      isOpen: true
    })
  }

  const hideConfirm = () => {
    setDialogState(prev => ({
      ...prev,
      isOpen: false
    }))
  }

  const handleConfirm = () => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm()
    }
    hideConfirm()
  }

  const handleCancel = () => {
    if (dialogState.onCancel) {
      dialogState.onCancel()
    }
    hideConfirm()
  }

  const setLoading = (loading: boolean) => {
    setDialogState(prev => ({
      ...prev,
      isLoading: loading
    }))
  }

  return {
    dialogState,
    showConfirm,
    hideConfirm,
    handleConfirm,
    handleCancel,
    setLoading
  }
}
