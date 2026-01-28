import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { deleteFile } from '@/lib/storage/local'
import { db } from '@/lib/db'
import { images, documents, workspaceMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

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

    // Get image from database with document info
    const [imageRecord] = await db
      .select({
        image: images,
        document: documents,
      })
      .from(images)
      .innerJoin(documents, eq(images.documentId, documents.id))
      .where(eq(images.id, id))
      .limit(1)

    if (!imageRecord) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Check if user has permission to delete (must have edit permission on document)
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, imageRecord.document.workspaceId),
          eq(workspaceMembers.userId, session.user.id),
          eq(workspaceMembers.isActive, true)
        )
      )
      .limit(1)

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if user has edit permission
    const canEdit = ['owner', 'admin', 'editor'].includes(membership.role)
    const isCreator = imageRecord.document.createdBy === session.user.id

    if (!canEdit && !isCreator) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this image' },
        { status: 403 }
      )
    }

    // Delete from storage
    try {
      // Extract filename from URL (e.g., "/uploads/filename.jpg" -> "filename.jpg")
      const fileName = imageRecord.image.fileUrl.split('/').pop()
      if (fileName) {
        await deleteFile(fileName)
      }
    } catch (storageError) {
      console.error('Failed to delete file from storage:', storageError)
      // Continue with DB deletion even if storage deletion fails
    }

    // Delete from database
    await db.delete(images).where(eq(images.id, id))

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Image deletion failed:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
