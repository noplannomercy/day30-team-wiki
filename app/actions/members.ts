'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/session'

export async function inviteMember(data: {
  workspaceId: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}) {
  const user = await requireAuth()

  // TODO: Implement with database
  // Check if user is owner or admin
  // Check if member already exists
  // Send invitation email
  // Create workspace_member record
  // Log activity

  revalidatePath('/settings/members')
  return { success: true }
}

export async function updateMemberRole(
  memberId: string,
  role: 'admin' | 'editor' | 'viewer'
) {
  const user = await requireAuth()

  // TODO: Implement with database
  // Check if user is owner or admin
  // Cannot change owner role
  // Update member role
  // Log activity

  revalidatePath('/settings/members')
  return { success: true }
}

export async function removeMember(memberId: string) {
  const user = await requireAuth()

  // TODO: Implement with database
  // Check if user is owner or admin
  // Cannot remove owner
  // Set isActive = false, leftAt = now
  // Mark user documents as created by "탈퇴한 사용자"
  // Keep all documents and history
  // Log activity

  revalidatePath('/settings/members')
  return { success: true }
}
