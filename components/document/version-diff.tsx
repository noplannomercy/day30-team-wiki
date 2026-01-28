'use client'

import { useMemo } from 'react'
import { computeDiff, computeInlineDiff, DiffLine } from '@/lib/version/diff'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface VersionDiffProps {
  oldContent: string
  newContent: string
  oldTitle: string
  newTitle: string
}

export function VersionDiff({
  oldContent,
  newContent,
  oldTitle,
  newTitle,
}: VersionDiffProps) {
  const diff = useMemo(() => computeDiff(oldContent, newContent), [oldContent, newContent])
  const titleDiff = useMemo(
    () => (oldTitle !== newTitle ? computeInlineDiff(oldTitle, newTitle) : null),
    [oldTitle, newTitle]
  )

  return (
    <div className="space-y-4">
      {/* Title Diff */}
      {titleDiff && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <h3 className="mb-2 text-sm font-semibold">Title Changed</h3>
          <div className="flex flex-wrap gap-1">
            {titleDiff.map((part, i) => (
              <span
                key={i}
                className={
                  part.type === 'added'
                    ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
                    : part.type === 'removed'
                      ? 'bg-red-100 text-red-900 line-through dark:bg-red-900 dark:text-red-100'
                      : ''
                }
              >
                {part.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
          +{diff.additions} additions
        </Badge>
        <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">
          -{diff.deletions} deletions
        </Badge>
        <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">
          {diff.unchanged} unchanged
        </Badge>
      </div>

      {/* Diff Viewer */}
      <Tabs defaultValue="split" className="w-full">
        <TabsList>
          <TabsTrigger value="split">Split View</TabsTrigger>
          <TabsTrigger value="unified">Unified View</TabsTrigger>
        </TabsList>

        <TabsContent value="split" className="mt-4">
          <SplitDiffView diff={diff} />
        </TabsContent>

        <TabsContent value="unified" className="mt-4">
          <UnifiedDiffView diff={diff} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SplitDiffView({ diff }: { diff: { lines: DiffLine[] } }) {
  const oldLines = diff.lines.filter((l) => l.type !== 'added')
  const newLines = diff.lines.filter((l) => l.type !== 'removed')

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Old Version */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="border-b bg-red-50 px-4 py-2 text-sm font-semibold text-red-900 dark:bg-red-950 dark:text-red-100">
          Previous Version
        </div>
        <div className="max-h-96 overflow-auto">
          <pre className="p-4 text-xs">
            {oldLines.map((line, i) => (
              <div
                key={i}
                className={
                  line.type === 'removed'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : ''
                }
              >
                <span className="mr-4 inline-block w-8 text-right text-gray-400">
                  {line.lineNumber}
                </span>
                <span>{line.content}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>

      {/* New Version */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="border-b bg-green-50 px-4 py-2 text-sm font-semibold text-green-900 dark:bg-green-950 dark:text-green-100">
          Current Version
        </div>
        <div className="max-h-96 overflow-auto">
          <pre className="p-4 text-xs">
            {newLines.map((line, i) => (
              <div
                key={i}
                className={
                  line.type === 'added'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : ''
                }
              >
                <span className="mr-4 inline-block w-8 text-right text-gray-400">
                  {line.lineNumber}
                </span>
                <span>{line.content}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  )
}

function UnifiedDiffView({ diff }: { diff: { lines: DiffLine[] } }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="border-b bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        Unified Diff
      </div>
      <div className="max-h-96 overflow-auto">
        <pre className="p-4 text-xs">
          {diff.lines.map((line, i) => (
            <div
              key={i}
              className={
                line.type === 'added'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : line.type === 'removed'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : ''
              }
            >
              <span className="mr-4 inline-block w-4 text-gray-600">
                {line.type === 'added'
                  ? '+'
                  : line.type === 'removed'
                    ? '-'
                    : ' '}
              </span>
              <span className="mr-4 inline-block w-8 text-right text-gray-400">
                {line.lineNumber}
              </span>
              <span>{line.content}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
