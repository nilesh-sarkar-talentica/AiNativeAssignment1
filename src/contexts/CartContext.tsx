'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from 'react'
import { ICartWithDetails, ICartItemInput, ISKU } from '@/types'
import { getOrCreateSessionId } from '@/lib/session'
import { useToast } from '@/hooks/use-toast'

interface CartState {
  cart: ICartWithDetails | null
  loading: boolean
  error: string | null
}

interface CartContextType extends CartState {
  addItem: (skuId: string, quantity: number) => Promise<void>
  updateItem: (skuId: string, quantity: number) => Promise<void>
  removeItem: (skuId: string) => Promise<void>
  clearCart: () => Promise<void>
  getItemCount: () => number
  getTotalAmount: () => number
  hasItem: (skuId: string) => boolean
  getItem: (skuId: string) => ICartWithDetails['items'][0] | undefined
  refreshCart: () => Promise<void>
}

export const CartContext = createContext<CartContextType | null>(null)

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: ICartWithDetails }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' }

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

interface CartProviderProps {
  children: React.ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { toast } = useToast()

  const getSessionHeaders = useCallback(() => {
    const sessionId = getOrCreateSessionId()
    return {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId,
    }
  }, [])

  const handleApiError = useCallback(
    (error: any) => {
      console.error('Cart API Error:', error)
      const message =
        error.message || 'An error occurred while updating your cart'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast({
        title: 'Cart Error',
        description: message,
        variant: 'destructive',
      })
    },
    [toast]
  )

  const fetchCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      const response = await fetch('/api/cart', {
        headers: getSessionHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch cart')
      }

      const result = await response.json()

      if (result.success) {
        dispatch({ type: 'SET_CART', payload: result.data })
      } else {
        throw new Error(result.error?.message || 'Failed to fetch cart')
      }
    } catch (error) {
      handleApiError(error)
    }
  }, [getSessionHeaders, handleApiError])

  const addItem = useCallback(
    async (skuId: string, quantity: number) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })

        const response = await fetch('/api/cart/items', {
          method: 'POST',
          headers: getSessionHeaders(),
          body: JSON.stringify({ skuId, quantity }),
        })

        if (!response.ok) {
          throw new Error('Failed to add item to cart')
        }

        const result = await response.json()

        if (result.success) {
          dispatch({ type: 'SET_CART', payload: result.data })
          toast({
            title: 'Item Added',
            description: 'Item successfully added to your cart',
          })
        } else {
          throw new Error(result.error?.message || 'Failed to add item to cart')
        }
      } catch (error) {
        handleApiError(error)
      }
    },
    [getSessionHeaders, handleApiError, toast]
  )

  const updateItem = useCallback(
    async (skuId: string, quantity: number) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })

        const response = await fetch(`/api/cart/items/${skuId}`, {
          method: 'PUT',
          headers: getSessionHeaders(),
          body: JSON.stringify({ quantity }),
        })

        if (!response.ok) {
          throw new Error('Failed to update cart item')
        }

        const result = await response.json()

        if (result.success) {
          dispatch({ type: 'SET_CART', payload: result.data })
        } else {
          throw new Error(result.error?.message || 'Failed to update cart item')
        }
      } catch (error) {
        handleApiError(error)
      }
    },
    [getSessionHeaders, handleApiError]
  )

  const removeItem = useCallback(
    async (skuId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })

        const response = await fetch(`/api/cart/items/${skuId}`, {
          method: 'DELETE',
          headers: getSessionHeaders(),
        })

        if (!response.ok) {
          throw new Error('Failed to remove item from cart')
        }

        const result = await response.json()

        if (result.success) {
          dispatch({ type: 'SET_CART', payload: result.data })
          toast({
            title: 'Item Removed',
            description: 'Item removed from your cart',
          })
        } else {
          throw new Error(
            result.error?.message || 'Failed to remove item from cart'
          )
        }
      } catch (error) {
        handleApiError(error)
      }
    },
    [getSessionHeaders, handleApiError, toast]
  )

  const clearCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: getSessionHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to clear cart')
      }

      const result = await response.json()

      if (result.success) {
        dispatch({ type: 'SET_CART', payload: result.data })
        toast({
          title: 'Cart Cleared',
          description: 'All items removed from your cart',
        })
      } else {
        throw new Error(result.error?.message || 'Failed to clear cart')
      }
    } catch (error) {
      handleApiError(error)
    }
  }, [getSessionHeaders, handleApiError, toast])

  const getItemCount = useCallback(() => {
    if (!state.cart?.items) return 0
    return state.cart.items.reduce((total, item) => total + item.quantity, 0)
  }, [state.cart])

  const getTotalAmount = useCallback(() => {
    return state.cart?.totalAmount || 0
  }, [state.cart])

  const hasItem = useCallback(
    (skuId: string) => {
      if (!state.cart?.items) return false
      return state.cart.items.some((item) => item.skuId.toString() === skuId)
    },
    [state.cart]
  )

  const getItem = useCallback(
    (skuId: string) => {
      if (!state.cart?.items) return undefined
      return state.cart.items.find((item) => item.skuId.toString() === skuId)
    },
    [state.cart]
  )

  // Load cart on mount
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const contextValue: CartContextType = {
    ...state,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getItemCount,
    getTotalAmount,
    hasItem,
    getItem,
    refreshCart: fetchCart,
  }

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  )
}
