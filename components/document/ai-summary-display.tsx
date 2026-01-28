'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Edit2, Save, X, Loader2 } from 'lucide-react'

interface AISummaryDisplayProps {
  documentId: string
  summary?: string
  onGenerate: () => void
  onSave?: (summary: string) => void
  loading?: boolean
}

export function AISummaryDisplay({
  documentId,
  summary,
  onGenerate,
  onSave,
  loading = false,
}: AISummaryDisplayProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSummary, setEditedSummary] = useState(summary || '')

  const handleEdit = () => {
    setEditedSummary(summary || '')
    setIsEditing(true)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(editedSummary)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedSummary(summary || '')
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-900 dark:bg-purple-950">
        <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
        <span className="text-sm text-purple-800 dark:text-purple-200">
          AI is generating summary...
        </span>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center dark:border-gray-700">
        <Sparkles className="mx-auto h-6 w-6 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          No AI summary yet
        </p>
        <Button size="sm" variant="outline" className="mt-3" onClick={onGenerate}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate AI Summary
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
            AI Summary
          </h4>
        </div>

        {!isEditing && (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleEdit}>
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onGenerate}>
              <Sparkles className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="min-h-[80px] resize-none bg-white dark:bg-gray-950"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="mr-1 h-3 w-3" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-purple-800 dark:text-purple-200">{summary}</p>
      )}
    </div>
  )
}
