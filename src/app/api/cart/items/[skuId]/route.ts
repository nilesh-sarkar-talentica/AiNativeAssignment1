import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwInventoryError,
  throwNotFoundError,
} from '@/lib/errors'
import {
  validateRequest,
  updateCartItemSchema,
  cartItemParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import { getSessionFromRequest, addSessionHeaders } from '@/lib/session'
import Cart from '@/models/Cart'
import SKU from '@/models/SKU'

// PUT /api/cart/items/[skuId] - Update cart item quantity
export const PUT = asyncHandler(
  async (request: Request, context?: { params: { skuId: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('Cart item')
    }

    const { sessionId } = getSessionFromRequest(request)
    const { skuId } = validateRequest(cartItemParamsSchema, context.params)
    const body = await parseJsonBody(request)
    const { quantity } = validateRequest(updateCartItemSchema, body)

    // Get cart
    const cart = await Cart.findBySession(sessionId)
    if (!cart) {
      throwNotFoundError('Cart')
    }

    // Check if item exists in cart
    if (!cart.hasItem(skuId)) {
      throwNotFoundError('Cart item')
    }

    // Verify SKU exists and check inventory
    const sku = await SKU.findOne({ _id: skuId, isActive: true })
    if (!sku) {
      throwNotFoundError('SKU')
    }

    // Check inventory availability
    if (quantity > sku.inventory) {
      throwInventoryError(`Only ${sku.inventory} items available in stock`)
    }

    // Update item quantity
    await cart.updateItem(skuId, quantity)

    // Reload cart with populated data
    const updatedCart = await Cart.findBySession(sessionId)

    const response = createSuccessResponse(updatedCart)
    addSessionHeaders(response, sessionId)
    return response
  }
)

// DELETE /api/cart/items/[skuId] - Remove item from cart
export const DELETE = asyncHandler(
  async (request: Request, context?: { params: { skuId: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('Cart item')
    }

    const { sessionId } = getSessionFromRequest(request)
    const { skuId } = validateRequest(cartItemParamsSchema, context.params)

    // Get cart
    const cart = await Cart.findBySession(sessionId)
    if (!cart) {
      throwNotFoundError('Cart')
    }

    // Check if item exists in cart
    if (!cart.hasItem(skuId)) {
      throwNotFoundError('Cart item')
    }

    // Remove item
    await cart.removeItem(skuId)

    // Reload cart with populated data
    const updatedCart = await Cart.findBySession(sessionId)

    const response = createSuccessResponse(updatedCart)
    addSessionHeaders(response, sessionId)
    return response
  }
)
