'use client'

import Link from 'next/link'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function EmptyCart() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-muted-foreground">
              Looks like you haven't added any items to your cart yet.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/products">
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p>Need help finding what you're looking for?</p>
            <p className="mt-1">
              Browse our{' '}
              <Link href="/products" className="text-primary hover:underline">
                product catalog
              </Link>{' '}
              or use the search bar above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
