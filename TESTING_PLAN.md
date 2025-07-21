# Unit Testing Plan for E-commerce Application

## Overview

This document outlines a comprehensive unit testing strategy for the e-commerce application built with Next.js, React 19, MongoDB, and TypeScript. The goal is to achieve **80%+ code coverage** across both backend and frontend components.

## Testing Stack

- **Testing Framework**: Jest 29.7.0
- **React Testing**: React Testing Library 16.0.0
- **API Testing**: Supertest 7.0.0
- **Database Testing**: MongoDB Memory Server 10.0.0
- **Test Environment**: jsdom for React components
- **Mocking**: Jest mocks for external dependencies

## Current Configuration

✅ Jest configuration is already set up with:

- Path mapping (`@/*` → `src/*`)
- Test file patterns
- Coverage thresholds (80% for all metrics)
- Next.js integration
- React Testing Library setup

## Testing Structure

```
tests/
├── unit/
│   ├── api/                    # API route tests
│   ├── models/                 # Database model tests
│   ├── lib/                    # Utility library tests
│   ├── components/             # React component tests
│   ├── hooks/                  # Custom hook tests
│   └── contexts/               # React context tests
├── integration/
│   ├── api/                    # API integration tests
│   └── workflows/              # User workflow tests
├── fixtures/                   # Test data and fixtures
├── mocks/                      # Mock implementations
└── utils/                      # Test utilities and helpers
```

## Backend Testing Plan

### 1. API Route Testing (`tests/unit/api/`)

#### Categories API (`/api/categories`)

- **GET /api/categories**

  - ✅ Returns all active categories
  - ✅ Returns empty array when no categories
  - ✅ Handles database errors
  - ✅ Proper response format

- **POST /api/categories**

  - ✅ Creates category with valid data
  - ❌ Validates required fields
  - ❌ Prevents duplicate names
  - ❌ Auto-generates slug
  - ❌ Handles validation errors

- **GET /api/categories/[id]**

  - ✅ Returns category by valid ID
  - ❌ Returns 404 for non-existent category
  - ❌ Returns 400 for invalid ID format

- **PUT /api/categories/[id]**

  - ✅ Updates category with valid data
  - ❌ Validates update fields
  - ❌ Updates slug when name changes
  - ❌ Handles conflicts

- **DELETE /api/categories/[id]**
  - ✅ Soft deletes category
  - ❌ Prevents deletion with associated products
  - ❌ Returns proper confirmation

#### Products API (`/api/products`)

- **GET /api/products**

  - ✅ Returns paginated products
  - ✅ Supports search by name/description
  - ✅ Filters by category
  - ✅ Includes category and SKU data
  - ❌ Validates query parameters
  - ❌ Handles invalid pagination

- **POST /api/products**

  - ✅ Creates product with valid data
  - ❌ Validates all required fields
  - ❌ Validates category exists
  - ❌ Auto-generates unique slug
  - ❌ Validates image URLs

- **GET /api/products/[id]**

  - ✅ Returns product with SKUs
  - ✅ Includes populated category
  - ❌ Returns 404 for non-existent
  - ❌ Validates ID format

- **PUT /api/products/[id]**

  - ✅ Updates product fields
  - ❌ Validates update data
  - ❌ Handles slug conflicts

- **DELETE /api/products/[id]**
  - ✅ Soft deletes product and SKUs
  - ❌ Prevents deletion with cart items
  - ❌ Cascades to associated SKUs

#### SKUs API (`/api/skus`, `/api/products/[id]/skus`)

- **GET /api/products/[id]/skus**

  - ✅ Returns SKUs for product
  - ✅ Includes product details
  - ❌ Validates product exists

- **POST /api/products/[id]/skus**

  - ✅ Creates SKU for product
  - ❌ Validates unique SKU code
  - ❌ Validates all fields
  - ❌ Associates with product

- **GET /api/skus/[id]**

  - ✅ Returns SKU with product/category
  - ❌ Validates ID format

- **PUT /api/skus/[id]**

  - ✅ Updates SKU fields
  - ❌ Validates inventory changes
  - ❌ Prevents invalid prices

- **DELETE /api/skus/[id]**
  - ✅ Soft deletes SKU
  - ❌ Prevents deletion if in cart
  - ❌ Validates dependencies

#### Cart API (`/api/cart`)

- **GET /api/cart**

  - ✅ Returns current cart
  - ✅ Creates empty cart if none exists
  - ✅ Handles session management
  - ❌ Populates item details

- **POST /api/cart/items**

  - ✅ Adds item to cart
  - ✅ Updates existing item quantity
  - ❌ Validates inventory availability
  - ❌ Enforces quantity limits
  - ❌ Handles session creation

- **PUT /api/cart/items/[skuId]**

  - ✅ Updates item quantity
  - ❌ Validates inventory constraints
  - ❌ Handles quantity validation

- **DELETE /api/cart/items/[skuId]**

  - ✅ Removes item from cart
  - ❌ Validates item exists
  - ❌ Updates cart totals

- **DELETE /api/cart**
  - ✅ Clears entire cart
  - ✅ Maintains session

#### Health API (`/api/health`)

- ✅ Returns health status
- ✅ Includes service statuses
- ❌ Validates database connectivity

### 2. Database Model Testing (`tests/unit/models/`)

#### Category Model

- **Validation**

  - ❌ Requires name (2-100 chars)
  - ❌ Optional description (max 500 chars)
  - ❌ Auto-generates unique slug
  - ❌ Enforces unique names

- **Methods**

  - ❌ `findActive()` - returns active categories
  - ❌ `findBySlug()` - finds by slug
  - ❌ `deactivate()` - soft delete
  - ❌ `activate()` - reactivate

- **Hooks**
  - ❌ Slug generation on save
  - ❌ Unique slug enforcement

#### Product Model

- **Validation**

  - ❌ Requires name (2-200 chars)
  - ❌ Requires description (10-2000 chars)
  - ❌ Validates category exists
  - ❌ Validates base price ≥ 0
  - ❌ Validates image URLs

- **Methods**

  - ❌ `findActive()` - active products
  - ❌ `findBySlug()` - find by slug
  - ❌ `findByCategory()` - filter by category
  - ❌ `search()` - text search

- **Virtuals**
  - ❌ `skus` - associated SKUs
  - ❌ `category` - populated category

#### SKU Model

- **Validation**

  - ❌ Unique SKU code format
  - ❌ Valid product reference
  - ❌ Inventory ≥ 0 (integer)
  - ❌ Price ≥ 0
  - ❌ Attributes as key-value pairs

- **Methods**
  - ❌ `findByProduct()` - SKUs for product
  - ❌ `findInStock()` - available inventory
  - ❌ `checkInventory()` - validate quantity
  - ❌ `updateInventory()` - modify stock
  - ❌ `isInStock()` - availability check

#### Cart Model

- **Validation**

  - ❌ Valid UUID session ID
  - ❌ No duplicate SKUs
  - ❌ Item quantity limits (1-99)
  - ❌ Valid SKU references

- **Methods**

  - ❌ `findBySession()` - get user cart
  - ❌ `createForSession()` - new cart
  - ❌ `addItem()` - add/update item
  - ❌ `updateItem()` - change quantity
  - ❌ `removeItem()` - delete item
  - ❌ `clearItems()` - empty cart

- **Calculations**
  - ❌ Subtotal per item
  - ❌ Total cart amount
  - ❌ Automatic recalculation

### 3. Library Testing (`tests/unit/lib/`)

#### Validation Library (`validations.ts`)

- **Schema Validation**

  - ❌ Category schemas (create/update)
  - ❌ Product schemas (create/update)
  - ❌ SKU schemas (create/update)
  - ❌ Cart schemas (add/update items)
  - ❌ Parameter validation (IDs, pagination)

- **Helper Functions**
  - ❌ `parseJsonBody()` - JSON parsing
  - ❌ `validateRequest()` - schema validation

#### Error Handling (`errors.ts`)

- **Error Classes**

  - ❌ `AppError` - base error class
  - ❌ `ValidationError` - validation failures
  - ❌ `NotFoundError` - resource not found
  - ❌ `DuplicateResourceError` - conflicts
  - ❌ `InsufficientInventoryError` - stock issues

- **Error Formatting**

  - ❌ `createErrorResponse()` - response formatting
  - ❌ Mongoose error handling
  - ❌ Custom error details

- **Utilities**
  - ❌ `asyncHandler()` - error wrapper
  - ❌ Error helper functions

#### Database Connection (`mongodb.ts`)

- ❌ Connection establishment
- ❌ Connection pooling
- ❌ Error handling
- ❌ Environment configuration

#### Session Management (`session.ts`)

- ❌ Session ID generation
- ❌ Session header parsing
- ❌ Session validation
- ❌ Response header setting

## Frontend Testing Plan

### 1. Component Testing (`tests/unit/components/`)

#### Layout Components

- **Header Component**
  - ❌ Renders logo and navigation
  - ❌ Shows cart item count
  - ❌ Displays search bar
  - ❌ Mobile responsive menu
  - ❌ Navigation links work

#### Product Components

- **ProductCard**

  - ❌ Displays product information
  - ❌ Shows price and availability
  - ❌ Add to cart functionality
  - ❌ Links to product details
  - ❌ Handles loading states

- **ProductDetails**

  - ❌ Shows product information
  - ❌ SKU selection dropdown
  - ❌ Quantity selector
  - ❌ Add to cart with validation
  - ❌ Image gallery
  - ❌ Stock availability

- **ProductGrid**
  - ❌ Renders product list
  - ❌ Handles empty state
  - ❌ Loading skeletons
  - ❌ Responsive grid layout

#### Cart Components

- **CartItem**

  - ❌ Displays item details
  - ❌ Quantity controls
  - ❌ Remove item functionality
  - ❌ Price calculations
  - ❌ Loading states

- **CartSummary**

  - ❌ Shows cart totals
  - ❌ Tax and shipping calculations
  - ❌ Checkout button
  - ❌ Item count display

- **EmptyCart**
  - ❌ Empty state message
  - ❌ Navigation links
  - ❌ Call-to-action buttons

#### Common Components

- **SearchBar**

  - ❌ Search input with debouncing
  - ❌ URL parameter updates
  - ❌ Clear search functionality
  - ❌ Form submission

- **CategoryFilter**

  - ❌ Category dropdown
  - ❌ Filter application
  - ❌ Clear filters
  - ❌ URL state management

- **Pagination**
  - ❌ Page navigation
  - ❌ Page number generation
  - ❌ URL parameter updates
  - ❌ Disable states

#### UI Components

- **Button**

  - ❌ Variant props (default, outline, etc.)
  - ❌ Size props (sm, md, lg)
  - ❌ Disabled state
  - ❌ Loading state
  - ❌ Icon support

- **Card Components**

  - ❌ Card structure rendering
  - ❌ Header, content, footer
  - ❌ Styling variants

- **Form Components**
  - ❌ Input validation
  - ❌ Error states
  - ❌ Focus management

### 2. Hook Testing (`tests/unit/hooks/`)

#### useCart Hook

- **Cart State Management**

  - ❌ Initial cart loading
  - ❌ Add item to cart
  - ❌ Update item quantity
  - ❌ Remove item from cart
  - ❌ Clear entire cart
  - ❌ Get item count
  - ❌ Get total amount

- **API Integration**
  - ❌ Session management
  - ❌ Error handling
  - ❌ Loading states
  - ❌ Optimistic updates

#### useToast Hook

- **Toast Management**
  - ❌ Show toast messages
  - ❌ Different toast types
  - ❌ Auto-dismiss timing
  - ❌ Manual dismiss
  - ❌ Queue management

### 3. Context Testing (`tests/unit/contexts/`)

#### CartContext

- **Provider Functionality**

  - ❌ Context value provision
  - ❌ State updates
  - ❌ Session persistence
  - ❌ Error boundaries

- **Consumer Integration**
  - ❌ Hook integration
  - ❌ State synchronization
  - ❌ Re-render optimization

## Integration Testing Plan

### 1. API Integration (`tests/integration/api/`)

#### End-to-End API Flows

- **Product Management Flow**

  - ❌ Create category → Create product → Create SKU
  - ❌ Search and filter products
  - ❌ Update inventory levels

- **Cart Management Flow**

  - ❌ Session creation → Add items → Update quantities → Remove items
  - ❌ Inventory validation during cart operations
  - ❌ Cart persistence across sessions

- **Database Integration**
  - ❌ Model relationships
  - ❌ Transaction handling
  - ❌ Cascade operations

### 2. User Workflow Testing (`tests/integration/workflows/`)

#### Shopping Flow

- ❌ Browse products → View details → Add to cart → View cart
- ❌ Search and filter → Select product → Configure options
- ❌ Cart management → Quantity updates → Item removal

#### Error Scenarios

- ❌ Network failures
- ❌ Invalid data handling
- ❌ Inventory conflicts
- ❌ Session management issues

## Test Utilities and Setup

### 1. Test Database Setup

```typescript
// tests/utils/database.ts
- MongoDB Memory Server setup
- Test data seeding
- Database cleanup
- Transaction management
```

### 2. API Test Utilities

```typescript
// tests/utils/api.ts
- Request helpers
- Response assertions
- Authentication mocking
- Error testing utilities
```

### 3. React Test Utilities

```typescript
// tests/utils/react.ts
- Custom render function
- Context providers wrapper
- User event helpers
- Async testing utilities
```

### 4. Mock Implementations

```typescript
// tests/mocks/
- Next.js router mocking
- API endpoint mocking
- External service mocking
- Database operation mocking
```

### 5. Test Fixtures

```typescript
// tests/fixtures/
- Sample category data
- Sample product data
- Sample SKU data
- Sample cart data
```

## Coverage Goals

### Minimum Coverage Targets (Current: 80%)

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Stretch Goals

- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Coverage Exclusions

- Type definition files (`*.d.ts`)
- Configuration files
- Build artifacts
- Test files themselves

## Testing Scripts

### Package.json Scripts

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:unit": "jest tests/unit",
  "test:integration": "jest tests/integration",
  "test:api": "jest tests/unit/api tests/integration/api",
  "test:components": "jest tests/unit/components",
  "test:models": "jest tests/unit/models",
  "test:ci": "jest --coverage --watchAll=false"
}
```

## Implementation Priority

### Phase 1: Core Backend (Week 1)

1. **API route tests** - Essential functionality
2. **Model validation tests** - Data integrity
3. **Error handling tests** - Robustness

### Phase 2: Frontend Components (Week 2)

1. **UI component tests** - Basic rendering
2. **Cart functionality tests** - Core features
3. **Product display tests** - User interface

### Phase 3: Integration & Optimization (Week 3)

1. **API integration tests** - End-to-end flows
2. **Hook and context tests** - State management
3. **Coverage optimization** - Fill gaps

### Phase 4: Advanced Testing (Week 4)

1. **Performance tests** - Load testing
2. **Edge case coverage** - Error scenarios
3. **Documentation** - Test maintenance

## Continuous Integration

### Pre-commit Hooks

- Run unit tests
- Check coverage thresholds
- Lint test files

### CI Pipeline

- Run full test suite
- Generate coverage reports
- Fail on coverage drops
- Performance regression tests

## Maintenance Strategy

### Test Updates

- Update tests with feature changes
- Regular test refactoring
- Remove obsolete tests
- Performance optimization

### Coverage Monitoring

- Weekly coverage reports
- Coverage trend analysis
- Identify untested code
- Plan coverage improvements

This comprehensive testing plan ensures robust validation of both backend APIs and frontend components, providing confidence in the application's reliability and maintainability.
