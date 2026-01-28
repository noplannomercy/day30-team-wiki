import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { optimizeImage, validateImageType, getImageExtension } from '@/lib/image/optimize'
import { saveFile, generateFileName } from '@/lib/storage/local'
import { db } from '@/lib/db'
import { images, documents, workspaceMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentId = formData.get('documentId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate documentId if provided
    if (documentId) {
      const [document] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId))
        .limit(1)

      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      // Verify user has access to the document
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
    }

    // Validate file type
    if (!validateImageType(file.type)) {
      return NextResponse.json(
        { error: 'Only PNG, JPG, and GIF images are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Optimize image if >1MB
    const { buffer: optimizedBuffer, size, optimized } = await optimizeImage(
      buffer,
      file.type
    )

    // Generate unique filename
    const extension = getImageExtension(file.type)
    const fileName = generateFileName(file.name, extension)

    // Save file
    const fileUrl = await saveFile(optimizedBuffer, fileName)

    // Save image metadata to database (only if documentId is provided)
    let savedImage
    if (documentId) {
      [savedImage] = await db
        .insert(images)
        .values({
          documentId,
          fileUrl,
          fileName: file.name,
          fileSize: size,
          mimeType: file.type,
          isOptimized: optimized,
        })
        .returning()
    }

    return NextResponse.json({
      id: savedImage?.id || crypto.randomUUID(),
      documentId,
      fileUrl,
      fileName: file.name,
      fileSize: size,
      mimeType: file.type,
      isOptimized: optimized,
      createdAt: savedImage?.createdAt || new Date(),
      url: fileUrl,
      originalSize: file.size,
      optimizedSize: size,
      saved: optimized ? file.size - size : 0,
      savedPercentage: optimized
        ? Math.round(((file.size - size) / file.size) * 100)
        : 0,
    })
  } catch (error) {
    console.error('Image upload failed:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
