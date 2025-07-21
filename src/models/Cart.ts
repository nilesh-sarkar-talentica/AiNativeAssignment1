import mongoose, { Schema, Model } from 'mongoose'
import { ICart, ICartItem, ICartModel } from '@/types'

const CartItemSchema = new Schema<ICartItem>(
  {
    skuId: {
      type: Schema.Types.ObjectId,
      ref: 'SKU',
      required: [true, 'SKU is required'],
      validate: {
        validator: async function (skuId: mongoose.Types.ObjectId) {
          const SKU = mongoose.model('SKU')
          const sku = await SKU.findOne({ _id: skuId, isActive: true })
          return !!sku
        },
        message: 'SKU must exist and be active',
      },
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [99, 'Quantity cannot exceed 99'],
      validate: {
        validator: function (quantity: number) {
          return Number.isInteger(quantity)
        },
        message: 'Quantity must be a whole number',
      },
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
  },
  {
    _id: false, // Don't create separate _id for subdocuments
  }
)

// Calculate subtotal before saving cart item
CartItemSchema.pre('save', function (next) {
  this.subtotal = Math.round(this.quantity * this.unitPrice * 100) / 100
  next()
})

const CartSchema = new Schema<ICart>(
  {
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function (sessionId: string) {
          // Basic UUID format validation
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            sessionId
          )
        },
        message: 'Session ID must be a valid UUID format',
      },
    },
    items: {
      type: [CartItemSchema],
      default: [],
      validate: {
        validator: function (items: ICartItem[]) {
          // Check for duplicate SKUs
          const skuIds = items.map((item) => item.skuId.toString())
          return skuIds.length === new Set(skuIds).size
        },
        message: 'Cart cannot contain duplicate SKUs',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Calculate total amount before saving
CartSchema.pre('save', function (next) {
  // Recalculate subtotals for all items
  this.items.forEach((item) => {
    item.subtotal = Math.round(item.quantity * item.unitPrice * 100) / 100
  })

  // Calculate total amount
  this.totalAmount =
    Math.round(
      this.items.reduce((total, item) => total + item.subtotal, 0) * 100
    ) / 100

  next()
})

// Indexes for performance
CartSchema.index({ sessionId: 1 })
CartSchema.index({ 'items.skuId': 1 })
CartSchema.index({ updatedAt: 1 })

// Static methods
CartSchema.statics.findBySession = function (sessionId: string) {
  return this.findOne({ sessionId }).populate({
    path: 'items.skuId',
    populate: {
      path: 'productId',
      model: 'Product',
      populate: {
        path: 'categoryId',
        model: 'Category',
      },
    },
  })
}

CartSchema.statics.createForSession = function (sessionId: string) {
  return this.create({ sessionId, items: [], totalAmount: 0 })
}

CartSchema.statics.findOrCreateBySession = async function (sessionId: string) {
  let cart = await this.findBySession(sessionId)
  if (!cart) {
    cart = await this.createForSession(sessionId)
  }
  return cart
}

CartSchema.statics.cleanupExpired = function (daysOld = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  return this.deleteMany({
    updatedAt: { $lt: cutoffDate },
  })
}

// Instance methods
CartSchema.methods.addItem = async function (
  skuId: string,
  quantity: number,
  unitPrice: number
) {
  // Check if item already exists
  const existingItemIndex = this.items.findIndex(
    (item) => item.skuId.toString() === skuId
  )

  if (existingItemIndex >= 0) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity

    // Ensure quantity doesn't exceed max
    if (this.items[existingItemIndex].quantity > 99) {
      this.items[existingItemIndex].quantity = 99
    }
  } else {
    // Add new item
    this.items.push({
      skuId: new mongoose.Types.ObjectId(skuId),
      quantity,
      unitPrice,
      subtotal: 0, // Will be calculated in pre-save
    })
  }

  return this.save()
}

CartSchema.methods.updateItem = function (skuId: string, quantity: number) {
  const itemIndex = this.items.findIndex(
    (item) => item.skuId.toString() === skuId
  )

  if (itemIndex === -1) {
    throw new Error('Item not found in cart')
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    this.items.splice(itemIndex, 1)
  } else {
    // Update quantity (ensure it doesn't exceed max)
    this.items[itemIndex].quantity = Math.min(quantity, 99)
  }

  return this.save()
}

CartSchema.methods.removeItem = function (skuId: string) {
  const itemIndex = this.items.findIndex(
    (item) => item.skuId.toString() === skuId
  )

  if (itemIndex === -1) {
    throw new Error('Item not found in cart')
  }

  this.items.splice(itemIndex, 1)
  return this.save()
}

CartSchema.methods.clearItems = function () {
  this.items = []
  return this.save()
}

CartSchema.methods.getItemCount = function () {
  return this.items.reduce((total, item) => total + item.quantity, 0)
}

CartSchema.methods.hasItem = function (skuId: string) {
  return this.items.some((item) => item.skuId.toString() === skuId)
}

CartSchema.methods.getItem = function (skuId: string) {
  return this.items.find((item) => item.skuId.toString() === skuId)
}

// Virtual for item count
CartSchema.virtual('itemCount').get(function () {
  return this.getItemCount()
})

const Cart: ICartModel =
  (mongoose.models.Cart as ICartModel) ||
  mongoose.model<ICart, ICartModel>('Cart', CartSchema)

export default Cart
