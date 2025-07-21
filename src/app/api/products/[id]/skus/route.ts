import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwNotFoundError,
} from '@/lib/errors'
import {
  validateRequest,
  createSKUSchema,
  productParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import Product from '@/models/Product'
import SKU from '@/models/SKU'
import mongoose from 'mongoose'

// GET /api/products/[id]/skus - Get all SKUs for a product
export const GET = asyncHandler(
  async (request: Request, context?: { params: { id: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('Product')
    }

    const { id } = validateRequest(productParamsSchema, context.params)

    // Verify product exists
    const product = await Product.findOne({ _id: id, isActive: true })
    if (!product) {
      throwNotFoundError('Product')
    }

    // Get SKUs for this product
    const skus = await SKU.find({
      productId: new mongoose.Types.ObjectId(id),
      isActive: true,
    })
      .populate('productId', 'name slug images')
      .sort({ name: 1 })

    return createSuccessResponse(skus)
  }
)

// POST /api/products/[id]/skus - Add SKU to product
export const POST = asyncHandler(
  async (request: Request, context?: { params: { id: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('Product')
    }

    const { id } = validateRequest(productParamsSchema, context.params)
    const body = await parseJsonBody(request)
    const validatedData = validateRequest(createSKUSchema, body)

    // Verify product exists
    const product = await Product.findOne({ _id: id, isActive: true })
    if (!product) {
      throwNotFoundError('Product')
    }

    // Create SKU
    const sku = new SKU({
      ...validatedData,
      productId: new mongoose.Types.ObjectId(id),
    })
    await sku.save()

    // Populate product details
    await sku.populate('productId', 'name slug images')

    return createSuccessResponse(sku, null, 201)
  }
)
