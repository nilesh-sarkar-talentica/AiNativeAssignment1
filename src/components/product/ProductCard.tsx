'use client'

import Image from 'next/image'
import Link from 'next/link'
import { IProductWithCategory } from '@/types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Package } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useState } from 'react'

interface ProductCardProps {
  product: IProductWithCategory & {
    defaultSkuId?: string
    minPrice?: number
    hasStock?: boolean
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.defaultSkuId) return

    setIsLoading(true)
    try {
      await addItem(product.defaultSkuId, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const displayPrice = product.minPrice || product.basePrice

  return (
    <Link href={`/products/${product._id}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        <div className="aspect-square relative bg-gray-50 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Stock indicator */}
          <div className="absolute top-2 left-2">
            {product.hasStock ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                In Stock
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </div>

            {product.category && (
              <Badge variant="outline" className="text-xs">
                {product.category.name}
              </Badge>
            )}

            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">
                {displayPrice ? formatPrice(displayPrice) : 'Price on request'}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={!product.defaultSkuId || !product.hasStock || isLoading}
            className="w-full"
            size="sm"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isLoading ? 'Adding...' : 'Add to Cart'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
