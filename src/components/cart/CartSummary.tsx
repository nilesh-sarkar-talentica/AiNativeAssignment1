'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShoppingBag, CreditCard } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'

export default function CartSummary() {
  const { cart, getItemCount, getTotalAmount } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const itemCount = getItemCount()
  const subtotal = getTotalAmount()
  const shipping = subtotal > 50 ? 0 : 9.99 // Free shipping over $50
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  if (!cart || itemCount === 0) {
    return null
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Items count */}
        <div className="flex justify-between text-sm">
          <span>Items ({itemCount})</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>
            {shipping === 0 ? (
              <span className="text-green-600 font-medium">Free</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        {/* Free shipping message */}
        {shipping > 0 && (
          <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
            Add {formatPrice(50 - subtotal)} more for free shipping!
          </div>
        )}

        {/* Checkout Button */}
        <Button className="w-full" size="lg" disabled>
          <CreditCard className="mr-2 h-5 w-5" />
          Proceed to Checkout
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Checkout functionality coming soon
        </p>

        {/* Security Note */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Secure 256-bit SSL encryption</p>
          <p>• 30-day return policy</p>
          <p>• Free shipping on orders over $50</p>
        </div>
      </CardContent>
    </Card>
  )
}
