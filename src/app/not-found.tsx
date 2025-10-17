'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-indigo-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-500 text-sm font-bold">!</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600 leading-relaxed">
            Oops! The page you&apos;re looking for seems to have wandered off into the digital void. 
            Don&apos;t worry, even the best clinics sometimes lose a patient record.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
          
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
            
            <Link
              href="/dashboard/patients"
              className="inline-flex items-center px-4 py-2 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Find Patients
            </Link>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
              Dashboard
            </Link>
            <Link href="/dashboard/patients" className="text-indigo-600 hover:text-indigo-800">
              Patients
            </Link>
            <Link href="/dashboard/inventory" className="text-indigo-600 hover:text-indigo-800">
              Inventory
            </Link>
            <Link href="/dashboard/billing" className="text-indigo-600 hover:text-indigo-800">
              Billing
            </Link>
            <Link href="/dashboard/settings" className="text-indigo-600 hover:text-indigo-800">
              Settings
            </Link>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Fun Fact:</strong> The first recorded medical error was in 1500 BC when an Egyptian 
            physician accidentally prescribed the wrong herb. Even ancient clinics had their 404 moments! 🏥
          </p>
        </div>
      </div>
    </div>
  )
}
