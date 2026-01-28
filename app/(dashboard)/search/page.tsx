'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchResults } from '@/components/search/search-results'
import { SearchFilters, SearchFiltersState } from '@/components/search/search-filters'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { SearchResult } from '@/lib/search/postgres-fts'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFiltersState>({
    type: 'all',
  })

  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFiltersState) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([])
      setTotal(0)
      return
    }

    setLoading(true)

    try {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        type: searchFilters.type,
      })

      if (searchFilters.startDate) {
        params.set('startDate', searchFilters.startDate.toISOString())
      }
      if (searchFilters.endDate) {
        params.set('endDate', searchFilters.endDate.toISOString())
      }

      const response = await fetch(`/api/search?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data.results || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Search on initial load if query exists
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, filters)
    }
  }, [initialQuery, performSearch])

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      performSearch(query, filters)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleFiltersApply = () => {
    if (query.trim()) {
      performSearch(query, filters)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Search</h1>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search documents and comments..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={!query.trim()}>
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 px-6 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Filters */}
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleFiltersApply}
          />

          {/* Results Count */}
          {query && !loading && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {total > 0 ? (
                <>
                  Found <span className="font-semibold">{total}</span> result
                  {total !== 1 ? 's' : ''} for &quot;
                  <span className="font-semibold">{query}</span>&quot;
                </>
              ) : (
                <>
                  No results for &quot;
                  <span className="font-semibold">{query}</span>&quot;
                </>
              )}
            </div>
          )}

          {/* Results */}
          <SearchResults results={results} query={query} loading={loading} />
        </div>
      </div>
    </div>
  )
}
