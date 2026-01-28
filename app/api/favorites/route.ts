import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  reorderFavorites,
} from '@/app/actions/favorites'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const favorites = await getFavorites()

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to get favorites',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId, itemType } = await request.json()

    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: 'itemId and itemType are required' },
        { status: 400 }
      )
    }

    if (itemType !== 'document' && itemType !== 'folder') {
      return NextResponse.json(
        { error: 'itemType must be "document" or "folder"' },
        { status: 400 }
      )
    }

    const result = await addToFavorites(itemId, itemType)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to add favorite',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const favoriteId = searchParams.get('id')

    if (!favoriteId) {
      return NextResponse.json(
        { error: 'Favorite ID is required' },
        { status: 400 }
      )
    }

    const result = await removeFromFavorites(favoriteId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to remove favorite',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { favoriteIds } = await request.json()

    if (!Array.isArray(favoriteIds)) {
      return NextResponse.json(
        { error: 'favoriteIds must be an array' },
        { status: 400 }
      )
    }

    const result = await reorderFavorites(favoriteIds)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder favorites error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to reorder favorites',
      },
      { status: 500 }
    )
  }
}
