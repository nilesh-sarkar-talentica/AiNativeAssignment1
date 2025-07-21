import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PackageX, ArrowLeft, Search } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PackageX className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Product Not Found
            </h1>
            <p className="text-muted-foreground">
              Sorry, we couldn't find the product you're looking for. It may
              have been removed or the link is incorrect.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/products">
                <Search className="mr-2 h-4 w-4" />
                Browse All Products
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p>Need help?</p>
            <p className="mt-1">
              Try searching for products or browse our categories.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
