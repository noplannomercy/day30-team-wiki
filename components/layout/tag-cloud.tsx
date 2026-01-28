'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Tag, X, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface TagItem {
  id: string
  name: string
  color: string
  count?: number
}

interface TagCloudProps {
  workspaceId?: string
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
]

export function TagCloud({ workspaceId }: TagCloudProps) {
  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(DEFAULT_COLORS[0])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchTags = async () => {
      if (!workspaceId) {
        setTags([])
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/tags?workspaceId=${workspaceId}`)
        if (response.ok) {
          const data = await response.json()
          setTags(data.tags || [])
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [workspaceId])

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !workspaceId) return

    setCreating(true)
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: newTagName.trim(),
          color: newTagColor,
        }),
      })

      if (response.ok) {
        const tag = await response.json()
        setTags([...tags, tag])
        setNewTagName('')
        setNewTagColor(DEFAULT_COLORS[0])
        setShowCreateDialog(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create tag')
      }
    } catch (error) {
      console.error('Failed to create tag:', error)
      alert('Failed to create tag')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Delete this tag? Documents will keep the tag name.')) return

    try {
      const response = await fetch(`/api/tags?id=${tagId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTags(tags.filter((t) => t.id !== tagId))
      }
    } catch (error) {
      console.error('Failed to delete tag:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="mb-2 flex items-center justify-between px-2">
        <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
          Tags
        </h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tag-name">Tag Name</Label>
                <Input
                  id="tag-name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g., Important, Review, Archive"
                  maxLength={30}
                />
              </div>
              <div>
                <Label>Tag Color</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTagColor(color)}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        newTagColor === color
                          ? 'scale-110 border-gray-900 dark:border-white'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTag} disabled={creating || !newTagName.trim()}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Tag'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tags.length === 0 ? (
        <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <Tag className="mx-auto mb-2 h-6 w-6 text-gray-400" />
          <p>No tags yet</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1 px-2">
          {tags.map((tag) => (
            <div key={tag.id} className="group relative">
              <Badge
                variant="outline"
                className="cursor-pointer pr-6"
                style={{
                  borderColor: tag.color,
                  color: tag.color,
                }}
              >
                <Link href={`/tags/${tag.id}`}>{tag.name}</Link>
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white opacity-0 group-hover:opacity-100 dark:bg-gray-950"
                onClick={() => handleDeleteTag(tag.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
