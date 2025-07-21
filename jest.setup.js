import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/ecommerce-test'
process.env.NODE_ENV = 'test'

// Global test utilities
global.fetch = jest.fn()

// Setup for each test
beforeEach(() => {
  fetch.mockClear()
})
