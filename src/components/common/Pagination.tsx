'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { PaginationMeta } from '@/types'

interface PaginationProps {
  pagination: PaginationMeta
}

export default function Pagination({ pagination }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { page, totalPages, hasNext, hasPrev } = pagination

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const generatePageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show smart pagination with ellipsis
      if (page <= 3) {
        // Near the beginning
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        if (totalPages > 5) {
          pages.push('...')
          pages.push(totalPages)
        }
      } else if (page >= totalPages - 2) {
        // Near the end
        pages.push(1)
        if (totalPages > 5) {
          pages.push('...')
        }
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push(1)
        pages.push('...')
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  const pageNumbers = generatePageNumbers()

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page - 1)}
        disabled={!hasPrev}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center space-x-1">
        {pageNumbers.map((pageNum, index) => (
          <div key={index}>
            {pageNum === '...' ? (
              <div className="flex items-center justify-center px-3 py-2">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            ) : (
              <Button
                variant={pageNum === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(pageNum as number)}
                className="min-w-[40px]"
              >
                {pageNum}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page + 1)}
        disabled={!hasNext}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
