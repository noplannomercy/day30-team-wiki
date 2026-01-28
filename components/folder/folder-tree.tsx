'use client'

import { useState, useEffect } from 'react'
import { Folder, ChevronRight, ChevronDown, FileText, Plus } from 'lucide-react'
import Link from 'next/link'

interface FolderData {
  id: string
  name: string
  depth: number
  parentFolderId: string | null
  icon: string
  color: string
}

interface DocumentData {
  id: string
  title: string
  folderId: string | null
  updatedAt: string
}

interface FolderNode extends FolderData {
  children?: FolderNode[]
  documents?: DocumentData[]
}

export function FolderTree() {
  const [folders, setFolders] = useState<FolderNode[]>([])
  const [rootDocuments, setRootDocuments] = useState<DocumentData[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFoldersAndDocuments()

    // Listen for document creation events
    const handleDocumentCreated = () => {
      fetchFoldersAndDocuments()
    }

    window.addEventListener('document-created', handleDocumentCreated)
    return () => {
      window.removeEventListener('document-created', handleDocumentCreated)
    }
  }, [])

  async function fetchFoldersAndDocuments() {
    try {
      const response = await fetch('/api/folders')
      if (!response.ok) {
        throw new Error('Failed to fetch folders')
      }

      const data = await response.json()
      const { folders: folderList, documents: documentList } = data

      // Build folder tree
      const folderMap = new Map<string, FolderNode>()

      // Initialize all folders
      folderList.forEach((folder: FolderData) => {
        folderMap.set(folder.id, {
          ...folder,
          children: [],
          documents: [],
        })
      })

      // Add documents to folders
      documentList.forEach((doc: DocumentData) => {
        if (doc.folderId) {
          const folder = folderMap.get(doc.folderId)
          if (folder) {
            folder.documents!.push(doc)
          }
        }
      })

      // Build tree structure
      const rootFolders: FolderNode[] = []
      folderList.forEach((folder: FolderData) => {
        const node = folderMap.get(folder.id)!
        if (!folder.parentFolderId) {
          rootFolders.push(node)
        } else {
          const parent = folderMap.get(folder.parentFolderId)
          if (parent) {
            parent.children!.push(node)
          }
        }
      })

      setFolders(rootFolders)

      // Root level documents (no folder)
      const rootDocs = documentList.filter((doc: DocumentData) => !doc.folderId)
      setRootDocuments(rootDocs)

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch folders:', error)
      setLoading(false)
    }
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const renderFolder = (folder: FolderNode) => {
    const hasChildren = (folder.children && folder.children.length > 0) || (folder.documents && folder.documents.length > 0)
    const isExpanded = expandedFolders.has(folder.id)

    return (
      <div key={folder.id}>
        <button
          onClick={() => toggleFolder(folder.id)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          style={{ paddingLeft: `${folder.depth * 16 + 12}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          )}
          <span style={{ color: folder.color }} className="text-base">
            {folder.icon}
          </span>
          <span className="flex-1 truncate text-left">{folder.name}</span>
          <span className="text-xs text-gray-400">
            {(folder.documents?.length || 0) + (folder.children?.reduce((acc, child) => acc + (child.documents?.length || 0), 0) || 0)}
          </span>
        </button>
        {isExpanded && (
          <div>
            {folder.documents?.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                style={{ paddingLeft: `${(folder.depth + 1) * 16 + 28}px` }}
              >
                <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="flex-1 truncate text-left">{doc.title}</span>
              </Link>
            ))}
            {folder.children?.map((child) => renderFolder(child))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    )
  }

  if (folders.length === 0 && rootDocuments.length === 0) {
    return (
      <div className="space-y-2">
        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          No documents yet
        </div>
        <Link
          href="/documents/new"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
        >
          <Plus className="h-4 w-4" />
          Create your first document
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {rootDocuments.length > 0 && (
        <div className="mb-2">
          <div className="mb-1 px-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
            DOCUMENTS
          </div>
          {rootDocuments.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
            >
              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="flex-1 truncate text-left">{doc.title}</span>
            </Link>
          ))}
        </div>
      )}
      {folders.map(renderFolder)}
    </div>
  )
}
