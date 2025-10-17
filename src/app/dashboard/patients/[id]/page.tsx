'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPatient, updatePatient, deletePatient } from '@/lib/api/patients'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Edit, Trash2, Save, X, Phone, Mail, MapPin, User, Heart, AlertTriangle } from 'lucide-react'

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedPatient, setEditedPatient] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    address: string;
    medical_history: string;
    allergies: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
  }>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    medical_history: '',
    allergies: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  })

  const queryClient = useQueryClient()

  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId),
  })

  const updatePatientMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<{
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      date_of_birth: string;
      gender: string;
      address: string;
      medical_history: string;
      allergies: string;
      emergency_contact_name: string;
      emergency_contact_phone: string;
    }> }) => updatePatient(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      setIsEditing(false)
    },
  })

  const deletePatientMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      router.push('/dashboard/patients')
    },
  })

  const handleEdit = () => {
    if (patient) {
      setEditedPatient({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || '',
        address: patient.address || '',
        medical_history: patient.medical_history || '',
        allergies: patient.allergies || '',
        emergency_contact_name: patient.emergency_contact || '',
        emergency_contact_phone: '',
      })
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    updatePatientMutation.mutate({
      id: patientId,
      updates: editedPatient,
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this patient? This action cannot be undone and will remove all associated data.')) {
      deletePatientMutation.mutate(patientId)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Patient Not Found</h2>
          <p className="text-gray-600 mb-4">The patient you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/dashboard/patients')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/dashboard/patients')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-gray-600">Patient Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={updatePatientMutation.isPending}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {updatePatientMutation.isPending ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Basic Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={editedPatient.first_name}
                    onChange={(e) => setEditedPatient({ ...editedPatient, first_name: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{patient.first_name || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={editedPatient.last_name}
                    onChange={(e) => setEditedPatient({ ...editedPatient, last_name: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{patient.last_name || '-'}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={editedPatient.date_of_birth}
                    onChange={(e) => setEditedPatient({ ...editedPatient, date_of_birth: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">
                    {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : '-'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                {isEditing ? (
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={editedPatient.gender}
                    onChange={(e) => setEditedPatient({ ...editedPatient, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="mt-1 text-sm text-gray-900 capitalize">{patient.gender || '-'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={editedPatient.email}
                  onChange={(e) => setEditedPatient({ ...editedPatient, email: e.target.value })}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {patient.email || '-'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={editedPatient.phone}
                  onChange={(e) => setEditedPatient({ ...editedPatient, phone: e.target.value })}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {patient.phone || '-'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              {isEditing ? (
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={editedPatient.address}
                  onChange={(e) => setEditedPatient({ ...editedPatient, address: e.target.value })}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {patient.address || '-'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Medical History
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Medical History</label>
            {isEditing ? (
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                rows={4}
                value={editedPatient.medical_history}
                onChange={(e) => setEditedPatient({ ...editedPatient, medical_history: e.target.value })}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {patient.medical_history || 'No medical history recorded'}
              </p>
            )}
          </div>
        </div>

        {/* Allergies & Emergency Contact */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Allergies & Emergency Contact
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Allergies</label>
              {isEditing ? (
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  rows={3}
                  value={editedPatient.allergies}
                  onChange={(e) => setEditedPatient({ ...editedPatient, allergies: e.target.value })}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {patient.allergies || 'No known allergies'}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={editedPatient.emergency_contact_name}
                    onChange={(e) => setEditedPatient({ ...editedPatient, emergency_contact_name: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{patient.emergency_contact || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={editedPatient.emergency_contact_phone}
                    onChange={(e) => setEditedPatient({ ...editedPatient, emergency_contact_phone: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">-</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
