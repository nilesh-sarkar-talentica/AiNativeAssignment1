import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwNotFoundError,
  ValidationError,
} from '@/lib/errors'
import {
  validateRequest,
  updateProductSchema,
  productParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import Product from '@/models/Product'
import SKU from '@/models/SKU'
import mongoose from 'mongoose'

// GET /api/products/[id] - Get product by ID with SKUs
export const GET = asyncHandler(
  async (request: Request, context?: { params: { id: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('Product')
    }

    const { id } = validateRequest(productParamsSchema, context.params)

    const product = await Product.findOne({ _id: id, isActive: true })
      .populate('categoryId')
      .lean()

    if (!product) {
      throwNotFoundError('Product')
    }

    // Get active SKUs for this product
    const skus = await SKU.find({
      productId: new mongoose.Types.ObjectId(id),
      isActive: true,
    }).lean()

    return createSuccessResponse({
      ...product,
      skus,
    })
  }
)

// PUT /api/products/[id] - Update product
export const PUT = asyncHandler(
  async (request: Request, context?: { params: { id: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('Product')
    }

    const { id } = validateRequest(productParamsSchema, context.params)
    const body = await parseJsonBody(request)
    const validatedData = validateRequest(updateProductSchema, body)

    const product = await Product.findOne({ _id: id, isActive: true })
    if (!product) {
      throwNotFoundError('Product')
    }

    Object.assign(product, validatedData)
    await product.save()

    // Populate category
    await product.populate('categoryId')

    return createSuccessResponse(product)
  }
)

// DELETE /api/products/[id] - Delete product and associated SKUs
export const DELETE = asyncHandler(
  async (request: Request, context?: { params: { id: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('Product')
    }

    const { id } = validateRequest(productParamsSchema, context.params)

    const product = await Product.findOne({ _id: id, isActive: true })
    if (!product) {
      throwNotFoundError('Product')
    }

    // Check if any SKUs are in carts (optional - for data integrity)
    // This would require checking the Cart collection, but we'll skip for now

    // Soft delete product
    product.isActive = false
    await product.save()

    // Soft delete all associated SKUs
    await SKU.updateMany(
      { productId: new mongoose.Types.ObjectId(id), isActive: true },
      { isActive: false }
    )

    return createSuccessResponse({
      message: 'Product and associated SKUs deleted successfully',
    })
  }
)
