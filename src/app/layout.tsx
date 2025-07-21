import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/layout/Header'
import { CartProvider } from '@/contexts/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-commerce App',
  description: 'A modern e-commerce application built with Next.js and React',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <Toaster />
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
