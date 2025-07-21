# API Documentation

## Overview

This document provides comprehensive documentation for all REST API endpoints in the e-commerce application. The APIs are built using Next.js API routes and follow RESTful conventions.

**Base URL**: `http://localhost:3000/api` (development)

**Content Type**: `application/json`

**Authentication**: Not required (session-based for carts)

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "meta": {
    /* optional metadata like pagination */
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": [
      /* optional validation details */
    ]
  }
}
```

## Error Codes

| Code                     | Description                |
| ------------------------ | -------------------------- |
| `VALIDATION_ERROR`       | Input validation failed    |
| `NOT_FOUND`              | Resource not found         |
| `DUPLICATE_RESOURCE`     | Resource already exists    |
| `INSUFFICIENT_INVENTORY` | Not enough stock available |
| `SESSION_REQUIRED`       | Cart session ID required   |
| `DATABASE_ERROR`         | Database operation failed  |
| `INTERNAL_ERROR`         | Internal server error      |

---

# Category APIs

## GET /api/categories

Get all categories.

### Request

- **Method**: GET
- **Parameters**: None

### Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
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

### Example

```bash
curl -X GET http://localhost:3000/api/categories
```

---

## GET /api/categories/[id]

Get a specific category by ID.

### Request

- **Method**: GET
- **Parameters**:
  - `id` (path): Category ID

### Response

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "slug": "electronics",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Errors

- `404 NOT_FOUND`: Category not found

### Example

```bash
curl -X GET http://localhost:3000/api/categories/507f1f77bcf86cd799439011
```

---

## POST /api/categories

Create a new category.

### Request

- **Method**: POST
- **Body**:

```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

### Validation

- `name`: Required, 2-100 characters, unique
- `description`: Optional, max 500 characters

### Response

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "slug": "electronics",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Errors

- `400 VALIDATION_ERROR`: Invalid input data
- `409 DUPLICATE_RESOURCE`: Category name already exists

### Example

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Electronics", "description": "Electronic devices"}'
```

---

## PUT /api/categories/[id]

Update an existing category.

### Request

- **Method**: PUT
- **Parameters**:
  - `id` (path): Category ID
- **Body**: Same as POST

### Response

Same as POST response with updated data.

### Errors

- `400 VALIDATION_ERROR`: Invalid input data
- `404 NOT_FOUND`: Category not found
- `409 DUPLICATE_RESOURCE`: Category name already exists

### Example

```bash
curl -X PUT http://localhost:3000/api/categories/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"name": "Consumer Electronics", "description": "Updated description"}'
```

---

## DELETE /api/categories/[id]

Delete a category.

### Request

- **Method**: DELETE
- **Parameters**:
  - `id` (path): Category ID

### Response

```json
{
  "success": true,
  "data": {
    "message": "Category deleted successfully"
  }
}
```

### Errors

- `404 NOT_FOUND`: Category not found
- `400 VALIDATION_ERROR`: Category has associated products

### Example

```bash
curl -X DELETE http://localhost:3000/api/categories/507f1f77bcf86cd799439011
```

---

# Product APIs

## GET /api/products

Get products with optional search and filtering.

### Request

- **Method**: GET
- **Query Parameters**:
  - `search` (string, optional): Search by product name
  - `categoryId` (string, optional): Filter by category ID
  - `page` (number, optional): Page number (default: 1)
  - `pageSize` (number, optional): Items per page (default: 10, max: 50)

### Response

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "iPhone 15",
        "description": "Latest iPhone model with advanced features",
        "categoryId": "507f1f77bcf86cd799439011",
        "category": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Electronics",
          "slug": "electronics"
        },
        "slug": "iphone-15",
        "basePrice": 999,
        "images": ["iphone15-1.jpg", "iphone15-2.jpg"],
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Example

```bash
# Get all products
curl -X GET http://localhost:3000/api/products

# Search products
curl -X GET "http://localhost:3000/api/products?search=iphone"

# Filter by category
curl -X GET "http://localhost:3000/api/products?categoryId=507f1f77bcf86cd799439011"

# Pagination
curl -X GET "http://localhost:3000/api/products?page=2&pageSize=20"
```

---

## GET /api/products/[id]

Get a specific product with its SKUs.

### Request

- **Method**: GET
- **Parameters**:
  - `id` (path): Product ID

### Response

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "iPhone 15",
    "description": "Latest iPhone model with advanced features",
    "categoryId": "507f1f77bcf86cd799439011",
    "category": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Electronics",
      "slug": "electronics"
    },
    "slug": "iphone-15",
    "basePrice": 999,
    "images": ["iphone15-1.jpg", "iphone15-2.jpg"],
    "skus": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "sku": "IPHONE15-128GB-BLACK",
        "name": "iPhone 15 - 128GB - Black",
        "price": 999,
        "inventory": 50,
        "attributes": {
          "storage": "128GB",
          "color": "Black"
        },
        "isActive": true
      }
    ],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Errors

- `404 NOT_FOUND`: Product not found

### Example

```bash
curl -X GET http://localhost:3000/api/products/507f1f77bcf86cd799439012
```

---

## POST /api/products

Create a new product.

### Request

- **Method**: POST
- **Body**:

```json
{
  "name": "iPhone 15",
  "description": "Latest iPhone model with advanced features",
  "categoryId": "507f1f77bcf86cd799439011",
  "basePrice": 999,
  "images": ["iphone15-1.jpg", "iphone15-2.jpg"]
}
```

### Validation

- `name`: Required, 2-200 characters
- `description`: Required, 10-2000 characters
- `categoryId`: Required, valid ObjectId, must exist
- `basePrice`: Required, number >= 0
- `images`: Optional, array of valid URLs

### Response

Same structure as GET product response.

### Errors

- `400 VALIDATION_ERROR`: Invalid input data
- `404 NOT_FOUND`: Category not found

### Example

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "description": "Latest iPhone model",
    "categoryId": "507f1f77bcf86cd799439011",
    "basePrice": 999
  }'
```

---

## PUT /api/products/[id]

Update an existing product.

### Request

- **Method**: PUT
- **Parameters**:
  - `id` (path): Product ID
- **Body**: Same as POST

### Response

Same as POST response with updated data.

### Errors

- `400 VALIDATION_ERROR`: Invalid input data
- `404 NOT_FOUND`: Product or category not found

### Example

```bash
curl -X PUT http://localhost:3000/api/products/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -d '{"name": "iPhone 15 Pro", "basePrice": 1099}'
```

---

## DELETE /api/products/[id]

Delete a product and its associated SKUs.

### Request

- **Method**: DELETE
- **Parameters**:
  - `id` (path): Product ID

### Response

```json
{
  "success": true,
  "data": {
    "message": "Product and associated SKUs deleted successfully"
  }
}
```

### Errors

- `404 NOT_FOUND`: Product not found

### Example

```bash
curl -X DELETE http://localhost:3000/api/products/507f1f77bcf86cd799439012
```

---

# SKU APIs

## GET /api/products/[productId]/skus

Get all SKUs for a specific product.

### Request

- **Method**: GET
- **Parameters**:
  - `productId` (path): Product ID

### Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "productId": "507f1f77bcf86cd799439012",
      "sku": "IPHONE15-128GB-BLACK",
      "name": "iPhone 15 - 128GB - Black",
      "price": 999,
      "inventory": 50,
      "attributes": {
        "storage": "128GB",
        "color": "Black"
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Errors

- `404 NOT_FOUND`: Product not found

### Example

```bash
curl -X GET http://localhost:3000/api/products/507f1f77bcf86cd799439012/skus
```

---

## GET /api/skus/[id]

Get a specific SKU with product details.

### Request

- **Method**: GET
- **Parameters**:
  - `id` (path): SKU ID

### Response

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "productId": "507f1f77bcf86cd799439012",
    "product": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "iPhone 15",
      "slug": "iphone-15",
      "images": ["iphone15-1.jpg"]
    },
    "sku": "IPHONE15-128GB-BLACK",
    "name": "iPhone 15 - 128GB - Black",
    "price": 999,
    "inventory": 50,
    "attributes": {
      "storage": "128GB",
      "color": "Black"
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Errors

- `404 NOT_FOUND`: SKU not found

### Example

```bash
curl -X GET http://localhost:3000/api/skus/507f1f77bcf86cd799439013
```

---

## POST /api/products/[productId]/skus

Add a new SKU to a product.

### Request

- **Method**: POST
- **Parameters**:
  - `productId` (path): Product ID
- **Body**:

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

### Validation

- `sku`: Required, unique, alphanumeric with hyphens
- `name`: Required, 2-200 characters
- `price`: Required, number >= 0
- `inventory`: Required, number >= 0
- `attributes`: Optional object with string values

### Response

Same structure as GET SKU response.

### Errors

- `400 VALIDATION_ERROR`: Invalid input data
- `404 NOT_FOUND`: Product not found
- `409 DUPLICATE_RESOURCE`: SKU already exists

### Example

```bash
curl -X POST http://localhost:3000/api/products/507f1f77bcf86cd799439012/skus \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "IPHONE15-256GB-BLUE",
    "name": "iPhone 15 - 256GB - Blue",
    "price": 1099,
    "inventory": 75,
    "attributes": {
      "storage": "256GB",
      "color": "Blue"
    }
  }'
```

---

## PUT /api/skus/[id]

Update an existing SKU.

### Request

- **Method**: PUT
- **Parameters**:
  - `id` (path): SKU ID
- **Body**: Same as POST (excluding productId)

### Response

Same as POST response with updated data.

### Errors

- `400 VALIDATION_ERROR`: Invalid input data
- `404 NOT_FOUND`: SKU not found
- `409 DUPLICATE_RESOURCE`: SKU code already exists

### Example

```bash
curl -X PUT http://localhost:3000/api/skus/507f1f77bcf86cd799439013 \
  -H "Content-Type: application/json" \
  -d '{"price": 949, "inventory": 25}'
```

---

## DELETE /api/skus/[id]

Delete a SKU.

### Request

- **Method**: DELETE
- **Parameters**:
  - `id` (path): SKU ID

### Response

```json
{
  "success": true,
  "data": {
    "message": "SKU deleted successfully"
  }
}
```

### Errors

- `404 NOT_FOUND`: SKU not found
- `400 VALIDATION_ERROR`: SKU is in active carts

### Example

```bash
curl -X DELETE http://localhost:3000/api/skus/507f1f77bcf86cd799439013
```

---

# Cart APIs

**Note**: All cart APIs require a session ID. This can be provided via:

- Header: `X-Session-Id: your-session-id`
- Cookie: `sessionId=your-session-id`

If no session ID is provided, a new one will be created and returned in the response headers.

## GET /api/cart

Get the current cart for the session.

### Request

- **Method**: GET
- **Headers**:
  - `X-Session-Id: your-session-id` (optional)

### Response

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "sessionId": "sess_abc123def456",
    "items": [
      {
        "skuId": "507f1f77bcf86cd799439013",
        "sku": {
          "_id": "507f1f77bcf86cd799439013",
          "sku": "IPHONE15-128GB-BLACK",
          "name": "iPhone 15 - 128GB - Black",
          "price": 999,
          "inventory": 50,
          "product": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "iPhone 15",
            "slug": "iphone-15",
            "images": ["iphone15-1.jpg"]
          }
        },
        "quantity": 2,
        "unitPrice": 999,
        "subtotal": 1998
      }
    ],
    "totalAmount": 1998,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Response Headers

- `X-Session-Id`: Session ID (if new session created)

### Example

```bash
curl -X GET http://localhost:3000/api/cart \
  -H "X-Session-Id: sess_abc123def456"
```

---

## POST /api/cart/items

Add an item to the cart.

### Request

- **Method**: POST
- **Headers**:
  - `X-Session-Id: your-session-id` (optional)
- **Body**:

```json
{
  "skuId": "507f1f77bcf86cd799439013",
  "quantity": 2
}
```

### Validation

- `skuId`: Required, valid ObjectId, SKU must exist and be active
- `quantity`: Required, number 1-99

### Response

Same structure as GET cart response with updated data.

### Errors

- `400 VALIDATION_ERROR`: Invalid input data
- `404 NOT_FOUND`: SKU not found
- `400 INSUFFICIENT_INVENTORY`: Not enough stock available

### Example

```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: sess_abc123def456" \
  -d '{
    "skuId": "507f1f77bcf86cd799439013",
    "quantity": 1
  }'
```

---

## PUT /api/cart/items/[skuId]

Update the quantity of an item in the cart.

### Request

- **Method**: PUT
- **Parameters**:
  - `skuId` (path): SKU ID
- **Headers**:
  - `X-Session-Id: your-session-id`
- **Body**:

```json
{
  "quantity": 3
}
```

### Validation

- `quantity`: Required, number 1-99

### Response

Same structure as GET cart response with updated data.

### Errors

- `400 VALIDATION_ERROR`: Invalid quantity
- `404 NOT_FOUND`: Cart item not found
- `400 INSUFFICIENT_INVENTORY`: Not enough stock available

### Example

```bash
curl -X PUT http://localhost:3000/api/cart/items/507f1f77bcf86cd799439013 \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: sess_abc123def456" \
  -d '{"quantity": 3}'
```

---

## DELETE /api/cart/items/[skuId]

Remove an item from the cart.

### Request

- **Method**: DELETE
- **Parameters**:
  - `skuId` (path): SKU ID
- **Headers**:
  - `X-Session-Id: your-session-id`

### Response

Same structure as GET cart response with updated data.

### Errors

- `404 NOT_FOUND`: Cart item not found
- `400 SESSION_REQUIRED`: Session ID required

### Example

```bash
curl -X DELETE http://localhost:3000/api/cart/items/507f1f77bcf86cd799439013 \
  -H "X-Session-Id: sess_abc123def456"
```

---

## DELETE /api/cart

Clear all items from the cart.

### Request

- **Method**: DELETE
- **Headers**:
  - `X-Session-Id: your-session-id`

### Response

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "sessionId": "sess_abc123def456",
    "items": [],
    "totalAmount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Errors

- `400 SESSION_REQUIRED`: Session ID required

### Example

```bash
curl -X DELETE http://localhost:3000/api/cart \
  -H "X-Session-Id: sess_abc123def456"
```

---

# Health Check API

## GET /api/health

Check the health of the API and database connection.

### Request

- **Method**: GET
- **Parameters**: None

### Response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "services": {
      "database": "connected",
      "api": "running"
    },
    "version": "1.0.0"
  }
}
```

### Example

```bash
curl -X GET http://localhost:3000/api/health
```

---

# Rate Limiting

All API endpoints are rate limited to prevent abuse:

- **Rate Limit**: 100 requests per minute per IP address
- **Headers**:
  - `X-RateLimit-Limit`: Request limit per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

---

# Testing the APIs

## Using curl

All the examples above use curl. Make sure to:

1. Replace `localhost:3000` with your actual API base URL
2. Include proper Content-Type headers for POST/PUT requests
3. Include session ID for cart operations

## Using Postman

Import the following Postman collection URL:
`http://localhost:3000/api/postman-collection` (if implemented)

## Using JavaScript/TypeScript

```typescript
// Example: Add item to cart
const response = await fetch('/api/cart/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-Id': sessionId,
  },
  body: JSON.stringify({
    skuId: 'sku_id_here',
    quantity: 1,
  }),
})

const result = await response.json()
if (result.success) {
  console.log('Item added to cart:', result.data)
} else {
  console.error('Error:', result.error)
}
```
