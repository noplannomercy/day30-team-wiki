import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { documentTags, tags, documents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

// Get document tags
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: documentId } = await context.params

    // Fetch tags for the document
    const docTags = await db
      .select({
        tagId: documentTags.tagId,
        tagName: tags.name,
        tagColor: tags.color,
        isAccepted: documentTags.isAccepted,
        isAiGenerated: tags.isAiGenerated,
      })
      .from(documentTags)
      .innerJoin(tags, eq(documentTags.tagId, tags.id))
      .where(eq(documentTags.documentId, documentId))

    return NextResponse.json({ tags: docTags })
  } catch (error) {
    console.error('Failed to get document tags:', error)
    return NextResponse.json(
      { error: 'Failed to get document tags' },
      { status: 500 }
    )
  }
}

// Add tag to document
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: documentId } = await context.params
    const { tagId, tagName, workspaceId, isAccepted } = await request.json()

    let finalTagId = tagId

    // If tagName is provided instead of tagId, create or find the tag
    if (!finalTagId && tagName) {
      // Check if tag exists
      const [existingTag] = await db
        .select()
        .from(tags)
        .where(and(eq(tags.workspaceId, workspaceId), eq(tags.name, tagName)))
        .limit(1)

      if (existingTag) {
        finalTagId = existingTag.id
      } else {
        // Create new tag
        const [newTag] = await db
          .insert(tags)
          .values({
            workspaceId,
            name: tagName,
            color: '#3B82F6',
            isAiGenerated: false,
          })
          .returning()

        finalTagId = newTag.id
      }
    }

    if (!finalTagId) {
      return NextResponse.json(
        { error: 'tagId or tagName is required' },
        { status: 400 }
      )
    }

    // Check if mapping already exists
    const [existing] = await db
      .select()
      .from(documentTags)
      .where(
        and(
          eq(documentTags.documentId, documentId),
          eq(documentTags.tagId, finalTagId)
        )
      )
      .limit(1)

    if (existing) {
      // Update isAccepted if provided
      if (isAccepted !== undefined) {
        await db
          .update(documentTags)
          .set({ isAccepted })
          .where(
            and(
              eq(documentTags.documentId, documentId),
              eq(documentTags.tagId, finalTagId)
            )
          )
      }
      return NextResponse.json({ success: true, existed: true })
    }

    // Create mapping
    await db.insert(documentTags).values({
      documentId,
      tagId: finalTagId,
      isAccepted: isAccepted !== undefined ? isAccepted : true,
    })

    return NextResponse.json({ success: true, tagId: finalTagId }, { status: 201 })
  } catch (error) {
    console.error('Failed to add tag to document:', error)
    return NextResponse.json(
      { error: 'Failed to add tag to document' },
      { status: 500 }
    )
  }
}

// Remove tag from document
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: documentId } = await context.params
    const searchParams = request.nextUrl.searchParams
    const tagId = searchParams.get('tagId')

    if (!tagId) {
      return NextResponse.json({ error: 'tagId is required' }, { status: 400 })
    }

    // Delete mapping
    await db
      .delete(documentTags)
      .where(
        and(eq(documentTags.documentId, documentId), eq(documentTags.tagId, tagId))
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove tag from document:', error)
    return NextResponse.json(
      { error: 'Failed to remove tag from document' },
      { status: 500 }
    )
  }
}
