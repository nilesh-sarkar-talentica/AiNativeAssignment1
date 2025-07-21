import { connectDB } from '@/lib/mongodb'
import { asyncHandler, createSuccessResponse } from '@/lib/errors'
import {
  validateRequest,
  createCategorySchema,
  parseJsonBody,
} from '@/lib/validations'
import Category from '@/models/Category'

// GET /api/categories - Get all categories
export const GET = asyncHandler(async (request: Request) => {
  await connectDB()

  const categories = await Category.find({ isActive: true }).sort({ name: 1 })

  return createSuccessResponse(categories)
})

// POST /api/categories - Create new category
export const POST = asyncHandler(async (request: Request) => {
  await connectDB()

  const body = await parseJsonBody(request)
  const validatedData = validateRequest(createCategorySchema, body)

  const category = new Category(validatedData)
  await category.save()

  return createSuccessResponse(category, null, 201)
})
