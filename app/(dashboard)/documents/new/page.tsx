'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { TemplateSelector } from '@/components/document/template-selector'
import { AutoSaveIndicator } from '@/components/editor/auto-save-indicator'
import { useAutoSave } from '@/lib/hooks/use-auto-save'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewDocumentPage() {
  const router = useRouter()
  const [title, setTitle] = useState('Untitled Document')
  const [content, setContent] = useState('<p>Start writing...</p>')
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [showSavedMessage, setShowSavedMessage] = useState(false)

  // Trigger sidebar refresh when document is created
  useEffect(() => {
    if (documentId && showSavedMessage) {
      // Dispatch custom event to refresh folder tree
      window.dispatchEvent(new CustomEvent('document-created'))
    }
  }, [documentId, showSavedMessage])

  const { isSaving, lastSaved, saveError, hasUnsavedChanges, debouncedSave, manualRetry } =
    useAutoSave({
      onSave: async () => {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: documentId,
            title,
            content,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save document')
        }

        const data = await response.json()
        if (!documentId) {
          setDocumentId(data.id)
          // Update URL without navigation
          window.history.replaceState(null, '', `/documents/${data.id}/edit`)
          // Show success message
          setShowSavedMessage(true)
          setTimeout(() => setShowSavedMessage(false), 3000)
        }
      },
      storageKey: documentId ? `doc_${documentId}` : undefined,
    })

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    debouncedSave()
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    debouncedSave()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground size-9">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Input
              value={title}
              onChange={handleTitleChange}
              className="max-w-md border-none text-2xl font-bold focus-visible:ring-0"
              placeholder="Document title"
            />
          </div>
          <div className="flex items-center gap-4">
            {showSavedMessage && documentId && (
              <div className="rounded-md bg-green-50 px-3 py-1.5 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Document saved to Workspace
              </div>
            )}
            <AutoSaveIndicator
              isSaving={isSaving}
              lastSaved={lastSaved}
              saveError={saveError}
              hasUnsavedChanges={hasUnsavedChanges}
              onRetry={manualRetry}
            />
            <TemplateSelector
              onSelect={(template) => {
                setTitle(template.name)
                setContent(template.content)
                debouncedSave()
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl">
          <TiptapEditor
            content={content}
            onChange={handleContentChange}
            documentId={documentId || undefined}
          />
        </div>
      </div>
    </div>
  )
}
