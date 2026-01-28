'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VersionTimeline } from '@/components/document/version-timeline'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface Version {
  id: string
  versionNumber: number
  title: string
  content: string
  createdAt: string
  createdBy: string
  creator?: {
    name: string
    email: string
    avatarUrl?: string
  }
}

interface Document {
  id: string
  title: string
  content: string
  createdBy: string
}

export default function DocumentVersionsPage({ params: paramsPromise }: PageProps) {
  const router = useRouter()
  const [params, setParams] = useState<{ id: string } | null>(null)
  const [document, setDocument] = useState<Document | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    async function loadParams() {
      const p = await paramsPromise
      setParams(p)
    }
    loadParams()
  }, [paramsPromise])

  useEffect(() => {
    if (!params?.id) return

    const fetchData = async () => {
      try {
        // Fetch document
        const docResponse = await fetch(`/api/documents/${params.id}`)
        if (docResponse.ok) {
          const docData = await docResponse.json()
          setDocument(docData)
          setCurrentUserId(docData.createdBy)
        }

        // Fetch versions
        const versionsResponse = await fetch(`/api/documents/${params.id}/versions`)
        if (versionsResponse.ok) {
          const versionsData = await versionsResponse.json()
          setVersions(versionsData.versions || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params?.id])

  const handleRestore = async (versionId: string) => {
    if (!params?.id) return

    setRestoring(true)
    try {
      const response = await fetch(`/api/versions/${versionId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: params.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to restore version')
      }

      // Redirect to document edit page
      router.push(`/documents/${params.id}/edit`)
    } catch (error) {
      console.error('Failed to restore version:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to restore version. Please try again.'
      )
    } finally {
      setRestoring(false)
    }
  }

  if (loading || !params) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">Document not found</h2>
          <Link href="/">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const canRestore = document.createdBy === currentUserId

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/documents/${params?.id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{document.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Version History ({versions.length} versions)
              </p>
            </div>
          </div>
          <Link href={`/documents/${params?.id}/edit`}>
            <Button variant="outline">Back to Editor</Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          {restoring && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-900 dark:bg-blue-950">
              <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Restoring version...
              </p>
            </div>
          )}

          <VersionTimeline
            versions={versions}
            currentTitle={document.title}
            currentContent={document.content}
            onRestore={handleRestore}
            canRestore={canRestore}
          />
        </div>
      </div>
    </div>
  )
}
