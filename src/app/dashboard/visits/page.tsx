'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPatients } from '@/lib/api/patients'
import { getTreatments } from '@/lib/api/patients'
import { createVisit } from '@/lib/api/patients'
import { createBill } from '@/lib/api/billing'
import { Plus, Calendar } from 'lucide-react'

export default function VisitsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedTreatments, setSelectedTreatments] = useState<{ [key: string]: number }>({})
  const [visitNotes, setVisitNotes] = useState('')

  const queryClient = useQueryClient()

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  })

  const { data: treatments, isLoading: treatmentsLoading } = useQuery({
    queryKey: ['treatments'],
    queryFn: getTreatments,
  })

  // const { data: visits, isLoading: visitsLoading } = useQuery({
  //   queryKey: ['visits'],
  //   queryFn: () => Promise.resolve([]), // This would need a proper visits API
  // })

  const createVisitMutation = useMutation({
    mutationFn: createVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] })
      setShowAddForm(false)
      setSelectedPatient('')
      setSelectedTreatments({})
      setVisitNotes('')
    },
  })

  const createBillMutation = useMutation({
    mutationFn: createBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    try {
      const visit = await createVisitMutation.mutateAsync({
        patient_id: selectedPatient,
        visit_type: 'consultation',
        notes: visitNotes,
      })

      // Add selected treatments to visit
      for (const [treatmentId, quantity] of Object.entries(selectedTreatments)) {
        if (quantity > 0) {
          // This would need a proper API call
          console.log(`Adding treatment ${treatmentId} with quantity ${quantity}`)
        }
      }

      // Create bill for the visit
      await createBillMutation.mutateAsync(visit.id)
    } catch (error) {
      console.error('Error creating visit:', error)
    }
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`

  if (patientsLoading || treatmentsLoading) {
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
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visit Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Visit
        </button>
      </div>

      {/* Add Visit Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Visit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
                <select
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                >
                  <option value="">Select Patient</option>
                  {patients?.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Treatments</label>
                <div className="mt-2 space-y-2">
                  {treatments?.map((treatment) => (
                    <div key={treatment.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`treatment-${treatment.id}`}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={selectedTreatments[treatment.id] > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTreatments({
                                ...selectedTreatments,
                                [treatment.id]: 1,
                              })
                            } else {
                              const newTreatments = { ...selectedTreatments }
                              delete newTreatments[treatment.id]
                              setSelectedTreatments(newTreatments)
                            }
                          }}
                        />
                        <label htmlFor={`treatment-${treatment.id}`} className="ml-2">
                          <span className="text-sm font-medium text-gray-900">{treatment.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {formatPrice(treatment.price_cents)}
                          </span>
                        </label>
                      </div>
                      {selectedTreatments[treatment.id] > 0 && (
                        <input
                          type="number"
                          min="1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          value={selectedTreatments[treatment.id]}
                          onChange={(e) => setSelectedTreatments({
                            ...selectedTreatments,
                            [treatment.id]: parseInt(e.target.value) || 1,
                          })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700"
                  rows={3}
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createVisitMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {createVisitMutation.isPending ? 'Creating...' : 'Create Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visits List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Visits</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p>No visits found. Create a new visit to get started.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
