import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwNotFoundError,
  ValidationError,
} from '@/lib/errors'
import {
  validateRequest,
  updateSKUSchema,
  skuParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import SKU from '@/models/SKU'
import Cart from '@/models/Cart'
import mongoose from 'mongoose'

// GET /api/skus/[id] - Get SKU by ID
export const GET = asyncHandler(
  async (request: Request, context?: { params: { id: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('SKU')
    }

    const { id } = validateRequest(skuParamsSchema, context.params)

    const sku = await SKU.findOne({ _id: id, isActive: true }).populate({
      path: 'productId',
      populate: {
        path: 'categoryId',
        model: 'Category',
      },
    })

    if (!sku) {
      throwNotFoundError('SKU')
    }

    return createSuccessResponse(sku)
  }
)

// PUT /api/skus/[id] - Update SKU
export const PUT = asyncHandler(
  async (request: Request, context?: { params: { id: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('SKU')
    }

    const { id } = validateRequest(skuParamsSchema, context.params)
    const body = await parseJsonBody(request)
    const validatedData = validateRequest(updateSKUSchema, body)

    const sku = await SKU.findOne({ _id: id, isActive: true })
    if (!sku) {
      throwNotFoundError('SKU')
    }

    Object.assign(sku, validatedData)
    await sku.save()

    // Populate product details
    await sku.populate({
      path: 'productId',
      populate: {
        path: 'categoryId',
        model: 'Category',
      },
    })

    return createSuccessResponse(sku)
  }
)

// DELETE /api/skus/[id] - Delete SKU
export const DELETE = asyncHandler(
  async (request: Request, context?: { params: { id: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('SKU')
    }

    const { id } = validateRequest(skuParamsSchema, context.params)

    const sku = await SKU.findOne({ _id: id, isActive: true })
    if (!sku) {
      throwNotFoundError('SKU')
    }

    // Check if SKU is in any carts
    const cartWithSKU = await Cart.findOne({
      'items.skuId': new mongoose.Types.ObjectId(id),
    })

    if (cartWithSKU) {
      throw new ValidationError('Cannot delete SKU that is in shopping carts')
    }

    // Soft delete
    sku.isActive = false
    await sku.save()

    return createSuccessResponse({
      message: 'SKU deleted successfully',
    })
  }
)
