'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderTree, Star, Tag, Activity } from 'lucide-react'
import { FolderTree as FolderTreeComponent } from '@/components/folder/folder-tree'
import { FavoritesList } from './favorites-list'
import { TagCloud } from './tag-cloud'
import { Separator } from '@/components/ui/separator'

export function Sidebar() {
  const pathname = usePathname()
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch user's workspace
    async function fetchWorkspace() {
      try {
        const response = await fetch('/api/workspace')
        if (response.ok) {
          const data = await response.json()
          setWorkspaceId(data.workspaceId)
        }
      } catch (error) {
        console.error('Failed to fetch workspace:', error)
      }
    }
    fetchWorkspace()
  }, [])

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Activity, label: 'Activity', href: '/activity' },
  ]

  return (
    <aside className="flex w-64 flex-col border-r bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4" />

        <div className="space-y-4">
          <FavoritesList workspaceId={workspaceId || undefined} />

          <Separator />

          <TagCloud workspaceId={workspaceId || undefined} />

          <Separator />

          <div>
            <div className="mb-2 flex items-center justify-between px-3">
              <h2 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Folders
              </h2>
            </div>
            <FolderTreeComponent />
          </div>
        </div>
      </div>
    </aside>
  )
}
