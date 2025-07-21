import { useContext } from 'react'
import { CartContext } from '@/contexts/CartContext'

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function useCartActions() {
  const { addItem, updateItem, removeItem, clearCart } = useCart()
  return { addItem, updateItem, removeItem, clearCart }
}

export function useCartState() {
  const { cart, loading, error } = useCart()
  return { cart, loading, error }
}

export function useCartUtils() {
  const { getItemCount, getTotalAmount, hasItem, getItem } = useCart()
  return { getItemCount, getTotalAmount, hasItem, getItem }
}
