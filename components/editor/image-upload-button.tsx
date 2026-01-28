'use client'

import { useState, useRef } from 'react'
import { type Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadButtonProps {
  editor: Editor
  documentId?: string
}

export function ImageUploadButton({ editor, documentId }: ImageUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await uploadImage(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (documentId) {
        formData.append('documentId', documentId)
      }

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()

      // Insert image into editor
      editor
        .chain()
        .focus()
        .setImage({ src: data.url, alt: data.fileName })
        .run()

      // Show optimization info if optimized
      if (data.isOptimized) {
        console.log(
          `Image optimized: ${data.originalSize} → ${data.optimizedSize} bytes (${data.savedPercentage}% saved)`
        )
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />
    </>
  )
}
