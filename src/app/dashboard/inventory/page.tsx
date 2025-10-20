'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, createProduct, deleteProduct, updateProduct } from '@/lib/api/products'
import { CreateProductData } from '@/lib/types'
import { Plus, Package, AlertTriangle, Edit, Save, X, Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton'
import { EnhancedButton } from '@/components/ui/EnhancedButton'
import { SmartForm } from '@/components/ui/SmartForm'

export default function InventoryPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStock, setEditingStock] = useState<string | null>(null)
  const [stockQuantity, setStockQuantity] = useState<number>(0)

  const queryClient = useQueryClient()
  const { dialogState, showConfirm, handleConfirm, handleCancel } = useConfirmDialog()

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowAddForm(false)
    },
    onError: (error) => {
      console.error('Error creating product:', error)
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateProductData> }) => 
      updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setEditingStock(null)
    },
  })

  const handleDelete = (productId: string) => {
    const product = products?.find(p => p.id === productId)
    showConfirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product?.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => deleteProductMutation.mutate(productId)
    })
  }

  const handleEditStock = (product: {id: string; stock_quantity: number}) => {
    setEditingStock(product.id)
    setStockQuantity(product.stock_quantity)
  }

  const handleSaveStock = (productId: string) => {
    updateProductMutation.mutate({
      id: productId,
      updates: { stock_quantity: stockQuantity }
    })
  }

  const handleCancelEdit = () => {
    setEditingStock(null)
    setStockQuantity(0)
  }



  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Breadcrumbs />
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <TableSkeleton rows={5} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Breadcrumbs />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your clinic&apos;s inventory and products</p>
        </div>
        <EnhancedButton
          onClick={() => setShowAddForm(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          variant="primary"
        >
          Add Product
        </EnhancedButton>
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Product</h2>
            <SmartForm
              fields={[
                {
                  name: 'name',
                  label: 'Product Name',
                  type: 'text',
                  required: true,
                  validation: {
                    minLength: 2,
                    maxLength: 100
                  },
                  placeholder: 'Enter product name'
                },
                {
                  name: 'description',
                  label: 'Description',
                  type: 'text',
                  placeholder: 'Enter product description'
                },
                {
                  name: 'category',
                  label: 'Category',
                  type: 'text',
                  placeholder: 'Enter product category'
                },
                {
                  name: 'unit_price',
                  label: 'Unit Price ($)',
                  type: 'number',
                  required: true,
                  validation: {
                    custom: (value) => {
                      const num = parseFloat(value)
                      if (isNaN(num) || num < 0) return 'Price must be a positive number'
                      return null
                    }
                  },
                  placeholder: '0.00'
                },
                {
                  name: 'stock_quantity',
                  label: 'Stock Quantity',
                  type: 'number',
                  required: true,
                  validation: {
                    custom: (value) => {
                      const num = parseInt(value)
                      if (isNaN(num) || num < 0) return 'Stock must be a positive number'
                      return null
                    }
                  },
                  placeholder: '0'
                },
                {
                  name: 'min_stock_level',
                  label: 'Minimum Stock Level',
                  type: 'number',
                  required: true,
                  validation: {
                    custom: (value) => {
                      const num = parseInt(value)
                      if (isNaN(num) || num < 0) return 'Minimum stock must be a positive number'
                      return null
                    }
                  },
                  placeholder: '0'
                }
              ]}
              onSubmit={async (data) => {
                const productData: CreateProductData = {
                  name: data.name,
                  description: data.description || '',
                  category: data.category || '',
                  unit_price_cents: Math.round(parseFloat(data.unit_price) * 100),
                  stock_quantity: parseInt(data.stock_quantity),
                  min_stock_level: parseInt(data.min_stock_level)
                }
                createProductMutation.mutate(productData)
                setShowAddForm(false)
              }}
              submitText="Add Product"
            />
            <div className="mt-4 flex justify-end">
              <EnhancedButton
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="mr-2"
              >
                Cancel
              </EnhancedButton>
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products?.map((product) => (
                <tr key={product.id} className='hover:bg-gray-100 dark:hover:bg-gray-700'>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{product.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.stock_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {editingStock === product.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={stockQuantity}
                            onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white dark:bg-gray-700"
                            min="0"
                          />
                          <button
                            onClick={() => handleSaveStock(product.id)}
                            className="text-green-600 hover:text-green-800 cursor-pointer"
                            disabled={updateProductMutation.isPending}
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 dark:text-white">{product.stock_quantity}</span>
                          {product.stock_quantity <= product.min_stock_level && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <button
                            onClick={() => handleEditStock(product)}
                            className="text-green-400 hover:text-green-600 cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.stock_quantity <= product.min_stock_level
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800 border-[3px] border-[#288528]'
                    }`}>
                      {product.stock_quantity <= product.min_stock_level ? 'Out of Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        type={dialogState.type}
        isLoading={dialogState.isLoading}
      />
    </div>
  )
}
