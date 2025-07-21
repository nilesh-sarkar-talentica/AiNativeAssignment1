'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ICategory } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Grid3X3,
  ArrowRight,
  Package,
  Search,
  Home,
  ChevronRight,
} from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/categories')
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error?.message || 'Failed to fetch categories')
        }

        if (result.success) {
          setCategories(result.data)
        } else {
          throw new Error(result.error?.message || 'Failed to fetch categories')
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to fetch categories'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Error Loading Categories
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
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Categories</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Grid3X3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Product Categories</h1>
        </div>
        <p className="text-muted-foreground">
          Browse our product categories to find exactly what you're looking for
        </p>
      </div>

      {/* Loading State */}
      {loading && <CategoriesPageSkeleton />}

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Categories Found
          </h3>
          <p className="text-muted-foreground mb-6">
            There are no categories available at the moment.
          </p>
          <Button variant="outline" asChild>
            <Link href="/products">
              <Search className="mr-2 h-4 w-4" />
              Browse All Products
            </Link>
          </Button>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && categories.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {categories.map((category) => (
              <CategoryCard key={category._id.toString()} category={category} />
            ))}
          </div>

          {/* Bottom Action */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for?
            </p>
            <Button variant="outline" asChild>
              <Link href="/products">
                <Search className="mr-2 h-4 w-4" />
                Browse All Products
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function CategoryCard({ category }: { category: ICategory }) {
  return (
    <Link href={`/products?categoryId=${category._id}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {category.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {category.description || 'Explore products in this category'}
          </p>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {category.slug}
            </Badge>
            <span className="text-xs text-muted-foreground">
              View products →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function CategoriesPageSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="h-48">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <Skeleton className="w-5 h-5" />
            </div>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
