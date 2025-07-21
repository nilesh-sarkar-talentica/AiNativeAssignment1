# E-commerce Application

A full-stack e-commerce application built with Next.js 19, React 19, MongoDB, and TypeScript.

## Features

- 🛍️ Product browsing with search and filtering
- 📦 Product catalog with categories and SKU variants
- 🛒 Session-based shopping cart
- 📱 Responsive design with Tailwind CSS
- 🧪 Comprehensive testing with Jest
- 🔒 Type-safe with TypeScript
- 📊 MongoDB database with Mongoose ODM

## Tech Stack

- **Frontend**: React 19, Next.js 15, Tailwind CSS
- **Backend**: Next.js API Routes, Mongoose
- **Database**: MongoDB
- **Testing**: Jest, React Testing Library, Supertest
- **Validation**: Zod
- **Type Safety**: TypeScript

## Prerequisites

- Node.js 18+
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Getting Started

### 1. Clone and Install

```bash
# Clone the repository
cd Assignment1

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment example
cp env.example .env.local

# Edit .env.local with your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/ecommerce
```

### 3. Database Setup

Make sure MongoDB is running locally, or update `MONGODB_URI` to point to your MongoDB Atlas cluster.

### 4. Seed Database (Optional)

```bash
# Seed the database with sample data
npm run seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
Assignment1/
├── DOC/                          # Documentation
│   ├── README.md                 # Project overview
│   ├── PRD-Frontend.md           # Frontend requirements
│   ├── PRD-Backend.md            # Backend requirements
│   ├── PRD-Database.md           # Database design
│   ├── PRD-Cart.md               # Cart functionality
│   └── API-Documentation.md      # API endpoints
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Home page
│   │   ├── products/             # Product pages
│   │   ├── cart/                 # Cart page
│   │   └── api/                  # API routes
│   ├── components/               # React components
│   │   ├── ui/                   # Base UI components
│   │   ├── layout/               # Layout components
│   │   ├── product/              # Product components
│   │   └── cart/                 # Cart components
│   ├── lib/                      # Utilities and configurations
│   │   ├── mongodb.ts            # Database connection
│   │   ├── validations.ts        # Zod schemas
│   │   └── utils.ts              # Helper functions
│   ├── models/                   # Database models
│   │   ├── Category.ts
│   │   ├── Product.ts
│   │   ├── SKU.ts
│   │   └── Cart.ts
│   └── types/                    # TypeScript types
├── tests/                        # Test files
├── public/                       # Static assets
└── scripts/                      # Utility scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - TypeScript type checking
- `npm run seed` - Seed database with sample data

## API Endpoints

The application provides RESTful APIs for:

- **Categories**: CRUD operations for product categories
- **Products**: CRUD operations with search and filtering
- **SKUs**: Product variant management
- **Cart**: Session-based cart management

See [API Documentation](./DOC/API-Documentation.md) for detailed endpoint information.

## Database Schema

The application uses MongoDB with four main collections:

- **categories** - Product categories
- **products** - Product information
- **skus** - Product variants and inventory
- **carts** - Session-based shopping carts

See [Database PRD](./DOC/PRD-Database.md) for detailed schema information.

## Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- Category.test.ts
```

## Key Features

### Product Management

- Hierarchical category structure
- Product variants with SKUs
- Inventory tracking
- Search and filtering

### Shopping Cart

- Session-based (no authentication required)
- Persistent across browser sessions
- Inventory validation
- Real-time updates

### Frontend Features

- Responsive design
- Server-side rendering
- Optimistic UI updates
- Error handling

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

This project is for educational purposes.
