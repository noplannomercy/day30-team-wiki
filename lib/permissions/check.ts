export type Role = 'owner' | 'admin' | 'editor' | 'viewer'

export interface Permission {
  canCreate: boolean
  canEditOwn: boolean
  canEditOthers: boolean
  canDeleteOwn: boolean
  canDeleteOthers: boolean
  canComment: boolean
  canManageMembers: boolean
}

export const PERMISSIONS: Record<Role, Permission> = {
  owner: {
    canCreate: true,
    canEditOwn: true,
    canEditOthers: true,
    canDeleteOwn: true,
    canDeleteOthers: true,
    canComment: true,
    canManageMembers: true,
  },
  admin: {
    canCreate: true,
    canEditOwn: true,
    canEditOthers: true,
    canDeleteOwn: true,
    canDeleteOthers: true,
    canComment: true,
    canManageMembers: true,
  },
  editor: {
    canCreate: true,
    canEditOwn: true,
    canEditOthers: true,
    canDeleteOwn: true,
    canDeleteOthers: false, // CRITICAL: Editor cannot delete others' docs
    canComment: true,
    canManageMembers: false,
  },
  viewer: {
    canCreate: false,
    canEditOwn: false,
    canEditOthers: false,
    canDeleteOwn: false,
    canDeleteOthers: false,
    canComment: true, // CRITICAL: Viewer CAN comment
    canManageMembers: false,
  },
}

export function checkPermission(role: Role, permission: keyof Permission): boolean {
  return PERMISSIONS[role][permission]
}

export function canEditDocument(role: Role, isOwner: boolean): boolean {
  const perms = PERMISSIONS[role]
  return isOwner ? perms.canEditOwn : perms.canEditOthers
}

export function canDeleteDocument(role: Role, isOwner: boolean): boolean {
  const perms = PERMISSIONS[role]
  return isOwner ? perms.canDeleteOwn : perms.canDeleteOthers
}

export function canDeleteComment(
  userRole: Role,
  isCommentAuthor: boolean,
  isDocumentOwner: boolean
): boolean {
  // Admin/Owner can delete any comment
  if (userRole === 'admin' || userRole === 'owner') {
    return true
  }

  // Comment author can delete own comment
  if (isCommentAuthor) {
    return true
  }

  // Document owner can delete comments on their document
  if (isDocumentOwner) {
    return true
  }

  return false
}
