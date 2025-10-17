'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBills, updateBillPayment, generateBillPDF, sendBillNotification } from '@/lib/api/billing'
import { getPatients } from '@/lib/api/patients'
import { FileText, Download, Send, CheckCircle, Clock, AlertCircle, Search, Plus, User } from 'lucide-react'

export default function BillingPage() {
  const [searchPhone, setSearchPhone] = useState('')
  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<{id: string; first_name: string; last_name: string; phone: string | null} | null>(null)

  const queryClient = useQueryClient()

  const { data: bills, isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: getBills,
  })

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
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

  const generatePDFMutation = useMutation({
    mutationFn: generateBillPDF,
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

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
            
            <div className="flex justify-end space-x-3 mt-4">
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
                    {formatPrice(bill.total_cents)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(bill.payment_status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.payment_status)}`}>
                        {bill.payment_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(bill.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {bill.payment_status !== 'paid' && (
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
                    {!bill.pdf_url && (
                      <button
                        onClick={() => generatePDFMutation.mutate(bill.id)}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
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
    </div>
  )
}
