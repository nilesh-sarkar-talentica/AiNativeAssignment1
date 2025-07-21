import mongoose, { Schema, Model } from 'mongoose'
import slugify from 'slugify'
import { ICategory } from '@/types'

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [100, 'Category name cannot exceed 100 characters'],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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
CategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})

// Indexes for performance
CategorySchema.index({ slug: 1 })
CategorySchema.index({ name: 1 })
CategorySchema.index({ isActive: 1 })

// Static methods
CategorySchema.statics.findActive = function () {
  return this.find({ isActive: true })
}

CategorySchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isActive: true })
}

// Instance methods
CategorySchema.methods.deactivate = function () {
  this.isActive = false
  return this.save()
}

CategorySchema.methods.activate = function () {
  this.isActive = true
  return this.save()
}

// Virtual for product count (to be populated when needed)
CategorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId',
  count: true,
})

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>('Category', CategorySchema)

export default Category
