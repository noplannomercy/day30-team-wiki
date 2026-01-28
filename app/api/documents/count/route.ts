import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { documents, workspaceMembers } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's workspace (use first active workspace)
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, session.user.id),
          eq(workspaceMembers.isActive, true)
        )
      )
      .limit(1)

    if (!membership) {
      return NextResponse.json({ count: 0 })
    }

    // Count documents from database
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(eq(documents.workspaceId, membership.workspaceId))

    const count = result[0]?.count || 0

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Failed to count documents:', error)
    return NextResponse.json(
      { error: 'Failed to count documents' },
      { status: 500 }
    )
  }
}
