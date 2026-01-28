'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Plus, Tag } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface TagItem {
  id: string
  name: string
  color: string
}

interface TagSelectorProps {
  documentId: string
  workspaceId: string
  currentTags: TagItem[]
  onTagsChange?: () => void
}

export function TagSelector({
  documentId,
  workspaceId,
  currentTags,
  onTagsChange,
}: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<TagItem[]>([])
  const [open, setOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchAvailableTags()
  }, [workspaceId])

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch(`/api/tags?workspaceId=${workspaceId}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableTags(data.tags || [])
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const handleAddExistingTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId, workspaceId }),
      })

      if (response.ok) {
        onTagsChange?.()
        setOpen(false)
      }
    } catch (error) {
      console.error('Failed to add tag:', error)
    }
  }

  const handleCreateAndAddTag = async () => {
    if (!newTagName.trim()) return

    setAdding(true)
    try {
      const response = await fetch(`/api/documents/${documentId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagName: newTagName.trim(),
          workspaceId,
        }),
      })

      if (response.ok) {
        setNewTagName('')
        onTagsChange?.()
        fetchAvailableTags()
        setOpen(false)
      }
    } catch (error) {
      console.error('Failed to create tag:', error)
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveTag = async (tagId: string) => {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/tags?tagId=${tagId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        onTagsChange?.()
      }
    } catch (error) {
      console.error('Failed to remove tag:', error)
    }
  }

  const currentTagIds = new Set(currentTags.map((t) => t.id))
  const unselectedTags = availableTags.filter((t) => !currentTagIds.has(t.id))

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Tags
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {currentTags.map((tag) => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.color || '#3B82F6' }}
            className="group relative pr-6 text-white"
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-white/20 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 gap-1 px-2 text-xs"
            >
              <Plus className="h-3 w-3" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div>
                <h4 className="mb-2 text-sm font-semibold">Create New Tag</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateAndAddTag()
                      }
                    }}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateAndAddTag}
                    disabled={!newTagName.trim() || adding}
                    className="h-8"
                  >
                    Create
                  </Button>
                </div>
              </div>

              {unselectedTags.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">
                    Existing Tags
                  </h4>
                  <div className="max-h-40 space-y-1 overflow-y-auto">
                    {unselectedTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleAddExistingTag(tag.id)}
                        className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Badge
                          style={{ backgroundColor: tag.color || '#3B82F6' }}
                          className="text-white"
                        >
                          {tag.name}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
