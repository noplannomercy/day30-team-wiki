'use client'

import { FileText, MessageSquare, Edit, Share2, UserPlus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  type: string
  description: string
  userId: string
  userName: string
  createdAt: Date
}

interface ActivityItemProps {
  activity: Activity
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'document_created':
        return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'document_updated':
        return <Edit className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      case 'document_shared':
        return <Share2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      case 'member_added':
        return <UserPlus className="h-4 w-4 text-pink-600 dark:text-pink-400" />
      default:
        return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900">
      <div className="mt-0.5 flex-shrink-0">{getIcon(activity.type)}</div>

      <div className="flex-1 space-y-1">
        <p className="text-sm text-gray-900 dark:text-white">
          <span className="font-medium">{activity.userName}</span>{' '}
          {activity.description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(activity.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  )
}
