import { db } from '@/lib/db'
import { documents, comments, users } from '@/lib/db/schema'
import { sql, and, eq, or, gte, lte, inArray } from 'drizzle-orm'

export interface SearchResult {
  id: string
  type: 'document' | 'comment'
  title: string
  content: string
  excerpt: string
  rank: number
  createdAt: Date
  author: {
    id: string
    name: string
    email: string
  }
  documentId?: string // For comments, the parent document ID
  tags?: string[]
}

export interface SearchFilters {
  authorIds?: string[]
  tags?: string[]
  startDate?: Date
  endDate?: Date
  type?: 'document' | 'comment' | 'all'
}

export interface SearchOptions {
  query: string
  filters?: SearchFilters
  limit?: number
  offset?: number
}

/**
 * Performs full-text search on documents and comments using PostgreSQL's
 * to_tsvector and plainto_tsquery functions with ranking.
 */
export async function searchContent({
  query,
  filters = {},
  limit = 20,
  offset = 0,
}: SearchOptions): Promise<{ results: SearchResult[]; total: number }> {
  if (!query || query.trim().length === 0) {
    return { results: [], total: 0 }
  }

  const searchQuery = query.trim()
  const searchType = filters.type || 'all'

  try {
    // Search documents
    const documentResults =
      searchType === 'comment'
        ? []
        : await searchDocuments(searchQuery, filters, limit, offset)

    // Search comments
    const commentResults =
      searchType === 'document'
        ? []
        : await searchComments(searchQuery, filters, limit, offset)

    // Combine and sort by rank
    const allResults = [...documentResults, ...commentResults].sort(
      (a, b) => b.rank - a.rank
    )

    // Apply limit and offset to combined results
    const paginatedResults = allResults.slice(offset, offset + limit)

    return {
      results: paginatedResults,
      total: allResults.length,
    }
  } catch (error) {
    console.error('Search error:', error)
    return { results: [], total: 0 }
  }
}

async function searchDocuments(
  query: string,
  filters: SearchFilters,
  limit: number,
  offset: number
): Promise<SearchResult[]> {
  const conditions = []

  // Author filter
  if (filters.authorIds && filters.authorIds.length > 0) {
    conditions.push(inArray(documents.createdBy, filters.authorIds))
  }

  // Date filter
  if (filters.startDate) {
    conditions.push(gte(documents.createdAt, filters.startDate))
  }
  if (filters.endDate) {
    conditions.push(lte(documents.createdAt, filters.endDate))
  }

  // Build the full-text search query
  const whereClause =
    conditions.length > 0 ? and(...conditions) : sql`true`

  // Search using PostgreSQL full-text search
  // Note: This is a simplified version. In production, you'd create GIN indexes:
  // CREATE INDEX idx_documents_fts ON documents USING GIN (to_tsvector('english', title || ' ' || content));
  const results = await db
    .select({
      id: documents.id,
      title: documents.title,
      content: documents.content,
      createdAt: documents.createdAt,
      authorId: users.id,
      authorName: users.name,
      authorEmail: users.email,
      rank: sql<number>`
        ts_rank(
          to_tsvector('english', ${documents.title} || ' ' || ${documents.content}),
          plainto_tsquery('english', ${query})
        )
      `.as('rank'),
    })
    .from(documents)
    .leftJoin(users, eq(documents.createdBy, users.id))
    .where(
      and(
        whereClause,
        sql`to_tsvector('english', ${documents.title} || ' ' || ${documents.content}) @@ plainto_tsquery('english', ${query})`
      )
    )
    .orderBy(sql`rank DESC`)
    .limit(limit)
    .offset(offset)

  return results.map((row) => ({
    id: row.id,
    type: 'document' as const,
    title: row.title,
    content: row.content,
    excerpt: createExcerpt(row.content, query),
    rank: row.rank,
    createdAt: row.createdAt,
    author: {
      id: row.authorId || '',
      name: row.authorName || 'Unknown',
      email: row.authorEmail || '',
    },
  }))
}

async function searchComments(
  query: string,
  filters: SearchFilters,
  limit: number,
  offset: number
): Promise<SearchResult[]> {
  const conditions = []

  // Author filter
  if (filters.authorIds && filters.authorIds.length > 0) {
    conditions.push(inArray(comments.createdBy, filters.authorIds))
  }

  // Date filter
  if (filters.startDate) {
    conditions.push(gte(comments.createdAt, filters.startDate))
  }
  if (filters.endDate) {
    conditions.push(lte(comments.createdAt, filters.endDate))
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : sql`true`

  const results = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      documentId: comments.documentId,
      authorId: users.id,
      authorName: users.name,
      authorEmail: users.email,
      documentTitle: documents.title,
      rank: sql<number>`
        ts_rank(
          to_tsvector('english', ${comments.content}),
          plainto_tsquery('english', ${query})
        )
      `.as('rank'),
    })
    .from(comments)
    .leftJoin(users, eq(comments.createdBy, users.id))
    .leftJoin(documents, eq(comments.documentId, documents.id))
    .where(
      and(
        whereClause,
        sql`to_tsvector('english', ${comments.content}) @@ plainto_tsquery('english', ${query})`
      )
    )
    .orderBy(sql`rank DESC`)
    .limit(limit)
    .offset(offset)

  return results.map((row) => ({
    id: row.id,
    type: 'comment' as const,
    title: `Comment on "${row.documentTitle || 'Unknown Document'}"`,
    content: row.content,
    excerpt: createExcerpt(row.content, query),
    rank: row.rank,
    createdAt: row.createdAt,
    author: {
      id: row.authorId || '',
      name: row.authorName || 'Unknown',
      email: row.authorEmail || '',
    },
    documentId: row.documentId,
  }))
}

/**
 * Creates an excerpt from content highlighting the search query context
 */
function createExcerpt(content: string, query: string, length = 200): string {
  // Strip HTML tags
  const plainText = content.replace(/<[^>]*>/g, '')

  // Find the first occurrence of the query (case-insensitive)
  const queryIndex = plainText.toLowerCase().indexOf(query.toLowerCase())

  if (queryIndex === -1) {
    // Query not found, return beginning of content
    return plainText.substring(0, length) + (plainText.length > length ? '...' : '')
  }

  // Calculate excerpt boundaries
  const start = Math.max(0, queryIndex - length / 2)
  const end = Math.min(plainText.length, queryIndex + query.length + length / 2)

  let excerpt = plainText.substring(start, end)

  // Add ellipsis
  if (start > 0) excerpt = '...' + excerpt
  if (end < plainText.length) excerpt = excerpt + '...'

  return excerpt
}

/**
 * Creates database indexes for full-text search (run this in a migration)
 */
export const createSearchIndexes = `
  -- Create GIN indexes for full-text search
  CREATE INDEX IF NOT EXISTS idx_documents_fts
    ON documents
    USING GIN (to_tsvector('english', title || ' ' || content));

  CREATE INDEX IF NOT EXISTS idx_comments_fts
    ON comments
    USING GIN (to_tsvector('english', content));

  -- Create indexes for common filters
  CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
  CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
  CREATE INDEX IF NOT EXISTS idx_comments_created_by ON comments(created_by);
  CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
`
