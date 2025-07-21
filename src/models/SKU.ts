import mongoose, { Schema, Model } from 'mongoose'
import { ISKU } from '@/types'

const SKUSchema = new Schema<ISKU>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
      validate: {
        validator: async function (productId: mongoose.Types.ObjectId) {
          const Product = mongoose.model('Product')
          const product = await Product.findOne({
            _id: productId,
            isActive: true,
          })
          return !!product
        },
        message: 'Product must exist and be active',
      },
    },
    sku: {
      type: String,
      required: [true, 'SKU code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (sku: string) {
          // Allow alphanumeric characters and hyphens only
          return /^[A-Z0-9-]+$/.test(sku)
        },
        message: 'SKU must contain only alphanumeric characters and hyphens',
      },
    },
    name: {
      type: String,
      required: [true, 'SKU name is required'],
      trim: true,
      minlength: [2, 'SKU name must be at least 2 characters'],
      maxlength: [200, 'SKU name cannot exceed 200 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    inventory: {
      type: Number,
      required: [true, 'Inventory is required'],
      min: [0, 'Inventory cannot be negative'],
      validate: {
        validator: function (inventory: number) {
          return Number.isInteger(inventory)
        },
        message: 'Inventory must be a whole number',
      },
    },
    attributes: {
      type: Map,
      of: String,
      default: new Map(),
      validate: {
        validator: function (attributes: Map<string, string>) {
          // Ensure all values are strings
          for (const [key, value] of attributes) {
            if (typeof key !== 'string' || typeof value !== 'string') {
              return false
            }
          }
          return true
        },
        message: 'All attribute keys and values must be strings',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Convert Map to Object for JSON serialization
        if (ret.attributes instanceof Map) {
          ret.attributes = Object.fromEntries(ret.attributes)
        }
        return ret
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        // Convert Map to Object for object serialization
        if (ret.attributes instanceof Map) {
          ret.attributes = Object.fromEntries(ret.attributes)
        }
        return ret
      },
    },
  }
)

// Indexes for performance
SKUSchema.index({ sku: 1 })
SKUSchema.index({ productId: 1 })
SKUSchema.index({ isActive: 1 })
SKUSchema.index({ inventory: 1 })
SKUSchema.index({ price: 1 })

// Compound indexes
SKUSchema.index({ productId: 1, isActive: 1 })
SKUSchema.index({ isActive: 1, inventory: 1 })

// Static methods
SKUSchema.statics.findActive = function () {
  return this.find({ isActive: true })
}

SKUSchema.statics.findByProduct = function (productId: string) {
  return this.find({ productId, isActive: true }).populate('productId')
}

SKUSchema.statics.findInStock = function () {
  return this.find({ isActive: true, inventory: { $gt: 0 } })
}

SKUSchema.statics.findBySku = function (sku: string) {
  return this.findOne({ sku, isActive: true }).populate('productId')
}

SKUSchema.statics.checkInventory = function (skuId: string, quantity: number) {
  return this.findOne({
    _id: skuId,
    isActive: true,
    inventory: { $gte: quantity },
  })
}

// Instance methods
SKUSchema.methods.deactivate = function () {
  this.isActive = false
  return this.save()
}

SKUSchema.methods.activate = function () {
  this.isActive = true
  return this.save()
}

SKUSchema.methods.updateInventory = function (quantity: number) {
  if (this.inventory + quantity < 0) {
    throw new Error('Insufficient inventory')
  }
  this.inventory += quantity
  return this.save()
}

SKUSchema.methods.reserveInventory = function (quantity: number) {
  if (this.inventory < quantity) {
    throw new Error('Insufficient inventory to reserve')
  }
  this.inventory -= quantity
  return this.save()
}

SKUSchema.methods.releaseInventory = function (quantity: number) {
  this.inventory += quantity
  return this.save()
}

SKUSchema.methods.isInStock = function (quantity = 1) {
  return this.isActive && this.inventory >= quantity
}

// Virtual for product details
SKUSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
})

const SKU: Model<ISKU> =
  mongoose.models.SKU || mongoose.model<ISKU>('SKU', SKUSchema)

export default SKU
