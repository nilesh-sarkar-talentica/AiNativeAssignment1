import { GET, POST } from '@/app/api/categories/route'
import { GET as getById, PUT, DELETE } from '@/app/api/categories/[id]/route'
import { NextRequest } from 'next/server'

// Mock the database connection and models
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/models/Category', () => ({
  find: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}))

// Import the mocked model after setting up the mock
const MockedCategory = require('@/models/Category')

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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Clothing',
          description: 'Fashion items',
          slug: 'clothing',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      // Mock the database query
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockCategories),
      }
      MockedCategory.find.mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost:3000/api/categories')
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

      const request = new NextRequest('http://localhost:3000/api/categories')
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

      const request = new NextRequest('http://localhost:3000/api/categories')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INTERNAL_ERROR')
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
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      }

      MockedCategory.create = jest.fn().mockResolvedValue(mockSavedCategory)

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockSavedCategory)
      expect(MockedCategory.create).toHaveBeenCalledWith(categoryData)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing name field',
      }

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.details).toBeDefined()
    })

    it('should validate name length constraints', async () => {
      const invalidData = {
        name: 'A', // Too short
        description: 'Valid description',
      }

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('should handle duplicate category names', async () => {
      const categoryData = {
        name: 'Electronics',
        description: 'Electronic devices',
      }

      MockedCategory.create.mockRejectedValue({
        code: 11000,
        keyPattern: { name: 1 },
      })

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('DUPLICATE_RESOURCE')
    })

    it('should handle invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
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
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      MockedCategory.findOne.mockResolvedValue(mockCategory)

      const request = new NextRequest(
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

      const request = new NextRequest(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011'
      )
      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      const response = await getById(request, context)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should return 400 for invalid ID format', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/categories/invalid-id'
      )
      const context = { params: { id: 'invalid-id' } }
      const response = await getById(request, context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('should handle missing context params', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011'
      )
      const response = await getById(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('NOT_FOUND')
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

      const mockUpdatedCategory = {
        ...mockCategory,
        name: 'Updated Electronics',
        description: 'Updated description',
      }

      MockedCategory.findOne.mockResolvedValue(mockCategory)
      Object.assign(mockCategory, updateData)

      const request = new NextRequest(
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

    it('should return 404 for non-existent category', async () => {
      MockedCategory.findOne.mockResolvedValue(null)

      const updateData = { name: 'Updated Name' }
      const request = new NextRequest(
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

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should validate update data', async () => {
      const invalidUpdateData = {
        name: 'A', // Too short
      }

      const request = new NextRequest(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011',
        {
          method: 'PUT',
          body: JSON.stringify(invalidUpdateData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      const response = await PUT(request, context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
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

      // Mock Product model to simulate no associated products
      jest.doMock('@/models/Product', () => ({
        countDocuments: jest.fn().mockResolvedValue(0),
      }))

      const request = new NextRequest(
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

    it('should return 404 for non-existent category', async () => {
      MockedCategory.findOne.mockResolvedValue(null)

      const request = new NextRequest(
        'http://localhost:3000/api/categories/507f1f77bcf86cd799439011',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      const response = await DELETE(request, context)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('NOT_FOUND')
    })
  })
})
