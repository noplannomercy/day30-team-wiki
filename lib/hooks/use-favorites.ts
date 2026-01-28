'use client'

import { useState, useEffect } from 'react'

export interface Favorite {
  id: string
  itemId: string
  itemType: 'document' | 'folder'
  itemTitle: string
  displayOrder: number
}

export function useFavorites(workspaceId?: string) {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFavorites = async () => {
    if (!workspaceId) {
      setFavorites([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/favorites`)

      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const data = await response.json()
      setFavorites(data.favorites || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites')
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [workspaceId])

  const addFavorite = async (itemId: string, itemType: 'document' | 'folder') => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, itemType }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add favorite')
      }

      await fetchFavorites()
    } catch (err) {
      throw err
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/favorites?id=${favoriteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove favorite')
      }

      await fetchFavorites()
    } catch (err) {
      throw err
    }
  }

  const reorderFavorites = async (newOrder: Favorite[]) => {
    // Optimistically update UI
    setFavorites(newOrder)

    try {
      const favoriteIds = newOrder.map((f) => f.id)
      const response = await fetch('/api/favorites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favoriteIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder favorites')
      }
    } catch (err) {
      // Revert on error
      await fetchFavorites()
      throw err
    }
  }

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    reorderFavorites,
    refetch: fetchFavorites,
  }
}
