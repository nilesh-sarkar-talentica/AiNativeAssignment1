import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Package, ShoppingCart, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-16">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          New Launch
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Welcome to <span className="text-primary">E-commerce</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover amazing products and build your perfect shopping cart with
          our modern, intuitive e-commerce platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/cart">
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Cart
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>Browse Products</CardTitle>
            <CardDescription>
              Explore our catalog with advanced search and filtering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Find exactly what you're looking for with our intuitive product
              discovery experience.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              View detailed information and product variants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get comprehensive product information including SKU variants and
              inventory status.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle>Shopping Cart</CardTitle>
            <CardDescription>
              Manage your cart and proceed to checkout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Session-based cart that persists across browser sessions with
              real-time updates.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Built with Modern Technology
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-primary">React 19</div>
            <div className="text-sm text-muted-foreground">Latest React</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">Next.js 15</div>
            <div className="text-sm text-muted-foreground">App Router</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">MongoDB</div>
            <div className="text-sm text-muted-foreground">Database</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">TypeScript</div>
            <div className="text-sm text-muted-foreground">Type Safety</div>
          </div>
        </div>
      </div>
    </div>
  )
}
