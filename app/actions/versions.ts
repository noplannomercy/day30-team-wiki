'use server'

import { db } from '@/lib/db'
import { documentVersions, documents } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { eq, desc, and } from 'drizzle-orm'
import { hasContentChanged } from '@/lib/version/diff'
import { revalidatePath } from 'next/cache'

/**
 * Creates a new version of a document if content has changed
 * Returns the version ID if created, null if no changes
 */
export async function createDocumentVersion(
  documentId: string,
  title: string,
  content: string
): Promise<string | null> {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  // Get the document
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1)

  if (!document) {
    throw new Error('Document not found')
  }

  // Check if content has changed
  if (!hasContentChanged(document.content, content)) {
    return null // No version created if content is unchanged
  }

  // Get the latest version number
  const [latestVersion] = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.versionNumber))
    .limit(1)

  const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1

  // Create the new version
  const [version] = await db
    .insert(documentVersions)
    .values({
      documentId,
      versionNumber: newVersionNumber,
      title,
      content,
      createdBy: session.user.id,
    })
    .returning()

  return version.id
}

/**
 * Gets all versions for a document
 */
export async function getDocumentVersions(documentId: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const versions = await db
    .select({
      id: documentVersions.id,
      versionNumber: documentVersions.versionNumber,
      title: documentVersions.title,
      content: documentVersions.content,
      createdAt: documentVersions.createdAt,
      createdBy: documentVersions.createdBy,
    })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.versionNumber))

  return versions
}

/**
 * Gets a specific version by ID
 */
export async function getVersion(versionId: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const [version] = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.id, versionId))
    .limit(1)

  if (!version) {
    throw new Error('Version not found')
  }

  return version
}

/**
 * Restores a document to a specific version
 * Only document owner or creator can restore
 */
export async function restoreDocumentVersion(
  documentId: string,
  versionId: string
): Promise<boolean> {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  // Get the document
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1)

  if (!document) {
    throw new Error('Document not found')
  }

  // Check if user has permission (owner or creator)
  if (document.createdBy !== session.user.id) {
    throw new Error('Only the document creator can restore versions')
  }

  // Get the version to restore
  const [version] = await db
    .select()
    .from(documentVersions)
    .where(
      and(
        eq(documentVersions.id, versionId),
        eq(documentVersions.documentId, documentId)
      )
    )
    .limit(1)

  if (!version) {
    throw new Error('Version not found')
  }

  // Create a new version with the current state before restoring
  await createDocumentVersion(documentId, document.title, document.content)

  // Restore the document to the selected version
  await db
    .update(documents)
    .set({
      title: version.title,
      content: version.content,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId))

  // Create a new version entry for the restored state
  await createDocumentVersion(documentId, version.title, version.content)

  revalidatePath(`/documents/${documentId}`)
  revalidatePath(`/documents/${documentId}/edit`)
  revalidatePath(`/documents/${documentId}/versions`)

  return true
}

/**
 * Deletes a version (soft delete - not implemented in MVP)
 * Versions are kept permanently in MVP
 */
export async function deleteVersion(versionId: string): Promise<boolean> {
  // In MVP, versions are permanent and cannot be deleted
  throw new Error('Versions cannot be deleted in this version')
}
