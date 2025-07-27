// Mock all dependencies before any imports
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/models/Cart', () => {
  const mockCartInstance = {
    save: jest.fn().mockResolvedValue(true),
    getItem: jest.fn(),
    hasItem: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    clearItems: jest.fn(),
  }

  const MockCart = jest.fn().mockImplementation((data) => {
    return { ...data, ...mockCartInstance }
  })

  // Add static methods to the mock constructor
  Object.assign(MockCart, {
    findBySession: jest.fn(),
    createForSession: jest.fn(),
    findOrCreateBySession: jest.fn(),
  })

  return MockCart
})

jest.mock('@/models/SKU', () => ({
  findOne: jest.fn(),
}))

jest.mock('@/lib/errors', () => ({
  asyncHandler: (fn: any) => fn,
  createSuccessResponse: (data: any, message?: string, status?: number) =>
    Response.json({ success: true, data, message }, { status: status || 200 }),
  throwNotFoundError: (resource: string) => {
    throw new Error(`${resource} not found`)
  },
  throwInventoryError: (message: string) => {
    const error = new Error(message)
    error.name = 'InventoryError'
    throw error
  },
}))

jest.mock('@/lib/validations', () => ({
  validateRequest: jest.fn((schema, data) => data),
  addCartItemSchema: {},
  updateCartItemSchema: {},
  cartItemParamsSchema: {},
  parseJsonBody: jest.fn(async (req) => {
    if (req.body === 'invalid json') {
      throw new Error('Invalid JSON')
    }
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  }),
}))

jest.mock('@/lib/session', () => ({
  getSessionFromRequest: jest.fn(() => ({ sessionId: 'test-session-123' })),
  addSessionHeaders: jest.fn((response, sessionId) => response),
}))

// Import the API routes after mocking
import { GET, POST, DELETE } from '@/app/api/cart/route'
import { PUT, DELETE as deleteItem } from '@/app/api/cart/items/[skuId]/route'

// Get the mocked modules
const MockedCart = require('@/models/Cart')
const MockedSKU = require('@/models/SKU')
const { validateRequest, parseJsonBody } = require('@/lib/validations')
const { getSessionFromRequest, addSessionHeaders } = require('@/lib/session')

describe('Cart API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getSessionFromRequest.mockReturnValue({ sessionId: 'test-session-123' })
  })

  describe('GET /api/cart', () => {
    it('should return current cart with populated item details', async () => {
      const mockCart = {
        _id: '507f1f77bcf86cd799439040',
        sessionId: 'test-session-123',
        items: [
          {
            skuId: {
              _id: '507f1f77bcf86cd799439030',
              skuCode: 'IP14-128-BLK',
              price: 999,
              productId: {
                _id: '507f1f77bcf86cd799439011',
                name: 'iPhone 14',
                slug: 'iphone-14',
              },
            },
            quantity: 2,
            price: 999,
            subtotal: 1998,
          },
        ],
        totalAmount: 1998,
        createdAt: '2025-07-26T05:39:30.993Z',
        updatedAt: '2025-07-26T05:39:30.993Z',
      }

      MockedCart.findBySession.mockResolvedValue(mockCart)

      const request = new Request('http://localhost:3000/api/cart')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockCart)
      expect(MockedCart.findBySession).toHaveBeenCalledWith('test-session-123')
      expect(addSessionHeaders).toHaveBeenCalledWith(
        expect.any(Response),
        'test-session-123'
      )
    })

    it('should create empty cart if none exists', async () => {
      const mockEmptyCart = {
        _id: '507f1f77bcf86cd799439041',
        sessionId: 'test-session-123',
        items: [],
        totalAmount: 0,
        createdAt: '2025-07-26T05:39:30.993Z',
        updatedAt: '2025-07-26T05:39:30.993Z',
      }

      MockedCart.findBySession.mockResolvedValue(null)
      MockedCart.createForSession.mockResolvedValue(mockEmptyCart)

      const request = new Request('http://localhost:3000/api/cart')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockEmptyCart)
      expect(MockedCart.createForSession).toHaveBeenCalledWith(
        'test-session-123'
      )
    })

    it('should handle session management', async () => {
      const mockCart = {
        sessionId: 'test-session-123',
        items: [],
        totalAmount: 0,
      }

      MockedCart.findBySession.mockResolvedValue(mockCart)

      const request = new Request('http://localhost:3000/api/cart')
      await GET(request)

      expect(getSessionFromRequest).toHaveBeenCalledWith(request)
      expect(addSessionHeaders).toHaveBeenCalled()
    })
  })

  describe('POST /api/cart/items', () => {
    it('should add item to cart with inventory validation', async () => {
      const itemData = {
        skuId: '507f1f77bcf86cd799439030',
        quantity: 2,
      }

      const mockSKU = {
        _id: '507f1f77bcf86cd799439030',
        skuCode: 'IP14-128-BLK',
        price: 999,
        inventory: 50,
        isActive: true,
      }

      const mockCart = {
        _id: '507f1f77bcf86cd799439040',
        sessionId: 'test-session-123',
        getItem: jest.fn().mockReturnValue(null), // No existing item
        addItem: jest.fn().mockResolvedValue(true),
      }

      const mockUpdatedCart = {
        ...mockCart,
        items: [
          {
            skuId: mockSKU._id,
            quantity: 2,
            price: 999,
            subtotal: 1998,
          },
        ],
        totalAmount: 1998,
      }

      MockedSKU.findOne.mockResolvedValue(mockSKU)
      MockedCart.findOrCreateBySession.mockResolvedValue(mockCart)
      MockedCart.findBySession.mockResolvedValue(mockUpdatedCart)
      parseJsonBody.mockResolvedValue(itemData)
      validateRequest.mockReturnValue(itemData)

      const request = new Request('http://localhost:3000/api/cart/items', {
        method: 'POST',
        body: JSON.stringify(itemData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(mockCart.addItem).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439030',
        2,
        999
      )
    })

    it('should validate inventory availability', async () => {
      const itemData = {
        skuId: '507f1f77bcf86cd799439030',
        quantity: 60, // Exceeds available inventory
      }

      const mockSKU = {
        _id: '507f1f77bcf86cd799439030',
        inventory: 50, // Only 50 available
        isActive: true,
      }

      MockedSKU.findOne.mockResolvedValue(mockSKU)
      parseJsonBody.mockResolvedValue(itemData)
      validateRequest.mockReturnValue(itemData)

      const request = new Request('http://localhost:3000/api/cart/items', {
        method: 'POST',
        body: JSON.stringify(itemData),
        headers: { 'Content-Type': 'application/json' },
      })

      await expect(POST(request)).rejects.toThrow(
        'Only 50 items available in stock'
      )
    })

    it('should enforce quantity limits with existing items', async () => {
      const itemData = {
        skuId: '507f1f77bcf86cd799439030',
        quantity: 40,
      }

      const mockSKU = {
        _id: '507f1f77bcf86cd799439030',
        inventory: 50,
        isActive: true,
      }

      const mockExistingItem = {
        quantity: 20, // Already 20 in cart
      }

      const mockCart = {
        getItem: jest.fn().mockReturnValue(mockExistingItem),
        addItem: jest.fn(),
      }

      MockedSKU.findOne.mockResolvedValue(mockSKU)
      MockedCart.findOrCreateBySession.mockResolvedValue(mockCart)
      parseJsonBody.mockResolvedValue(itemData)
      validateRequest.mockReturnValue(itemData)

      const request = new Request('http://localhost:3000/api/cart/items', {
        method: 'POST',
        body: JSON.stringify(itemData),
        headers: { 'Content-Type': 'application/json' },
      })

      // 20 existing + 40 new = 60, but only 50 available
      await expect(POST(request)).rejects.toThrow(
        'Cannot add 40 items. Only 30 more available'
      )
    })

    it('should handle session creation during cart operations', async () => {
      const itemData = {
        skuId: '507f1f77bcf86cd799439030',
        quantity: 1,
      }

      const mockSKU = {
        _id: '507f1f77bcf86cd799439030',
        price: 999,
        inventory: 50,
        isActive: true,
      }

      const mockCart = {
        getItem: jest.fn().mockReturnValue(null),
        addItem: jest.fn().mockResolvedValue(true),
      }

      MockedSKU.findOne.mockResolvedValue(mockSKU)
      MockedCart.findOrCreateBySession.mockResolvedValue(mockCart)
      MockedCart.findBySession.mockResolvedValue(mockCart)
      parseJsonBody.mockResolvedValue(itemData)
      validateRequest.mockReturnValue(itemData)

      const request = new Request('http://localhost:3000/api/cart/items', {
        method: 'POST',
        body: JSON.stringify(itemData),
        headers: { 'Content-Type': 'application/json' },
      })

      await POST(request)

      expect(MockedCart.findOrCreateBySession).toHaveBeenCalledWith(
        'test-session-123'
      )
    })
  })

  describe('PUT /api/cart/items/[skuId]', () => {
    it('should update item quantity with inventory constraints', async () => {
      const updateData = { quantity: 5 }

      const mockSKU = {
        _id: '507f1f77bcf86cd799439030',
        inventory: 10,
        isActive: true,
      }

      const mockCart = {
        _id: '507f1f77bcf86cd799439040',
        hasItem: jest.fn().mockReturnValue(true),
        updateItem: jest.fn().mockResolvedValue(true),
      }

      const mockUpdatedCart = {
        ...mockCart,
        items: [
          {
            skuId: '507f1f77bcf86cd799439030',
            quantity: 5,
          },
        ],
      }

      MockedCart.findBySession.mockResolvedValueOnce(mockCart)
      MockedCart.findBySession.mockResolvedValueOnce(mockUpdatedCart)
      MockedSKU.findOne.mockResolvedValue(mockSKU)
      parseJsonBody.mockResolvedValue(updateData)
      validateRequest.mockReturnValueOnce({ skuId: '507f1f77bcf86cd799439030' })
      validateRequest.mockReturnValueOnce(updateData)

      const request = new Request(
        'http://localhost:3000/api/cart/items/507f1f77bcf86cd799439030',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { skuId: '507f1f77bcf86cd799439030' } }
      const response = await PUT(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockCart.updateItem).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439030',
        5
      )
    })

    it('should validate inventory constraints during update', async () => {
      const updateData = { quantity: 15 }

      const mockSKU = {
        _id: '507f1f77bcf86cd799439030',
        inventory: 10, // Only 10 available
        isActive: true,
      }

      const mockCart = {
        hasItem: jest.fn().mockReturnValue(true),
      }

      MockedCart.findBySession.mockResolvedValue(mockCart)
      MockedSKU.findOne.mockResolvedValue(mockSKU)
      parseJsonBody.mockResolvedValue(updateData)
      validateRequest.mockReturnValueOnce({ skuId: '507f1f77bcf86cd799439030' })
      validateRequest.mockReturnValueOnce(updateData)

      const request = new Request(
        'http://localhost:3000/api/cart/items/507f1f77bcf86cd799439030',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { skuId: '507f1f77bcf86cd799439030' } }

      await expect(PUT(request, context)).rejects.toThrow(
        'Only 10 items available in stock'
      )
    })

    it('should validate quantity validation', async () => {
      const updateData = { quantity: 0 } // Invalid zero quantity

      parseJsonBody.mockResolvedValue(updateData)
      validateRequest.mockReturnValueOnce({ skuId: '507f1f77bcf86cd799439030' })
      validateRequest.mockImplementationOnce(() => {
        const error = new Error('Quantity must be at least 1')
        error.name = 'ValidationError'
        throw error
      })

      const request = new Request(
        'http://localhost:3000/api/cart/items/507f1f77bcf86cd799439030',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const context = { params: { skuId: '507f1f77bcf86cd799439030' } }

      await expect(PUT(request, context)).rejects.toThrow(
        'Quantity must be at least 1'
      )
    })
  })

  describe('DELETE /api/cart/items/[skuId]', () => {
    it('should remove item from cart', async () => {
      const mockCart = {
        _id: '507f1f77bcf86cd799439040',
        hasItem: jest.fn().mockReturnValue(true),
        removeItem: jest.fn().mockResolvedValue(true),
      }

      const mockUpdatedCart = {
        ...mockCart,
        items: [],
        totalAmount: 0,
      }

      MockedCart.findBySession.mockResolvedValueOnce(mockCart)
      MockedCart.findBySession.mockResolvedValueOnce(mockUpdatedCart)
      validateRequest.mockReturnValue({ skuId: '507f1f77bcf86cd799439030' })

      const request = new Request(
        'http://localhost:3000/api/cart/items/507f1f77bcf86cd799439030',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { skuId: '507f1f77bcf86cd799439030' } }
      const response = await deleteItem(request, context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockCart.removeItem).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439030'
      )
    })

    it('should validate item exists in cart', async () => {
      const mockCart = {
        hasItem: jest.fn().mockReturnValue(false), // Item not in cart
      }

      MockedCart.findBySession.mockResolvedValue(mockCart)
      validateRequest.mockReturnValue({ skuId: '507f1f77bcf86cd799439030' })

      const request = new Request(
        'http://localhost:3000/api/cart/items/507f1f77bcf86cd799439030',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { skuId: '507f1f77bcf86cd799439030' } }

      await expect(deleteItem(request, context)).rejects.toThrow(
        'Cart item not found'
      )
    })

    it('should update cart totals after item removal', async () => {
      const mockCart = {
        hasItem: jest.fn().mockReturnValue(true),
        removeItem: jest.fn().mockResolvedValue(true),
      }

      const mockUpdatedCart = {
        items: [],
        totalAmount: 0,
      }

      MockedCart.findBySession.mockResolvedValueOnce(mockCart)
      MockedCart.findBySession.mockResolvedValueOnce(mockUpdatedCart)
      validateRequest.mockReturnValue({ skuId: '507f1f77bcf86cd799439030' })

      const request = new Request(
        'http://localhost:3000/api/cart/items/507f1f77bcf86cd799439030',
        {
          method: 'DELETE',
        }
      )

      const context = { params: { skuId: '507f1f77bcf86cd799439030' } }
      const response = await deleteItem(request, context)
      const data = await response.json()

      expect(data.data.totalAmount).toBe(0)
      // Verify cart was reloaded after removal
      expect(MockedCart.findBySession).toHaveBeenCalledTimes(2)
    })
  })

  describe('DELETE /api/cart', () => {
    it('should clear entire cart and maintain session', async () => {
      const mockCart = {
        _id: '507f1f77bcf86cd799439040',
        sessionId: 'test-session-123',
        clearItems: jest.fn().mockResolvedValue(true),
      }

      const mockClearedCart = {
        ...mockCart,
        items: [],
        totalAmount: 0,
      }

      MockedCart.findBySession.mockResolvedValueOnce(mockCart)
      MockedCart.findBySession.mockResolvedValueOnce(mockClearedCart)

      const request = new Request('http://localhost:3000/api/cart', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.items).toEqual([])
      expect(data.data.totalAmount).toBe(0)
      expect(mockCart.clearItems).toHaveBeenCalled()
    })

    it('should create empty cart if none exists during clear', async () => {
      const mockEmptyCart = {
        _id: '507f1f77bcf86cd799439041',
        sessionId: 'test-session-123',
        items: [],
        totalAmount: 0,
      }

      MockedCart.findBySession.mockResolvedValue(null)
      MockedCart.createForSession.mockResolvedValue(mockEmptyCart)

      const request = new Request('http://localhost:3000/api/cart', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockEmptyCart)
      expect(MockedCart.createForSession).toHaveBeenCalledWith(
        'test-session-123'
      )
    })
  })
})
