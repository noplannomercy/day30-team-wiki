'use client'

import { useEffect, useState } from 'react'

export function useDocumentCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/documents/count')
        if (res.ok) {
          const data = await res.json()
          setCount(data.count)
        }
      } catch (error) {
        console.error('Failed to fetch document count:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCount()

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchCount, 30000)

    return () => clearInterval(interval)
  }, [])

  return { count, loading, isAtLimit: count >= 100 }
}
