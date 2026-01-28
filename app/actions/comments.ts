'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/session'

export async function createComment(data: {
  documentId: string
  content: string
  parentCommentId?: string
}) {
  const user = await requireAuth()

  // TODO: Implement with database
  // Check user role (Viewer can comment)
  // Create comment
  // Extract mentions from content (@username)
  // Send notifications to mentioned users
  // Log activity

  revalidatePath(`/documents/${data.documentId}`)
  return { success: true, id: crypto.randomUUID() }
}

export async function updateComment(
  commentId: string,
  data: { content?: string; resolved?: boolean }
) {
  const user = await requireAuth()

  // TODO: Implement with database
  // Get comment
  // Check if user is author
  // Update comment
  // Set isEdited = true if content changed

  revalidatePath('/') // Revalidate all document pages
  return { success: true }
}

export async function deleteComment(commentId: string) {
  const user = await requireAuth()

  // TODO: Implement with database
  // Get comment and document
  // Check permissions (author, doc owner, or admin)
  // Delete comment
  // Log activity

  revalidatePath('/') // Revalidate all document pages
  return { success: true }
}

export async function resolveComment(commentId: string) {
  const user = await requireAuth()

  // TODO: Implement with database
  // Get comment and document
  // Check if user is comment creator or doc owner
  // Set resolved = true, resolvedBy = user.id

  revalidatePath('/') // Revalidate all document pages
  return { success: true }
}
