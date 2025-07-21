# E-commerce Application - Documentation

## Overview

This is a full-stack e-commerce application built with React 19, Next.js, and MongoDB. The application consists of both frontend user interface and backend inventory management system.

## Project Structure

```
Assignment1/
├── DOC/                          # Documentation
│   ├── README.md                 # This file
│   ├── PRD-Frontend.md           # Frontend Product Requirements
│   ├── PRD-Backend.md            # Backend Product Requirements
│   ├── PRD-Database.md           # Database Design Requirements
│   ├── PRD-Authentication.md     # Authentication Module Requirements
│   ├── PRD-Cart.md               # Shopping Cart Module Requirements
│   └── API-Documentation.md      # API Endpoints Documentation
├── src/                          # Source code
│   ├── app/                      # Next.js App Router
│   ├── components/               # React Components
│   ├── lib/                      # Utilities and configurations
│   ├── models/                   # Database models
│   └── api/                      # API routes
├── tests/                        # Test files
├── public/                       # Static assets
└── package.json                  # Dependencies
```

## Tech Stack

- **Frontend**: React 19, Next.js 14
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Testing**: Jest, React Testing Library, Supertest
- **Styling**: Tailwind CSS (recommended)
- **Validation**: Zod
- **Type Safety**: TypeScript

## Modules

1. **Category Management** - CRUD operations for product categories
2. **Product Management** - CRUD operations for products
3. **SKU Management** - Manage product variants and inventory
4. **Shopping Cart** - Session-based cart management with backend APIs
5. **Product Listing** - Frontend product browsing with custom backend integration
6. **Product Details** - Detailed product views with SKU variants
7. **Database Layer** - MongoDB integration and models

## Key Decisions

- **Cart Management**: Full backend API implementation with session-based persistence
- **Product Structure**: Custom Product/SKU model (not using FakeStore API)
- **Frontend Integration**: Direct connection to custom backend APIs
- **Testing**: Jest + React Testing Library for comprehensive coverage

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables (see `.env.example`)
3. Start development server: `npm run dev`
4. Run tests: `npm test`

## Documentation Files

- [Frontend PRD](./PRD-Frontend.md) - Frontend application requirements
- [Backend PRD](./PRD-Backend.md) - Backend API requirements
- [Database PRD](./PRD-Database.md) - Database design and relationships
- [Cart PRD](./PRD-Cart.md) - Shopping cart functionality
- [API Documentation](./API-Documentation.md) - Complete API reference
