import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { folders, documents, workspaceMembers } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's workspace (use first active workspace)
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, session.user.id),
          eq(workspaceMembers.isActive, true)
        )
      )
      .limit(1)

    if (!membership) {
      return NextResponse.json(
        { error: 'User not in any workspace' },
        { status: 403 }
      )
    }

    // Fetch all folders in workspace
    const allFolders = await db
      .select()
      .from(folders)
      .where(eq(folders.workspaceId, membership.workspaceId))
      .orderBy(folders.name)

    // Fetch all documents in workspace
    const allDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.workspaceId, membership.workspaceId))
      .orderBy(documents.updatedAt)

    return NextResponse.json({
      folders: allFolders,
      documents: allDocuments,
    })
  } catch (error) {
    console.error('Failed to fetch folders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    )
  }
}
