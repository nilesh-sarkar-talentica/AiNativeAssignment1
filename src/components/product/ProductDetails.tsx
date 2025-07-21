'use client'

import { useState } from 'react'
import Image from 'next/image'
import { IProductWithSKUs, ISKU } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ShoppingCart,
  Package,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { Separator } from '@/components/ui/separator'

interface ProductDetailsProps {
  product: IProductWithSKUs
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem } = useCart()
  const [selectedSku, setSelectedSku] = useState<ISKU | null>(
    product.skus?.[0] || null
  )
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleSkuChange = (skuId: string) => {
    const sku = product.skus?.find((s) => s._id.toString() === skuId)
    if (sku) {
      setSelectedSku(sku)
      setQuantity(1) // Reset quantity when SKU changes
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (selectedSku) {
      const maxQuantity = Math.min(selectedSku.inventory, 99)
      setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)))
    }
  }

  const handleAddToCart = async () => {
    if (!selectedSku) return

    setIsLoading(true)
    try {
      await addItem(selectedSku._id.toString(), quantity)
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

  const isInStock = selectedSku && selectedSku.inventory > 0
  const maxQuantity = selectedSku ? Math.min(selectedSku.inventory, 99) : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="aspect-square relative bg-gray-50 rounded-lg overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[selectedImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Image Thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                  selectedImageIndex === index
                    ? 'border-primary'
                    : 'border-gray-200'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.category && (
              <Badge variant="outline">{product.category.name}</Badge>
            )}
            {isInStock ? (
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

          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="text-2xl font-bold text-primary mb-4">
            {selectedSku
              ? formatPrice(selectedSku.price)
              : formatPrice(product.basePrice)}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{product.description}</p>
        </div>

        {/* SKU Selection */}
        {product.skus && product.skus.length > 1 && (
          <div>
            <h3 className="font-semibold mb-2">Variant</h3>
            <Select
              value={selectedSku?._id.toString()}
              onValueChange={handleSkuChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a variant" />
              </SelectTrigger>
              <SelectContent>
                {product.skus.map((sku) => (
                  <SelectItem
                    key={sku._id.toString()}
                    value={sku._id.toString()}
                    disabled={sku.inventory === 0}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{sku.name}</span>
                      <span className="ml-4 font-medium">
                        {formatPrice(sku.price)}
                      </span>
                      {sku.inventory === 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-red-100 text-red-800"
                        >
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Quantity Selector */}
        {isInStock && (
          <div>
            <h3 className="font-semibold mb-2">Quantity</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                {selectedSku?.inventory} available
              </span>
            </div>
          </div>
        )}

        {/* Add to Cart */}
        <Button
          onClick={handleAddToCart}
          disabled={!isInStock || !selectedSku || isLoading}
          className="w-full"
          size="lg"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isLoading
            ? 'Adding to Cart...'
            : !isInStock
            ? 'Out of Stock'
            : `Add to Cart - ${formatPrice(
                (selectedSku?.price || 0) * quantity
              )}`}
        </Button>

        <Separator />

        {/* Product Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <span>Free shipping on orders over $50</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span>2-year warranty included</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
            <span>30-day return policy</span>
          </div>
        </div>

        {/* SKU Details */}
        {selectedSku &&
          selectedSku.attributes &&
          Object.keys(selectedSku.attributes).length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-3">Product Details</h3>
                <div className="space-y-2">
                  {Object.entries(selectedSku.attributes).map(
                    ([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key}:
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="font-mono text-xs">{selectedSku.sku}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  )
}
