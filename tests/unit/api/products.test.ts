// Mock all dependencies before any imports
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/models/Product', () => {
  const mockProductInstance = {
    save: jest.fn().mockResolvedValue(true),
    populate: jest.fn().mockReturnThis(),
  }

  const MockProduct = jest.fn().mockImplementation((data) => {
    return { ...data, ...mockProductInstance }
  })

  // Add static methods to the mock constructor
  Object.assign(MockProduct, {
    find: jest.fn(),
    findOne: jest.fn(),
    aggregate: jest.fn(),
    create: jest.fn(),
  })

  return MockProduct
})

jest.mock('@/models/SKU', () => ({
  find: jest.fn(),
  updateMany: jest.fn(),
}))

jest.mock('@/models/Category', () => ({
  findById: jest.fn(),
}))

jest.mock('@/lib/errors', () => ({
  asyncHandler: (fn: any) => fn,
  createSuccessResponse: (data: any, message?: string, status?: number) =>
    Response.json({ success: true, data, message }, { status: status || 200 }),
  throwNotFoundError: (resource: string) => {
    throw new Error(`${resource} not found`)
  },
  ValidationError: class ValidationError extends Error {
    constructor(message: string, details?: any) {
      super(message)
      this.name = 'ValidationError'
    }
  },
}))

jest.mock('@/lib/validations', () => ({
  validateRequest: jest.fn((schema, data) => data),
  createProductSchema: {},
  updateProductSchema: {},
  productParamsSchema: {},
  productQuerySchema: {},
  parseJsonBody: jest.fn(async (req) => {
    if (req.body === 'invalid json') {
      throw new Error('Invalid JSON')
    }
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  }),
}))

// Import the API routes after mocking
import { GET, POST } from '@/app/api/products/route'
import { GET as getById, PUT, DELETE } from '@/app/api/products/[id]/route'

// Get the mocked modules
const MockedProduct = require('@/models/Product')
const MockedSKU = require('@/models/SKU')
const MockedCategory = require('@/models/Category')
const { validateRequest, parseJsonBody } = require('@/lib/validations')

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return paginated products with default pagination', async () => {
      const mockProducts = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'iPhone 14',
          description: 'Latest iPhone model',
          slug: 'iphone-14',
          categoryId: '507f1f77bcf86cd799439020',
          category: { _id: '507f1f77bcf86cd799439020', name: 'Electronics' },
          basePrice: 999,
          isActive: true,
        },
      ]

      // Mock aggregate pipeline for counting
      MockedProduct.aggregate
        .mockResolvedValueOnce([{ total: 25 }]) // Count query
        .mockResolvedValueOnce(mockProducts) // Main query

      const request = new Request('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.products).toEqual(mockProducts)
      expect(data.data.pagination).toMatchObject({
        page: 1,
        pageSize: 10,
        totalItems: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      })
    })

    it('should validate query parameters and handle invalid pagination', async () => {
      const request = new Request(
        'http://localhost:3000/api/products?page=0&pageSize=101'
      )

      await expect(GET(request)).rejects.toThrow('Page must be at least 1')
    })

    it('should handle invalid page size', async () => {
      const request = new Request(
        'http://localhost:3000/api/products?pageSize=101'
      )

      await expect(GET(request)).rejects.toThrow(
        'Page size must be between 1 and 100'
      )
    })

    it('should validate category ID format', async () => {
      const request = new Request(
        'http://localhost:3000/api/products?categoryId=invalid-id'
      )

      await expect(GET(request)).rejects.toThrow('Invalid category ID format')
    })

    it('should support search by name and description', async () => {
      const mockProducts = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'iPhone 14',
          description: 'Latest iPhone smartphone',
          category: { name: 'Electronics' },
        },
      ]

      MockedProduct.aggregate
        .mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce(mockProducts)

      const request = new Request(
        'http://localhost:3000/api/products?search=iPhone'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.products).toEqual(mockProducts)
      expect(MockedProduct.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: {
              $or: [
                { name: { $regex: 'iPhone', $options: 'i' } },
                { description: { $regex: 'iPhone', $options: 'i' } },
              ],
            },
          }),
        ])
      )
    })

    it('should filter by category', async () => {
      const mockProducts = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'iPhone 14',
          categoryId: '507f1f77bcf86cd799439020',
          category: { name: 'Electronics' },
        },
      ]

      MockedProduct.aggregate
        .mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce(mockProducts)

      const request = new Request(
        'http://localhost:3000/api/products?categoryId=507f1f77bcf86cd799439020'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.products).toEqual(mockProducts)
    })

    it('should include populated category and SKU data', async () => {
      const mockProducts = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'iPhone 14',
          category: {
            _id: '507f1f77bcf86cd799439020',
            name: 'Electronics',
            slug: 'electronics',
          },
        },
      ]

      MockedProduct.aggregate
        .mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce(mockProducts)

      const request = new Request('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.products[0]).toHaveProperty('category')
      expect(data.data.products[0].category).toHaveProperty('name')
    })
  })

  describe('POST /api/products', () => {
    it('should create product with valid data', async () => {
      const productData = {
        name: 'iPhone 14',
        description: 'Latest iPhone model with advanced features',
        categoryId: '507f1f77bcf86cd799439020',
        basePrice: 999,
        images: ['https://example.com/iphone14.jpg'],
      }

      const mockSavedProduct = {
        _id: '507f1f77bcf86cd799439011',
        ...productData,
        slug: 'iphone-14',
        isActive: true,
        createdAt: '2025-07-26T05:39:30.993Z',
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      }

      MockedProduct.mockImplementation(() => mockSavedProduct)
      parseJsonBody.mockResolvedValue(productData)
      validateRequest.mockReturnValue(productData)

      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(mockSavedProduct.save).toHaveBeenCalled()
      expect(mockSavedProduct.populate).toHaveBeenCalledWith('categoryId')
    })

    it('should validate all required fields', async () => {
      const invalidData = {
        description: 'Missing name and other required fields',
      }

      parseJsonBody.mockResolvedValue(invalidData)
      validateRequest.mockImplementation(() => {
        const error = new Error('Name is required')
        error.name = 'ValidationError'
        throw error
      })

      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      await expect(POST(request)).rejects.toThrow('Name is required')
    })

    it('should validate category exists', async () => {
      const productData = {
        name: 'iPhone 14',
        description: 'Latest iPhone model',
        categoryId: '507f1f77bcf86cd799439999', // Non-existent category
        basePrice: 999,
      }

      parseJsonBody.mockResolvedValue(productData)
      validateRequest.mockReturnValue(productData)

      const mockProduct = {
        save: jest.fn().mockRejectedValue({
          name: 'ValidationError',
          message: 'Category does not exist',
        }),
        populate: jest.fn(),
      }
      MockedProduct.mockImplementation(() => mockProduct)

      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
        headers: { 'Content-Type': 'application/json' },
      })

      await expect(POST(request)).rejects.toMatchObject({
        name: 'ValidationError',
        message: 'Category does not exist',
      })
    })

    it('should auto-generate unique slug', async () => {
      const productData = {
        name: 'iPhone 14 Pro Max',
        description: 'Premium iPhone model',
        categoryId: '507f1f77bcf86cd799439020',
        basePrice: 1199,
      }

      const mockSavedProduct = {
        _id: '507f1f77bcf86cd799439011',
        ...productData,
        slug: 'iphone-14-pro-max',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      }

      MockedProduct.mockImplementation(() => mockSavedProduct)
      parseJsonBody.mockResolvedValue(productData)
      validateRequest.mockReturnValue(productData)

      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.slug).toBe('iphone-14-pro-max')
    })

    it('should validate image URLs', async () => {
      const productData = {
        name: 'iPhone 14',
        description: 'Latest iPhone model',
        categoryId: '507f1f77bcf86cd799439020',
        basePrice: 999,
        images: ['invalid-url', 'not-a-url'],
      }

      parseJsonBody.mockResolvedValue(productData)
      validateRequest.mockImplementation(() => {
        const error = new Error('Invalid image URLs')
        error.name = 'ValidationError'
        throw error
      })

      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
        headers: { 'Content-Type': 'application/json' },
      })

      await expect(POST(request)).rejects.toThrow('Invalid image URLs')
    })
  })

  describe('GET /api/products/[id]', () => {
    it('should return product with SKUs and populated category', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        name: 'iPhone 14',
        description: 'Latest iPhone model',
        slug: 'iphone-14',
        categoryId: {
          _id: '507f1f77bcf86cd799439020',
          name: 'Electronics',
          slug: 'electronics',
        },
        isActive: true,
      }

      const mockSKUs = [
        {
          _id: '507f1f77bcf86cd799439030',
          skuCode: 'IP14-128-BLK',
          productId: '507f1f77bcf86cd799439011',
          attributes: { storage: '128GB', color: 'Black' },
          price: 999,
          inventory: 50,
          isActive: true,
        },
      ]

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockProduct),
      }
      MockedProduct.findOne.mockReturnValue(mockQuery)
      MockedSKU.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockSKUs),
      })
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011'
      )
      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      const response = await getById(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toMatchObject(mockProduct)
      expect(data.data.skus).toEqual(mockSKUs)
      expect(mockQuery.populate).toHaveBeenCalledWith('categoryId')
    })

    it('should return 404 for non-existent product', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      }
      MockedProduct.findOne.mockReturnValue(mockQuery)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011'
      )
      const context = { params: { id: '507f1f77bcf86cd799439011' } }

      await expect(getById(request, context)).rejects.toThrow(
        'Product not found'
      )
    })

    it('should validate ID format', async () => {
      validateRequest.mockImplementation(() => {
        const error = new Error('Invalid product ID format')
        error.name = 'ValidationError'
        throw error
      })

      const request = new Request(
        'http://localhost:3000/api/products/invalid-id'
      )
      const context = { params: { id: 'invalid-id' } }

      await expect(getById(request, context)).rejects.toThrow(
        'Invalid product ID format'
      )
    })
  })

  describe('PUT /api/products/[id]', () => {
    it('should update product with valid data', async () => {
      const updateData = {
        name: 'iPhone 14 Updated',
        description: 'Updated description',
        basePrice: 1099,
      }

      const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        name: 'iPhone 14',
        description: 'Original description',
        basePrice: 999,
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      }

      MockedProduct.findOne.mockResolvedValue(mockProduct)
      parseJsonBody.mockResolvedValue(updateData)
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439011' })
      validateRequest.mockReturnValueOnce(updateData)

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      const response = await PUT(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockProduct.save).toHaveBeenCalled()
      expect(mockProduct.populate).toHaveBeenCalledWith('categoryId')
    })

    it('should validate update data', async () => {
      const updateData = { basePrice: -100 }

      parseJsonBody.mockResolvedValue(updateData)
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439011' })
      validateRequest.mockImplementationOnce(() => {
        const error = new Error('Price must be positive')
        error.name = 'ValidationError'
        throw error
      })

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }

      await expect(PUT(request, context)).rejects.toThrow(
        'Price must be positive'
      )
    })

    it('should handle slug conflicts', async () => {
      const updateData = {
        name: 'Existing Product Name',
      }

      const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        isActive: true,
        save: jest.fn().mockRejectedValue({
          code: 11000,
          keyPattern: { slug: 1 },
        }),
        populate: jest.fn(),
      }

      MockedProduct.findOne.mockResolvedValue(mockProduct)
      parseJsonBody.mockResolvedValue(updateData)
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439011' })
      validateRequest.mockReturnValueOnce(updateData)

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }

      await expect(PUT(request, context)).rejects.toMatchObject({
        code: 11000,
        keyPattern: { slug: 1 },
      })
    })
  })

  describe('DELETE /api/products/[id]', () => {
    it('should soft delete product and cascade to associated SKUs', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        name: 'iPhone 14',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      }

      MockedProduct.findOne.mockResolvedValue(mockProduct)
      MockedSKU.updateMany.mockResolvedValue({ modifiedCount: 3 })
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      const response = await DELETE(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.message).toBe(
        'Product and associated SKUs deleted successfully'
      )
      expect(mockProduct.isActive).toBe(false)
      expect(mockProduct.save).toHaveBeenCalled()
      expect(MockedSKU.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: expect.any(Object),
          isActive: true,
        }),
        { isActive: false }
      )
    })

    it('should return 404 for non-existent product', async () => {
      MockedProduct.findOne.mockResolvedValue(null)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }

      await expect(DELETE(request, context)).rejects.toThrow(
        'Product not found'
      )
    })
  })
})
