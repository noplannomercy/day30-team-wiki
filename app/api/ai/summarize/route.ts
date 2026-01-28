import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { generateSummary } from '@/lib/ai/summarize'
import { db } from '@/lib/db'
import { aiJobs, documents, workspaceMembers } from '@/lib/db/schema'
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

    // Get document to verify access
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
        jobType: 'summarization',
        status: 'pending',
      })
      .returning()

    try {
      // Process synchronously (can be moved to background queue later)
      const summary = await generateSummary(title, content)

      // Save summary to document.aiSummary field
      await db
        .update(documents)
        .set({
          aiSummary: summary,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, documentId))

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
        summary,
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
    console.error('AI summarization failed:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate summary',
      },
      { status: 500 }
    )
  }
}
