'use client'

import { useEffect, useState } from 'react'
import { ICategory } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface CategoryFilterProps {
  onCategoryChange?: (categoryId: string | null) => void
}

export default function CategoryFilter({
  onCategoryChange,
}: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<ICategory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('categoryId')
  )

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const result = await response.json()

        if (result.success) {
          setCategories(result.data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const categoryId = searchParams.get('categoryId')
    setSelectedCategory(categoryId)
  }, [searchParams])

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams)

    if (categoryId === 'all') {
      params.delete('categoryId')
      setSelectedCategory(null)
    } else {
      params.set('categoryId', categoryId)
      setSelectedCategory(categoryId)
    }

    // Reset to first page when filtering
    params.set('page', '1')

    router.push(`${pathname}?${params.toString()}`)

    if (onCategoryChange) {
      onCategoryChange(categoryId === 'all' ? null : categoryId)
    }
  }

  const handleClearFilter = () => {
    handleCategoryChange('all')
  }

  const selectedCategoryName = categories.find(
    (cat) => cat._id.toString() === selectedCategory
  )?.name

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Category</label>
      <div className="space-y-2">
        <Select
          value={selectedCategory || 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem
                key={category._id.toString()}
                value={category._id.toString()}
              >
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCategory && selectedCategoryName && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedCategoryName}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearFilter}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
