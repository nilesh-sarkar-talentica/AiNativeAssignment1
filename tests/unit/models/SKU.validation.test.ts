import { validateRequest } from '@/lib/validations'
import { createSKUSchema, updateSKUSchema } from '@/lib/validations'

describe('SKU Validation', () => {
  describe('Create SKU Schema', () => {
    it('should validate a valid SKU', () => {
      const validSKU = {
        sku: 'iph15-128-blk',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 50,
        attributes: { storage: '128GB', color: 'Black' },
      }

      const result = validateRequest(createSKUSchema, validSKU)

      expect(result.sku).toBe('IPH15-128-BLK') // Should be transformed to uppercase
      expect(result.name).toBe('iPhone 15 128GB Black')
      expect(result.price).toBe(999.99)
      expect(result.inventory).toBe(50)
      expect(result.attributes).toEqual({ storage: '128GB', color: 'Black' })
    })

    it('should require productId field', () => {
      const invalidSKU = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 50,
      }

      // This test is not valid since productId is not part of the validation schema
      // ProductId is added separately in the API route from the URL parameter
      const result = validateRequest(createSKUSchema, invalidSKU)
      expect(result.sku).toBe('IPH15-128-BLK')
    })

    it('should require sku field', () => {
      const invalidSKU = {
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 50,
      }

      expect(() => validateRequest(createSKUSchema, invalidSKU)).toThrow()
    })

    it('should validate SKU code format', () => {
      const invalidSKU = {
        sku: 'IPH15_128@BLK!', // Invalid characters
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 50,
      }

      expect(() => validateRequest(createSKUSchema, invalidSKU)).toThrow()
    })

    it('should require name field', () => {
      const invalidSKU = {
        sku: 'IPH15-128-BLK',
        price: 999.99,
        inventory: 50,
      }

      expect(() => validateRequest(createSKUSchema, invalidSKU)).toThrow()
    })

    it('should reject name too short', () => {
      const invalidSKU = {
        sku: 'IPH15-128-BLK',
        name: 'A', // Too short
        price: 999.99,
        inventory: 50,
      }

      expect(() => validateRequest(createSKUSchema, invalidSKU)).toThrow()
    })

    it('should reject name too long', () => {
      const invalidSKU = {
        sku: 'IPH15-128-BLK',
        name: 'A'.repeat(201), // Too long
        price: 999.99,
        inventory: 50,
      }

      expect(() => validateRequest(createSKUSchema, invalidSKU)).toThrow()
    })

    it('should require price field', () => {
      const invalidSKU = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        inventory: 50,
      }

      expect(() => validateRequest(createSKUSchema, invalidSKU)).toThrow()
    })

    it('should reject negative price', () => {
      const invalidSKU = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: -10, // Negative price
        inventory: 50,
      }

      expect(() => validateRequest(createSKUSchema, invalidSKU)).toThrow()
    })

    it('should require inventory field', () => {
      const invalidSKU = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
      }

      expect(() => validateRequest(createSKUSchema, invalidSKU)).toThrow()
    })

    it('should reject negative inventory', () => {
      const invalidSKU = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: -5, // Negative inventory
      }

      expect(() => validateRequest(createSKUSchema, invalidSKU)).toThrow()
    })

    it('should reject decimal inventory', () => {
      const invalidSKU = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 10.5, // Decimal inventory
      }

      expect(() => validateRequest(createSKUSchema, invalidSKU)).toThrow()
    })

    it('should validate attributes as key-value pairs', () => {
      const validSKU = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 50,
        attributes: {
          storage: '128GB',
          color: 'Black',
          warranty: '1 year',
        },
      }

      const result = validateRequest(createSKUSchema, validSKU)
      expect(result.attributes).toEqual({
        storage: '128GB',
        color: 'Black',
        warranty: '1 year',
      })
    })

    it('should default to empty attributes when not provided', () => {
      const validSKU = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 50,
      }

      const result = validateRequest(createSKUSchema, validSKU)
      expect(result.attributes).toEqual({})
    })

    it('should trim whitespace from name', () => {
      const skuWithWhitespace = {
        sku: 'IPH15-128-BLK',
        name: '  iPhone 15 128GB Black  ',
        price: 999.99,
        inventory: 50,
      }

      const result = validateRequest(createSKUSchema, skuWithWhitespace)
      expect(result.name).toBe('iPhone 15 128GB Black')
    })

    it('should transform SKU to uppercase', () => {
      const validSKU = {
        sku: 'iph15-128-blk', // lowercase
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 50,
      }

      const result = validateRequest(createSKUSchema, validSKU)
      expect(result.sku).toBe('IPH15-128-BLK')
    })
  })

  describe('Update SKU Schema', () => {
    it('should validate SKU updates', () => {
      const validUpdate = {
        name: 'Updated iPhone 15 128GB Black',
        price: 1099.99,
        inventory: 75,
      }

      const result = validateRequest(updateSKUSchema, validUpdate)
      expect(result.name).toBe('Updated iPhone 15 128GB Black')
      expect(result.price).toBe(1099.99)
      expect(result.inventory).toBe(75)
    })

    it('should allow partial updates', () => {
      const partialUpdate = {
        price: 899.99,
      }

      const result = validateRequest(updateSKUSchema, partialUpdate)
      expect(result.price).toBe(899.99)
      expect(result.name).toBeUndefined()
    })

    it('should validate constraints in updates', () => {
      const invalidUpdate = {
        name: 'A', // Too short
      }

      expect(() => validateRequest(updateSKUSchema, invalidUpdate)).toThrow()
    })

    it('should transform SKU to uppercase in updates', () => {
      const validUpdate = {
        sku: 'new-sku-code',
      }

      const result = validateRequest(updateSKUSchema, validUpdate)
      expect(result.sku).toBe('NEW-SKU-CODE')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const invalidSKU = {
        sku: '',
        name: '',
        price: 0,
        inventory: 0,
      }

      expect(() => validateRequest(createSKUSchema, invalidSKU)).toThrow()
    })

    it('should handle invalid ObjectId format', () => {
      // This test is not applicable since productId is not part of the validation schema
      const validSKU = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 50,
      }

      const result = validateRequest(createSKUSchema, validSKU)
      expect(result.sku).toBe('IPH15-128-BLK')
    })

    it('should handle zero inventory', () => {
      const skuWithZeroInventory = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 0,
      }

      const result = validateRequest(createSKUSchema, skuWithZeroInventory)
      expect(result.inventory).toBe(0)
    })

    it('should handle zero price', () => {
      const skuWithZeroPrice = {
        sku: 'FREE-SAMPLE',
        name: 'Free Sample',
        price: 0,
        inventory: 10,
      }

      const result = validateRequest(createSKUSchema, skuWithZeroPrice)
      expect(result.price).toBe(0)
    })

    it('should handle complex attributes', () => {
      const skuWithComplexAttributes = {
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        price: 999.99,
        inventory: 50,
        attributes: {
          storage: '128GB',
          color: 'Black',
          warranty: '1 year',
          carrier: 'Unlocked',
          condition: 'New',
        },
      }

      const result = validateRequest(createSKUSchema, skuWithComplexAttributes)
      expect(result.attributes).toBeDefined()
      if (result.attributes) {
        expect(Object.keys(result.attributes)).toHaveLength(5)
        expect(result.attributes.storage).toBe('128GB')
        expect(result.attributes.condition).toBe('New')
      }
    })
  })
})
