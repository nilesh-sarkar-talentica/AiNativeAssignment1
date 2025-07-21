import request from 'supertest'
import { createServer } from 'http'
import { NextRequest } from 'next/server'
import { ApiResponse, ErrorCode } from '@/types'

// Create a test server for API routes
export const createTestServer = () => {
  return createServer()
}

/**
 * Helper to make API requests with proper headers
 */
export class ApiTestHelper {
  private sessionId?: string

  constructor(sessionId?: string) {
    this.sessionId = sessionId
  }

  setSessionId(sessionId: string) {
    this.sessionId = sessionId
  }

  /**
   * Make a GET request
   */
  async get(url: string, headers: Record<string, string> = {}) {
    const allHeaders = {
      'Content-Type': 'application/json',
      ...(this.sessionId && { 'X-Session-Id': this.sessionId }),
      ...headers,
    }

    return request(createTestServer()).get(url).set(allHeaders)
  }

  /**
   * Make a POST request
   */
  async post(
    url: string,
    body: any = {},
    headers: Record<string, string> = {}
  ) {
    const allHeaders = {
      'Content-Type': 'application/json',
      ...(this.sessionId && { 'X-Session-Id': this.sessionId }),
      ...headers,
    }

    return request(createTestServer()).post(url).set(allHeaders).send(body)
  }

  /**
   * Make a PUT request
   */
  async put(url: string, body: any = {}, headers: Record<string, string> = {}) {
    const allHeaders = {
      'Content-Type': 'application/json',
      ...(this.sessionId && { 'X-Session-Id': this.sessionId }),
      ...headers,
    }

    return request(createTestServer()).put(url).set(allHeaders).send(body)
  }

  /**
   * Make a DELETE request
   */
  async delete(url: string, headers: Record<string, string> = {}) {
    const allHeaders = {
      'Content-Type': 'application/json',
      ...(this.sessionId && { 'X-Session-Id': this.sessionId }),
      ...headers,
    }

    return request(createTestServer()).delete(url).set(allHeaders)
  }
}

/**
 * Response assertion helpers
 */
export const expectSuccessResponse = (response: any, expectedStatus = 200) => {
  expect(response.status).toBe(expectedStatus)
  expect(response.body).toHaveProperty('success', true)
  expect(response.body).toHaveProperty('data')
  return response.body.data
}

export const expectErrorResponse = (
  response: any,
  expectedStatus: number,
  expectedCode?: ErrorCode
) => {
  expect(response.status).toBe(expectedStatus)
  expect(response.body).toHaveProperty('success', false)
  expect(response.body).toHaveProperty('error')

  if (expectedCode) {
    expect(response.body.error).toHaveProperty('code', expectedCode)
  }

  return response.body.error
}

export const expectValidationError = (response: any, field?: string) => {
  const error = expectErrorResponse(response, 400, 'VALIDATION_ERROR')

  if (field) {
    expect(error).toHaveProperty('details')
    expect(Array.isArray(error.details)).toBe(true)

    const fieldError = error.details.find(
      (detail: any) => detail.field === field
    )
    expect(fieldError).toBeTruthy()
  }

  return error
}

export const expectNotFoundError = (response: any) => {
  return expectErrorResponse(response, 404, 'NOT_FOUND')
}

export const expectDuplicateError = (response: any) => {
  return expectErrorResponse(response, 409, 'DUPLICATE_RESOURCE')
}

export const expectInventoryError = (response: any) => {
  return expectErrorResponse(response, 400, 'INSUFFICIENT_INVENTORY')
}

/**
 * Pagination assertion helper
 */
export const expectPaginatedResponse = (data: any, page = 1, pageSize = 10) => {
  expect(data).toHaveProperty('pagination')
  expect(data.pagination).toHaveProperty('page', page)
  expect(data.pagination).toHaveProperty('pageSize', pageSize)
  expect(data.pagination).toHaveProperty('totalItems')
  expect(data.pagination).toHaveProperty('totalPages')
  expect(data.pagination).toHaveProperty('hasNext')
  expect(data.pagination).toHaveProperty('hasPrev')

  return data.pagination
}

/**
 * Category response assertion
 */
export const expectCategoryResponse = (category: any) => {
  expect(category).toHaveProperty('_id')
  expect(category).toHaveProperty('name')
  expect(category).toHaveProperty('slug')
  expect(category).toHaveProperty('isActive')
  expect(category).toHaveProperty('createdAt')
  expect(category).toHaveProperty('updatedAt')

  return category
}

/**
 * Product response assertion
 */
export const expectProductResponse = (
  product: any,
  withCategory = false,
  withSKUs = false
) => {
  expect(product).toHaveProperty('_id')
  expect(product).toHaveProperty('name')
  expect(product).toHaveProperty('description')
  expect(product).toHaveProperty('categoryId')
  expect(product).toHaveProperty('slug')
  expect(product).toHaveProperty('basePrice')
  expect(product).toHaveProperty('images')
  expect(product).toHaveProperty('isActive')
  expect(product).toHaveProperty('createdAt')
  expect(product).toHaveProperty('updatedAt')

  if (withCategory) {
    expect(product).toHaveProperty('category')
    expectCategoryResponse(product.category)
  }

  if (withSKUs) {
    expect(product).toHaveProperty('skus')
    expect(Array.isArray(product.skus)).toBe(true)
  }

  return product
}

/**
 * SKU response assertion
 */
export const expectSKUResponse = (sku: any, withProduct = false) => {
  expect(sku).toHaveProperty('_id')
  expect(sku).toHaveProperty('productId')
  expect(sku).toHaveProperty('sku')
  expect(sku).toHaveProperty('name')
  expect(sku).toHaveProperty('price')
  expect(sku).toHaveProperty('inventory')
  expect(sku).toHaveProperty('attributes')
  expect(sku).toHaveProperty('isActive')
  expect(sku).toHaveProperty('createdAt')
  expect(sku).toHaveProperty('updatedAt')

  if (withProduct) {
    expect(sku).toHaveProperty('productId')
    // Product might be populated as an object
    if (typeof sku.productId === 'object') {
      expectProductResponse(sku.productId)
    }
  }

  return sku
}

/**
 * Cart response assertion
 */
export const expectCartResponse = (cart: any, withDetails = false) => {
  expect(cart).toHaveProperty('_id')
  expect(cart).toHaveProperty('sessionId')
  expect(cart).toHaveProperty('items')
  expect(cart).toHaveProperty('totalAmount')
  expect(cart).toHaveProperty('createdAt')
  expect(cart).toHaveProperty('updatedAt')

  expect(Array.isArray(cart.items)).toBe(true)

  cart.items.forEach((item: any) => {
    expect(item).toHaveProperty('skuId')
    expect(item).toHaveProperty('quantity')
    expect(item).toHaveProperty('unitPrice')
    expect(item).toHaveProperty('subtotal')

    if (withDetails && typeof item.skuId === 'object') {
      expectSKUResponse(item.skuId, true)
    }
  })

  return cart
}

/**
 * Mock NextRequest for API route testing
 */
export const createMockRequest = (
  method: string,
  url: string,
  body?: any,
  headers?: Record<string, string>
): NextRequest => {
  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  return request
}

/**
 * Test data validation helpers
 */
export const createValidCategoryData = () => ({
  name: 'Test Category',
  description: 'Test category description',
})

export const createValidProductData = (categoryId: string) => ({
  name: 'Test Product',
  description: 'Test product description with sufficient length',
  categoryId,
  basePrice: 99.99,
  images: ['https://example.com/test.jpg'],
})

export const createValidSKUData = () => ({
  sku: 'TEST-SKU-001',
  name: 'Test SKU',
  price: 99.99,
  inventory: 10,
  attributes: { color: 'blue', size: 'M' },
})

export const createValidCartItemData = (skuId: string) => ({
  skuId,
  quantity: 2,
})

/**
 * Generate random test data
 */
export const generateRandomString = (length = 8): string => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
}

export const generateRandomNumber = (min = 1, max = 100): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const generateRandomEmail = (): string => {
  return `test.${generateRandomString()}@example.com`
}

/**
 * Sleep utility for async testing
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
