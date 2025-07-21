# Database Module - Product Requirements Document (PRD)

## 1. Purpose

Define the database design and requirements for the e-commerce application using MongoDB. This document outlines the data models, relationships, indexes, and performance considerations.

## 2. Database Technology

### 2.1 Technology Stack

- **Database**: MongoDB 7.0+
- **ODM**: Mongoose 8.0+
- **Connection**: MongoDB Atlas (Cloud) or Local MongoDB
- **Backup Strategy**: Automated daily backups

### 2.2 Environment Configuration

- **Development**: Local MongoDB instance
- **Testing**: In-memory MongoDB for tests
- **Production**: MongoDB Atlas cluster with replica sets

## 3. Data Models

### 3.1 Category Collection

```javascript
// Collection: categories
{
  _id: ObjectId,
  name: String,          // "Electronics", "Clothing"
  description: String,   // Optional detailed description
  slug: String,          // URL-friendly version: "electronics"
  isActive: Boolean,     // Soft delete flag
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ slug: 1 }` - Unique index for URL routing
- `{ name: 1 }` - Unique index for category names
- `{ isActive: 1 }` - Filter active categories

**Validation Rules**:

- `name`: Required, 2-100 characters, unique
- `slug`: Required, unique, auto-generated from name
- `description`: Optional, max 500 characters
- `isActive`: Default true

### 3.2 Product Collection

```javascript
// Collection: products
{
  _id: ObjectId,
  name: String,          // "iPhone 15"
  description: String,   // Detailed product description
  categoryId: ObjectId,  // Reference to categories collection
  slug: String,          // URL-friendly: "iphone-15"
  basePrice: Number,     // Base price for the product
  images: [String],      // Array of image URLs
  isActive: Boolean,     // Soft delete flag
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ slug: 1 }` - Unique index for URL routing
- `{ categoryId: 1 }` - Filter by category
- `{ name: "text" }` - Text search index
- `{ isActive: 1 }` - Filter active products
- `{ createdAt: -1 }` - Sort by creation date

**Validation Rules**:

- `name`: Required, 2-200 characters
- `description`: Required, 10-2000 characters
- `categoryId`: Required, valid ObjectId reference
- `slug`: Required, unique, auto-generated
- `basePrice`: Required, minimum 0
- `images`: Optional array of valid URLs

### 3.3 SKU Collection

```javascript
// Collection: skus
{
  _id: ObjectId,
  productId: ObjectId,   // Reference to products collection
  sku: String,           // Unique SKU code: "IPHONE15-128GB-BLACK"
  name: String,          // "iPhone 15 - 128GB - Black"
  price: Number,         // Actual selling price
  inventory: Number,     // Available quantity
  attributes: {          // Product variant attributes
    color: String,
    size: String,
    storage: String,
    // ... other variant attributes
  },
  isActive: Boolean,     // Soft delete flag
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ sku: 1 }` - Unique index for SKU codes
- `{ productId: 1 }` - Get SKUs for a product
- `{ isActive: 1 }` - Filter active SKUs
- `{ inventory: 1 }` - Check stock levels

**Validation Rules**:

- `sku`: Required, unique, alphanumeric with hyphens
- `name`: Required, 2-200 characters
- `productId`: Required, valid ObjectId reference
- `price`: Required, minimum 0
- `inventory`: Required, minimum 0
- `attributes`: Optional object with string values

### 3.4 Cart Collection

```javascript
// Collection: carts
{
  _id: ObjectId,
  sessionId: String,     // Browser session identifier
  items: [{
    skuId: ObjectId,     // Reference to skus collection
    quantity: Number,    // Item quantity
    unitPrice: Number,   // Price at time of adding
    subtotal: Number     // quantity * unitPrice
  }],
  totalAmount: Number,   // Sum of all subtotals
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ sessionId: 1 }` - Unique index for session-based carts
- `{ "items.skuId": 1 }` - Find carts containing specific SKUs
- `{ updatedAt: 1 }` - Clean up old carts

**Validation Rules**:

- `sessionId`: Required, unique string
- `items.skuId`: Required, valid ObjectId reference
- `items.quantity`: Required, 1-99
- `items.unitPrice`: Required, minimum 0
- `totalAmount`: Calculated field

## 4. Relationships and Data Integrity

### 4.1 Relationship Diagram

```
Category (1) ─────→ (N) Product
                        │
                        └─→ (N) SKU
                             │
                             └─→ (N) CartItem
```

### 4.2 Referential Integrity

#### 4.2.1 Category → Product

- Products must reference valid, active categories
- Cannot delete categories with existing products
- Cascade update when category is modified

#### 4.2.2 Product → SKU

- SKUs must reference valid, active products
- Delete all SKUs when product is deleted
- Update SKU references when product is modified

#### 4.2.3 SKU → CartItem

- Cart items must reference valid, active SKUs
- Remove cart items when SKU is deleted
- Update cart when SKU price changes

### 4.3 Data Consistency Rules

1. **Inventory Management**:

   - SKU inventory must be >= 0
   - Cart quantity cannot exceed available inventory
   - Inventory updates must be atomic

2. **Price Consistency**:

   - Cart items store price at time of addition
   - Price changes don't affect existing cart items
   - Total calculations must be accurate

3. **Soft Deletes**:
   - Use `isActive` flag instead of hard deletes
   - Inactive items not shown in listings
   - Maintain data integrity for historical records

## 5. Performance Optimization

### 5.1 Database Indexes

```javascript
// Categories
db.categories.createIndex({ slug: 1 }, { unique: true })
db.categories.createIndex({ name: 1 }, { unique: true })
db.categories.createIndex({ isActive: 1 })

// Products
db.products.createIndex({ slug: 1 }, { unique: true })
db.products.createIndex({ categoryId: 1 })
db.products.createIndex({ name: 'text', description: 'text' })
db.products.createIndex({ isActive: 1 })
db.products.createIndex({ createdAt: -1 })

// SKUs
db.skus.createIndex({ sku: 1 }, { unique: true })
db.skus.createIndex({ productId: 1 })
db.skus.createIndex({ isActive: 1 })
db.skus.createIndex({ inventory: 1 })

// Carts
db.carts.createIndex({ sessionId: 1 }, { unique: true })
db.carts.createIndex({ 'items.skuId': 1 })
db.carts.createIndex({ updatedAt: 1 })
```

### 5.2 Query Optimization

1. **Pagination**: Use skip/limit with proper indexing
2. **Population**: Minimize deep population queries
3. **Projection**: Select only required fields
4. **Aggregation**: Use for complex queries and reporting

### 5.3 Connection Pooling

```javascript
// Mongoose connection configuration
mongoose.connect(mongoURI, {
  maxPoolSize: 10, // Maximum connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false,
})
```

## 6. Data Migration and Seeding

### 6.1 Initial Data Seeding

```javascript
// Seed categories
const categories = [
  { name: 'Electronics', description: 'Electronic devices and accessories' },
  { name: 'Clothing', description: 'Fashion and apparel' },
  { name: 'Books', description: 'Books and educational materials' },
  { name: 'Home & Garden', description: 'Home improvement and gardening' },
]

// Seed products for each category
// Seed SKUs for each product
```

### 6.2 Migration Scripts

- Version-controlled migration scripts
- Rollback capabilities
- Data validation after migrations
- Backup before major migrations

## 7. Backup and Recovery

### 7.1 Backup Strategy

1. **Automated Daily Backups**: Full database backup
2. **Point-in-Time Recovery**: Oplog for real-time backup
3. **Cross-Region Replication**: Geographic redundancy
4. **Backup Testing**: Regular restore testing

### 7.2 Recovery Procedures

1. **Data Corruption**: Restore from latest backup
2. **Accidental Deletion**: Point-in-time recovery
3. **Disaster Recovery**: Failover to replica set
4. **Performance Issues**: Scale replica sets

## 8. Security Considerations

### 8.1 Access Control

```javascript
// Database user with limited permissions
{
  user: "ecommerce_app",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "ecommerce" }
  ]
}
```

### 8.2 Data Protection

1. **Encryption at Rest**: MongoDB native encryption
2. **Encryption in Transit**: TLS/SSL connections
3. **Network Security**: VPC and firewall rules
4. **Audit Logging**: Track database operations

### 8.3 Sensitive Data Handling

- No PII stored (future consideration)
- Session IDs are temporary and rotated
- Price history for audit purposes
- Compliance with data protection regulations

## 9. Monitoring and Maintenance

### 9.1 Performance Monitoring

- Query performance tracking
- Index usage analysis
- Connection pool monitoring
- Storage usage tracking

### 9.2 Maintenance Tasks

1. **Index Optimization**: Regular index analysis
2. **Data Cleanup**: Remove old cart sessions
3. **Compaction**: Optimize storage usage
4. **Statistics Update**: Keep query planner current

### 9.3 Alerts and Notifications

- High query execution time
- Low available storage
- Connection pool exhaustion
- Replication lag issues

## 10. Testing Strategy

### 10.1 Unit Tests

- Model validation tests
- Custom validation logic
- Mongoose middleware tests
- Database utility functions

### 10.2 Integration Tests

- CRUD operations
- Relationship integrity
- Index performance
- Transaction scenarios

### 10.3 Performance Tests

- Load testing with realistic data volumes
- Query performance benchmarks
- Connection pool stress tests
- Concurrent access patterns

## 11. Acceptance Criteria

### 11.1 Data Integrity

- [ ] All relationships properly enforced
- [ ] Unique constraints prevent duplicates
- [ ] Soft deletes maintain data consistency
- [ ] Inventory tracking is accurate

### 11.2 Performance

- [ ] Query response times < 100ms for simple queries
- [ ] Index usage optimized for common operations
- [ ] Connection pooling handles concurrent users
- [ ] Memory usage within acceptable limits

### 11.3 Reliability

- [ ] Database connections are stable
- [ ] Backups complete successfully
- [ ] Recovery procedures tested and verified
- [ ] Error handling gracefully manages failures

## 12. Future Considerations

### 12.1 Scalability Planning

- Sharding strategy for large datasets
- Read replicas for improved performance
- Caching layer integration
- Microservices data separation

### 12.2 Feature Enhancements

- Product reviews and ratings schema
- User accounts and order history
- Advanced analytics data structure
- Multi-currency support

### 12.3 Compliance and Governance

- GDPR compliance for user data
- PCI DSS for payment information
- Data retention policies
- Privacy by design principles
