import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { ICategory, IProduct, ISKU, ICart } from '@/types'

let mongoServer: MongoMemoryServer

/**
 * Connect to MongoDB Memory Server for testing
 */
export const connectTestDB = async (): Promise<void> => {
  try {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()

    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB Memory Server')
  } catch (error) {
    console.error('Failed to connect to test database:', error)
    throw error
  }
}

/**
 * Disconnect and cleanup test database
 */
export const disconnectTestDB = async (): Promise<void> => {
  try {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()

    if (mongoServer) {
      await mongoServer.stop()
    }
    console.log('Disconnected from MongoDB Memory Server')
  } catch (error) {
    console.error('Failed to disconnect from test database:', error)
    throw error
  }
}

/**
 * Clear all collections in the test database
 */
export const clearTestDB = async (): Promise<void> => {
  try {
    const collections = mongoose.connection.collections

    for (const key in collections) {
      const collection = collections[key]
      await collection.deleteMany({})
    }
  } catch (error) {
    console.error('Failed to clear test database:', error)
    throw error
  }
}

/**
 * Create test data for categories
 */
export const createTestCategories = async (): Promise<ICategory[]> => {
  const Category = mongoose.model('Category')

  const categoriesData = [
    {
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      slug: 'electronics',
      isActive: true,
    },
    {
      name: 'Clothing',
      description: 'Fashion and apparel',
      slug: 'clothing',
      isActive: true,
    },
    {
      name: 'Books',
      description: 'Books and literature',
      slug: 'books',
      isActive: true,
    },
  ]

  const categories = await Category.insertMany(categoriesData)
  return categories
}

/**
 * Create test data for products
 */
export const createTestProducts = async (
  categoryIds: string[]
): Promise<IProduct[]> => {
  const Product = mongoose.model('Product')

  const productsData = [
    {
      name: 'iPhone 15',
      description:
        'Latest iPhone with advanced features and improved performance',
      categoryId: categoryIds[0], // Electronics
      slug: 'iphone-15',
      basePrice: 999.99,
      images: [
        'https://example.com/iphone1.jpg',
        'https://example.com/iphone2.jpg',
      ],
      isActive: true,
    },
    {
      name: 'MacBook Pro',
      description: 'Professional laptop with M3 chip and Retina display',
      categoryId: categoryIds[0], // Electronics
      slug: 'macbook-pro',
      basePrice: 1999.99,
      images: ['https://example.com/macbook1.jpg'],
      isActive: true,
    },
    {
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt in various colors',
      categoryId: categoryIds[1], // Clothing
      slug: 'cotton-t-shirt',
      basePrice: 29.99,
      images: ['https://example.com/tshirt1.jpg'],
      isActive: true,
    },
  ]

  const products = await Product.insertMany(productsData)
  return products
}

/**
 * Create test data for SKUs
 */
export const createTestSKUs = async (productIds: string[]): Promise<ISKU[]> => {
  const SKU = mongoose.model('SKU')

  const skusData = [
    {
      productId: productIds[0], // iPhone 15
      sku: 'IPH15-128-BLK',
      name: 'iPhone 15 128GB Black',
      price: 999.99,
      inventory: 50,
      attributes: { storage: '128GB', color: 'Black' },
      isActive: true,
    },
    {
      productId: productIds[0], // iPhone 15
      sku: 'IPH15-256-BLU',
      name: 'iPhone 15 256GB Blue',
      price: 1099.99,
      inventory: 30,
      attributes: { storage: '256GB', color: 'Blue' },
      isActive: true,
    },
    {
      productId: productIds[1], // MacBook Pro
      sku: 'MBP-512-SLV',
      name: 'MacBook Pro 512GB Silver',
      price: 1999.99,
      inventory: 15,
      attributes: { storage: '512GB', color: 'Silver' },
      isActive: true,
    },
    {
      productId: productIds[2], // T-Shirt
      sku: 'TSH-M-RED',
      name: 'Cotton T-Shirt Medium Red',
      price: 29.99,
      inventory: 100,
      attributes: { size: 'M', color: 'Red' },
      isActive: true,
    },
    {
      productId: productIds[2], // T-Shirt
      sku: 'TSH-L-BLU',
      name: 'Cotton T-Shirt Large Blue',
      price: 29.99,
      inventory: 75,
      attributes: { size: 'L', color: 'Blue' },
      isActive: true,
    },
  ]

  const skus = await SKU.insertMany(skusData)
  return skus
}

/**
 * Create a test cart with items
 */
export const createTestCart = async (
  sessionId: string,
  skuIds: string[]
): Promise<ICart> => {
  const Cart = mongoose.model('Cart')

  const cartData = {
    sessionId,
    items: [
      {
        skuId: skuIds[0],
        quantity: 2,
        unitPrice: 999.99,
        subtotal: 1999.98,
      },
      {
        skuId: skuIds[3],
        quantity: 1,
        unitPrice: 29.99,
        subtotal: 29.99,
      },
    ],
    totalAmount: 2029.97,
  }

  const cart = await Cart.create(cartData)
  return cart
}

/**
 * Setup complete test data suite
 */
export const setupTestData = async () => {
  const categories = await createTestCategories()
  const categoryIds = categories.map((cat) => cat._id.toString())

  const products = await createTestProducts(categoryIds)
  const productIds = products.map((prod) => prod._id.toString())

  const skus = await createTestSKUs(productIds)
  const skuIds = skus.map((sku) => sku._id.toString())

  const sessionId = 'test-session-12345-67890-abcdef'
  const cart = await createTestCart(sessionId, skuIds)

  return {
    categories,
    products,
    skus,
    cart,
    categoryIds,
    productIds,
    skuIds,
    sessionId,
  }
}

/**
 * Get a valid ObjectId for testing
 */
export const getValidObjectId = (): string => {
  return new mongoose.Types.ObjectId().toString()
}

/**
 * Get an invalid ObjectId for testing
 */
export const getInvalidObjectId = (): string => {
  return 'invalid-object-id'
}

/**
 * Generate a test UUID for session testing
 */
export const generateTestSessionId = (): string => {
  return 'test-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now()
}
