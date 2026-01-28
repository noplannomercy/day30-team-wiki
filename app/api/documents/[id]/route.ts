import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createDocumentVersion } from '@/app/actions/versions'
import { db } from '@/lib/db'
import { documents, workspaceMembers, documentVersions } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { canEditDocument, canDeleteDocument, type Role } from '@/lib/permissions/check'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch document from database
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1)

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check workspace membership
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, document.workspaceId),
          eq(workspaceMembers.userId, session.user.id),
          eq(workspaceMembers.isActive, true)
        )
      )
      .limit(1)

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Failed to fetch document:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

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
    const { title, content } = await request.json()

    // Validate input
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Fetch existing document to check permissions
    const [existingDoc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1)

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Get user's role in workspace
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, existingDoc.workspaceId),
          eq(workspaceMembers.userId, session.user.id),
          eq(workspaceMembers.isActive, true)
        )
      )
      .limit(1)

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check edit permission
    const isOwner = existingDoc.createdBy === session.user.id
    if (!canEditDocument(membership.role as Role, isOwner)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if content has changed and create version BEFORE updating
    const contentChanged = existingDoc.content.trim() !== content.trim()

    if (contentChanged) {
      try {
        // Get the latest version number
        const [latestVersion] = await db
          .select()
          .from(documentVersions)
          .where(eq(documentVersions.documentId, id))
          .orderBy(desc(documentVersions.versionNumber))
          .limit(1)

        const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1

        // Create new version with updated content
        await db.insert(documentVersions).values({
          documentId: id,
          versionNumber: newVersionNumber,
          title,
          content,
          createdBy: session.user.id,
        })

        console.log(`Created version ${newVersionNumber} for document ${id}`)
      } catch (error) {
        console.error('Failed to create version:', error)
        // Log the full error for debugging
        if (error instanceof Error) {
          console.error('Version creation error details:', {
            message: error.message,
            stack: error.stack,
          })
        }
      }
    }

    // Update document in database
    const [updatedDocument] = await db
      .update(documents)
      .set({
        title,
        content,
        updatedBy: session.user.id,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning()

    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error('Failed to update document:', error)
    return NextResponse.json(
      { error: 'Failed to update document' },
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

    // Fetch document to check permissions
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1)

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Get user's role in workspace
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, document.workspaceId),
          eq(workspaceMembers.userId, session.user.id),
          eq(workspaceMembers.isActive, true)
        )
      )
      .limit(1)

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check delete permission
    const isOwner = document.createdBy === session.user.id
    if (!canDeleteDocument(membership.role as Role, isOwner)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete document (cascade will handle related records)
    await db.delete(documents).where(eq(documents.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
