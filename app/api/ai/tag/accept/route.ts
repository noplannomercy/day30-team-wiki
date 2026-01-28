import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId, tags: tagNames, workspaceId } = await request.json()

    if (!documentId || !Array.isArray(tagNames) || !workspaceId) {
      return NextResponse.json(
        { error: 'documentId, workspaceId, and tags array are required' },
        { status: 400 }
      )
    }

    const { db } = await import('@/lib/db')
    const { tags, documentTags } = await import('@/lib/db/schema')
    const { eq, and } = await import('drizzle-orm')

    const acceptedTags = []

    for (const tagName of tagNames) {
      // Check if tag exists
      const [existingTag] = await db
        .select()
        .from(tags)
        .where(and(eq(tags.workspaceId, workspaceId), eq(tags.name, tagName)))
        .limit(1)

      let tagId: string

      if (existingTag) {
        tagId = existingTag.id
      } else {
        // Create new tag
        const [newTag] = await db
          .insert(tags)
          .values({
            workspaceId,
            name: tagName,
            color: '#3B82F6',
            isAiGenerated: true,
          })
          .returning()

        tagId = newTag.id
      }

      // Check if document-tag mapping exists
      const [existingMapping] = await db
        .select()
        .from(documentTags)
        .where(
          and(eq(documentTags.documentId, documentId), eq(documentTags.tagId, tagId))
        )
        .limit(1)

      if (existingMapping) {
        // Update to accepted
        await db
          .update(documentTags)
          .set({ isAccepted: true })
          .where(
            and(
              eq(documentTags.documentId, documentId),
              eq(documentTags.tagId, tagId)
            )
          )
      } else {
        // Create mapping as accepted
        await db.insert(documentTags).values({
          documentId,
          tagId,
          isAccepted: true,
        })
      }

      acceptedTags.push({ id: tagId, name: tagName })
    }

    return NextResponse.json({
      success: true,
      acceptedTags,
    })
  } catch (error) {
    console.error('Failed to accept tags:', error)
    return NextResponse.json(
      { error: 'Failed to accept tags' },
      { status: 500 }
    )
  }
}
