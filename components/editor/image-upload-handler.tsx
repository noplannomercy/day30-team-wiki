'use client'

import { useCallback } from 'react'
import { type Editor } from '@tiptap/react'

interface ImageUploadHandlerProps {
  editor: Editor
  documentId?: string
  children: React.ReactNode
}

export function ImageUploadHandler({
  editor,
  documentId,
  children,
}: ImageUploadHandlerProps) {
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()

      const files = Array.from(e.dataTransfer.files)
      const imageFiles = files.filter((file) =>
        file.type.startsWith('image/')
      )

      if (imageFiles.length === 0) return

      // Upload each image
      for (const file of imageFiles) {
        await uploadImage(file)
      }
    },
    [editor, documentId]
  )

  const uploadImage = async (file: File) => {
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
    } catch (error) {
      console.error('Upload failed:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items)
      const imageItems = items.filter((item) => item.type.startsWith('image/'))

      if (imageItems.length === 0) return

      e.preventDefault()

      // Upload each pasted image
      for (const item of imageItems) {
        const file = item.getAsFile()
        if (file) {
          await uploadImage(file)
        }
      }
    },
    [editor, documentId]
  )

  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver} onPaste={handlePaste}>
      {children}
    </div>
  )
}
