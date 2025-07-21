import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock router for Next.js testing
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

const mockSearchParams = new URLSearchParams()

/**
 * Custom render function that includes providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withProviders?: boolean
}

export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  return render(ui, options)
}

/**
 * Create user event instance for testing interactions
 */
export const createUserEvent = () => {
  return userEvent.setup()
}

/**
 * Mock fetch for API calls
 */
export const mockFetch = (mockResponse: any, status = 200) => {
  const mockFetchPromise = Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(mockResponse),
    text: () => Promise.resolve(JSON.stringify(mockResponse)),
  } as Response)

  global.fetch = jest.fn().mockResolvedValue(mockFetchPromise.then((r) => r))
  return global.fetch as jest.MockedFunction<typeof fetch>
}

/**
 * Mock successful API response
 */
export const mockApiSuccess = (data: any, status = 200) => {
  return mockFetch(
    {
      success: true,
      data,
    },
    status
  )
}

/**
 * Mock API error response
 */
export const mockApiError = (
  code: string,
  message: string,
  status = 400,
  details?: any[]
) => {
  return mockFetch(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    status
  )
}

/**
 * Mock router methods
 */
export const getMockRouter = () => mockRouter

export const resetMockRouter = () => {
  Object.values(mockRouter).forEach((mock) => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      ;(mock as jest.MockedFunction<any>).mockClear()
    }
  })
}

/**
 * Mock search params for testing
 */
export const setMockSearchParams = (params: Record<string, string>) => {
  // Clear existing params
  const keys = Array.from(mockSearchParams.keys())
  keys.forEach((key) => mockSearchParams.delete(key))

  Object.entries(params).forEach(([key, value]) => {
    mockSearchParams.set(key, value)
  })
}

export const clearMockSearchParams = () => {
  const keys = Array.from(mockSearchParams.keys())
  keys.forEach((key) => mockSearchParams.delete(key))
}

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * Fire events with proper async handling
 */
export const fireEvent = {
  async click(element: Element) {
    const user = createUserEvent()
    await user.click(element)
  },

  async type(element: Element, text: string) {
    const user = createUserEvent()
    await user.type(element, text)
  },

  async clear(element: Element) {
    const user = createUserEvent()
    await user.clear(element)
  },

  async selectOption(element: Element, option: string | string[]) {
    const user = createUserEvent()
    await user.selectOptions(element, option)
  },
}

/**
 * Common test data generators
 */
export const createMockCategory = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Test Category',
  description: 'Test category description',
  slug: 'test-category',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockProduct = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439012',
  name: 'Test Product',
  description: 'Test product description',
  categoryId: '507f1f77bcf86cd799439011',
  slug: 'test-product',
  basePrice: 99.99,
  images: ['https://example.com/test.jpg'],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockSKU = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439013',
  productId: '507f1f77bcf86cd799439012',
  sku: 'TEST-SKU-001',
  name: 'Test SKU',
  price: 99.99,
  inventory: 10,
  attributes: { color: 'blue', size: 'M' },
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockCartItem = (overrides = {}) => ({
  skuId: createMockSKU(),
  quantity: 2,
  unitPrice: 99.99,
  subtotal: 199.98,
  ...overrides,
})

export const createMockCart = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439014',
  sessionId: 'test-session-12345',
  items: [createMockCartItem()],
  totalAmount: 199.98,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

/**
 * Component testing utilities
 */
export const getByTestId = (container: HTMLElement, testId: string) => {
  const element = container.querySelector(`[data-testid="${testId}"]`)
  if (!element) {
    throw new Error(`Unable to find element with testId: ${testId}`)
  }
  return element
}

export const queryByTestId = (container: HTMLElement, testId: string) => {
  return container.querySelector(`[data-testid="${testId}"]`)
}

/**
 * Form testing utilities
 */
export const fillForm = async (fields: Record<string, string | number>) => {
  const user = createUserEvent()

  for (const [name, value] of Object.entries(fields)) {
    const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (input) {
      await user.clear(input)
      await user.type(input, String(value))
    }
  }
}

export const submitForm = async (form?: HTMLFormElement) => {
  const user = createUserEvent()
  const formElement = form || document.querySelector('form')

  if (formElement) {
    const submitButton = formElement.querySelector(
      '[type="submit"]'
    ) as HTMLButtonElement
    if (submitButton) {
      await user.click(submitButton)
    }
  }
}

/**
 * Cleanup utilities
 */
export const cleanup = () => {
  // Clear all mocks
  jest.clearAllMocks()

  // Reset fetch mock
  if (global.fetch && 'mockClear' in global.fetch) {
    ;(global.fetch as jest.MockedFunction<typeof fetch>).mockClear()
  }

  // Reset router mocks
  resetMockRouter()

  // Clear search params
  clearMockSearchParams()
}

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

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Override the default render with our custom render
export { customRender as render }
