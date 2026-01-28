import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getVersion } from '@/app/actions/versions'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const version = await getVersion(id)

    return NextResponse.json(version)
  } catch (error) {
    console.error('Get version error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get version',
      },
      { status: 500 }
    )
  }
}
