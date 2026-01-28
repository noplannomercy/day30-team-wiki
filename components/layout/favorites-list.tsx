'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFavorites, type Favorite } from '@/lib/hooks/use-favorites'
import { Button } from '@/components/ui/button'
import { Star, FileText, Folder, GripVertical, X, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FavoritesListProps {
  workspaceId?: string
}

export function FavoritesList({ workspaceId }: FavoritesListProps) {
  const { favorites, loading, addFavorite, removeFavorite, reorderFavorites } =
    useFavorites(workspaceId)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === index) return

    const newFavorites = [...favorites]
    const draggedItem = newFavorites[draggedIndex]

    // Remove from old position
    newFavorites.splice(draggedIndex, 1)

    // Insert at new position
    newFavorites.splice(index, 0, draggedItem)

    // Update display order
    const reordered = newFavorites.map((item, idx) => ({
      ...item,
      displayOrder: idx,
    }))

    reorderFavorites(reordered)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleRemove = async (e: React.MouseEvent, favoriteId: string) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await removeFavorite(favoriteId)
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <Star className="mx-auto mb-2 h-6 w-6 text-gray-400" />
        <p>No favorites yet</p>
        <p className="text-xs">Star documents to add them here</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="mb-2 flex items-center justify-between px-2">
        <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
          Favorites
        </h3>
        <Badge variant="secondary" className="text-xs">
          {favorites.length}/20
        </Badge>
      </div>

      {favorites.map((favorite, index) => (
        <div
          key={favorite.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`group relative flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
            draggedIndex === index ? 'opacity-50' : ''
          }`}
        >
          <GripVertical className="h-4 w-4 cursor-grab text-gray-400 opacity-0 group-hover:opacity-100" />

          <Link
            href={
              favorite.itemType === 'document'
                ? `/documents/${favorite.itemId}`
                : `/folders/${favorite.itemId}`
            }
            className="flex flex-1 items-center gap-2 overflow-hidden"
          >
            {favorite.itemType === 'document' ? (
              <FileText className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            ) : (
              <Folder className="h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            )}
            <span className="truncate">{favorite.itemTitle}</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={(e) => handleRemove(e, favorite.id)}
            title="Remove from favorites"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}

      {favorites.length >= 20 && (
        <p className="px-2 pt-2 text-xs text-amber-600 dark:text-amber-400">
          Maximum 20 favorites reached
        </p>
      )}
    </div>
  )
}
