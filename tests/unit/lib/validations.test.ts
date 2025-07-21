import {
  createCategorySchema,
  createProductSchema,
  createSKUSchema,
  addCartItemSchema,
  validateRequest,
  parseJsonBody,
} from '@/lib/validations'

describe('Validation Library', () => {
  describe('createCategorySchema', () => {
    it('should validate a valid category', () => {
      const validCategory = {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
      }

      const result = createCategorySchema.safeParse(validCategory)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Electronics')
        expect(result.data.description).toBe('Electronic devices and gadgets')
      }
    })

    it('should reject category with name too short', () => {
      const invalidCategory = {
        name: 'A',
        description: 'Valid description',
      }

      const result = createCategorySchema.safeParse(invalidCategory)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          'at least 2 characters'
        )
      }
    })

    it('should reject category with name too long', () => {
      const invalidCategory = {
        name: 'A'.repeat(101), // 101 characters
        description: 'Valid description',
      }

      const result = createCategorySchema.safeParse(invalidCategory)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          'cannot exceed 100 characters'
        )
      }
    })

    it('should reject category with description too long', () => {
      const invalidCategory = {
        name: 'Valid Name',
        description: 'A'.repeat(501), // 501 characters
      }

      const result = createCategorySchema.safeParse(invalidCategory)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          'cannot exceed 500 characters'
        )
      }
    })

    it('should allow optional description', () => {
      const validCategory = {
        name: 'Electronics',
      }

      const result = createCategorySchema.safeParse(validCategory)
      expect(result.success).toBe(true)
    })

    it('should trim whitespace from name and description', () => {
      const categoryWithWhitespace = {
        name: '  Electronics  ',
        description: '  Electronic devices  ',
      }

      const result = createCategorySchema.safeParse(categoryWithWhitespace)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Electronics')
        expect(result.data.description).toBe('Electronic devices')
      }
    })
  })

  describe('createProductSchema', () => {
    const validCategoryId = '507f1f77bcf86cd799439011'

    it('should validate a valid product', () => {
      const validProduct = {
        name: 'iPhone 15',
        description: 'Latest iPhone with advanced features',
        categoryId: validCategoryId,
        basePrice: 999.99,
        images: ['https://example.com/image.jpg'],
      }

      const result = createProductSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('iPhone 15')
        expect(result.data.categoryId).toBe(validCategoryId)
        expect(result.data.basePrice).toBe(999.99)
      }
    })

    it('should reject product with invalid category ID format', () => {
      const invalidProduct = {
        name: 'iPhone 15',
        description: 'Latest iPhone with advanced features',
        categoryId: 'invalid-id',
        basePrice: 999.99,
      }

      const result = createProductSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          'Invalid category ID format'
        )
      }
    })

    it('should reject product with negative price', () => {
      const invalidProduct = {
        name: 'iPhone 15',
        description: 'Latest iPhone with advanced features',
        categoryId: validCategoryId,
        basePrice: -10,
      }

      const result = createProductSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('cannot be negative')
      }
    })

    it('should reject product with description too short', () => {
      const invalidProduct = {
        name: 'iPhone 15',
        description: 'Short',
        categoryId: validCategoryId,
        basePrice: 999.99,
      }

      const result = createProductSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          'at least 10 characters'
        )
      }
    })

    it('should reject product with invalid image URLs', () => {
      const invalidProduct = {
        name: 'iPhone 15',
        description: 'Latest iPhone with advanced features',
        categoryId: validCategoryId,
        basePrice: 999.99,
        images: ['not-a-url'],
      }

      const result = createProductSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid image URL')
      }
    })
  })

  describe('createSKUSchema', () => {
    it('should validate a valid SKU', () => {
      const validSKU = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 10,
        attributes: { storage: '128GB', color: 'Black' },
      }

      const result = createSKUSchema.safeParse(validSKU)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sku).toBe('IPH15-128-BLK')
        expect(result.data.price).toBe(999.99)
        expect(result.data.inventory).toBe(10)
      }
    })

    it('should transform SKU to uppercase', () => {
      const skuWithLowercase = {
        sku: 'iph15-128-blk',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 10,
      }

      const result = createSKUSchema.safeParse(skuWithLowercase)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sku).toBe('IPH15-128-BLK')
      }
    })

    it('should reject SKU with invalid characters', () => {
      const invalidSKU = {
        sku: 'IPH15_128@BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 10,
      }

      const result = createSKUSchema.safeParse(invalidSKU)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          'alphanumeric characters and hyphens'
        )
      }
    })

    it('should reject SKU with negative inventory', () => {
      const invalidSKU = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: -5,
      }

      const result = createSKUSchema.safeParse(invalidSKU)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('cannot be negative')
      }
    })

    it('should reject SKU with non-integer inventory', () => {
      const invalidSKU = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 10.5,
      }

      const result = createSKUSchema.safeParse(invalidSKU)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('whole number')
      }
    })
  })

  describe('addCartItemSchema', () => {
    const validSkuId = '507f1f77bcf86cd799439031'

    it('should validate a valid cart item', () => {
      const validCartItem = {
        skuId: validSkuId,
        quantity: 2,
      }

      const result = addCartItemSchema.safeParse(validCartItem)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.skuId).toBe(validSkuId)
        expect(result.data.quantity).toBe(2)
      }
    })

    it('should reject cart item with invalid SKU ID', () => {
      const invalidCartItem = {
        skuId: 'invalid-sku-id',
        quantity: 2,
      }

      const result = addCartItemSchema.safeParse(invalidCartItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          'Invalid SKU ID format'
        )
      }
    })

    it('should reject cart item with quantity too low', () => {
      const invalidCartItem = {
        skuId: validSkuId,
        quantity: 0,
      }

      const result = addCartItemSchema.safeParse(invalidCartItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 1')
      }
    })

    it('should reject cart item with quantity too high', () => {
      const invalidCartItem = {
        skuId: validSkuId,
        quantity: 100,
      }

      const result = addCartItemSchema.safeParse(invalidCartItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('cannot exceed 99')
      }
    })
  })

  describe('validateRequest', () => {
    it('should return validated data for valid input', () => {
      const data = { name: 'Electronics' }
      const result = validateRequest(createCategorySchema, data)

      expect(result).toEqual({ name: 'Electronics' })
    })

    it('should throw validation error for invalid input', () => {
      const data = { name: 'A' } // Too short

      expect(() => validateRequest(createCategorySchema, data)).toThrow()

      try {
        validateRequest(createCategorySchema, data)
      } catch (error: any) {
        expect(error.message).toBe('Validation failed')
        expect(error.code).toBe('VALIDATION_ERROR')
        expect(error.details).toEqual([
          {
            field: 'name',
            message: 'Category name must be at least 2 characters',
          },
        ])
      }
    })
  })

  describe('parseJsonBody', () => {
    it('should parse valid JSON body', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ name: 'Test' }),
      } as any

      const result = await parseJsonBody(mockRequest)
      expect(result).toEqual({ name: 'Test' })
      expect(mockRequest.json).toHaveBeenCalled()
    })

    it('should throw error for invalid JSON body', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as any

      await expect(parseJsonBody(mockRequest)).rejects.toThrow(
        'Invalid JSON body'
      )
    })
  })
})
