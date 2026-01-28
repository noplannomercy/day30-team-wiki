import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { generateTags } from '@/lib/ai/tagging'
import { db } from '@/lib/db'
import { aiJobs, tags, documentTags, documents, workspaceMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId, title, content } = await request.json()

    if (!documentId || !title || !content) {
      return NextResponse.json(
        { error: 'documentId, title, and content are required' },
        { status: 400 }
      )
    }

    // Get document to verify access and get workspaceId
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

    // Create AI job record with status 'pending'
    const [job] = await db
      .insert(aiJobs)
      .values({
        documentId,
        jobType: 'tagging',
        status: 'pending',
      })
      .returning()

    try {
      // Process synchronously (can be moved to background queue later)
      const generatedTags = await generateTags(title, content)

      // AI-generated tag colors (cycle through these)
      const tagColors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#EC4899', '#14B8A6', '#F97316'
      ]

      // Save suggested tags to database with isAccepted = false
      const savedTags = []
      for (let i = 0; i < generatedTags.length; i++) {
        const tagName = generatedTags[i]
        const tagColor = tagColors[i % tagColors.length]

        // Check if tag already exists in workspace
        const [existingTag] = await db
          .select()
          .from(tags)
          .where(
            and(
              eq(tags.workspaceId, document.workspaceId),
              eq(tags.name, tagName)
            )
          )
          .limit(1)

        let tagId: string
        let tagColorToUse: string

        if (existingTag) {
          tagId = existingTag.id
          tagColorToUse = existingTag.color || tagColor
        } else {
          // Create new tag
          const [newTag] = await db
            .insert(tags)
            .values({
              workspaceId: document.workspaceId,
              name: tagName,
              color: tagColor,
              isAiGenerated: true,
            })
            .returning()
          tagId = newTag.id
          tagColorToUse = tagColor
        }

        // Check if document already has this tag
        const [existingDocTag] = await db
          .select()
          .from(documentTags)
          .where(
            and(
              eq(documentTags.documentId, documentId),
              eq(documentTags.tagId, tagId)
            )
          )
          .limit(1)

        if (!existingDocTag) {
          // Create document-tag relationship with isAccepted = false
          await db.insert(documentTags).values({
            documentId,
            tagId,
            isAccepted: false,
          })

          savedTags.push({
            id: tagId,
            name: tagName,
            color: tagColorToUse,
            isAiGenerated: true,
            isAccepted: false,
          })
        }
      }

      // Update job status to completed
      await db
        .update(aiJobs)
        .set({
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(aiJobs.id, job.id))

      return NextResponse.json({
        jobId: job.id,
        status: 'completed',
        tags: savedTags,
      })
    } catch (error) {
      // Update job status to failed
      await db
        .update(aiJobs)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        })
        .where(eq(aiJobs.id, job.id))

      throw error
    }
  } catch (error) {
    console.error('AI tagging failed:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate tags',
      },
      { status: 500 }
    )
  }
}
