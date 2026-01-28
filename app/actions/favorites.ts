'use server'

import { db } from '@/lib/db'
import { favorites } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const MAX_FAVORITES = 20

/**
 * Get all favorites for the current user
 */
export async function getFavorites() {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  // TODO: Fetch from database
  return []
}

/**
 * Add a document or folder to favorites
 */
export async function addToFavorites(
  itemId: string,
  itemType: 'document' | 'folder'
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Check if already at max favorites
    const existingFavorites = await getFavorites()
    if (existingFavorites.length >= MAX_FAVORITES) {
      return {
        success: false,
        error: `Maximum ${MAX_FAVORITES} favorites allowed`,
      }
    }

    // TODO: Check if already favorited
    // TODO: Add to database

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Add to favorites error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add favorite',
    }
  }
}

/**
 * Remove from favorites
 */
export async function removeFromFavorites(
  favoriteId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // TODO: Delete from database

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Remove from favorites error:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to remove favorite',
    }
  }
}

/**
 * Reorder favorites (drag and drop)
 */
export async function reorderFavorites(
  favoriteIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // TODO: Update order in database
    // Update displayOrder for each favorite based on array index

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Reorder favorites error:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to reorder favorites',
    }
  }
}

/**
 * Check if an item is favorited
 */
export async function isFavorited(
  itemId: string,
  itemType: 'document' | 'folder'
): Promise<boolean> {
  const session = await getSession()
  if (!session?.user?.id) {
    return false
  }

  try {
    const favorites = await getFavorites()
    return favorites.some(
      (f: any) => f.itemId === itemId && f.itemType === itemType
    )
  } catch (error) {
    console.error('Check favorite error:', error)
    return false
  }
}
