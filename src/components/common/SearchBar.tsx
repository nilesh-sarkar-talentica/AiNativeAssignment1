'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

interface SearchBarProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
}

export default function SearchBar({
  placeholder = 'Search products...',
  className = '',
  onSearch,
}: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  )

  const debouncedSearch = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams(searchParams)

    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }

    // Reset to first page when searching
    params.set('page', '1')

    router.push(`${pathname}?${params.toString()}`)

    if (onSearch) {
      onSearch(query)
    }
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    debouncedSearch(value)
  }

  const handleClear = () => {
    setSearchQuery('')
    debouncedSearch('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    debouncedSearch(searchQuery)
  }

  // Update local state when URL params change
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  )
}
