import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { documents, workspaceMembers, users, folders } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

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
      return NextResponse.json({ documents: [] })
    }

    // Fetch documents from database with creator and folder info
    const documentsList = await db
      .select({
        id: documents.id,
        workspaceId: documents.workspaceId,
        folderId: documents.folderId,
        title: documents.title,
        content: documents.content,
        aiSummary: documents.aiSummary,
        createdBy: documents.createdBy,
        updatedBy: documents.updatedBy,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(documents)
      .leftJoin(users, eq(documents.createdBy, users.id))
      .where(eq(documents.workspaceId, membership.workspaceId))
      .orderBy(desc(documents.updatedAt))

    return NextResponse.json({ documents: documentsList })
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, title, content, folderId } = await request.json()

    // Validate input
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
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

    // Check if updating existing document (when id is provided)
    if (id) {
      const [existingDoc] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id))
        .limit(1)

      if (existingDoc) {
        // Update existing document
        const [updated] = await db
          .update(documents)
          .set({
            title,
            content,
            updatedBy: session.user.id,
            updatedAt: new Date(),
          })
          .where(eq(documents.id, id))
          .returning()

        return NextResponse.json(updated, { status: 200 })
      }
    }

    // Check document count limit (100 max)
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(eq(documents.workspaceId, membership.workspaceId))

    const currentCount = countResult[0]?.count || 0
    if (currentCount >= 100) {
      return NextResponse.json(
        {
          error: 'Document limit reached',
          message: 'Your workspace has reached the maximum limit of 100 documents. Please delete some documents before creating new ones.',
        },
        { status: 403 }
      )
    }

    // Create new document
    const [document] = await db
      .insert(documents)
      .values({
        id: id || undefined,
        workspaceId: membership.workspaceId,
        folderId: folderId || null,
        title,
        content,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      })
      .returning()

    // Create initial version
    try {
      const { documentVersions } = await import('@/lib/db/schema')
      await db.insert(documentVersions).values({
        documentId: document.id,
        versionNumber: 1,
        title: document.title,
        content: document.content,
        createdBy: session.user.id,
      })
    } catch (error) {
      console.error('Failed to create initial version:', error)
    }

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Failed to create document:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}
