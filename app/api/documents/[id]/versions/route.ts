import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { documentVersions, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

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

    const { id: documentId } = await context.params

    // Fetch all versions for the document with user info
    const versions = await db
      .select({
        id: documentVersions.id,
        versionNumber: documentVersions.versionNumber,
        title: documentVersions.title,
        content: documentVersions.content,
        createdAt: documentVersions.createdAt,
        createdBy: documentVersions.createdBy,
        creatorName: users.name,
        creatorEmail: users.email,
        creatorAvatar: users.avatarUrl,
      })
      .from(documentVersions)
      .innerJoin(users, eq(documentVersions.createdBy, users.id))
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(desc(documentVersions.versionNumber))

    return NextResponse.json({
      versions: versions.map((v) => ({
        id: v.id,
        versionNumber: v.versionNumber,
        title: v.title,
        content: v.content,
        createdAt: v.createdAt.toISOString(),
        createdBy: v.createdBy,
        creator: {
          name: v.creatorName,
          email: v.creatorEmail,
          avatarUrl: v.creatorAvatar,
        },
      })),
    })
  } catch (error) {
    console.error('Failed to fetch versions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    )
  }
}
