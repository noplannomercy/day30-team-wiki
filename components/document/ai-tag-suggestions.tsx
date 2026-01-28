'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Sparkles, Loader2 } from 'lucide-react'

interface AITagSuggestionsProps {
  documentId: string
  suggestedTags: string[]
  onAccept: (tags: string[]) => void
  onReject: (tags: string[]) => void
  loading?: boolean
}

export function AITagSuggestions({
  documentId,
  suggestedTags,
  onAccept,
  onReject,
  loading = false,
}: AITagSuggestionsProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="text-sm text-blue-800 dark:text-blue-200">
          AI is generating tags...
        </span>
      </div>
    )
  }

  if (suggestedTags.length === 0) {
    return null
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
  }

  const handleAcceptSelected = () => {
    const tags = Array.from(selectedTags)
    if (tags.length > 0) {
      onAccept(tags)
      setSelectedTags(new Set())
    }
  }

  const handleRejectSelected = () => {
    const tags = Array.from(selectedTags)
    if (tags.length > 0) {
      onReject(tags)
      setSelectedTags(new Set())
    }
  }

  const handleAcceptAll = () => {
    onAccept(suggestedTags)
    setSelectedTags(new Set())
  }

  const handleRejectAll = () => {
    onReject(suggestedTags)
    setSelectedTags(new Set())
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          AI Suggested Tags
        </h4>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {suggestedTags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className={`cursor-pointer transition-colors ${
              selectedTags.has(tag)
                ? 'border-blue-600 bg-blue-100 text-blue-900 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-100'
                : 'border-blue-300 bg-white hover:border-blue-500 dark:border-blue-800 dark:bg-blue-950'
            }`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleAcceptSelected}
          disabled={selectedTags.size === 0}
        >
          <Check className="mr-1 h-3 w-3" />
          Accept Selected ({selectedTags.size})
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleRejectSelected}
          disabled={selectedTags.size === 0}
        >
          <X className="mr-1 h-3 w-3" />
          Reject Selected
        </Button>

        <Button size="sm" variant="outline" onClick={handleAcceptAll}>
          <Check className="mr-1 h-3 w-3" />
          Accept All
        </Button>

        <Button size="sm" variant="outline" onClick={handleRejectAll}>
          <X className="mr-1 h-3 w-3" />
          Reject All
        </Button>
      </div>

      <p className="mt-3 text-xs text-blue-700 dark:text-blue-300">
        💡 Click tags to select, then accept or reject them. Accepted tags will
        be added to the document.
      </p>
    </div>
  )
}
