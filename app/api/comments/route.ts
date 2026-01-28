import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { comments, users } from '@/lib/db/schema'
import { eq, isNull, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      )
    }

    // Fetch all comments for document
    const allComments = await db
      .select({
        id: comments.id,
        documentId: comments.documentId,
        userId: comments.userId,
        content: comments.content,
        parentCommentId: comments.parentCommentId,
        resolved: comments.resolved,
        resolvedBy: comments.resolvedBy,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        isEdited: comments.isEdited,
        userName: users.name,
        userEmail: users.email,
        userAvatar: users.avatarUrl,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.documentId, documentId))
      .orderBy(comments.createdAt)

    // Build tree structure
    const commentMap = new Map()
    const rootComments: any[] = []

    // First pass: create all comment objects
    allComments.forEach((comment) => {
      commentMap.set(comment.id, {
        id: comment.id,
        documentId: comment.documentId,
        userId: comment.userId,
        content: comment.content,
        parentCommentId: comment.parentCommentId,
        resolved: comment.resolved,
        resolvedBy: comment.resolvedBy,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        isEdited: comment.isEdited,
        user: {
          id: comment.userId,
          name: comment.userName,
          email: comment.userEmail,
          avatarUrl: comment.userAvatar,
        },
        replies: [],
      })
    })

    // Second pass: build tree
    commentMap.forEach((comment) => {
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId)
        if (parent) {
          parent.replies.push(comment)
        }
      } else {
        rootComments.push(comment)
      }
    })

    return NextResponse.json({ comments: rootComments })
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
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

    const { documentId, content, parentCommentId } = await request.json()

    // Validate input
    if (!documentId || !content) {
      return NextResponse.json(
        { error: 'documentId and content are required' },
        { status: 400 }
      )
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      )
    }

    // Save comment to database
    const [newComment] = await db
      .insert(comments)
      .values({
        documentId,
        userId: session.user.id,
        content: content.trim(),
        parentCommentId: parentCommentId || null,
        resolved: false,
        isEdited: false,
      })
      .returning()

    // Fetch user info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    const comment = {
      id: newComment.id,
      documentId: newComment.documentId,
      userId: newComment.userId,
      content: newComment.content,
      parentCommentId: newComment.parentCommentId,
      resolved: newComment.resolved,
      createdAt: newComment.createdAt.toISOString(),
      updatedAt: newComment.updatedAt.toISOString(),
      isEdited: newComment.isEdited,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
