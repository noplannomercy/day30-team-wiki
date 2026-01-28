'use client'

import { useState, useEffect } from 'react'
import { ActivityItem } from './activity-item'
import { Loader2, Activity as ActivityIcon } from 'lucide-react'

interface Activity {
  id: string
  type: string
  description: string
  userId: string
  userName: string
  workspaceId: string
  createdAt: Date
}

interface ActivityFeedProps {
  workspaceId?: string
  limit?: number
}

export function ActivityFeed({ workspaceId, limit = 20 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      if (!workspaceId) {
        setActivities([])
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/activities?workspaceId=${workspaceId}&limit=${limit}`
        )

        if (response.ok) {
          const data = await response.json()
          setActivities(data.activities || [])
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [workspaceId, limit])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ActivityIcon className="mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          No activity yet
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Activity will appear here as you and your team work on documents
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  )
}
