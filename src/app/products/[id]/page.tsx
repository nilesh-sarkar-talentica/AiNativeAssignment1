import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { IProductWithSKUs } from '@/types'
import ProductDetails from '@/components/product/ProductDetails'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface ProductPageProps {
  params: {
    id: string
  }
}

async function getProduct(id: string): Promise<IProductWithSKUs | null> {
  try {
    const response = await fetch(
      `${
        process.env.NEXTAUTH_URL || 'http://localhost:3000'
      }/api/products/${id}`,
      {
        cache: 'no-store', // Ensure fresh data
      }
    )

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} | E-commerce`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.length ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        {product.category && (
          <>
            <Link
              href={`/products?categoryId=${product.category._id}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      {/* Product Details */}
      <ProductDetails product={product} />

      <Separator className="my-12" />

      {/* Back to Products */}
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/products">← Back to Products</Link>
        </Button>
      </div>
    </div>
  )
}
