import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { documentTags, documents, workspaceMembers, tags as tagsTable } from '@/lib/db/schema'
import { eq, and, inArray, sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId, tags } = await request.json()

    if (!documentId || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'documentId and tags array are required' },
        { status: 400 }
      )
    }

    // Get document to verify access
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1)

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get user's workspace membership
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, session.user.id),
          eq(workspaceMembers.workspaceId, document.workspaceId),
          eq(workspaceMembers.isActive, true)
        )
      )
      .limit(1)

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Extract tag IDs from the tags array
    const tagIds = tags.map(tag => typeof tag === 'string' ? tag : tag.id)

    // Delete suggested tags from document_tags (only isAccepted = false)
    await db
      .delete(documentTags)
      .where(
        and(
          eq(documentTags.documentId, documentId),
          inArray(documentTags.tagId, tagIds),
          eq(documentTags.isAccepted, false)
        )
      )

    // Optionally: Clean up tags that are no longer used anywhere
    for (const tagId of tagIds) {
      // Check if tag is used in any other documents
      const usageCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(documentTags)
        .where(eq(documentTags.tagId, tagId))

      // If tag is AI-generated and not used anywhere, delete it
      if (usageCount[0]?.count === 0) {
        const [tag] = await db
          .select()
          .from(tagsTable)
          .where(eq(tagsTable.id, tagId))
          .limit(1)

        if (tag && tag.isAiGenerated) {
          await db.delete(tagsTable).where(eq(tagsTable.id, tagId))
        }
      }
    }

    return NextResponse.json({
      success: true,
      rejectedTags: tagIds,
    })
  } catch (error) {
    console.error('Failed to reject tags:', error)
    return NextResponse.json(
      { error: 'Failed to reject tags' },
      { status: 500 }
    )
  }
}
