import { ActivityFeed } from '@/components/activity/activity-feed'
import { Activity } from 'lucide-react'

export default function ActivityPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Activity Feed</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recent workspace activity
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl">
          <ActivityFeed workspaceId="default-workspace" limit={50} />
        </div>
      </div>
    </div>
  )
}
