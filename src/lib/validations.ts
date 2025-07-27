import { z } from 'zod'

// Category validation schemas
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name cannot exceed 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional(),
})

export const updateCategorySchema = createCategorySchema.partial()

export const categoryParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),
})

// Product validation schemas
export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name cannot exceed 200 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),
  categoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),
  basePrice: z
    .number()
    .min(0, 'Base price cannot be negative')
    .finite('Base price must be a valid number'),
  images: z.array(z.string().url('Invalid image URL')).default([]),
})

export const updateProductSchema = createProductSchema.partial()

export const productParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
})

export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format')
    .optional(),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val))
    .pipe(z.number().int().min(1, 'Page must be at least 1')),
  pageSize: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val))
    .pipe(
      z.number().int().min(1).max(100, 'Page size must be between 1 and 100')
    ),
})

// SKU validation schemas
export const createSKUSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU is required')
    .transform((val) => val.toUpperCase())
    .refine(
      (val) => /^[A-Z0-9-]+$/.test(val),
      'SKU must contain only alphanumeric characters and hyphens'
    ),
  name: z
    .string()
    .min(2, 'SKU name must be at least 2 characters')
    .max(200, 'SKU name cannot exceed 200 characters')
    .trim(),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .finite('Price must be a valid number'),
  inventory: z
    .number()
    .int('Inventory must be a whole number')
    .min(0, 'Inventory cannot be negative'),
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
  attributes: z.record(z.string()).default({}),
})

export const updateSKUSchema = createSKUSchema.partial()

export const skuParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid SKU ID format'),
})

export const productSKUParamsSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
})

// Cart validation schemas
export const sessionHeaderSchema = z.object({
  'x-session-id': z.string().uuid('Session ID must be a valid UUID').optional(),
})

export const addCartItemSchema = z.object({
  skuId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid SKU ID format'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Quantity cannot exceed 99'),
})

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Quantity cannot exceed 99'),
})

export const cartItemParamsSchema = z.object({
  skuId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid SKU ID format'),
})

// Generic validation schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
})

// Request body validation for JSON parsing
export const parseJsonBody = async (request: Request) => {
  try {
    return await request.json()
  } catch (error) {
    throw new Error('Invalid JSON body')
  }
}

// Validation helper function
export const validateRequest = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T => {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    const error = new Error('Validation failed')
    ;(error as any).code = 'VALIDATION_ERROR'
    ;(error as any).details = errors
    throw error
  }
  return result.data
}

// Type exports for better TypeScript support
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQueryInput = {
  search?: string
  categoryId?: string
  page?: string
  pageSize?: string
}

export type ProductQuery = {
  search?: string
  categoryId?: string
  page: number
  pageSize: number
}
export type CreateSKUInput = z.infer<typeof createSKUSchema>
export type UpdateSKUInput = z.infer<typeof updateSKUSchema>
export type AddCartItemInput = z.infer<typeof addCartItemSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
