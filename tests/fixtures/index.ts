/**
 * Test fixtures for consistent test data
 */

// Category fixtures
export const categoryFixtures = {
  electronics: {
    _id: '507f1f77bcf86cd799439011',
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    slug: 'electronics',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  clothing: {
    _id: '507f1f77bcf86cd799439012',
    name: 'Clothing',
    description: 'Fashion and apparel',
    slug: 'clothing',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  books: {
    _id: '507f1f77bcf86cd799439013',
    name: 'Books',
    description: 'Books and literature',
    slug: 'books',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  inactive: {
    _id: '507f1f77bcf86cd799439014',
    name: 'Inactive Category',
    description: 'This category is inactive',
    slug: 'inactive-category',
    isActive: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
}

// Product fixtures
export const productFixtures = {
  iphone: {
    _id: '507f1f77bcf86cd799439021',
    name: 'iPhone 15',
    description:
      'Latest iPhone with advanced features and improved performance',
    categoryId: categoryFixtures.electronics._id,
    slug: 'iphone-15',
    basePrice: 999.99,
    images: [
      'https://example.com/iphone-1.jpg',
      'https://example.com/iphone-2.jpg',
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  macbook: {
    _id: '507f1f77bcf86cd799439022',
    name: 'MacBook Pro',
    description: 'Professional laptop with M3 chip and Retina display',
    categoryId: categoryFixtures.electronics._id,
    slug: 'macbook-pro',
    basePrice: 1999.99,
    images: ['https://example.com/macbook.jpg'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  tshirt: {
    _id: '507f1f77bcf86cd799439023',
    name: 'Cotton T-Shirt',
    description: 'Comfortable cotton t-shirt in various colors and sizes',
    categoryId: categoryFixtures.clothing._id,
    slug: 'cotton-t-shirt',
    basePrice: 29.99,
    images: ['https://example.com/tshirt.jpg'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  book: {
    _id: '507f1f77bcf86cd799439024',
    name: 'JavaScript: The Good Parts',
    description: 'A comprehensive guide to JavaScript programming',
    categoryId: categoryFixtures.books._id,
    slug: 'javascript-good-parts',
    basePrice: 39.99,
    images: ['https://example.com/js-book.jpg'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  inactive: {
    _id: '507f1f77bcf86cd799439025',
    name: 'Inactive Product',
    description: 'This product is no longer available',
    categoryId: categoryFixtures.electronics._id,
    slug: 'inactive-product',
    basePrice: 99.99,
    images: [],
    isActive: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
}

// SKU fixtures
export const skuFixtures = {
  iphone128Black: {
    _id: '507f1f77bcf86cd799439031',
    productId: productFixtures.iphone._id,
    sku: 'IPH15-128-BLK',
    name: 'iPhone 15 128GB Black',
    price: 999.99,
    inventory: 50,
    attributes: { storage: '128GB', color: 'Black' },
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  iphone256Blue: {
    _id: '507f1f77bcf86cd799439032',
    productId: productFixtures.iphone._id,
    sku: 'IPH15-256-BLU',
    name: 'iPhone 15 256GB Blue',
    price: 1099.99,
    inventory: 30,
    attributes: { storage: '256GB', color: 'Blue' },
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  macbook512: {
    _id: '507f1f77bcf86cd799439033',
    productId: productFixtures.macbook._id,
    sku: 'MBP-512-SLV',
    name: 'MacBook Pro 512GB Silver',
    price: 1999.99,
    inventory: 15,
    attributes: { storage: '512GB', color: 'Silver' },
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  tshirtMediumRed: {
    _id: '507f1f77bcf86cd799439034',
    productId: productFixtures.tshirt._id,
    sku: 'TSH-M-RED',
    name: 'Cotton T-Shirt Medium Red',
    price: 29.99,
    inventory: 100,
    attributes: { size: 'M', color: 'Red' },
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  tshirtLargeBlue: {
    _id: '507f1f77bcf86cd799439035',
    productId: productFixtures.tshirt._id,
    sku: 'TSH-L-BLU',
    name: 'Cotton T-Shirt Large Blue',
    price: 29.99,
    inventory: 75,
    attributes: { size: 'L', color: 'Blue' },
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  outOfStock: {
    _id: '507f1f77bcf86cd799439036',
    productId: productFixtures.iphone._id,
    sku: 'IPH15-512-GLD',
    name: 'iPhone 15 512GB Gold',
    price: 1199.99,
    inventory: 0,
    attributes: { storage: '512GB', color: 'Gold' },
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  inactive: {
    _id: '507f1f77bcf86cd799439037',
    productId: productFixtures.iphone._id,
    sku: 'IPH15-OLD-SKU',
    name: 'iPhone 15 Old SKU',
    price: 899.99,
    inventory: 10,
    attributes: { storage: '64GB', color: 'White' },
    isActive: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
}

// Cart fixtures
export const cartFixtures = {
  empty: {
    _id: '507f1f77bcf86cd799439041',
    sessionId: 'test-session-empty-cart',
    items: [],
    totalAmount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  withItems: {
    _id: '507f1f77bcf86cd799439042',
    sessionId: 'test-session-with-items',
    items: [
      {
        skuId: skuFixtures.iphone128Black._id,
        quantity: 2,
        unitPrice: 999.99,
        subtotal: 1999.98,
      },
      {
        skuId: skuFixtures.tshirtMediumRed._id,
        quantity: 1,
        unitPrice: 29.99,
        subtotal: 29.99,
      },
    ],
    totalAmount: 2029.97,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  singleItem: {
    _id: '507f1f77bcf86cd799439043',
    sessionId: 'test-session-single-item',
    items: [
      {
        skuId: skuFixtures.macbook512._id,
        quantity: 1,
        unitPrice: 1999.99,
        subtotal: 1999.99,
      },
    ],
    totalAmount: 1999.99,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
}

// Session ID fixtures
export const sessionFixtures = {
  valid: 'a0b1c2d3-e4f5-6789-abcd-ef1234567890',
  invalid: 'invalid-session-id',
  expired: 'expired-session-12345',
  new: 'new-session-67890',
}

// Pagination fixtures
export const paginationFixtures = {
  firstPage: {
    page: 1,
    pageSize: 10,
    totalItems: 25,
    totalPages: 3,
    hasNext: true,
    hasPrev: false,
  },
  middlePage: {
    page: 2,
    pageSize: 10,
    totalItems: 25,
    totalPages: 3,
    hasNext: true,
    hasPrev: true,
  },
  lastPage: {
    page: 3,
    pageSize: 10,
    totalItems: 25,
    totalPages: 3,
    hasNext: false,
    hasPrev: true,
  },
  singlePage: {
    page: 1,
    pageSize: 10,
    totalItems: 5,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
}

// API response fixtures
export const apiResponseFixtures = {
  success: (data: any) => ({
    success: true,
    data,
  }),
  error: (code: string, message: string, details?: any[]) => ({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  }),
  validationError: (field: string, message: string) => ({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [{ field, message }],
    },
  }),
  notFoundError: (resource: string) => ({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `${resource} not found`,
    },
  }),
  duplicateError: (resource: string) => ({
    success: false,
    error: {
      code: 'DUPLICATE_RESOURCE',
      message: `${resource} already exists`,
    },
  }),
  inventoryError: (message: string) => ({
    success: false,
    error: {
      code: 'INSUFFICIENT_INVENTORY',
      message,
    },
  }),
}

// Helper to get all fixtures
export const getAllFixtures = () => ({
  categories: categoryFixtures,
  products: productFixtures,
  skus: skuFixtures,
  carts: cartFixtures,
  sessions: sessionFixtures,
  pagination: paginationFixtures,
  apiResponses: apiResponseFixtures,
})

// Helper to get arrays of fixtures
export const getFixtureArrays = () => ({
  categories: Object.values(categoryFixtures),
  products: Object.values(productFixtures),
  skus: Object.values(skuFixtures),
  carts: Object.values(cartFixtures),
})

export default getAllFixtures
