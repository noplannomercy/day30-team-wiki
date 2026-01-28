'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VersionDiff } from './version-diff'
import { History, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Version {
  id: string
  versionNumber: number
  title: string
  content: string
  createdAt: Date | string
  createdBy: string
  creator?: {
    name: string
    email: string
    avatarUrl?: string
  }
}

interface VersionTimelineProps {
  versions: Version[]
  currentTitle: string
  currentContent: string
  onRestore?: (versionId: string) => void
  canRestore?: boolean
}

export function VersionTimeline({
  versions,
  currentTitle,
  currentContent,
  onRestore,
  canRestore = false,
}: VersionTimelineProps) {
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null)
  const [comparingVersionId, setComparingVersionId] = useState<string | null>(null)

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          No version history yet
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Versions are automatically created when you save changes to this document
        </p>
      </div>
    )
  }

  const handleToggleExpand = (versionId: string) => {
    if (expandedVersionId === versionId) {
      setExpandedVersionId(null)
      setComparingVersionId(null)
    } else {
      setExpandedVersionId(versionId)
      setComparingVersionId(versionId)
    }
  }

  const handleRestore = async (versionId: string) => {
    if (onRestore) {
      await onRestore(versionId)
    }
  }

  // Get the version to compare against (the one after the comparing version)
  const getComparisonVersion = (versionId: string) => {
    const index = versions.findIndex((v) => v.id === versionId)
    if (index === 0) {
      // Comparing against current version
      return { title: currentTitle, content: currentContent }
    }
    return versions[index - 1]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Version History</h2>
        <Badge variant="outline">
          {versions.length} version{versions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-2">
        {versions.map((version, index) => {
          const isExpanded = expandedVersionId === version.id
          const isLatest = index === 0
          const comparisonVersion = getComparisonVersion(version.id)

          return (
            <div
              key={version.id}
              className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
            >
              {/* Version Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    v{version.versionNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {version.title}
                      </h3>
                      {isLatest && (
                        <Badge variant="secondary" className="text-xs">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDistanceToNow(new Date(version.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canRestore && !isLatest && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(version.id)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleExpand(version.id)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4" />
                        Hide Changes
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        View Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Diff Viewer (when expanded) */}
              {isExpanded && comparingVersionId && (
                <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                  <VersionDiff
                    oldContent={version.content}
                    newContent={comparisonVersion.content}
                    oldTitle={version.title}
                    newTitle={comparisonVersion.title}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        <History className="mx-auto mb-2 h-5 w-5" />
        All versions are stored permanently and can be restored at any time
      </div>
    </div>
  )
}
