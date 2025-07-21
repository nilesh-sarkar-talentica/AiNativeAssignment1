import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwInventoryError,
} from '@/lib/errors'
import {
  validateRequest,
  addCartItemSchema,
  parseJsonBody,
} from '@/lib/validations'
import { getSessionFromRequest, addSessionHeaders } from '@/lib/session'
import Cart from '@/models/Cart'
import SKU from '@/models/SKU'

// GET /api/cart - Get current cart
export const GET = asyncHandler(async (request: Request) => {
  await connectDB()

  const { sessionId } = getSessionFromRequest(request)

  const cart = await Cart.findBySession(sessionId)

  if (!cart) {
    // Create empty cart if none exists
    const newCart = await Cart.createForSession(sessionId)
    const response = createSuccessResponse(newCart)
    addSessionHeaders(response, sessionId)
    return response
  }

  const response = createSuccessResponse(cart)
  addSessionHeaders(response, sessionId)
  return response
})

// POST /api/cart/items - Add item to cart
export const POST = asyncHandler(async (request: Request) => {
  await connectDB()

  const { sessionId } = getSessionFromRequest(request)
  const body = await parseJsonBody(request)
  const { skuId, quantity } = validateRequest(addCartItemSchema, body)

  // Verify SKU exists and is active
  const sku = await SKU.findOne({ _id: skuId, isActive: true })
  if (!sku) {
    throw new Error('SKU not found or inactive')
  }

  // Check inventory availability
  if (sku.inventory < quantity) {
    throwInventoryError(`Only ${sku.inventory} items available in stock`)
  }

  // Get or create cart
  const cart = await Cart.findOrCreateBySession(sessionId)

  // Check if adding this quantity would exceed available inventory
  const existingItem = cart.getItem(skuId)
  const totalQuantity = (existingItem?.quantity || 0) + quantity

  if (totalQuantity > sku.inventory) {
    throwInventoryError(
      `Cannot add ${quantity} items. Only ${
        sku.inventory - (existingItem?.quantity || 0)
      } more available`
    )
  }

  // Add item to cart
  await cart.addItem(skuId, quantity, sku.price)

  // Reload cart with populated data
  const updatedCart = await Cart.findBySession(sessionId)

  const response = createSuccessResponse(updatedCart, null, 201)
  addSessionHeaders(response, sessionId)
  return response
})

// DELETE /api/cart - Clear entire cart
export const DELETE = asyncHandler(async (request: Request) => {
  await connectDB()

  const { sessionId } = getSessionFromRequest(request)

  const cart = await Cart.findBySession(sessionId)
  if (!cart) {
    // Return empty cart if none exists
    const newCart = await Cart.createForSession(sessionId)
    const response = createSuccessResponse(newCart)
    addSessionHeaders(response, sessionId)
    return response
  }

  await cart.clearItems()

  // Reload cart with populated data
  const updatedCart = await Cart.findBySession(sessionId)

  const response = createSuccessResponse(updatedCart)
  addSessionHeaders(response, sessionId)
  return response
})
