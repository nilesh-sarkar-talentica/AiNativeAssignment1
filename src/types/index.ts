import { Document, Types, Model } from 'mongoose'

// Base interfaces for MongoDB documents
export interface BaseDocument extends Document {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Category interfaces
export interface ICategory extends BaseDocument {
  name: string
  description?: string
  slug: string
  isActive: boolean
}

export interface ICategoryInput {
  name: string
  description?: string
}

// Product interfaces
export interface IProduct extends BaseDocument {
  name: string
  description: string
  categoryId: Types.ObjectId
  slug: string
  basePrice: number
  images: string[]
  isActive: boolean
}

export interface IProductInput {
  name: string
  description: string
  categoryId: string
  basePrice: number
  images?: string[]
}

export interface IProductWithCategory extends IProduct {
  category?: ICategory
}

export interface IProductWithSKUs extends IProductWithCategory {
  skus?: ISKU[]
}

// SKU interfaces
export interface ISKU extends BaseDocument {
  productId: Types.ObjectId
  sku: string
  name: string
  price: number
  inventory: number
  attributes: Record<string, string>
  isActive: boolean
}

export interface ISKUInput {
  sku: string
  name: string
  price: number
  inventory: number
  attributes?: Record<string, string>
}

export interface ISKUWithProduct extends ISKU {
  product?: IProduct
}

// Cart interfaces
export interface ICartItem {
  skuId: Types.ObjectId
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface ICart extends BaseDocument {
  sessionId: string
  items: ICartItem[]
  totalAmount: number
  // Instance methods
  addItem(skuId: string, quantity: number, unitPrice: number): Promise<ICart>
  updateItem(skuId: string, quantity: number): Promise<ICart>
  removeItem(skuId: string): Promise<ICart>
  clearItems(): Promise<ICart>
  getItemCount(): number
  hasItem(skuId: string): boolean
  getItem(skuId: string): ICartItem | undefined
}

export interface ICartModel extends Model<ICart> {
  findBySession(sessionId: string): Promise<ICart | null>
  createForSession(sessionId: string): Promise<ICart>
  findOrCreateBySession(sessionId: string): Promise<ICart>
  cleanupExpired(daysOld?: number): Promise<any>
}

export interface ICartItemInput {
  skuId: string
  quantity: number
}

export interface ICartWithDetails extends ICart {
  items: Array<
    ICartItem & {
      sku?: ISKUWithProduct
    }
  >
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: any
}

export interface ApiError {
  code: string
  message: string
  details?: any[]
}

// Pagination interfaces
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

// Search and filter interfaces
export interface ProductFilters {
  search?: string
  categoryId?: string
  page?: number
  pageSize?: number
}

// Error types
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DUPLICATE_RESOURCE'
  | 'INSUFFICIENT_INVENTORY'
  | 'SESSION_REQUIRED'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMIT_EXCEEDED'

// Session types
export interface SessionInfo {
  sessionId: string
  isNew: boolean
}
