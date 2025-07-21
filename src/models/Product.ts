import mongoose, { Schema, Model } from 'mongoose'
import slugify from 'slugify'
import { IProduct } from '@/types'

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      validate: {
        validator: async function (categoryId: mongoose.Types.ObjectId) {
          const Category = mongoose.model('Category')
          const category = await Category.findOne({
            _id: categoryId,
            isActive: true,
          })
          return !!category
        },
        message: 'Category must exist and be active',
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.every((url) => {
            try {
              new URL(url)
              return true
            } catch {
              return false
            }
          })
        },
        message: 'All images must be valid URLs',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Generate slug before saving
ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})

// Ensure unique slug by appending number if needed
ProductSchema.pre('save', async function (next) {
  if (this.isModified('slug')) {
    const Product = this.constructor as Model<IProduct>
    let slug = this.slug
    let counter = 1

    while (await Product.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${this.slug}-${counter}`
      counter++
    }

    this.slug = slug
  }
  next()
})

// Indexes for performance
ProductSchema.index({ slug: 1 })
ProductSchema.index({ categoryId: 1 })
ProductSchema.index({ name: 'text', description: 'text' })
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ createdAt: -1 })

// Static methods
ProductSchema.statics.findActive = function () {
  return this.find({ isActive: true })
}

ProductSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isActive: true }).populate('categoryId')
}

ProductSchema.statics.findByCategory = function (categoryId: string) {
  return this.find({ categoryId, isActive: true }).populate('categoryId')
}

ProductSchema.statics.search = function (query: string, options = {}) {
  return this.find({
    $text: { $search: query },
    isActive: true,
    ...options,
  }).populate('categoryId')
}

// Instance methods
ProductSchema.methods.deactivate = function () {
  this.isActive = false
  return this.save()
}

ProductSchema.methods.activate = function () {
  this.isActive = true
  return this.save()
}

// Virtual for SKU count
ProductSchema.virtual('skuCount', {
  ref: 'SKU',
  localField: '_id',
  foreignField: 'productId',
  count: true,
})

// Virtual for active SKUs
ProductSchema.virtual('skus', {
  ref: 'SKU',
  localField: '_id',
  foreignField: 'productId',
  match: { isActive: true },
})

// Virtual for category details
ProductSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
})

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

export default Product
