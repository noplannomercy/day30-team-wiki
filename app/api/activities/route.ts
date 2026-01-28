import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { activities, users, documents, workspaceMembers } from '@/lib/db/schema'
import { desc, eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const workspaceId = searchParams.get('workspaceId')
    const limit = parseInt(searchParams.get('limit') || '50')

    // If no workspaceId provided, get user's first active workspace
    let targetWorkspaceId = workspaceId
    if (!targetWorkspaceId) {
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
        return NextResponse.json({ activities: [] })
      }
      targetWorkspaceId = membership.workspaceId
    }

    // Fetch activities from database with user info
    const activityList = await db
      .select({
        id: activities.id,
        workspaceId: activities.workspaceId,
        userId: activities.userId,
        action: activities.action,
        targetType: activities.targetType,
        targetId: activities.targetId,
        createdAt: activities.createdAt,
        userName: users.name,
        userEmail: users.email,
        userAvatar: users.avatarUrl,
      })
      .from(activities)
      .leftJoin(users, eq(activities.userId, users.id))
      .where(eq(activities.workspaceId, targetWorkspaceId))
      .orderBy(desc(activities.createdAt))
      .limit(limit)

    // Format activities for display
    const formattedActivities = activityList.map((activity) => ({
      id: activity.id,
      type: activity.action,
      description: formatActivityDescription(activity),
      userId: activity.userId,
      userName: activity.userName || 'Unknown User',
      userEmail: activity.userEmail,
      userAvatar: activity.userAvatar,
      workspaceId: activity.workspaceId,
      targetType: activity.targetType,
      targetId: activity.targetId,
      createdAt: activity.createdAt,
    }))

    return NextResponse.json({ activities: formattedActivities })
  } catch (error) {
    console.error('Get activities error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to get activities',
      },
      { status: 500 }
    )
  }
}

function formatActivityDescription(activity: any): string {
  const action = activity.action
  const targetType = activity.targetType

  if (action === 'created') {
    return `Created ${targetType}`
  } else if (action === 'updated') {
    return `Updated ${targetType}`
  } else if (action === 'deleted') {
    return `Deleted ${targetType}`
  } else if (action === 'commented') {
    return `Commented on ${targetType}`
  } else if (action === 'shared') {
    return `Shared ${targetType}`
  } else {
    return `${action} ${targetType}`
  }
}

/**
 * Create a new activity log entry
 * Called by other parts of the app when actions occur
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId, action, targetType, targetId } = await request.json()

    if (!workspaceId || !action || !targetType || !targetId) {
      return NextResponse.json(
        { error: 'workspaceId, action, targetType, and targetId are required' },
        { status: 400 }
      )
    }

    // Create activity in database
    const [activity] = await db
      .insert(activities)
      .values({
        workspaceId,
        userId: session.user.id,
        action,
        targetType,
        targetId,
      })
      .returning()

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Create activity error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create activity',
      },
      { status: 500 }
    )
  }
}
