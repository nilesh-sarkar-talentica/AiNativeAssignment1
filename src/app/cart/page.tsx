'use client'

import { useCart } from '@/hooks/use-cart'
import CartItem from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'
import EmptyCart from '@/components/cart/EmptyCart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function CartPage() {
  const { cart, loading, error, clearCart, getItemCount } = useCart()
  const [isClearingCart, setIsClearingCart] = useState(false)

  const handleClearCart = async () => {
    if (!cart || cart.items.length === 0) return

    if (window.confirm('Are you sure you want to clear your cart?')) {
      setIsClearingCart(true)
      try {
        await clearCart()
      } catch (error) {
        console.error('Error clearing cart:', error)
      } finally {
        setIsClearingCart(false)
      }
    }
  }

  if (loading) {
    return <CartPageSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Error Loading Cart
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

  const itemCount = getItemCount()

  if (!cart || itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
        </div>
        <EmptyCart />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Shopping Cart
            </h1>
            <p className="text-muted-foreground mt-1">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          {itemCount > 0 && (
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={isClearingCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isClearingCart ? 'Clearing...' : 'Clear Cart'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.skuId.toString()}>
                  <CartItem item={item} />
                  {cart.items.indexOf(item) < cart.items.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}

function CartPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
