'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchBar({ open, onOpenChange }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = useCallback(() => {
    if (query.trim().length > 0) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      onOpenChange(false)
      setQuery('')
    }
  }, [query, router, onOpenChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSearch()
      }
    },
    [handleSearch]
  )

  // Clear query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search TeamWiki</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search documents and comments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-9"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={!query.trim()}>
            Search
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          <kbd className="rounded border bg-gray-100 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800">
            Enter
          </kbd>{' '}
          to search •{' '}
          <kbd className="rounded border bg-gray-100 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800">
            Esc
          </kbd>{' '}
          to close
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook to handle Cmd+K / Ctrl+K keyboard shortcut
 */
export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpen()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onOpen])
}
