import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          api: 'running',
          database: 'pending', // Will be updated when MongoDB is connected
        },
        version: '1.0.0',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Health check failed',
        },
      },
      { status: 500 }
    )
  }
}
