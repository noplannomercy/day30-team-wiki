import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { restoreDocumentVersion } from '@/app/actions/versions'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: versionId } = await context.params
    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      )
    }

    await restoreDocumentVersion(documentId, versionId)

    return NextResponse.json({
      success: true,
      message: 'Version restored successfully',
    })
  } catch (error) {
    console.error('Restore version error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to restore version',
      },
      { status: 500 }
    )
  }
}
