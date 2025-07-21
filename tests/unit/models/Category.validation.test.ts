import { validateRequest } from '@/lib/validations'
import { createCategorySchema, updateCategorySchema } from '@/lib/validations'

describe('Category Validation', () => {
  describe('Create Category Schema', () => {
    it('should validate a valid category', () => {
      const validCategory = {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
      }

      const result = validateRequest(createCategorySchema, validCategory)

      expect(result.name).toBe('Electronics')
      expect(result.description).toBe('Electronic devices and gadgets')
    })

    it('should reject category with name too short', () => {
      const invalidCategory = {
        name: 'A',
        description: 'Valid description',
      }

      expect(() =>
        validateRequest(createCategorySchema, invalidCategory)
      ).toThrow()
    })

    it('should reject category with name too long', () => {
      const invalidCategory = {
        name: 'A'.repeat(101), // 101 characters
        description: 'Valid description',
      }

      expect(() =>
        validateRequest(createCategorySchema, invalidCategory)
      ).toThrow()
    })

    it('should reject category with description too long', () => {
      const invalidCategory = {
        name: 'Valid Name',
        description: 'A'.repeat(501), // 501 characters
      }

      expect(() =>
        validateRequest(createCategorySchema, invalidCategory)
      ).toThrow()
    })

    it('should allow optional description', () => {
      const validCategory = {
        name: 'Electronics',
      }

      const result = validateRequest(createCategorySchema, validCategory)
      expect(result.name).toBe('Electronics')
      expect(result.description).toBeUndefined()
    })

    it('should trim whitespace from name and description', () => {
      const categoryWithWhitespace = {
        name: '  Electronics  ',
        description: '  Electronic devices  ',
      }

      const result = validateRequest(
        createCategorySchema,
        categoryWithWhitespace
      )
      expect(result.name).toBe('Electronics')
      expect(result.description).toBe('Electronic devices')
    })

    it('should require name field', () => {
      const invalidCategory = {
        description: 'Description without name',
      }

      expect(() =>
        validateRequest(createCategorySchema, invalidCategory)
      ).toThrow()
    })
  })

  describe('Update Category Schema', () => {
    it('should validate category updates', () => {
      const validUpdate = {
        name: 'Updated Electronics',
        description: 'Updated description',
      }

      const result = validateRequest(updateCategorySchema, validUpdate)
      expect(result.name).toBe('Updated Electronics')
      expect(result.description).toBe('Updated description')
    })

    it('should allow partial updates', () => {
      const partialUpdate = {
        description: 'Updated description only',
      }

      const result = validateRequest(updateCategorySchema, partialUpdate)
      expect(result.description).toBe('Updated description only')
      expect(result.name).toBeUndefined()
    })

    it('should validate name length in updates', () => {
      const invalidUpdate = {
        name: 'A', // Too short
      }

      expect(() =>
        validateRequest(updateCategorySchema, invalidUpdate)
      ).toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const invalidCategory = {
        name: '',
        description: '',
      }

      expect(() =>
        validateRequest(createCategorySchema, invalidCategory)
      ).toThrow()
    })

    it('should handle null values', () => {
      const invalidCategory = {
        name: null,
        description: null,
      }

      expect(() =>
        validateRequest(createCategorySchema, invalidCategory)
      ).toThrow()
    })

    it('should handle undefined name', () => {
      const invalidCategory = {
        description: 'Valid description',
      }

      expect(() =>
        validateRequest(createCategorySchema, invalidCategory)
      ).toThrow()
    })
  })
})
