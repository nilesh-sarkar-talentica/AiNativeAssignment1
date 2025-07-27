// Mock all dependencies before any imports
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/models/SKU', () => {
  const mockSKUInstance = {
    save: jest.fn().mockResolvedValue(true),
    populate: jest.fn().mockReturnThis(),
  }

  const MockSKU = jest.fn().mockImplementation((data) => {
    return { ...data, ...mockSKUInstance }
  })

  // Add static methods to the mock constructor
  Object.assign(MockSKU, {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  })

  return MockSKU
})

jest.mock('@/models/Product', () => ({
  findOne: jest.fn(),
}))

jest.mock('@/models/Cart', () => ({
  findOne: jest.fn(),
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
  createSKUSchema: {},
  updateSKUSchema: {},
  skuParamsSchema: {},
  productParamsSchema: {},
  parseJsonBody: jest.fn(async (req) => {
    if (req.body === 'invalid json') {
      throw new Error('Invalid JSON')
    }
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  }),
}))

// Import the API routes after mocking
import {
  GET as getByProduct,
  POST as createSKU,
} from '@/app/api/products/[id]/skus/route'
import { GET as getById, PUT, DELETE } from '@/app/api/skus/[id]/route'

// Get the mocked modules
const MockedSKU = require('@/models/SKU')
const MockedProduct = require('@/models/Product')
const MockedCart = require('@/models/Cart')
const { validateRequest, parseJsonBody } = require('@/lib/validations')

describe('SKUs API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products/[id]/skus', () => {
    it('should return SKUs for a valid product', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        name: 'iPhone 14',
        isActive: true,
      }

      const mockSKUs = [
        {
          _id: '507f1f77bcf86cd799439030',
          skuCode: 'IP14-128-BLK',
          productId: {
            _id: '507f1f77bcf86cd799439011',
            name: 'iPhone 14',
            slug: 'iphone-14',
            images: ['https://example.com/iphone14.jpg'],
          },
          attributes: { storage: '128GB', color: 'Black' },
          price: 999,
          inventory: 50,
          isActive: true,
        },
        {
          _id: '507f1f77bcf86cd799439031',
          skuCode: 'IP14-256-WHT',
          productId: {
            _id: '507f1f77bcf86cd799439011',
            name: 'iPhone 14',
            slug: 'iphone-14',
            images: ['https://example.com/iphone14.jpg'],
          },
          attributes: { storage: '256GB', color: 'White' },
          price: 1099,
          inventory: 30,
          isActive: true,
        },
      ]

      MockedProduct.findOne.mockResolvedValue(mockProduct)
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockSKUs),
      }
      MockedSKU.find.mockReturnValue(mockQuery)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011/skus'
      )
      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      const response = await getByProduct(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockSKUs)
      expect(mockQuery.populate).toHaveBeenCalledWith(
        'productId',
        'name slug images'
      )
      expect(mockQuery.sort).toHaveBeenCalledWith({ name: 1 })
    })

    it('should validate product exists before returning SKUs', async () => {
      MockedProduct.findOne.mockResolvedValue(null)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011/skus'
      )
      const context = { params: { id: '507f1f77bcf86cd799439011' } }

      await expect(getByProduct(request, context)).rejects.toThrow(
        'Product not found'
      )
    })

    it('should include product details in SKU response', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        name: 'iPhone 14',
        isActive: true,
      }

      const mockSKUs = [
        {
          _id: '507f1f77bcf86cd799439030',
          productId: {
            _id: '507f1f77bcf86cd799439011',
            name: 'iPhone 14',
            slug: 'iphone-14',
            images: ['https://example.com/iphone14.jpg'],
          },
        },
      ]

      MockedProduct.findOne.mockResolvedValue(mockProduct)
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockSKUs),
      }
      MockedSKU.find.mockReturnValue(mockQuery)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439011' })

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011/skus'
      )
      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      const response = await getByProduct(request, context)
      const data = await response.json()

      expect(data.data[0].productId).toHaveProperty('name')
      expect(data.data[0].productId).toHaveProperty('slug')
      expect(data.data[0].productId).toHaveProperty('images')
    })
  })

  describe('POST /api/products/[id]/skus', () => {
    it('should create SKU for a valid product', async () => {
      const skuData = {
        skuCode: 'IP14-512-BLU',
        attributes: { storage: '512GB', color: 'Blue' },
        price: 1299,
        inventory: 25,
      }

      const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        name: 'iPhone 14',
        isActive: true,
      }

      const mockSavedSKU = {
        _id: '507f1f77bcf86cd799439032',
        ...skuData,
        productId: '507f1f77bcf86cd799439011',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      }

      MockedProduct.findOne.mockResolvedValue(mockProduct)
      MockedSKU.mockImplementation(() => mockSavedSKU)
      parseJsonBody.mockResolvedValue(skuData)
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439011' })
      validateRequest.mockReturnValueOnce(skuData)

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011/skus',
        {
          method: 'POST',
          body: JSON.stringify(skuData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      const response = await createSKU(request, context)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(mockSavedSKU.save).toHaveBeenCalled()
      expect(mockSavedSKU.populate).toHaveBeenCalledWith(
        'productId',
        'name slug images'
      )
    })

    it('should validate unique SKU code', async () => {
      const skuData = {
        skuCode: 'IP14-128-BLK', // Existing SKU code
        attributes: { storage: '128GB', color: 'Black' },
        price: 999,
        inventory: 50,
      }

      const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        name: 'iPhone 14',
        isActive: true,
      }

      const mockSKU = {
        save: jest.fn().mockRejectedValue({
          code: 11000,
          keyPattern: { skuCode: 1 },
        }),
        populate: jest.fn(),
      }

      MockedProduct.findOne.mockResolvedValue(mockProduct)
      MockedSKU.mockImplementation(() => mockSKU)
      parseJsonBody.mockResolvedValue(skuData)
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439011' })
      validateRequest.mockReturnValueOnce(skuData)

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011/skus',
        {
          method: 'POST',
          body: JSON.stringify(skuData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }

      await expect(createSKU(request, context)).rejects.toMatchObject({
        code: 11000,
        keyPattern: { skuCode: 1 },
      })
    })

    it('should validate all required fields', async () => {
      const invalidData = {
        attributes: { storage: '128GB' },
        // Missing skuCode, price, inventory
      }

      parseJsonBody.mockResolvedValue(invalidData)
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439011' })
      validateRequest.mockImplementationOnce(() => {
        const error = new Error('SKU code is required')
        error.name = 'ValidationError'
        throw error
      })

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011/skus',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }

      await expect(createSKU(request, context)).rejects.toThrow(
        'SKU code is required'
      )
    })

    it('should associate SKU with the correct product', async () => {
      const skuData = {
        skuCode: 'IP14-256-RED',
        attributes: { storage: '256GB', color: 'Red' },
        price: 1099,
        inventory: 20,
      }

      const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        name: 'iPhone 14',
        isActive: true,
      }

      const mockSavedSKU = {
        _id: '507f1f77bcf86cd799439032',
        ...skuData,
        productId: '507f1f77bcf86cd799439011',
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      }

      MockedProduct.findOne.mockResolvedValue(mockProduct)
      MockedSKU.mockImplementation((data: any) => {
        expect(data.productId.toString()).toBe('507f1f77bcf86cd799439011')
        return mockSavedSKU
      })
      parseJsonBody.mockResolvedValue(skuData)
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439011' })
      validateRequest.mockReturnValueOnce(skuData)

      const request = new Request(
        'http://localhost:3000/api/products/507f1f77bcf86cd799439011/skus',
        {
          method: 'POST',
          body: JSON.stringify(skuData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439011' } }
      await createSKU(request, context)

      expect(MockedSKU).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: expect.any(Object),
        })
      )
    })
  })

  describe('GET /api/skus/[id]', () => {
    it('should return SKU with product and category details', async () => {
      const mockSKU = {
        _id: '507f1f77bcf86cd799439030',
        skuCode: 'IP14-128-BLK',
        productId: {
          _id: '507f1f77bcf86cd799439011',
          name: 'iPhone 14',
          slug: 'iphone-14',
          categoryId: {
            _id: '507f1f77bcf86cd799439020',
            name: 'Electronics',
            slug: 'electronics',
          },
        },
        attributes: { storage: '128GB', color: 'Black' },
        price: 999,
        inventory: 50,
        isActive: true,
      }

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockSKU),
      }
      MockedSKU.findOne.mockReturnValue(mockQuery)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439030' })

      const request = new Request(
        'http://localhost:3000/api/skus/507f1f77bcf86cd799439030'
      )
      const context = { params: { id: '507f1f77bcf86cd799439030' } }
      const response = await getById(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockSKU)
      expect(mockQuery.populate).toHaveBeenCalledWith({
        path: 'productId',
        populate: {
          path: 'categoryId',
          model: 'Category',
        },
      })
    })

    it('should validate ID format', async () => {
      validateRequest.mockImplementation(() => {
        const error = new Error('Invalid SKU ID format')
        error.name = 'ValidationError'
        throw error
      })

      const request = new Request('http://localhost:3000/api/skus/invalid-id')
      const context = { params: { id: 'invalid-id' } }

      await expect(getById(request, context)).rejects.toThrow(
        'Invalid SKU ID format'
      )
    })

    it('should return 404 for non-existent SKU', async () => {
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(null),
      }
      MockedSKU.findOne.mockReturnValue(mockQuery)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439030' })

      const request = new Request(
        'http://localhost:3000/api/skus/507f1f77bcf86cd799439030'
      )
      const context = { params: { id: '507f1f77bcf86cd799439030' } }

      await expect(getById(request, context)).rejects.toThrow('SKU not found')
    })
  })

  describe('PUT /api/skus/[id]', () => {
    it('should update SKU fields', async () => {
      const updateData = {
        price: 1099,
        inventory: 75,
        attributes: { storage: '128GB', color: 'Black', warranty: '2 years' },
      }

      const mockSKU = {
        _id: '507f1f77bcf86cd799439030',
        skuCode: 'IP14-128-BLK',
        price: 999,
        inventory: 50,
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      }

      MockedSKU.findOne.mockResolvedValue(mockSKU)
      parseJsonBody.mockResolvedValue(updateData)
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439030' })
      validateRequest.mockReturnValueOnce(updateData)

      const request = new Request(
        'http://localhost:3000/api/skus/507f1f77bcf86cd799439030',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439030' } }
      const response = await PUT(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockSKU.save).toHaveBeenCalled()
      expect(mockSKU.populate).toHaveBeenCalledWith({
        path: 'productId',
        populate: {
          path: 'categoryId',
          model: 'Category',
        },
      })
    })

    it('should validate inventory changes', async () => {
      const updateData = {
        inventory: -10, // Invalid negative inventory
      }

      parseJsonBody.mockResolvedValue(updateData)
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439030' })
      validateRequest.mockImplementationOnce(() => {
        const error = new Error('Inventory must be non-negative')
        error.name = 'ValidationError'
        throw error
      })

      const request = new Request(
        'http://localhost:3000/api/skus/507f1f77bcf86cd799439030',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439030' } }

      await expect(PUT(request, context)).rejects.toThrow(
        'Inventory must be non-negative'
      )
    })

    it('should prevent invalid prices', async () => {
      const updateData = {
        price: -100, // Invalid negative price
      }

      parseJsonBody.mockResolvedValue(updateData)
      validateRequest.mockReturnValueOnce({ id: '507f1f77bcf86cd799439030' })
      validateRequest.mockImplementationOnce(() => {
        const error = new Error('Price must be positive')
        error.name = 'ValidationError'
        throw error
      })

      const request = new Request(
        'http://localhost:3000/api/skus/507f1f77bcf86cd799439030',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439030' } }

      await expect(PUT(request, context)).rejects.toThrow(
        'Price must be positive'
      )
    })
  })

  describe('DELETE /api/skus/[id]', () => {
    it('should soft delete SKU when not in cart', async () => {
      const mockSKU = {
        _id: '507f1f77bcf86cd799439030',
        skuCode: 'IP14-128-BLK',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      }

      MockedSKU.findOne.mockResolvedValue(mockSKU)
      MockedCart.findOne.mockResolvedValue(null) // SKU not in any cart
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439030' })

      const request = new Request(
        'http://localhost:3000/api/skus/507f1f77bcf86cd799439030',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439030' } }
      const response = await DELETE(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.message).toBe('SKU deleted successfully')
      expect(mockSKU.isActive).toBe(false)
      expect(mockSKU.save).toHaveBeenCalled()
    })

    it('should prevent deletion if SKU is in cart', async () => {
      const mockSKU = {
        _id: '507f1f77bcf86cd799439030',
        skuCode: 'IP14-128-BLK',
        isActive: true,
        save: jest.fn(),
      }

      const mockCart = {
        _id: '507f1f77bcf86cd799439040',
        items: [
          {
            skuId: '507f1f77bcf86cd799439030',
            quantity: 2,
          },
        ],
      }

      MockedSKU.findOne.mockResolvedValue(mockSKU)
      MockedCart.findOne.mockResolvedValue(mockCart)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439030' })

      const request = new Request(
        'http://localhost:3000/api/skus/507f1f77bcf86cd799439030',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439030' } }

      await expect(DELETE(request, context)).rejects.toThrow(
        'Cannot delete SKU that is in shopping carts'
      )
    })

    it('should validate dependencies before deletion', async () => {
      const mockSKU = {
        _id: '507f1f77bcf86cd799439030',
        isActive: true,
        save: jest.fn(),
      }

      MockedSKU.findOne.mockResolvedValue(mockSKU)
      MockedCart.findOne.mockResolvedValue(null)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439030' })

      const request = new Request(
        'http://localhost:3000/api/skus/507f1f77bcf86cd799439030',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439030' } }
      await DELETE(request, context)

      // Verify cart dependency check was performed
      expect(MockedCart.findOne).toHaveBeenCalledWith({
        'items.skuId': expect.any(Object),
      })
    })

    it('should return 404 for non-existent SKU', async () => {
      MockedSKU.findOne.mockResolvedValue(null)
      validateRequest.mockReturnValue({ id: '507f1f77bcf86cd799439030' })

      const request = new Request(
        'http://localhost:3000/api/skus/507f1f77bcf86cd799439030',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { id: '507f1f77bcf86cd799439030' } }

      await expect(DELETE(request, context)).rejects.toThrow('SKU not found')
    })
  })
})
