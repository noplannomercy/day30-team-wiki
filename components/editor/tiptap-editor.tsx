'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { EditorToolbar } from './editor-toolbar'
import { ImageUploadHandler } from './image-upload-handler'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
  documentId?: string
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  documentId,
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-8 py-6',
      },
    },
  })

  if (!editor) {
    return null
  }

  const editorContent = (
    <div className="rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-950">
      {editable && <EditorToolbar editor={editor} documentId={documentId} />}
      <EditorContent editor={editor} />
    </div>
  )

  if (editable) {
    return (
      <ImageUploadHandler editor={editor} documentId={documentId}>
        {editorContent}
      </ImageUploadHandler>
    )
  }

  return editorContent
}
