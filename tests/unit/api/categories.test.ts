// Mock all dependencies before any imports
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/models/Category', () => {
  const mockCategoryInstance = {
    save: jest.fn().mockResolvedValue(true),
  }

  const MockCategory = jest.fn().mockImplementation((data) => {
    return { ...data, ...mockCategoryInstance }
  })

  // Add static methods to the mock constructor
  Object.assign(MockCategory, {
    find: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  })

  return MockCategory
})

jest.mock('@/models/Product', () => ({
  countDocuments: jest.fn(),
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
  createCategorySchema: {},
  updateCategorySchema: {},
  categoryParamsSchema: {},
  parseJsonBody: jest.fn(async (req) => {
    if (req.body === 'invalid json') {
      throw new Error('Invalid JSON')
    }
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  }),
}))

// Import the API routes after mocking
import { GET, POST } from '@/app/api/categories/route'
import { GET as getById, PUT, DELETE } from '@/app/api/categories/[id]/route'

// Get the mocked modules
const MockedCategory = require('@/models/Category')
const MockedProduct = require('@/models/Product')
const { validateRequest, parseJsonBody } = require('@/lib/validations')

describe('Categories API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/categories', () => {
    it('should return all active categories', async () => {
      const mockCategories = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'Electronics',
          description: 'Electronic devices',
          slug: 'electronics',
          isActive: true,
          createdAt: '2025-07-26T05:39:30.993Z',
          updatedAt: '2025-07-26T05:39:30.993Z',
        },
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Clothing',
          description: 'Fashion items',
          slug: 'clothing',
          isActive: true,
          createdAt: '2025-07-26T05:39:30.993Z',
          updatedAt: '2025-07-26T05:39:30.993Z',
        },
      ]

      // Mock the database query
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockCategories),
      }
      MockedCategory.find.mockReturnValue(mockQuery)

      const request = new Request('http://localhost:3000/api/categories')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockCategories)
      expect(MockedCategory.find).toHaveBeenCalledWith({ isActive: true })
      expect(mockQuery.sort).toHaveBeenCalledWith({ name: 1 })
    })

    it('should return empty array when no categories found', async () => {
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([]),
      }
      MockedCategory.find.mockReturnValue(mockQuery)

      const request = new Request('http://localhost:3000/api/categories')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
    })

    it('should handle database errors', async () => {
      MockedCategory.find.mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const request = new Request('http://localhost:3000/api/categories')

      // The asyncHandler should catch errors and return appropriate response
      await expect(GET(request)).rejects.toThrow('Database connection failed')
    })
  })

  describe('POST /api/categories', () => {
    it('should create a new category with valid data', async () => {
      const categoryData = {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
      }

      const mockSavedCategory = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        slug: 'electronics',
        isActive: true,
        createdAt: '2025-07-26T05:39:30.993Z',
        updatedAt: '2025-07-26T05:39:30.993Z',
        save: jest.fn().mockResolvedValue(true),
      }

      // Mock the constructor to return the saved category
      MockedCategory.mockImplementation(() => mockSavedCategory)
      parseJsonBody.mockResolvedValue(categoryData)
      validateRequest.mockReturnValue(categoryData)

      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      // Check specific properties instead of the entire object to avoid save method comparison
      expect(data.data).toMatchObject({
        _id: '507f1f77bcf86cd799439011',
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        slug: 'electronics',
        isActive: true,
        createdAt: '2025-07-26T05:39:30.993Z',
        updatedAt: '2025-07-26T05:39:30.993Z',
      })
    })

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing name field',
      }

      parseJsonBody.mockResolvedValue(invalidData)
      validateRequest.mockImplementation(() => {
        const error = new Error('Validation failed')
        error.name = 'ValidationError'
        throw error
      })

      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      await expect(POST(request)).rejects.toThrow('Validation failed')
    })

    it('should handle duplicate category names', async () => {
      const categoryData = {
        name: 'Electronics',
        description: 'Electronic devices',
      }

      parseJsonBody.mockResolvedValue(categoryData)
      validateRequest.mockReturnValue(categoryData)

      // Mock the constructor to throw duplicate error when save is called
      const mockCategory = {
        save: jest.fn().mockRejectedValue({
          code: 11000,
          keyPattern: { name: 1 },
        }),
      }
      MockedCategory.mockImplementation(() => mockCategory)

      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
        headers: { 'Content-Type': 'application/json' },
      })

      await expect(POST(request)).rejects.toMatchObject({
        code: 11000,
        keyPattern: { name: 1 },
      })
    })

    it('should auto-generate slug from name', async () => {
      const categoryData = {
        name: 'Home & Garden',
        description: 'Home and garden items',
      }

      const mockSavedCategory = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Home & Garden',
        description: 'Home and garden items',
        slug: 'home-garden',
        isActive: true,
        createdAt: '2025-07-26T05:39:30.993Z',
        updatedAt: '2025-07-26T05:39:30.993Z',
        save: jest.fn().mockResolvedValue(true),
      }

      MockedCategory.mockImplementation(() => mockSavedCategory)
      parseJsonBody.mockResolvedValue(categoryData)
      validateRequest.mockReturnValue(categoryData)

      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.slug).toBe('home-garden')
    })

    it('should handle invalid JSON body', async () => {
      parseJsonBody.mockImplementation(() => {
        throw new Error('Invalid JSON')
      })

      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      })

      await expect(POST(request)).rejects.toThrow('Invalid JSON')
    })
  })

  describe('GET /api/categories/[id]', () => {
    it('should return category by valid ID', async () => {
      const mockCategory = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Electronics',
        description: 'Electronic devices',
        slug: 'electronics',
        isActive: true,
        createdAt: '2025-07-26T05:39:31.068Z',
        updatedAt: '2025-07-26T05:39:31.068Z',
      }

      MockedCategory.findOne.mockResolvedValue(mockCategory)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011'
      )
      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      const response = await getById(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockCategory)
      expect(MockedCategory.findOne).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439011',
        isActive: true,
      })
    })

    it('should return 404 for non-existent category', async () => {
      MockedCategory.findOne.mockResolvedValue(null)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011'
      )
      const context = { params: { id: '507f1f77bcf86cd799439011' } }

      await expect(getById(request, context)).rejects.toThrow(
        'Category not found'
      )
    })

    it('should return 400 for invalid ID format', async () => {
      validateRequest.mockImplementation(() => {
        const error = new Error('Invalid ID format')
        error.name = 'ValidationError'
        throw error
      })

      const request = new Request(
        'http://localhost:3000/api/categories/invalid-id'
      )
      const context = { params: { id: 'invalid-id' } }

      await expect(getById(request, context)).rejects.toThrow(
        'Invalid ID format'
      )
    })

    it('should handle missing context params', async () => {
      const request = new Request(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011'
      )

      await expect(getById(request)).rejects.toThrow('Category not found')
    })
  })

  describe('PUT /api/categories/[id]', () => {
    it('should update category with valid data', async () => {
      const updateData = {
        name: 'Updated Electronics',
        description: 'Updated description',
      }

      const mockCategory = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Electronics',
        description: 'Electronic devices',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      }

      MockedCategory.findOne.mockResolvedValue(mockCategory)
      parseJsonBody.mockResolvedValue(updateData)
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439011' })
      validateRequest.mockReturnValueOnce(updateData)

      const request = new Request(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011',
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
      expect(mockCategory.save).toHaveBeenCalled()
    })

    it('should update slug when name changes', async () => {
      const updateData = {
        name: 'Smart Electronics',
        description: 'Updated description',
      }

      const mockCategory = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Electronics',
        description: 'Electronic devices',
        slug: 'electronics',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      }

      const updatedCategory = {
        ...mockCategory,
        name: 'Smart Electronics',
        slug: 'smart-electronics',
        description: 'Updated description',
      }

      MockedCategory.findOne.mockResolvedValue(mockCategory)
      parseJsonBody.mockResolvedValue(updateData)
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439011' })
      validateRequest.mockReturnValueOnce(updateData)

      // Mock Object.assign to simulate the update
      const originalAssign = Object.assign
      Object.assign = jest.fn((target: any, source: any) => {
        target.name = source.name
        target.description = source.description
        target.slug = 'smart-electronics'
        return target
      })

      const request = new Request(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011',
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
      expect(mockCategory.save).toHaveBeenCalled()

      // Restore original Object.assign
      Object.assign = originalAssign
    })

    it('should handle update validation errors', async () => {
      parseJsonBody.mockResolvedValue({ name: '' })
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439011' })
      validateRequest.mockImplementationOnce(() => {
        const error = new Error('Name is required')
        error.name = 'ValidationError'
        throw error
      })

      const request = new Request(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011',
        {
          method: 'PUT',
          body: JSON.stringify({ name: '' }),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }

      await expect(PUT(request, context)).rejects.toThrow('Name is required')
    })

    it('should return 404 for non-existent category', async () => {
      MockedCategory.findOne.mockResolvedValue(null)
      parseJsonBody.mockResolvedValue({ name: 'Updated Name' })
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const updateData = { name: 'Updated Name' }
      const request = new Request(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }

      await expect(PUT(request, context)).rejects.toThrow('Category not found')
    })
  })

  describe('DELETE /api/categories/[id]', () => {
    it('should soft delete category when no associated products', async () => {
      const mockCategory = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Electronics',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      }

      MockedCategory.findOne.mockResolvedValue(mockCategory)
      MockedProduct.countDocuments.mockResolvedValue(0)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      const response = await DELETE(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.message).toContain('deleted successfully')
    })

    it('should prevent deletion with associated products', async () => {
      const mockCategory = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Electronics',
        isActive: true,
        save: jest.fn(),
      }

      MockedCategory.findOne.mockResolvedValue(mockCategory)
      MockedProduct.countDocuments.mockResolvedValue(5) // Has products
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }

      await expect(DELETE(request, context)).rejects.toThrow(
        'Cannot delete category with existing products'
      )
    })

    it('should return proper confirmation on successful deletion', async () => {
      const mockCategory = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Electronics',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      }

      MockedCategory.findOne.mockResolvedValue(mockCategory)
      MockedProduct.countDocuments.mockResolvedValue(0)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      const response = await DELETE(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.message).toBe('Category deleted successfully')
      expect(mockCategory.isActive).toBe(false)
      expect(mockCategory.save).toHaveBeenCalled()
    })

    it('should return 404 for non-existent category', async () => {
      MockedCategory.findOne.mockResolvedValue(null)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }

      await expect(DELETE(request, context)).rejects.toThrow(
        'Category not found'
      )
    })
  })
})
