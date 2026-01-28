export function DocumentSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Title skeleton */}
      <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />

      {/* Metadata skeleton */}
      <div className="flex gap-4">
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3 pt-4">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  )
}

export function DocumentListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-gray-200 p-4 dark:border-gray-800"
        >
          <div className="mb-2 h-6 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EditorSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="animate-pulse border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>

      {/* Editor skeleton */}
      <div className="flex-1 animate-pulse p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  )
}
