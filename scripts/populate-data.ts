import { MongoClient, Db, ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce'

// Helper function to generate slugs
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Helper function to generate SKU codes
function generateSKU(
  productName: string,
  attributes: Record<string, string> = {}
): string {
  const baseCode = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 4)

  const attributeCode = Object.values(attributes)
    .join('')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 4)

  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase()

  return `${baseCode}-${attributeCode || randomCode}`
}

// Sample data types
interface CategoryData {
  name: string
  description: string
}

interface ProductData {
  name: string
  description: string
  categoryName: string
  basePrice: number
  images: string[]
}

interface SKUVariation {
  name: string
  attributes: Record<string, string>
  price: number
  inventory: number
}

// Sample data
const categories: CategoryData[] = [
  { name: 'Electronics', description: 'Electronic devices and gadgets' },
  { name: 'Clothing', description: 'Fashion and apparel' },
  {
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies',
  },
  { name: 'Books', description: 'Books and educational materials' },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
  },
]

const products: ProductData[] = [
  // Electronics
  {
    name: 'Wireless Bluetooth Headphones',
    description:
      'High-quality wireless headphones with noise cancellation and 20-hour battery life. Perfect for music lovers and professionals.',
    categoryName: 'Electronics',
    basePrice: 149.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
    ],
  },
  {
    name: 'Smart Fitness Tracker',
    description:
      'Advanced fitness tracker with heart rate monitoring, GPS, and sleep tracking. Water-resistant design for active lifestyles.',
    categoryName: 'Electronics',
    basePrice: 199.99,
    images: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500',
      'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500',
    ],
  },
  {
    name: 'Wireless Charging Pad',
    description:
      'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED charging indicator.',
    categoryName: 'Electronics',
    basePrice: 39.99,
    images: [
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500',
    ],
  },

  // Clothing
  {
    name: 'Premium Cotton T-Shirt',
    description:
      'Soft, breathable 100% organic cotton t-shirt. Perfect for casual wear with a comfortable fit.',
    categoryName: 'Clothing',
    basePrice: 29.99,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500',
    ],
  },
  {
    name: 'Denim Jeans',
    description:
      'Classic straight-fit denim jeans made from premium denim fabric. Durable and stylish for everyday wear.',
    categoryName: 'Clothing',
    basePrice: 79.99,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500',
    ],
  },
  {
    name: 'Winter Jacket',
    description:
      'Warm and waterproof winter jacket with down insulation. Perfect for cold weather conditions.',
    categoryName: 'Clothing',
    basePrice: 189.99,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500',
    ],
  },

  // Home & Garden
  {
    name: 'Ceramic Coffee Mug Set',
    description:
      'Set of 4 elegant ceramic coffee mugs. Dishwasher and microwave safe. Perfect for daily use or gifting.',
    categoryName: 'Home & Garden',
    basePrice: 24.99,
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500',
    ],
  },
  {
    name: 'Indoor Plant Collection',
    description:
      'Collection of 3 low-maintenance indoor plants including pothos, snake plant, and peace lily. Includes decorative pots.',
    categoryName: 'Home & Garden',
    basePrice: 59.99,
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
    ],
  },

  // Books
  {
    name: 'JavaScript Programming Guide',
    description:
      'Comprehensive guide to modern JavaScript programming. Covers ES6+, async programming, and best practices.',
    categoryName: 'Books',
    basePrice: 49.99,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'],
  },
  {
    name: 'The Art of Cooking',
    description:
      'Master cookbook with over 200 recipes from around the world. Includes step-by-step instructions and beautiful photography.',
    categoryName: 'Books',
    basePrice: 34.99,
    images: [
      'https://images.unsplash.com/photo-1589998059171-988d887df646?w=500',
    ],
  },

  // Sports & Outdoors
  {
    name: 'Yoga Mat Premium',
    description:
      'Non-slip premium yoga mat with extra thickness for comfort. Eco-friendly and durable material.',
    categoryName: 'Sports & Outdoors',
    basePrice: 69.99,
    images: ['https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500'],
  },
  {
    name: 'Camping Tent 4-Person',
    description:
      'Spacious 4-person camping tent with easy setup. Waterproof and wind-resistant for outdoor adventures.',
    categoryName: 'Sports & Outdoors',
    basePrice: 159.99,
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500',
    ],
  },
]

// SKU variations for each product
const skuVariations: Record<string, SKUVariation[]> = {
  'Wireless Bluetooth Headphones': [
    {
      name: 'Black',
      attributes: { color: 'Black' },
      price: 149.99,
      inventory: 50,
    },
    {
      name: 'White',
      attributes: { color: 'White' },
      price: 149.99,
      inventory: 30,
    },
    {
      name: 'Blue',
      attributes: { color: 'Blue' },
      price: 159.99,
      inventory: 25,
    },
  ],
  'Smart Fitness Tracker': [
    {
      name: 'Black Band',
      attributes: { color: 'Black', size: 'M' },
      price: 199.99,
      inventory: 40,
    },
    {
      name: 'Pink Band',
      attributes: { color: 'Pink', size: 'S' },
      price: 199.99,
      inventory: 35,
    },
    {
      name: 'Blue Band',
      attributes: { color: 'Blue', size: 'L' },
      price: 199.99,
      inventory: 30,
    },
  ],
  'Wireless Charging Pad': [
    {
      name: 'Standard',
      attributes: { power: '10W' },
      price: 39.99,
      inventory: 100,
    },
  ],
  'Premium Cotton T-Shirt': [
    {
      name: 'Small Black',
      attributes: { size: 'S', color: 'Black' },
      price: 29.99,
      inventory: 60,
    },
    {
      name: 'Medium Black',
      attributes: { size: 'M', color: 'Black' },
      price: 29.99,
      inventory: 80,
    },
    {
      name: 'Large Black',
      attributes: { size: 'L', color: 'Black' },
      price: 29.99,
      inventory: 70,
    },
    {
      name: 'Small White',
      attributes: { size: 'S', color: 'White' },
      price: 29.99,
      inventory: 50,
    },
    {
      name: 'Medium White',
      attributes: { size: 'M', color: 'White' },
      price: 29.99,
      inventory: 75,
    },
    {
      name: 'Large White',
      attributes: { size: 'L', color: 'White' },
      price: 29.99,
      inventory: 65,
    },
  ],
  'Denim Jeans': [
    {
      name: 'Size 30 Dark Wash',
      attributes: { size: '30', wash: 'Dark' },
      price: 79.99,
      inventory: 45,
    },
    {
      name: 'Size 32 Dark Wash',
      attributes: { size: '32', wash: 'Dark' },
      price: 79.99,
      inventory: 55,
    },
    {
      name: 'Size 34 Dark Wash',
      attributes: { size: '34', wash: 'Dark' },
      price: 79.99,
      inventory: 50,
    },
    {
      name: 'Size 30 Light Wash',
      attributes: { size: '30', wash: 'Light' },
      price: 79.99,
      inventory: 35,
    },
    {
      name: 'Size 32 Light Wash',
      attributes: { size: '32', wash: 'Light' },
      price: 79.99,
      inventory: 40,
    },
  ],
  'Winter Jacket': [
    {
      name: 'Size M Navy',
      attributes: { size: 'M', color: 'Navy' },
      price: 189.99,
      inventory: 25,
    },
    {
      name: 'Size L Navy',
      attributes: { size: 'L', color: 'Navy' },
      price: 189.99,
      inventory: 30,
    },
    {
      name: 'Size M Black',
      attributes: { size: 'M', color: 'Black' },
      price: 189.99,
      inventory: 20,
    },
  ],
  'Ceramic Coffee Mug Set': [
    {
      name: 'White Set',
      attributes: { color: 'White', quantity: '4' },
      price: 24.99,
      inventory: 75,
    },
    {
      name: 'Blue Set',
      attributes: { color: 'Blue', quantity: '4' },
      price: 24.99,
      inventory: 60,
    },
  ],
  'Indoor Plant Collection': [
    {
      name: 'Small Pots',
      attributes: { size: 'Small' },
      price: 59.99,
      inventory: 40,
    },
    {
      name: 'Medium Pots',
      attributes: { size: 'Medium' },
      price: 69.99,
      inventory: 35,
    },
  ],
  'JavaScript Programming Guide': [
    {
      name: 'Paperback',
      attributes: { format: 'Paperback' },
      price: 49.99,
      inventory: 100,
    },
    {
      name: 'Hardcover',
      attributes: { format: 'Hardcover' },
      price: 69.99,
      inventory: 50,
    },
  ],
  'The Art of Cooking': [
    {
      name: 'Standard Edition',
      attributes: { edition: 'Standard' },
      price: 34.99,
      inventory: 80,
    },
  ],
  'Yoga Mat Premium': [
    {
      name: 'Purple 6mm',
      attributes: { color: 'Purple', thickness: '6mm' },
      price: 69.99,
      inventory: 45,
    },
    {
      name: 'Blue 6mm',
      attributes: { color: 'Blue', thickness: '6mm' },
      price: 69.99,
      inventory: 50,
    },
    {
      name: 'Black 8mm',
      attributes: { color: 'Black', thickness: '8mm' },
      price: 79.99,
      inventory: 30,
    },
  ],
  'Camping Tent 4-Person': [
    {
      name: 'Green',
      attributes: { color: 'Green', capacity: '4' },
      price: 159.99,
      inventory: 25,
    },
    {
      name: 'Orange',
      attributes: { color: 'Orange', capacity: '4' },
      price: 159.99,
      inventory: 20,
    },
  ],
}

async function populateData(): Promise<void> {
  let client: MongoClient | null = null

  try {
    console.log('🔌 Connecting to MongoDB...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db: Db = client.db()

    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await Promise.all([
      db.collection('carts').deleteMany({}),
      db.collection('skus').deleteMany({}),
      db.collection('products').deleteMany({}),
      db.collection('categories').deleteMany({}),
    ])
    console.log('✅ Existing data cleared')

    // Insert categories
    console.log('📂 Inserting categories...')
    const categoryDocs = categories.map((cat) => ({
      ...cat,
      slug: generateSlug(cat.name),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    const categoryResult = await db
      .collection('categories')
      .insertMany(categoryDocs)
    console.log(`✅ Inserted ${categoryResult.insertedCount} categories`)

    // Create category lookup
    const categoryLookup: Record<string, ObjectId> = {}
    const insertedCategories = await db
      .collection('categories')
      .find()
      .toArray()
    insertedCategories.forEach((cat: any) => {
      categoryLookup[cat.name] = cat._id
    })

    // Insert products
    console.log('📦 Inserting products...')
    const productDocs = products.map((product) => ({
      name: product.name,
      description: product.description,
      categoryId: categoryLookup[product.categoryName],
      slug: generateSlug(product.name),
      basePrice: product.basePrice,
      images: product.images,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    const productResult = await db
      .collection('products')
      .insertMany(productDocs)
    console.log(`✅ Inserted ${productResult.insertedCount} products`)

    // Create product lookup
    const productLookup: Record<string, ObjectId> = {}
    const insertedProducts = await db.collection('products').find().toArray()
    insertedProducts.forEach((product: any) => {
      productLookup[product.name] = product._id
    })

    // Insert SKUs
    console.log('🏷️ Inserting SKUs...')
    const skuDocs: any[] = []

    for (const [productName, variations] of Object.entries(skuVariations)) {
      const productId = productLookup[productName]
      if (productId) {
        variations.forEach((variation) => {
          skuDocs.push({
            productId: productId,
            sku: generateSKU(productName, variation.attributes),
            name: `${productName} - ${variation.name}`,
            price: variation.price,
            inventory: variation.inventory,
            attributes: variation.attributes,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        })
      }
    }

    const skuResult = await db.collection('skus').insertMany(skuDocs)
    console.log(`✅ Inserted ${skuResult.insertedCount} SKUs`)

    // Insert sample carts
    console.log('🛒 Inserting sample carts...')
    const insertedSKUs = await db.collection('skus').find().toArray()

    // Create 3 sample carts
    const cartDocs: any[] = []
    for (let i = 0; i < 3; i++) {
      const sessionId = uuidv4()
      const numItems = Math.floor(Math.random() * 4) + 1 // 1-4 items per cart
      const cartItems: any[] = []
      const usedSKUs = new Set<string>()

      for (let j = 0; j < numItems; j++) {
        let randomSKU: any
        do {
          randomSKU =
            insertedSKUs[Math.floor(Math.random() * insertedSKUs.length)]
        } while (usedSKUs.has(randomSKU._id.toString()))

        usedSKUs.add(randomSKU._id.toString())

        const quantity = Math.floor(Math.random() * 3) + 1 // 1-3 quantity
        const subtotal = Math.round(quantity * randomSKU.price * 100) / 100

        cartItems.push({
          skuId: randomSKU._id,
          quantity: quantity,
          unitPrice: randomSKU.price,
          subtotal: subtotal,
        })
      }

      const totalAmount =
        Math.round(
          cartItems.reduce((sum, item) => sum + item.subtotal, 0) * 100
        ) / 100

      cartDocs.push({
        sessionId: sessionId,
        items: cartItems,
        totalAmount: totalAmount,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const cartResult = await db.collection('carts').insertMany(cartDocs)
    console.log(`✅ Inserted ${cartResult.insertedCount} sample carts`)

    // Print summary
    console.log('\n📊 Data Population Summary:')
    console.log(`📂 Categories: ${categoryResult.insertedCount}`)
    console.log(`📦 Products: ${productResult.insertedCount}`)
    console.log(`🏷️ SKUs: ${skuResult.insertedCount}`)
    console.log(`🛒 Sample Carts: ${cartResult.insertedCount}`)

    // Print some sample data for verification
    console.log('\n🔍 Sample Data Preview:')

    const sampleCategory = await db.collection('categories').findOne()
    if (sampleCategory) {
      console.log('Sample Category:', {
        name: sampleCategory.name,
        slug: sampleCategory.slug,
      })
    }

    const sampleProduct = await db.collection('products').findOne()
    if (sampleProduct) {
      console.log('Sample Product:', {
        name: sampleProduct.name,
        slug: sampleProduct.slug,
        basePrice: sampleProduct.basePrice,
      })
    }

    const sampleSKU = await db.collection('skus').findOne()
    if (sampleSKU) {
      console.log('Sample SKU:', {
        sku: sampleSKU.sku,
        name: sampleSKU.name,
        price: sampleSKU.price,
        inventory: sampleSKU.inventory,
        attributes: sampleSKU.attributes,
      })
    }

    const sampleCart = await db.collection('carts').findOne()
    if (sampleCart) {
      console.log('Sample Cart:', {
        sessionId: sampleCart.sessionId,
        itemCount: sampleCart.items.length,
        totalAmount: sampleCart.totalAmount,
      })
    }

    console.log('\n🎉 Data population completed successfully!')
  } catch (error) {
    console.error('❌ Error populating data:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Database connection closed')
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  populateData()
}

export { populateData }
