'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  IProductWithCategory,
  ProductFilters,
  PaginatedResponse,
} from '@/types'
import ProductGrid from '@/components/product/ProductGrid'
import SearchBar from '@/components/common/SearchBar'
import CategoryFilter from '@/components/common/CategoryFilter'
import Pagination from '@/components/common/Pagination'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ProductWithExtras extends IProductWithCategory {
  defaultSkuId?: string
  minPrice?: number
  hasStock?: boolean
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<ProductWithExtras[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchProducts = async (filters: ProductFilters) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.categoryId) params.append('categoryId', filters.categoryId)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.pageSize)
        params.append('pageSize', filters.pageSize.toString())

      const response = await fetch(`/api/products?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch products')
      }

      if (result.success) {
        // Transform products to include SKU information
        const productsWithExtras = result.data.products.map((product: any) => ({
          ...product,
          defaultSkuId: product.skus?.[0]?._id?.toString(),
          minPrice:
            product.skus?.length > 0
              ? Math.min(...product.skus.map((sku: any) => sku.price))
              : product.basePrice,
          hasStock:
            product.skus?.some((sku: any) => sku.inventory > 0) || false,
        }))

        setProducts(productsWithExtras)
        setPagination(result.data.pagination)
      } else {
        throw new Error(result.error?.message || 'Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filters: ProductFilters = {
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '12'),
    }

    fetchProducts(filters)
  }, [searchParams])

  const clearAllFilters = () => {
    window.location.href = '/products'
  }

  const hasActiveFilters =
    searchParams.get('search') || searchParams.get('categoryId')

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Error Loading Products
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Products</h1>
        <p className="text-muted-foreground">
          Discover our collection of products
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <SearchBar className="w-full" />
          </div>

          {/* Filter Toggle - Mobile */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filters Panel */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                Filters
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CategoryFilter />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Active filters:</span>
            {searchParams.get('search') && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchParams.get('search')}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      <Separator className="mb-6" />

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          {loading
            ? 'Loading products...'
            : `Showing ${
                (pagination.page - 1) * pagination.pageSize + 1
              }-${Math.min(
                pagination.page * pagination.pageSize,
                pagination.totalItems
              )} of ${pagination.totalItems} products`}
        </p>
      </div>

      {/* Products Grid */}
      <div className="mb-8">
        <ProductGrid products={products} loading={loading} />
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination pagination={pagination} />
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-96 bg-gray-200 rounded" />
            <div className="h-12 w-full bg-gray-200 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}
