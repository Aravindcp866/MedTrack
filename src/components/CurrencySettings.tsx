'use client'

import { useState, useEffect } from 'react'
import { Settings, DollarSign, Euro, IndianRupee } from 'lucide-react'

export interface CurrencySettings {
  currency: 'INR' | 'USD' | 'EUR'
  symbol: string
}

const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', icon: IndianRupee },
  { code: 'USD', symbol: '$', name: 'US Dollar', icon: DollarSign },
  { code: 'EUR', symbol: '€', name: 'Euro', icon: Euro },
]

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clinic-currency')
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return { currency: 'INR', symbol: '₹' }
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('clinic-currency', JSON.stringify(currency))
    }
  }, [currency])

  const updateCurrency = (newCurrency: 'INR' | 'USD' | 'EUR') => {
    const option = CURRENCY_OPTIONS.find(opt => opt.code === newCurrency)
    if (option) {
      setCurrency({ currency: newCurrency, symbol: option.symbol })
    }
  }

  const formatPrice = (amount: number | string | undefined | null) => {
    // Handle undefined, null, or invalid amounts
    if (amount === undefined || amount === null || amount === '') {
      return `${currency.symbol}0.00`
    }
    
    // Handle both regular amounts and amounts in cents
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    
    // Check if the parsed amount is valid
    if (isNaN(numAmount) || !isFinite(numAmount)) {
      return `${currency.symbol}0.00`
    }
    
    // Check if the amount is likely in cents (very large numbers)
    // Most prices in the app are stored in cents, so we need to convert
    const displayAmount = numAmount >= 100 ? numAmount / 100 : numAmount
    
    return `${currency.symbol}${displayAmount.toFixed(2)}`
  }

  return { currency, updateCurrency, formatPrice, CURRENCY_OPTIONS }
}

export default function CurrencySettings() {
  const { currency, updateCurrency, CURRENCY_OPTIONS } = useCurrency()

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2" />
        Currency Settings
      </h2>
      <div className="space-y-3">
        {CURRENCY_OPTIONS.map((option) => {
          const Icon = option.icon
          return (
            <label
              key={option.code}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                currency.currency === option.code
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="currency"
                value={option.code}
                checked={currency.currency === option.code}
                onChange={() => updateCurrency(option.code as 'INR' | 'USD' | 'EUR')}
                className="sr-only"
              />
              <div className="flex items-center">
                <Icon className="w-5 h-5 mr-3 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">{option.name}</div>
                  <div className="text-sm text-gray-500">{option.code} - {option.symbol}</div>
                </div>
              </div>
              {currency.currency === option.code && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                </div>
              )}
            </label>
          )
        })}
      </div>
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Current Currency:</strong> {currency.symbol} {currency.currency}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          This setting will be applied to all monetary values throughout the application.
        </p>
      </div>
    </div>
  )
}

