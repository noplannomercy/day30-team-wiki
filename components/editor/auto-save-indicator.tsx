'use client'

import { Loader2, Check, AlertCircle } from 'lucide-react'

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  return date.toLocaleDateString()
}

interface AutoSaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
  saveError: string | null
  hasUnsavedChanges: boolean
  onRetry?: () => void
}

export function AutoSaveIndicator({
  isSaving,
  lastSaved,
  saveError,
  hasUnsavedChanges,
  onRetry,
}: AutoSaveIndicatorProps) {
  if (saveError) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-red-600 dark:text-red-400">
          Save failed
        </span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-all hover:bg-accent hover:text-accent-foreground h-6 px-2"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    )
  }

  if (lastSaved) {
    const timeAgo = getTimeAgo(lastSaved)
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Check className="h-4 w-4 text-green-500" />
        <span>
          Saved {timeAgo}
        </span>
      </div>
    )
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Unsaved changes</span>
      </div>
    )
  }

  return null
}
