'use client'

import { useDocumentCount } from '@/lib/hooks/use-document-count'

export function DocumentCounter() {
  const { count, loading } = useDocumentCount()

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Loading...</span>
      </div>
    )
  }

  const percentage = (count / 100) * 100
  const isNearLimit = count >= 90
  const isAtLimit = count >= 100

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full transition-all ${
            isNearLimit
              ? 'bg-red-500'
              : count >= 70
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={`text-sm font-medium ${
          isNearLimit
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {count}/100
      </span>
      {isAtLimit && (
        <span className="text-xs text-red-600 dark:text-red-400">
          (Limit reached)
        </span>
      )}
    </div>
  )
}
