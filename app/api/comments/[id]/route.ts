import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { comments, documents, workspaceMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { content, resolved } = await request.json()

    // Get comment from database
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1)

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isAuthor = comment.userId === session.user.id
    const isResolvingOnly = resolved !== undefined && content === undefined

    if (!isAuthor && !isResolvingOnly) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      )
    }

    // Update comment
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (content !== undefined) {
      updateData.content = content
      updateData.isEdited = true
    }

    if (resolved !== undefined) {
      updateData.resolved = resolved
      if (resolved) {
        updateData.resolvedBy = session.user.id
      } else {
        updateData.resolvedBy = null
      }
    }

    const [updatedComment] = await db
      .update(comments)
      .set(updateData)
      .where(eq(comments.id, id))
      .returning()

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('Failed to update comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get comment from database
    const [comment] = await db
      .select({
        comment: comments,
        document: documents,
      })
      .from(comments)
      .innerJoin(documents, eq(comments.documentId, documents.id))
      .where(eq(comments.id, id))
      .limit(1)

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Get user's role in workspace
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, comment.document.workspaceId),
          eq(workspaceMembers.userId, session.user.id),
          eq(workspaceMembers.isActive, true)
        )
      )
      .limit(1)

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check permissions: author can delete their own, admin/owner can delete any
    const isAuthor = comment.comment.userId === session.user.id
    const isAdmin = membership.role === 'owner' || membership.role === 'admin'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own comments or be an admin' },
        { status: 403 }
      )
    }

    // Delete comment (cascade will delete replies)
    await db.delete(comments).where(eq(comments.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
