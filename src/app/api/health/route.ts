import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'API is working' 
    })
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}