import { NextResponse } from 'next/server'
import { ErrorCode, ApiResponse, ApiError } from '@/types'

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: any[]

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any[]
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any[]) {
    super('VALIDATION_ERROR', message, 400, details)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super('NOT_FOUND', message, 404)
  }
}

export class DuplicateResourceError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super('DUPLICATE_RESOURCE', message, 409)
  }
}

export class InsufficientInventoryError extends AppError {
  constructor(message: string = 'Not enough stock available') {
    super('INSUFFICIENT_INVENTORY', message, 400)
  }
}

export class SessionRequiredError extends AppError {
  constructor(message: string = 'Session ID is required') {
    super('SESSION_REQUIRED', message, 400)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super('DATABASE_ERROR', message, 500)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super('RATE_LIMIT_EXCEEDED', message, 429)
  }
}

// Error response formatter
export function createErrorResponse(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  if (error instanceof AppError) {
    const apiError: ApiError = {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    }

    return NextResponse.json(
      {
        success: false,
        error: apiError,
      },
      { status: error.statusCode }
    )
  }

  // Handle Mongoose validation errors
  if (error && typeof error === 'object' && 'name' in error) {
    if ((error as any).name === 'ValidationError') {
      const mongooseError = error as any
      const details = Object.values(mongooseError.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }))

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details,
          },
        },
        { status: 400 }
      )
    }

    if ((error as any).name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid ID format',
          },
        },
        { status: 400 }
      )
    }

    if ((error as any).code === 11000) {
      // MongoDB duplicate key error
      const field = Object.keys((error as any).keyPattern || {})[0] || 'field'
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_RESOURCE',
            message: `${field} already exists`,
          },
        },
        { status: 409 }
      )
    }
  }

  // Handle custom validation errors (from Zod)
  if (error instanceof Error && (error as any).code === 'VALIDATION_ERROR') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: (error as any).details,
        },
      },
      { status: 400 }
    )
  }

  // Default internal server error
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    },
    { status: 500 }
  )
}

// Success response formatter
export function createSuccessResponse<T>(
  data: T,
  meta?: any,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  }

  return NextResponse.json(response, { status })
}

// Async error wrapper for API routes
export function asyncHandler<T = any>(
  handler: (request: Request, context?: { params: T }) => Promise<NextResponse>
) {
  return async (
    request: Request,
    context?: { params: T }
  ): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      return createErrorResponse(error)
    }
  }
}

// Validation error helper
export function throwValidationError(message: string, details?: any[]): never {
  throw new ValidationError(message, details)
}

// Not found error helper
export function throwNotFoundError(resource: string = 'Resource'): never {
  throw new NotFoundError(`${resource} not found`)
}

// Duplicate resource error helper
export function throwDuplicateError(resource: string = 'Resource'): never {
  throw new DuplicateResourceError(`${resource} already exists`)
}

// Database error helper
export function throwDatabaseError(message?: string): never {
  throw new DatabaseError(message)
}

// Session error helper
export function throwSessionError(message?: string): never {
  throw new SessionRequiredError(message)
}

// Inventory error helper
export function throwInventoryError(message?: string): never {
  throw new InsufficientInventoryError(message)
}
