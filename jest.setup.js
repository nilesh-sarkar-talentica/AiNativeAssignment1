import '@testing-library/jest-dom'

// Polyfill for Web APIs needed by Next.js
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Web APIs for Next.js
Object.defineProperty(globalThis, 'Request', {
  value: class Request {
    constructor(input, init) {
      this.url = input
      this.method = init?.method || 'GET'
      this.headers = new Map(Object.entries(init?.headers || {}))
      this.body = init?.body
    }

    async json() {
      return JSON.parse(this.body || '{}')
    }

    async text() {
      return this.body || ''
    }
  },
})

Object.defineProperty(globalThis, 'Response', {
  value: class Response {
    constructor(body, init) {
      this.body = body
      this.status = init?.status || 200
      this.statusText = init?.statusText || 'OK'
      this.headers = new Map(Object.entries(init?.headers || {}))
    }

    async json() {
      return JSON.parse(this.body || '{}')
    }

    async text() {
      return this.body || ''
    }
  },
})

Object.defineProperty(globalThis, 'Headers', {
  value: Map,
})

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
