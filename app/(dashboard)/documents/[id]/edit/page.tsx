'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { AutoSaveIndicator } from '@/components/editor/auto-save-indicator'
import { useAutoSave } from '@/lib/hooks/use-auto-save'
import { useAISuggestedTags } from '@/lib/hooks/use-ai-suggested-tags'
import { AITagSuggestions } from '@/components/document/ai-tag-suggestions'
import { AISummaryDisplay } from '@/components/document/ai-summary-display'
import { TagSelector } from '@/components/document/tag-selector'
import { ArrowLeft, Eye, Sparkles, History } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditDocumentPage({ params: paramsPromise }: PageProps) {
  const router = useRouter()
  const [params, setParams] = useState<{ id: string } | null>(null)
  const [title, setTitle] = useState('Loading...')
  const [content, setContent] = useState('')
  const [summary, setSummary] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string>('')
  const [documentTags, setDocumentTags] = useState<any[]>([])
  const [fetchingTags, setFetchingTags] = useState(false)

  const {
    suggestedTags,
    loading: tagsLoading,
    generateTags,
    acceptTags,
    rejectTags,
  } = useAISuggestedTags(params?.id || '')

  useEffect(() => {
    async function loadParams() {
      const p = await paramsPromise
      setParams(p)
    }
    loadParams()
  }, [paramsPromise])

  useEffect(() => {
    if (!params?.id) return

    async function fetchDocument() {
      if (!params?.id) return

      try {
        // Fetch document
        const response = await fetch(`/api/documents/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch document')
        }

        const data = await response.json()
        setTitle(data.title)
        setContent(data.content)
        setSummary(data.aiSummary)

        // Fetch workspace
        const wsResponse = await fetch('/api/workspace')
        if (wsResponse.ok) {
          const wsData = await wsResponse.json()
          setWorkspaceId(wsData.workspaceId)
        }

        // Fetch document tags
        await fetchDocumentTags()

        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch document:', error)
        setLoading(false)
      }
    }

    fetchDocument()
  }, [params?.id])

  const fetchDocumentTags = async () => {
    if (!params?.id) return

    setFetchingTags(true)
    try {
      const response = await fetch(`/api/documents/${params.id}/tags`)
      if (response.ok) {
        const data = await response.json()
        setDocumentTags(
          data.tags
            .filter((t: any) => t.isAccepted)
            .map((t: any) => ({
              id: t.tagId,
              name: t.tagName,
              color: t.tagColor,
            }))
        )
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setFetchingTags(false)
    }
  }

  const { isSaving, lastSaved, saveError, hasUnsavedChanges, debouncedSave, manualRetry } =
    useAutoSave({
      onSave: async () => {
        if (!params?.id) return

        const response = await fetch(`/api/documents/${params.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save document')
        }
      },
      storageKey: params?.id ? `doc_${params.id}` : undefined,
    })

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    debouncedSave()
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    debouncedSave()
  }

  const handleGenerateAI = async () => {
    await generateTags(title, content)
  }

  const handleGenerateSummary = async () => {
    if (!params?.id) return

    setSummaryLoading(true)
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: params.id,
          title,
          content,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to generate summary:', error)
    } finally {
      setSummaryLoading(false)
    }
  }

  if (loading || !params) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/documents/${params?.id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Input
              value={title}
              onChange={handleTitleChange}
              className="max-w-md border-none text-2xl font-bold focus-visible:ring-0"
              placeholder="Document title"
            />
          </div>
          <div className="flex items-center gap-4">
            <AutoSaveIndicator
              isSaving={isSaving}
              lastSaved={lastSaved}
              saveError={saveError}
              hasUnsavedChanges={hasUnsavedChanges}
              onRetry={manualRetry}
            />
            <Button variant="outline" size="sm" onClick={handleGenerateAI}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Tags
            </Button>
            <Link href={`/documents/${params?.id}/versions`}>
              <Button variant="outline" size="sm">
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </Link>
            <Link href={`/documents/${params?.id}`}>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <TagSelector
            documentId={params?.id || ''}
            workspaceId={workspaceId}
            currentTags={documentTags}
            onTagsChange={fetchDocumentTags}
          />

          <Separator />

          <AITagSuggestions
            documentId={params?.id || ''}
            suggestedTags={suggestedTags}
            onAccept={acceptTags}
            onReject={rejectTags}
            loading={tagsLoading}
          />

          <AISummaryDisplay
            documentId={params?.id || ''}
            summary={summary}
            onGenerate={handleGenerateSummary}
            onSave={(newSummary) => setSummary(newSummary)}
            loading={summaryLoading}
          />

          <Separator />

          <TiptapEditor
            content={content}
            onChange={handleContentChange}
            documentId={params?.id}
          />
        </div>
      </div>
    </div>
  )
}
