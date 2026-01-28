'use client'

import Link from 'next/link'
import { SearchResult } from '@/lib/search/postgres-fts'
import { FileText, MessageSquare, User, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  loading?: boolean
}

export function SearchResults({ results, query, loading }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 p-4 dark:border-gray-800"
          >
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-2 h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-2 h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          No results found
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Try adjusting your search terms or filters
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <SearchResultItem key={`${result.type}-${result.id}`} result={result} query={query} />
      ))}
    </div>
  )
}

function SearchResultItem({ result, query }: { result: SearchResult; query: string }) {
  const href =
    result.type === 'document'
      ? `/documents/${result.id}`
      : `/documents/${result.documentId}#comment-${result.id}`

  return (
    <Link href={href}>
      <div className="group rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:hover:border-blue-700">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {result.type === 'document' ? (
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            )}
            <Badge
              variant="outline"
              className={
                result.type === 'document'
                  ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300'
                  : 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300'
              }
            >
              {result.type === 'document' ? 'Document' : 'Comment'}
            </Badge>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {highlightText(result.title, query)}
        </h3>

        {/* Excerpt */}
        <p className="mb-3 text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
          {highlightText(result.excerpt, query)}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{result.author.name}</span>
          </div>
          {result.tags && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {result.tags.length > 3 && (
                <span className="text-gray-400">+{result.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

/**
 * Highlights search query matches in text
 */
function highlightText(text: string, query: string) {
  if (!query) return text

  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'))
  return (
    <>
      {parts.map((part, i) => (
        <span
          key={i}
          className={
            part.toLowerCase() === query.toLowerCase()
              ? 'bg-yellow-200 font-medium dark:bg-yellow-900'
              : ''
          }
        >
          {part}
        </span>
      ))}
    </>
  )
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
