import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { tags } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      )
    }

    // Fetch tags from database
    const allTags = await db
      .select()
      .from(tags)
      .where(eq(tags.workspaceId, workspaceId))
      .orderBy(asc(tags.name))

    return NextResponse.json({ tags: allTags })
  } catch (error) {
    console.error('Get tags error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get tags',
      },
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

    const { workspaceId, name, color, isAiGenerated } = await request.json()

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: 'workspaceId and name are required' },
        { status: 400 }
      )
    }

    // Validate tag name (no special chars except hyphen and underscore)
    if (!/^[a-zA-Z0-9-_ ]+$/.test(name)) {
      return NextResponse.json(
        { error: 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores' },
        { status: 400 }
      )
    }

    // Check if tag already exists
    const [existingTag] = await db
      .select()
      .from(tags)
      .where(and(eq(tags.workspaceId, workspaceId), eq(tags.name, name)))
      .limit(1)

    if (existingTag) {
      return NextResponse.json(existingTag, { status: 200 })
    }

    // Create tag in database
    const [tag] = await db
      .insert(tags)
      .values({
        workspaceId,
        name,
        color: color || '#3B82F6', // Default blue
        isAiGenerated: isAiGenerated || false,
      })
      .returning()

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Create tag error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create tag',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tagId = searchParams.get('id')

    if (!tagId) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })
    }

    // Delete tag from database (cascade will delete document_tags)
    await db.delete(tags).where(eq(tags.id, tagId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete tag error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete tag',
      },
      { status: 500 }
    )
  }
}
