import { validateRequest } from '@/lib/validations'
import { createProductSchema, updateProductSchema } from '@/lib/validations'

describe('Product Validation', () => {
  describe('Create Product Schema', () => {
    it('should validate a valid product', () => {
      const validProduct = {
        name: 'iPhone 15',
        description:
          'Latest iPhone with advanced features and improved performance',
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: 999.99,
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
      }

      const result = validateRequest(createProductSchema, validProduct)

      expect(result.name).toBe('iPhone 15')
      expect(result.description).toBe(
        'Latest iPhone with advanced features and improved performance'
      )
      expect(result.categoryId).toBe('507f1f77bcf86cd799439011')
      expect(result.basePrice).toBe(999.99)
      expect(result.images).toEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ])
    })

    it('should require name field', () => {
      const invalidProduct = {
        description: 'Valid description with enough length for testing',
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: 99.99,
      }

      expect(() =>
        validateRequest(createProductSchema, invalidProduct)
      ).toThrow()
    })

    it('should reject name too short', () => {
      const invalidProduct = {
        name: 'A',
        description: 'Valid description with enough length for testing',
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: 99.99,
      }

      expect(() =>
        validateRequest(createProductSchema, invalidProduct)
      ).toThrow()
    })

    it('should reject name too long', () => {
      const invalidProduct = {
        name: 'A'.repeat(201),
        description: 'Valid description with enough length for testing',
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: 99.99,
      }

      expect(() =>
        validateRequest(createProductSchema, invalidProduct)
      ).toThrow()
    })

    it('should require description field', () => {
      const invalidProduct = {
        name: 'iPhone 15',
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: 99.99,
      }

      expect(() =>
        validateRequest(createProductSchema, invalidProduct)
      ).toThrow()
    })

    it('should reject description too short', () => {
      const invalidProduct = {
        name: 'iPhone 15',
        description: 'Too short',
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: 99.99,
      }

      expect(() =>
        validateRequest(createProductSchema, invalidProduct)
      ).toThrow()
    })

    it('should reject description too long', () => {
      const invalidProduct = {
        name: 'iPhone 15',
        description: 'A'.repeat(2001),
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: 99.99,
      }

      expect(() =>
        validateRequest(createProductSchema, invalidProduct)
      ).toThrow()
    })

    it('should require categoryId field', () => {
      const invalidProduct = {
        name: 'iPhone 15',
        description: 'Valid description with enough length for testing',
        basePrice: 99.99,
      }

      expect(() =>
        validateRequest(createProductSchema, invalidProduct)
      ).toThrow()
    })

    it('should require basePrice field', () => {
      const invalidProduct = {
        name: 'iPhone 15',
        description: 'Valid description with enough length for testing',
        categoryId: '507f1f77bcf86cd799439011',
      }

      expect(() =>
        validateRequest(createProductSchema, invalidProduct)
      ).toThrow()
    })

    it('should reject negative basePrice', () => {
      const invalidProduct = {
        name: 'iPhone 15',
        description: 'Valid description with enough length for testing',
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: -10,
      }

      expect(() =>
        validateRequest(createProductSchema, invalidProduct)
      ).toThrow()
    })

    it('should validate image URLs', () => {
      const invalidProduct = {
        name: 'iPhone 15',
        description: 'Valid description with enough length for testing',
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: 999.99,
        images: ['not-a-url', 'also-not-a-url'],
      }

      expect(() =>
        validateRequest(createProductSchema, invalidProduct)
      ).toThrow()
    })

    it('should allow valid image URLs', () => {
      const validProduct = {
        name: 'iPhone 15',
        description: 'Valid description with enough length for testing',
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: 999.99,
        images: [
          'https://example.com/image1.jpg',
          'http://example.com/image2.png',
          'https://cdn.example.com/path/to/image3.gif',
        ],
      }

      const result = validateRequest(createProductSchema, validProduct)
      expect(result.images).toHaveLength(3)
    })

    it('should trim whitespace from name and description', () => {
      const productWithWhitespace = {
        name: '  iPhone 15  ',
        description: '  Latest iPhone with advanced features  ',
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: 999.99,
      }

      const result = validateRequest(createProductSchema, productWithWhitespace)
      expect(result.name).toBe('iPhone 15')
      expect(result.description).toBe('Latest iPhone with advanced features')
    })

    it('should default to empty images array when not provided', () => {
      const validProduct = {
        name: 'iPhone 15',
        description: 'Valid description with enough length for testing',
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: 999.99,
      }

      const result = validateRequest(createProductSchema, validProduct)
      expect(result.images).toEqual([])
    })
  })

  describe('Update Product Schema', () => {
    it('should validate product updates', () => {
      const validUpdate = {
        name: 'Updated iPhone 15',
        description: 'Updated description with new features and improvements',
        basePrice: 1099.99,
      }

      const result = validateRequest(updateProductSchema, validUpdate)
      expect(result.name).toBe('Updated iPhone 15')
      expect(result.description).toBe(
        'Updated description with new features and improvements'
      )
      expect(result.basePrice).toBe(1099.99)
    })

    it('should allow partial updates', () => {
      const partialUpdate = {
        description: 'Updated description with new features and improvements',
      }

      const result = validateRequest(updateProductSchema, partialUpdate)
      expect(result.description).toBe(
        'Updated description with new features and improvements'
      )
      expect(result.name).toBeUndefined()
    })

    it('should validate constraints in updates', () => {
      const invalidUpdate = {
        name: 'A', // Too short
      }

      expect(() =>
        validateRequest(updateProductSchema, invalidUpdate)
      ).toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const invalidProduct = {
        name: '',
        description: '',
        categoryId: '',
        basePrice: 0,
      }

      expect(() =>
        validateRequest(createProductSchema, invalidProduct)
      ).toThrow()
    })

    it('should handle invalid ObjectId format', () => {
      const invalidProduct = {
        name: 'iPhone 15',
        description: 'Valid description with enough length for testing',
        categoryId: 'invalid-object-id',
        basePrice: 999.99,
      }

      expect(() =>
        validateRequest(createProductSchema, invalidProduct)
      ).toThrow()
    })

    it('should handle zero price', () => {
      const productWithZeroPrice = {
        name: 'iPhone 15',
        description: 'Valid description with enough length for testing',
        categoryId: '507f1f77bcf86cd799439011',
        basePrice: 0,
      }

      const result = validateRequest(createProductSchema, productWithZeroPrice)
      expect(result.basePrice).toBe(0)
    })
  })
})
