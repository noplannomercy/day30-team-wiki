'use client'

import { useState, useEffect } from 'react'

export interface SuggestedTag {
  name: string
  isAccepted: boolean
}

export function useAISuggestedTags(documentId?: string) {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateTags = async (title: string, content: string) => {
    if (!documentId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, title, content }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate tags')
      }

      const data = await response.json()
      setSuggestedTags(data.tags || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tags')
    } finally {
      setLoading(false)
    }
  }

  const acceptTags = async (tags: string[]) => {
    if (!documentId) return

    try {
      const response = await fetch('/api/ai/tag/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, tags }),
      })

      if (!response.ok) {
        throw new Error('Failed to accept tags')
      }

      // Remove accepted tags from suggestions
      setSuggestedTags((prev) => prev.filter((tag) => !tags.includes(tag)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept tags')
    }
  }

  const rejectTags = async (tags: string[]) => {
    if (!documentId) return

    try {
      const response = await fetch('/api/ai/tag/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, tags }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject tags')
      }

      // Remove rejected tags from suggestions
      setSuggestedTags((prev) => prev.filter((tag) => !tags.includes(tag)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject tags')
    }
  }

  return {
    suggestedTags,
    loading,
    error,
    generateTags,
    acceptTags,
    rejectTags,
  }
}
