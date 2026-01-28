'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAutoSaveOptions {
  onSave: () => Promise<void>
  delay?: number
  storageKey?: string
}

export function useAutoSave({
  onSave,
  delay = 2000,
  storageKey,
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const retryCountRef = useRef(0)
  const maxRetries = 5

  const saveToLocalStorage = useCallback(
    (data: any) => {
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(data))
          localStorage.setItem(`${storageKey}_timestamp`, new Date().toISOString())
        } catch (error) {
          console.error('Failed to save to localStorage:', error)
        }
      }
    },
    [storageKey]
  )

  const clearLocalStorage = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey)
      localStorage.removeItem(`${storageKey}_timestamp`)
    }
  }, [storageKey])

  const save = useCallback(async () => {
    if (isSaving) return

    setIsSaving(true)
    setSaveError(null)

    try {
      await onSave()
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      retryCountRef.current = 0
      clearLocalStorage()
    } catch (error) {
      console.error('Save failed:', error)
      setSaveError(error instanceof Error ? error.message : '저장에 실패했습니다.')

      // Save to localStorage as backup
      if (storageKey && retryCountRef.current < maxRetries) {
        saveToLocalStorage({ error: true, timestamp: new Date().toISOString() })
      }

      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        setTimeout(() => {
          save()
        }, 1000 * retryCountRef.current) // Exponential backoff
      }
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, onSave, storageKey, saveToLocalStorage, clearLocalStorage])

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setHasUnsavedChanges(true)

    timeoutRef.current = setTimeout(() => {
      save()
    }, delay)
  }, [delay, save])

  const manualRetry = useCallback(() => {
    retryCountRef.current = 0
    setSaveError(null)
    save()
  }, [save])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isSaving,
    lastSaved,
    saveError,
    hasUnsavedChanges,
    debouncedSave,
    manualRetry,
    retryCount: retryCountRef.current,
    maxRetries,
  }
}
