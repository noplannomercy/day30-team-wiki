import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { shareLinks, documents, workspaceMembers, activities } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId, password, expiresAt } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
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

    // Check user permissions - must have at least 'viewer' role in workspace
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

    // Generate unique token
    const token = crypto.randomUUID()

    // Hash password if provided
    const passwordHash = password ? await bcrypt.hash(password, 10) : null

    // Save share link to database
    const [savedShareLink] = await db
      .insert(shareLinks)
      .values({
        documentId,
        token,
        password: passwordHash,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        viewCount: 0,
        createdBy: session.user.id,
      })
      .returning()

    // Log activity
    await db.insert(activities).values({
      workspaceId: document.workspaceId,
      userId: session.user.id,
      action: 'shared',
      targetType: 'document',
      targetId: documentId,
    })

    const shareLinkResponse = {
      ...savedShareLink,
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${token}`,
    }

    return NextResponse.json(shareLinkResponse, { status: 201 })
  } catch (error) {
    console.error('Failed to create share link:', error)
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    )
  }
}
