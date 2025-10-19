'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBills, updateBillPayment, sendBillNotification, recalculateBillTotal } from '@/lib/api/billing'
import { getPatients } from '@/lib/api/patients'
import { getProducts } from '@/lib/api/products'
import { getBillItems, createBillItem, deleteBillItem, updateInventoryItem } from '@/lib/api/bill-items'
import { api, apiRequest } from '@/lib/api-client'
import { CreatePatientData } from '@/lib/types'
import { useCurrency } from '@/components/CurrencySettings'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ConfirmationPopup from '@/components/ui/ConfirmationPopup'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import { FileText, Download, Send, CheckCircle, Clock, AlertCircle, Search, Plus, User, X, Edit, Save, Package, Trash2 } from 'lucide-react'

export default function BillingPage() {
  const { formatPrice } = useCurrency()
  const { toasts, success, error, warning, removeToast } = useToast()
  const [searchPhone, setSearchPhone] = useState('')
  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<{id: string; first_name: string; last_name: string; phone: string | null} | null>(null)
  const [newPatient, setNewPatient] = useState<CreatePatientData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_history: '',
    allergies: '',
  })
  const [visitAmount, setVisitAmount] = useState('')
  const [visitNotes, setVisitNotes] = useState('')
  const [editingBill, setEditingBill] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{id: string; name: string} | null>(null)
  const [showItemDeleteConfirm, setShowItemDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{id: string; description: string} | null>(null)
  const [showInventorySelection, setShowInventorySelection] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    product_id: string;
    name: string;
    unit_price_cents: number;
    quantity: number;
    stock_quantity: number;
    updated_price?: number; // New field for price updates
  }>>([])
  const [currentBillId, setCurrentBillId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const { data: bills, isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: getBills,
  })

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  })

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  const { data: billItems } = useQuery({
    queryKey: ['bill-items', currentBillId],
    queryFn: () => currentBillId ? getBillItems(currentBillId) : Promise.resolve([]),
    enabled: !!currentBillId,
  })

  const filteredPatients = patients?.filter(patient => 
    patient.phone?.includes(searchPhone) || 
    patient.first_name?.toLowerCase().includes(searchPhone.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchPhone.toLowerCase())
  ) || []

  const updatePaymentMutation = useMutation({
    mutationFn: ({ billId, status, method }: { billId: string; status: string; method?: string }) =>
      updateBillPayment(billId, status as 'paid' | 'pending' | 'overdue', method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })


  const sendNotificationMutation = useMutation({
    mutationFn: sendBillNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })

  const createPatientMutation = useMutation({
    mutationFn: api.createPatient,
    onSuccess: (newPatient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      setSelectedPatient({
        id: newPatient.id,
        first_name: newPatient.first_name,
        last_name: newPatient.last_name,
        phone: newPatient.phone
      })
      setShowAddPatient(false)
      setNewPatient({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        medical_history: '',
        allergies: '',
      })
      success('Patient created', `${newPatient.first_name} ${newPatient.last_name} has been added`)
    },
    onError: (err: Error) => {
      console.error('Patient creation error:', err)
      const errorMessage = err.message || 'Unknown error occurred'
      error('Failed to create patient', errorMessage)
    },
  })

  const createVisitMutation = useMutation({
    mutationFn: api.createVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] })
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      setSelectedPatient(null)
      setVisitAmount('')
      setVisitNotes('')
      success('Visit created', 'Visit and bill have been created successfully')
    },
    onError: (err: Error) => {
      console.error('Visit creation error:', err)
      error('Failed to create visit', err.message)
    },
  })

  const updateBillMutation = useMutation({
    mutationFn: ({ billId, amount }: { billId: string; amount: number }) => 
      apiRequest(`/api/bills/${billId}`, {
        method: 'PUT',
        body: JSON.stringify({ total_amount: amount }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      setEditingBill(null)
      setEditAmount('')
      success('Bill updated', 'Bill amount has been updated successfully')
    },
    onError: (err: Error) => {
      console.error('Bill update error:', err)
      error('Failed to update bill', err.message)
    },
  })

  const createBillItemMutation = useMutation({
    mutationFn: createBillItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-items', currentBillId] })
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err: Error) => {
      console.error('Bill item creation error:', err)
      error('Failed to add item to bill', err.message)
    },
  })

  const deleteBillItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await deleteBillItem(itemId)
      // Recalculate bill total after removing item
      if (currentBillId) {
        await recalculateBillTotal(currentBillId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-items', currentBillId] })
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      success('Item removed', 'Item has been removed from the bill')
    },
    onError: (err: Error) => {
      console.error('Bill item deletion error:', err)
      error('Failed to remove item', err.message)
    },
  })

  const handleEditBill = (bill: { id: string; total_amount?: number }) => {
    setEditingBill(bill.id)
    setEditAmount(bill.total_amount?.toString() || '')
  }

  const handleSaveBill = () => {
    if (editingBill && editAmount) {
      updateBillMutation.mutate({ 
        billId: editingBill, 
        amount: parseFloat(editAmount) 
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingBill(null)
    setEditAmount('')
  }

  const handleAddInventoryToBill = (billId: string) => {
    setCurrentBillId(billId)
    setShowInventorySelection(true)
    // Refresh products data when opening inventory modal
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const handleProductSelection = (product: { id: string; name: string; unit_price: number; stock_quantity: number }) => {
    const existingIndex = selectedProducts.findIndex(p => p.product_id === product.id)
    if (existingIndex >= 0) {
      const updated = [...selectedProducts]
      updated[existingIndex].quantity += 1
      setSelectedProducts(updated)
    } else {
      setSelectedProducts([...selectedProducts, {
        product_id: product.id,
        name: product.name,
        unit_price_cents: product.unit_price * 100, // Convert dollars to cents
        quantity: 1,
        stock_quantity: product.stock_quantity
      }])
    }
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    const updated = selectedProducts.map(p => 
      p.product_id === productId ? { ...p, quantity } : p
    )
    setSelectedProducts(updated)
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.product_id !== productId))
  }

  const handlePriceUpdate = (productId: string, newPrice: number) => {
    const updated = selectedProducts.map(p => 
      p.product_id === productId ? { ...p, updated_price: newPrice } : p
    )
    setSelectedProducts(updated)
  }

  const handleDeleteItemClick = (itemId: string, itemDescription: string) => {
    setItemToDelete({ id: itemId, description: itemDescription })
    setShowItemDeleteConfirm(true)
  }

  const handleConfirmDeleteItem = () => {
    if (itemToDelete) {
      deleteBillItemMutation.mutate(itemToDelete.id)
      setItemToDelete(null)
    }
  }

  const handleSaveInventoryItems = async () => {
    if (!currentBillId) return

    try {
      let successCount = 0
      let errorCount = 0

      for (const product of selectedProducts) {
        if (product.quantity > 0) {
          try {
            // Check if we have enough stock
            if (product.quantity > product.stock_quantity) {
              warning('Insufficient stock', `${product.name} - Only ${product.stock_quantity} available`)
              errorCount++
              continue
            }

            // Use updated price if available, otherwise use current price
            let finalPrice: number
            
            if (product.updated_price !== undefined && product.updated_price > 0) {
              finalPrice = product.updated_price
            } else if (product.unit_price_cents && product.unit_price_cents > 0) {
              finalPrice = product.unit_price_cents / 100
            } else {
              // Fallback to a default price if no valid price is found
              console.warn(`No valid price found for ${product.name}, using default price of $1.00`)
              finalPrice = 1.00
            }
            
            // Final validation
            if (!finalPrice || finalPrice <= 0 || isNaN(finalPrice)) {
              throw new Error(`Invalid price for ${product.name}: ${finalPrice}. Original price: ${product.unit_price_cents}, Updated price: ${product.updated_price}`)
            }
            
            console.log(`Creating bill item for ${product.name}:`, {
              product_id: product.product_id,
              unit_price: finalPrice,
              quantity: product.quantity,
              total_price: finalPrice * product.quantity
            })
            
            await createBillItemMutation.mutateAsync({
              bill_id: currentBillId,
              product_id: product.product_id,
              description: product.name,
              quantity: product.quantity,
              unit_price: finalPrice,
              total_price: finalPrice * product.quantity
            })

            // Update inventory (stock and price tracking)
            const inventoryUpdates: { stockChange: number; newPrice?: number } = {
              stockChange: -product.quantity
            }
            
            // If price was updated, include it in the inventory update
            if (product.updated_price !== undefined) {
              inventoryUpdates.newPrice = product.updated_price
            }
            
            await updateInventoryItem(product.product_id, inventoryUpdates)
            successCount++
          } catch (itemError: unknown) {
            console.error(`Error adding ${product.name}:`, itemError)
            error('Failed to add item', `${product.name}: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`)
            errorCount++
          }
        }
      }

      if (successCount > 0) {
        // Recalculate bill total after adding items
        try {
          await recalculateBillTotal(currentBillId)
          // Invalidate queries to refresh stock and bill data
          queryClient.invalidateQueries({ queryKey: ['products'] })
          queryClient.invalidateQueries({ queryKey: ['bills'] })
          queryClient.invalidateQueries({ queryKey: ['bill-items', currentBillId] })
          success('Items added successfully', `${successCount} item(s) added to the bill`)
        } catch (recalcError) {
          console.error('Error recalculating bill total:', recalcError)
          // Still invalidate queries even if recalculation fails
          queryClient.invalidateQueries({ queryKey: ['products'] })
          queryClient.invalidateQueries({ queryKey: ['bills'] })
          queryClient.invalidateQueries({ queryKey: ['bill-items', currentBillId] })
          success('Items added successfully', `${successCount} item(s) added to the bill (total may need manual update)`)
        }
      }

      if (errorCount > 0) {
        warning('Some items failed', `${errorCount} item(s) could not be added`)
      }

      setSelectedProducts([])
      setShowInventorySelection(false)
      // Don't clear currentBillId so bill items remain visible
      // setCurrentBillId(null)
      // Refresh products data when closing modal
      queryClient.invalidateQueries({ queryKey: ['products'] })
    } catch (err: unknown) {
      console.error('Error adding inventory items:', err)
      error('Failed to add inventory items', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
        </div>
      </div>

    </div>
  )
}

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
            <p className="text-gray-600">Manage invoices and payments</p>
          </div>
          <button
            onClick={() => setShowPatientSearch(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Bill
          </button>
        </div>
      </div>

      {/* Patient Search Modal */}
      {showPatientSearch && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Find Patient</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Search by Phone Number or Name</label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    placeholder="Enter phone number or patient name..."
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {searchPhone && (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatient(patient)
                          setShowPatientSearch(false)
                          setSearchPhone('')
                        }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {patient.first_name} {patient.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{patient.phone}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      No patients found
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setShowAddPatient(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Patient
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPatientSearch(false)
                    setSearchPhone('')
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Patient</h2>
              <button
                onClick={() => setShowAddPatient(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              createPatientMutation.mutate(newPatient)
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={newPatient.first_name}
                    onChange={(e) => setNewPatient({ ...newPatient, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={newPatient.last_name}
                    onChange={(e) => setNewPatient({ ...newPatient, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPatientMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {createPatientMutation.isPending ? 'Adding...' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Patient Info */}
      {selectedPatient && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Selected Patient: {selectedPatient.first_name} {selectedPatient.last_name}
                </p>
                <p className="text-sm text-blue-700">{selectedPatient.phone}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Visit Creation Form */}
      {selectedPatient && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Create Visit & Bill</h3>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (visitAmount && selectedPatient) {
              createVisitMutation.mutate({
                patient_id: selectedPatient.id,
                visit_date: new Date().toISOString().split('T')[0],
                visit_type: 'consultation',
                status: 'completed',
                treatment_notes: visitNotes,
                amount: parseFloat(visitAmount)
              })
            }
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Visit Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={visitAmount}
                  onChange={(e) => setVisitAmount(e.target.value)}
                  placeholder="Enter visit amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Visit Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={new Date().toISOString().split('T')[0]}
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Treatment Notes</label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                rows={3}
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="Enter treatment details..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPatient(null)
                  setVisitAmount('')
                  setVisitNotes('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createVisitMutation.isPending || !visitAmount}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {createVisitMutation.isPending ? 'Creating...' : 'Create Visit & Bill'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bills List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills?.map((bill) => (
                <tr key={bill.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {bill.bill_number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* Patient name would come from join */}
                    Patient Name
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingBill === bill.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-gray-900"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                        />
                        <button
                          onClick={handleSaveBill}
                          disabled={updateBillMutation.isPending}
                          className="text-green-600 hover:text-green-900 cursor-pointer"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{formatPrice(bill.total_cents || 0)}</span>
                        <button
                          onClick={() => handleEditBill(bill)}
                          className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(bill.payment_status || 'pending')}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.payment_status || 'pending')}`}>
                        {bill.payment_status || 'pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(bill.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {(bill.payment_status || 'pending') !== 'paid' && (
                      <button
                        onClick={() => updatePaymentMutation.mutate({
                        billId: bill.id,
                        status: 'paid',
                        method: 'cash'
                      })}
                        className="text-green-600 hover:text-green-900 cursor-pointer"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => handleAddInventoryToBill(bill.id)}
                      className="text-green-600 hover:text-green-900 cursor-pointer"
                      title="Add Inventory Items"
                    >
                      <Package className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentBillId(currentBillId === bill.id ? null : bill.id)}
                      className={`cursor-pointer ${
                        currentBillId === bill.id 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-blue-600 hover:text-blue-900'
                      }`}
                      title={currentBillId === bill.id ? "Hide Items" : "View Items"}
                    >
                      {currentBillId === bill.id ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => window.open(`/api/bills/${bill.id}/pdf`, '_blank')}
                      className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {bill.pdf_url && (
                      <button
                        onClick={() => sendNotificationMutation.mutate(bill.id)}
                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Items Display */}
      {currentBillId && (
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Bill Items for Bill #{bills?.find(b => b.id === currentBillId)?.bill_number || currentBillId}
            </h3>
            <button
              onClick={() => setCurrentBillId(null)}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              title="Hide Items"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {billItems && billItems.length > 0 ? (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {billItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(item.total_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteItemClick(item.id, item.description)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No items added to this bill yet</p>
              <p className="text-sm">Click the &quot;Add Inventory Items&quot; button to add items to this bill</p>
            </div>
          )}
        </div>
      )}

      {/* Inventory Selection Modal */}
      {showInventorySelection && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Inventory Items to Bill</h2>
              <button
                onClick={() => {
                  setShowInventorySelection(false)
                  setSelectedProducts([])
                  // Don't clear currentBillId so bill items remain visible
                  // setCurrentBillId(null)
                  // Refresh products data when manually closing modal
                  queryClient.invalidateQueries({ queryKey: ['products'] })
                }}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Products */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Products</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {products?.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">
                            Price: {formatPrice(product.unit_price || 0)} | 
                            Stock: {product.stock_quantity}
                          </p>
                        </div>
                        <button
                          onClick={() => handleProductSelection(product)}
                          disabled={product.stock_quantity <= 0}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Products */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Selected Items</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedProducts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No items selected</p>
                  ) : (
                    selectedProducts.map((product) => (
                      <div key={product.product_id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center space-x-2">
                                <span>Price:</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={product.updated_price !== undefined ? product.updated_price : (product.unit_price_cents / 100)}
                                  onChange={(e) => handlePriceUpdate(product.product_id, parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Price"
                                />
                                <span className="text-xs text-gray-500">
                                  (was {formatPrice(product.unit_price_cents)})
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              max={product.stock_quantity}
                              value={product.quantity}
                              onChange={(e) => handleQuantityChange(product.product_id, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            />
                            <button
                              onClick={() => handleRemoveProduct(product.product_id)}
                              className="text-red-600 hover:text-red-800 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          Total: {formatPrice((product.updated_price !== undefined ? product.updated_price : (product.unit_price_cents / 100)) * product.quantity)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {selectedProducts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg">
                        {formatPrice(selectedProducts.reduce((sum, p) => {
                          const price = p.updated_price !== undefined ? p.updated_price : (p.unit_price_cents / 100)
                          return sum + (price * p.quantity)
                        }, 0))}
                      </span>
                    </div>
                    <button
                      onClick={handleSaveInventoryItems}
                      disabled={createBillItemMutation.isPending}
                      className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {createBillItemMutation.isPending ? 'Adding...' : 'Add Items to Bill'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (deleteTarget) {
            // Add delete logic here if needed
            setShowDeleteConfirm(false)
            setDeleteTarget(null)
          }
        }}
        title="Delete Confirmation"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Item Delete Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showItemDeleteConfirm}
        onClose={() => {
          setShowItemDeleteConfirm(false)
          setItemToDelete(null)
        }}
        onConfirm={handleConfirmDeleteItem}
        title="Remove Item from Bill"
        message={`Are you sure you want to remove "${itemToDelete?.description}" from the bill? This action cannot be undone.`}
        confirmText="Remove Item"
        cancelText="Cancel"
        type="danger"
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
