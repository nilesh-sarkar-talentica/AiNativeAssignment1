import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwNotFoundError,
  ValidationError,
} from '@/lib/errors'
import {
  validateRequest,
  updateCategorySchema,
  categoryParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import Category from '@/models/Category'
import Product from '@/models/Product'
import mongoose from 'mongoose'

// GET /api/categories/[id] - Get category by ID
export const GET = asyncHandler(
  async (request: Request, context?: { params: { id: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('Category')
    }

    const { id } = validateRequest(categoryParamsSchema, context.params)

    const category = await Category.findOne({ _id: id, isActive: true })
    if (!category) {
      throwNotFoundError('Category')
    }

    return createSuccessResponse(category)
  }
)

// PUT /api/categories/[id] - Update category
export const PUT = asyncHandler(
  async (request: Request, context?: { params: { id: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('Category')
    }

    const { id } = validateRequest(categoryParamsSchema, context.params)
    const body = await parseJsonBody(request)
    const validatedData = validateRequest(updateCategorySchema, body)

    const category = await Category.findOne({ _id: id, isActive: true })
    if (!category) {
      throwNotFoundError('Category')
    }

    Object.assign(category, validatedData)
    await category.save()

    return createSuccessResponse(category)
  }
)

// DELETE /api/categories/[id] - Delete category
export const DELETE = asyncHandler(
  async (request: Request, context?: { params: { id: string } }) => {
    await connectDB()

    if (!context?.params) {
      throwNotFoundError('Category')
    }

    const { id } = validateRequest(categoryParamsSchema, context.params)

    const category = await Category.findOne({ _id: id, isActive: true })
    if (!category) {
      throwNotFoundError('Category')
    }

    // Check if category has products
    const productCount = await Product.countDocuments({
      categoryId: new mongoose.Types.ObjectId(id),
      isActive: true,
    })
    if (productCount > 0) {
      throw new ValidationError('Cannot delete category with existing products')
    }

    // Soft delete
    category.isActive = false
    await category.save()

    return createSuccessResponse({
      message: 'Category deleted successfully',
    })
  }
)
