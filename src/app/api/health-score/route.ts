import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { businessHealthScoring } from '@/lib/business-intelligence/scoring-engine'
import { apiLogger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      apiLogger.response('GET', '/api/health-score', 401, Date.now() - startTime)
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    apiLogger.request('GET', '/api/health-score', session.user.id)

    // Calculate health score for the user
    const healthScore = await businessHealthScoring.calculateHealthScore(session.user.id)

    apiLogger.response('GET', '/api/health-score', 200, Date.now() - startTime, session.user.id, {
      score: healthScore.overall,
      grade: healthScore.grade
    })

    return NextResponse.json(healthScore)
  } catch (error: any) {
    const duration = Date.now() - startTime
    apiLogger.error('GET', '/api/health-score', error, undefined, { duration })
    
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      apiLogger.response('POST', '/api/health-score', 401, Date.now() - startTime)
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    apiLogger.request('POST', '/api/health-score', session.user.id)

    // Force recalculation of health score
    const healthScore = await businessHealthScoring.calculateHealthScore(session.user.id)

    apiLogger.response('POST', '/api/health-score', 200, Date.now() - startTime, session.user.id, {
      action: 'recalculated',
      score: healthScore.overall
    })

    return NextResponse.json({
      message: 'Health score recalculated successfully',
      healthScore
    })
  } catch (error: any) {
    const duration = Date.now() - startTime
    apiLogger.error('POST', '/api/health-score', error, session?.user?.id, { duration })
    
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}