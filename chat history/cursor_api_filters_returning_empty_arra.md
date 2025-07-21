# Api filters returning empty arrays
_Exported on 7/21/2025 at 17:42:34 GMT+5:30 from Cursor (1.2.4)_

---

**User**

None of the endpoint for filters are working: getting empty array. Here is example request: 
http://localhost:3000/api/products?categoryId=687e0cd9fa768d31182bf00b&page=1&pageSize=12

---

**Cursor**

I'll help you debug the filtering endpoints. Let me first examine the products API endpoint and check what's happening with the filtering logic.

Now let me check the database to see if there's data and understand the issue with the filtering:

---

**User**

There is data, already checked

---

**Cursor**

I can see the issue! In the products API route, there's a problem with how the `categoryId` is being handled. Let me examine the issue more closely:

The issue is in the query building logic. The `categoryId` is being passed as a string from the URL parameters, but MongoDB expects an ObjectId. In the aggregation pipeline, when we're matching against `categoryId`, we need to convert the string to an ObjectId.

Let me fix this:

```typescript
import { connectDB } from '@/lib/mongodb'
import { asyncHandler, createSuccessResponse } from '@/lib/errors'
import {
  validateRequest,
  createProductSchema,
  productQuerySchema,
  parseJsonBody,
} from '@/lib/validations'
import Product from '@/models/Product'
import { PaginationMeta } from '@/types'

->

import { connectDB } from '@/lib/mongodb'
import { asyncHandler, createSuccessResponse } from '@/lib/errors'
import {
  validateRequest,
  createProductSchema,
  productQuerySchema,
  parseJsonBody,
} from '@/lib/validations'
import Product from '@/models/Product'
import { PaginationMeta } from '@/types'
import mongoose from 'mongoose'
```

```typescript
  // Build query
  const query: any = { isActive: true }

  if (categoryId) {
    query.categoryId = categoryId
  }

->

  // Build query
  const query: any = { isActive: true }

  if (categoryId) {
    query.categoryId = new mongoose.Types.ObjectId(categoryId)
  }
```

Now let me also check the categories API route to see if it has similar issues:

Let me also check if there are any other API routes that might have filtering issues:

I notice that in the categories/[id] route, there's also an issue where they're checking for products by category but not converting the `id` to ObjectId. Let me fix that as well:

```typescript
import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwNotFoundError,
  ValidationError,
} from '@/lib/errors'
import {
  validateRequest,
  updateCategorySchema,
  categoryParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import Category from '@/models/Category'
import Product from '@/models/Product'

->

import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwNotFoundError,
  ValidationError,
} from '@/lib/errors'
import {
  validateRequest,
  updateCategorySchema,
  categoryParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import Category from '@/models/Category'
import Product from '@/models/Product'
import mongoose from 'mongoose'
```

```typescript
    // Check if category has products
    const productCount = await Product.countDocuments({
      categoryId: id,
      isActive: true,
    })

->

    // Check if category has products
    const productCount = await Product.countDocuments({
      categoryId: new mongoose.Types.ObjectId(id),
      isActive: true,
    })
```

Now let me check if there are any other places where SKU routes might have similar issues:

I need to fix the SKU routes as well since they're also dealing with ObjectIds:

```typescript
import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwNotFoundError,
} from '@/lib/errors'
import {
  validateRequest,
  createSKUSchema,
  productParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import Product from '@/models/Product'
import SKU from '@/models/SKU'

->

import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwNotFoundError,
} from '@/lib/errors'
import {
  validateRequest,
  createSKUSchema,
  productParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import Product from '@/models/Product'
import SKU from '@/models/SKU'
import mongoose from 'mongoose'
```

```typescript
    // Get SKUs for this product
    const skus = await SKU.find({ productId: id, isActive: true })
      .populate('productId', 'name slug images')
      .sort({ name: 1 })

->

    // Get SKUs for this product
    const skus = await SKU.find({ productId: new mongoose.Types.ObjectId(id), isActive: true })
      .populate('productId', 'name slug images')
      .sort({ name: 1 })
```

```typescript
    // Create SKU
    const sku = new SKU({
      ...validatedData,
      productId: id,
    })

->

    // Create SKU
    const sku = new SKU({
      ...validatedData,
      productId: new mongoose.Types.ObjectId(id),
    })
```

```typescript
import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwNotFoundError,
  ValidationError,
} from '@/lib/errors'
import {
  validateRequest,
  updateSKUSchema,
  skuParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import SKU from '@/models/SKU'
import Cart from '@/models/Cart'

->

import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwNotFoundError,
  ValidationError,
} from '@/lib/errors'
import {
  validateRequest,
  updateSKUSchema,
  skuParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import SKU from '@/models/SKU'
import Cart from '@/models/Cart'
import mongoose from 'mongoose'
```

```typescript
    // Check if SKU is in any carts
    const cartWithSKU = await Cart.findOne({
      'items.skuId': id,
    })

->

    // Check if SKU is in any carts
    const cartWithSKU = await Cart.findOne({
      'items.skuId': new mongoose.Types.ObjectId(id),
    })
```

Let me also check the cart API routes for similar issues:

Let me also check the Cart model to see if there are any issues there:

The Cart model already handles ObjectId conversion properly in the `addItem` method. Now let me test if the API endpoints have any other issues. Let me also check if there might be an issue with the aggregation pipeline lookup in the products route:

The issue might be that the aggregation pipeline is expecting the lookup to always find a match, but if there's a mismatch between ObjectId types, the `$unwind` operation might fail. Let me fix this:

```typescript
  pipeline.push({
    $unwind: '$category',
  })

->

  pipeline.push({
    $unwind: {
      path: '$category',
      preserveNullAndEmptyArrays: false
    },
  })
```

Actually, let me also check the database connection to make sure there might not be an issue there. Let me also see if there are any issues with the individual product route:

```typescript
    // Get active SKUs for this product
    const skus = await SKU.find({ productId: id, isActive: true }).lean()

->

    // Get active SKUs for this product
    const skus = await SKU.find({ productId: new mongoose.Types.ObjectId(id), isActive: true }).lean()
```

I need to add the mongoose import to this file:

```typescript
import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwNotFoundError,
  ValidationError,
} from '@/lib/errors'
import {
  validateRequest,
  updateProductSchema,
  productParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import Product from '@/models/Product'
import SKU from '@/models/SKU'

->

import { connectDB } from '@/lib/mongodb'
import {
  asyncHandler,
  createSuccessResponse,
  throwNotFoundError,
  ValidationError,
} from '@/lib/errors'
import {
  validateRequest,
  updateProductSchema,
  productParamsSchema,
  parseJsonBody,
} from '@/lib/validations'
import Product from '@/models/Product'
import SKU from '@/models/SKU'
import mongoose from 'mongoose'
```

Now let me also fix the DELETE route in that file:

```typescript
    // Soft delete all associated SKUs
    await SKU.updateMany({ productId: id, isActive: true }, { isActive: false })

->

    // Soft delete all associated SKUs
    await SKU.updateMany({ productId: new mongoose.Types.ObjectId(id), isActive: true }, { isActive: false })
```

Now let me check if we need to make any adjustments to handle the string-to-ObjectId conversion more elegantly. Let me test a simple API endpoint to see if the main issue is resolved:

