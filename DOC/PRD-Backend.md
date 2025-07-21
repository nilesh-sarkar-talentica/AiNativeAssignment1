# Backend Module - Product Requirements Document (PRD)

## 1. Purpose

Define requirements for the e-commerce backend inventory management service built with Next.js API routes and MongoDB. The backend provides REST APIs for managing categories, products, SKUs, and shopping cart operations.

**Key Architecture Decision**: This backend implements a complete cart management system with session-based persistence, replacing any need for external cart services or client-only cart management.

## 2. Scope

### 2.1 In Scope

- Category management APIs (CRUD)
- Product management APIs (CRUD)
- SKU management APIs (CRUD)
- Shopping cart APIs (CRUD) - **Full implementation with session management**
- Data validation and error handling
- Database integration with MongoDB
- API documentation
- Session-based cart persistence

### 2.2 Out of Scope

- User authentication and authorization
- Payment processing APIs
- Order management
- Email notifications
- File upload handling
- Admin panel backend
- Integration with external APIs (FakeStore, etc.)

## 3. Data Models and Relationships

### 3.1 Category

```typescript
interface Category {
  _id: ObjectId
  name: string
  description?: string
  slug: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 3.2 Product

```typescript
interface Product {
  _id: ObjectId
  name: string
  description: string
  categoryId: ObjectId
  slug: string
  basePrice: number
  images: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 3.3 SKU (Stock Keeping Unit)

```typescript
interface SKU {
  _id: ObjectId
  productId: ObjectId
  sku: string
  name: string
  price: number
  inventory: number
  attributes: Record<string, string> // e.g., {color: "red", size: "L"}
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 3.4 Cart

```typescript
interface Cart {
  _id: ObjectId
  sessionId: string
  items: CartItem[]
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}

interface CartItem {
  skuId: ObjectId
  quantity: number
  unitPrice: number
  subtotal: number
}
```

### 3.5 Relationships

- Product belongs to one Category (1:N)
- Product has many SKUs (1:N)
- Cart contains many CartItems with SKU references (N:N)

## 4. API Endpoints

### 4.1 Category APIs

#### 4.1.1 GET /api/categories

**Purpose**: List all categories
**Parameters**: None
**Response**: Array of categories

```json
{
  "success": true,
  "data": [
    {
      "_id": "category_id",
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "slug": "electronics",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 4.1.2 GET /api/categories/[id]

**Purpose**: Get category by ID
**Parameters**: id (path parameter)
**Response**: Single category object

#### 4.1.3 POST /api/categories

**Purpose**: Create new category
**Body**:

```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

**Response**: Created category object

#### 4.1.4 PUT /api/categories/[id]

**Purpose**: Update category
**Body**: Same as POST
**Response**: Updated category object

#### 4.1.5 DELETE /api/categories/[id]

**Purpose**: Delete category
**Response**: Success message
**Note**: Should check if category has products before deletion

### 4.2 Product APIs

#### 4.2.1 GET /api/products

**Purpose**: List products with search and filtering
**Query Parameters**:

- `search` (string): Search by product name
- `categoryId` (string): Filter by category
- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 10)

**Response**:

```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### 4.2.2 GET /api/products/[id]

**Purpose**: Get product details with SKUs
**Response**: Product object with populated category and SKUs

#### 4.2.3 POST /api/products

**Purpose**: Create new product
**Body**:

```json
{
  "name": "iPhone 15",
  "description": "Latest iPhone model",
  "categoryId": "category_id",
  "basePrice": 999,
  "images": ["image1.jpg", "image2.jpg"]
}
```

#### 4.2.4 PUT /api/products/[id]

**Purpose**: Update product
**Body**: Same as POST

#### 4.2.5 DELETE /api/products/[id]

**Purpose**: Delete product
**Note**: Should also delete associated SKUs

### 4.3 SKU APIs

#### 4.3.1 GET /api/products/[productId]/skus

**Purpose**: Get all SKUs for a product
**Response**: Array of SKUs for the product

#### 4.3.2 GET /api/skus/[id]

**Purpose**: Get SKU details
**Response**: Single SKU object with product details

#### 4.3.3 POST /api/products/[productId]/skus

**Purpose**: Add SKU to product
**Body**:

```json
{
  "sku": "IPHONE15-128GB-BLACK",
  "name": "iPhone 15 - 128GB - Black",
  "price": 999,
  "inventory": 100,
  "attributes": {
    "storage": "128GB",
    "color": "Black"
  }
}
```

#### 4.3.4 PUT /api/skus/[id]

**Purpose**: Update SKU
**Body**: Same as POST

#### 4.3.5 DELETE /api/skus/[id]

**Purpose**: Delete SKU
**Note**: Should check if SKU is in any carts

### 4.4 Cart APIs

#### 4.4.1 GET /api/cart

**Purpose**: Get current cart
**Headers**: `X-Session-Id` for cart identification
**Response**: Cart object with populated SKU and product details

#### 4.4.2 POST /api/cart/items

**Purpose**: Add item to cart
**Body**:

```json
{
  "skuId": "sku_id",
  "quantity": 2
}
```

**Response**: Updated cart object

#### 4.4.3 PUT /api/cart/items/[skuId]

**Purpose**: Update cart item quantity
**Body**:

```json
{
  "quantity": 5
}
```

#### 4.4.4 DELETE /api/cart/items/[skuId]

**Purpose**: Remove item from cart
**Response**: Updated cart object

#### 4.4.5 DELETE /api/cart

**Purpose**: Clear entire cart
**Response**: Empty cart object

## 5. Technical Requirements

### 5.1 Technology Stack

- **Framework**: Next.js 14 API Routes
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod schemas
- **Error Handling**: Custom error classes
- **Testing**: Jest + Supertest
- **Documentation**: OpenAPI/Swagger

### 5.2 Database Configuration

- Connection pooling
- Indexes for performance:
  - Category: `slug`, `isActive`
  - Product: `categoryId`, `slug`, `isActive`, `name` (text index)
  - SKU: `productId`, `sku`, `isActive`
  - Cart: `sessionId`

### 5.3 Validation Rules

#### Category Validation

- `name`: Required, string, 2-100 characters, unique
- `description`: Optional, string, max 500 characters
- `slug`: Auto-generated from name, unique

#### Product Validation

- `name`: Required, string, 2-200 characters
- `description`: Required, string, 10-2000 characters
- `categoryId`: Required, valid ObjectId, must exist
- `basePrice`: Required, number, min 0
- `images`: Optional, array of valid URLs

#### SKU Validation

- `sku`: Required, string, unique, alphanumeric + hyphens
- `name`: Required, string, 2-200 characters
- `price`: Required, number, min 0
- `inventory`: Required, number, min 0
- `productId`: Required, valid ObjectId, must exist

#### Cart Validation

- `sessionId`: Required for cart operations
- `quantity`: Required, number, min 1, max 99
- `skuId`: Required, valid ObjectId, must exist and be active

## 6. Error Handling

### 6.1 HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `409`: Conflict (duplicate resources)
- `500`: Internal Server Error

### 6.2 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

### 6.3 Error Types

- `VALIDATION_ERROR`: Input validation failures
- `NOT_FOUND`: Resource not found
- `DUPLICATE_RESOURCE`: Unique constraint violations
- `INSUFFICIENT_INVENTORY`: Not enough stock
- `DATABASE_ERROR`: Database operation failures

## 7. Performance Requirements

### 7.1 Response Times

- List endpoints: < 200ms
- Detail endpoints: < 100ms
- Create/Update endpoints: < 300ms
- Delete endpoints: < 200ms

### 7.2 Scalability

- Support for 1000+ concurrent requests
- Database connection pooling
- Efficient pagination for large datasets
- Optimized database queries

## 8. Testing Requirements

### 8.1 Unit Tests

- Model validation tests
- Business logic tests
- Utility function tests
- Minimum 85% code coverage

### 8.2 Integration Tests

- API endpoint tests
- Database interaction tests
- Error handling tests
- Cart functionality tests

### 8.3 Test Data

- Category test fixtures
- Product test fixtures
- SKU test fixtures
- Cart test scenarios

## 9. Security Requirements

### 9.1 Input Validation

- All inputs validated with Zod schemas
- SQL injection prevention through ODM
- XSS prevention in text fields
- File upload validation (for images)

### 9.2 API Security

- Rate limiting (100 requests/minute per IP)
- CORS configuration
- Request size limits
- Helmet.js security headers

## 10. Monitoring and Logging

### 10.1 Logging

- Request/response logging
- Error logging with stack traces
- Performance metrics logging
- Database query logging (development)

### 10.2 Health Checks

- `/api/health` endpoint
- Database connectivity check
- Performance metrics

## 11. Acceptance Criteria

### 11.1 Category Management

- [ ] CRUD operations work correctly
- [ ] Validation prevents invalid data
- [ ] Cannot delete categories with products
- [ ] Slugs are auto-generated and unique

### 11.2 Product Management

- [ ] CRUD operations work correctly
- [ ] Search by name works
- [ ] Category filtering works
- [ ] Pagination works correctly
- [ ] Products include category and SKU data

### 11.3 SKU Management

- [ ] CRUD operations work correctly
- [ ] SKUs are unique per product
- [ ] Inventory tracking works
- [ ] Cannot delete SKUs in carts

### 11.4 Cart Management

- [ ] Add/remove items works
- [ ] Quantity updates work
- [ ] Total calculations are accurate
- [ ] Inventory validation prevents overselling
- [ ] Session-based cart persistence

## 12. Future Enhancements

- Bulk operations for products/SKUs
- Product image upload handling
- Inventory alerts and notifications
- Product variants and options
- Advanced search with filters
- Cache layer for improved performance
