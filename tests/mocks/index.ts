/**
 * Mock implementations for external dependencies
 */

// Mock Next.js navigation
export const mockNextNavigation = {
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}

// Mock Next.js server components
export const mockNextRequest = (url: string, options: RequestInit = {}) => {
  return {
    url,
    method: options.method || 'GET',
    headers: new Headers(options.headers),
    json: () =>
      Promise.resolve(options.body ? JSON.parse(options.body as string) : {}),
    text: () => Promise.resolve((options.body as string) || ''),
  }
}

export const mockNextResponse = {
  json: (data: any, init?: ResponseInit) => ({
    status: init?.status || 200,
    headers: new Headers(init?.headers),
    json: () => Promise.resolve(data),
  }),
}

// Mock MongoDB/Mongoose
export const mockMongoose = {
  connect: jest.fn().mockResolvedValue(undefined),
  connection: {
    dropDatabase: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    collections: {},
  },
  model: jest.fn(),
  Schema: jest.fn(),
  Types: {
    ObjectId: jest.fn().mockImplementation((id?: string) => ({
      toString: () => id || '507f1f77bcf86cd799439011',
      _id: id || '507f1f77bcf86cd799439011',
    })),
  },
}

// Mock MongoDB Memory Server
export const mockMongoMemoryServer = {
  create: jest.fn().mockResolvedValue({
    getUri: () => 'mongodb://127.0.0.1:27017/test',
    stop: jest.fn().mockResolvedValue(undefined),
  }),
}

// Mock file system operations
export const mockFs = {
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}

// Mock environment variables
export const mockEnv = {
  NODE_ENV: 'test',
  MONGODB_URI: 'mongodb://localhost:27017/ecommerce-test',
  SESSION_SECRET: 'test-secret',
}

// Mock fetch API
export const createMockFetch = (responses: any[] = []) => {
  let callCount = 0

  return jest.fn().mockImplementation(() => {
    const response = responses[callCount] || {
      status: 200,
      json: () => Promise.resolve({}),
    }
    callCount++

    return Promise.resolve({
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText || 'OK',
      headers: new Headers(response.headers || {}),
      json: () => Promise.resolve(response.json || response.data || {}),
      text: () =>
        Promise.resolve(JSON.stringify(response.json || response.data || {})),
    })
  })
}

// Mock console methods for testing
export const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}

// Mock timers
export const mockTimers = {
  setTimeout: jest.fn(),
  clearTimeout: jest.fn(),
  setInterval: jest.fn(),
  clearInterval: jest.fn(),
}

// Mock local storage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}

// Mock session storage
export const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}

// Mock window location
export const mockLocation = {
  href: 'http://localhost:3000/',
  hostname: 'localhost',
  port: '3000',
  protocol: 'http:',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
}

// Mock window object
export const mockWindow = {
  location: mockLocation,
  localStorage: mockLocalStorage,
  sessionStorage: mockSessionStorage,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  scroll: jest.fn(),
  scrollTo: jest.fn(),
  innerWidth: 1024,
  innerHeight: 768,
}

// Mock DOM APIs
export const mockDocument = {
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  getElementById: jest.fn(),
  createElement: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  cookie: '',
  title: 'Test',
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
}

// Mock image loading
export const mockImage = {
  onload: null,
  onerror: null,
  src: '',
  alt: '',
  width: 0,
  height: 0,
}

// Mock API responses
export const mockApiResponses = {
  success: (data: any) => ({
    status: 200,
    json: {
      success: true,
      data,
    },
  }),

  error: (status: number, code: string, message: string) => ({
    status,
    json: {
      success: false,
      error: {
        code,
        message,
      },
    },
  }),

  validationError: (field: string, message: string) => ({
    status: 400,
    json: {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [{ field, message }],
      },
    },
  }),

  notFound: (resource: string) => ({
    status: 404,
    json: {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `${resource} not found`,
      },
    },
  }),

  duplicate: (resource: string) => ({
    status: 409,
    json: {
      success: false,
      error: {
        code: 'DUPLICATE_RESOURCE',
        message: `${resource} already exists`,
      },
    },
  }),
}

// Setup all mocks
export const setupMocks = () => {
  // Setup global mocks
  global.fetch = createMockFetch()
  global.console = mockConsole as any

  // Setup window mocks
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  })

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })

  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
  })

  // Mock environment variables
  Object.assign(process.env, mockEnv)
}

// Clear all mocks
export const clearAllMocks = () => {
  jest.clearAllMocks()

  // Clear mock implementations
  if (global.fetch && 'mockClear' in global.fetch) {
    ;(global.fetch as jest.MockedFunction<any>).mockClear()
  }

  Object.values(mockConsole).forEach((mock) => {
    if ('mockClear' in mock) {
      mock.mockClear()
    }
  })

  Object.values(mockLocalStorage).forEach((mock) => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      mock.mockClear()
    }
  })

  Object.values(mockSessionStorage).forEach((mock) => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      mock.mockClear()
    }
  })
}

export default {
  setupMocks,
  clearAllMocks,
  mockNextNavigation,
  mockNextRequest,
  mockNextResponse,
  mockMongoose,
  mockMongoMemoryServer,
  mockFs,
  mockEnv,
  createMockFetch,
  mockConsole,
  mockTimers,
  mockLocalStorage,
  mockSessionStorage,
  mockLocation,
  mockWindow,
  mockDocument,
  mockImage,
  mockApiResponses,
}
