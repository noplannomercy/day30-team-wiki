import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { searchContent, SearchFilters } from '@/lib/search/postgres-fts'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') as 'document' | 'comment' | 'all' | null
    const authorIds = searchParams.get('authorIds')?.split(',').filter(Boolean)
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
        query: '',
      })
    }

    const filters: SearchFilters = {
      type: type || 'all',
      authorIds,
      tags,
      startDate,
      endDate,
    }

    const { results, total } = await searchContent({
      query,
      filters,
      limit,
      offset,
    })

    return NextResponse.json({
      results,
      total,
      query,
      filters,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to search',
      },
      { status: 500 }
    )
  }
}
