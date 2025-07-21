import { connectDB } from '@/lib/mongodb'
import { asyncHandler, createSuccessResponse } from '@/lib/errors'
import {
  validateRequest,
  createProductSchema,
  productQuerySchema,
  parseJsonBody,
} from '@/lib/validations'
import Product from '@/models/Product'
import { PaginationMeta } from '@/types'
import mongoose from 'mongoose'

// GET /api/products - Get products with search, filtering, and pagination
export const GET = asyncHandler(async (request: Request) => {
  await connectDB()

  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams.entries())

  // Validate and transform query parameters
  const page = parseInt(searchParams.page || '1')
  const pageSize = parseInt(searchParams.pageSize || '10')
  const search = searchParams.search
  const categoryId = searchParams.categoryId

  // Validate page and pageSize
  if (page < 1) throw new Error('Page must be at least 1')
  if (pageSize < 1 || pageSize > 100)
    throw new Error('Page size must be between 1 and 100')
  if (categoryId && !/^[0-9a-fA-F]{24}$/.test(categoryId)) {
    throw new Error('Invalid category ID format')
  }

  // Build query
  const query: any = { isActive: true }

  if (categoryId) {
    query.categoryId = new mongoose.Types.ObjectId(categoryId)
  }

  // Build aggregation pipeline for search and pagination
  const pipeline: any[] = []

  // Match stage
  pipeline.push({ $match: query })

  // Search stage
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      },
    })
  }

  // Lookup category
  pipeline.push({
    $lookup: {
      from: 'categories',
      localField: 'categoryId',
      foreignField: '_id',
      as: 'category',
    },
  })

  pipeline.push({
    $unwind: {
      path: '$category',
      preserveNullAndEmptyArrays: false,
    },
  })

  // Sort by name
  pipeline.push({ $sort: { name: 1 } })

  // Count total items
  const countPipeline = [...pipeline, { $count: 'total' }]
  const countResult = await Product.aggregate(countPipeline)
  const totalItems = countResult[0]?.total || 0

  // Add pagination
  const skip = (page - 1) * pageSize
  pipeline.push({ $skip: skip }, { $limit: pageSize })

  // Execute query
  const products = await Product.aggregate(pipeline)

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalItems / pageSize)
  const pagination: PaginationMeta = {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }

  return createSuccessResponse({
    products,
    pagination,
  })
})

// POST /api/products - Create new product
export const POST = asyncHandler(async (request: Request) => {
  await connectDB()

  const body = await parseJsonBody(request)
  const validatedData = validateRequest(createProductSchema, body)

  const product = new Product(validatedData)
  await product.save()

  // Populate category
  await product.populate('categoryId')

  return createSuccessResponse(product, null, 201)
})
