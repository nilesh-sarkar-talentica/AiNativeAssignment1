'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ICartWithDetails } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Minus, Plus, Trash2, Package } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'

interface CartItemProps {
  item: ICartWithDetails['items'][0]
}

export default function CartItem({ item }: CartItemProps) {
  const { updateItem, removeItem } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return
    if (newQuantity === item.quantity) return

    setIsUpdating(true)
    try {
      await updateItem(item.skuId.toString(), newQuantity)
    } catch (error) {
      console.error('Error updating cart item:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await removeItem(item.skuId.toString())
    } catch (error) {
      console.error('Error removing cart item:', error)
      setIsRemoving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const sku = item.sku
  const product = sku?.product

  if (!sku || !product) {
    return null
  }

  const maxQuantity = Math.min(sku.inventory, 99)
  const isOutOfStock = sku.inventory === 0
  const hasLowStock = sku.inventory > 0 && sku.inventory <= 5

  return (
    <Card className={`transition-opacity ${isRemoving ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <Link href={`/products/${product._id}`} className="flex-shrink-0">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-gray-50">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          </Link>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${product._id}`}
                  className="font-medium hover:text-primary transition-colors line-clamp-2"
                >
                  {product.name}
                </Link>

                <p className="text-sm text-muted-foreground mt-1">{sku.name}</p>

                {/* SKU Attributes */}
                {sku.attributes && Object.keys(sku.attributes).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(sku.attributes).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stock Status */}
                <div className="mt-2">
                  {isOutOfStock ? (
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800"
                    >
                      Out of Stock
                    </Badge>
                  ) : hasLowStock ? (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      Only {sku.inventory} left
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      In Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="font-semibold">
                  {formatPrice(item.subtotal)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatPrice(item.unitPrice)} each
                </div>
              </div>
            </div>

            {/* Quantity Controls and Remove */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1 || isUpdating || isRemoving}
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <span className="w-8 text-center font-medium">
                  {item.quantity}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={
                    item.quantity >= maxQuantity || isUpdating || isRemoving
                  }
                >
                  <Plus className="h-3 w-3" />
                </Button>

                {isUpdating && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Updating...
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving || isUpdating}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isRemoving ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
