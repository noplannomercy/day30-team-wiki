/**
 * Text diff utilities for version history
 * Uses a simple line-based diff algorithm for document content
 */

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineNumber?: number
}

export interface DiffResult {
  lines: DiffLine[]
  additions: number
  deletions: number
  unchanged: number
}

/**
 * Computes a line-by-line diff between two text contents
 */
export function computeDiff(oldContent: string, newContent: string): DiffResult {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')

  const diff = diffLines(oldLines, newLines)

  const additions = diff.filter((l) => l.type === 'added').length
  const deletions = diff.filter((l) => l.type === 'removed').length
  const unchanged = diff.filter((l) => l.type === 'unchanged').length

  return {
    lines: diff,
    additions,
    deletions,
    unchanged,
  }
}

/**
 * Simple line-based diff algorithm using longest common subsequence
 */
function diffLines(oldLines: string[], newLines: string[]): DiffLine[] {
  const lcs = longestCommonSubsequence(oldLines, newLines)
  const result: DiffLine[] = []

  let oldIndex = 0
  let newIndex = 0
  let lcsIndex = 0

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (lcsIndex < lcs.length) {
      const lcsLine = lcs[lcsIndex]

      // Add deleted lines
      while (oldIndex < oldLines.length && oldLines[oldIndex] !== lcsLine) {
        result.push({
          type: 'removed',
          content: oldLines[oldIndex],
          lineNumber: oldIndex + 1,
        })
        oldIndex++
      }

      // Add added lines
      while (newIndex < newLines.length && newLines[newIndex] !== lcsLine) {
        result.push({
          type: 'added',
          content: newLines[newIndex],
          lineNumber: newIndex + 1,
        })
        newIndex++
      }

      // Add unchanged line
      if (oldIndex < oldLines.length && newIndex < newLines.length) {
        result.push({
          type: 'unchanged',
          content: oldLines[oldIndex],
          lineNumber: oldIndex + 1,
        })
        oldIndex++
        newIndex++
        lcsIndex++
      }
    } else {
      // No more LCS items, add remaining as changes
      while (oldIndex < oldLines.length) {
        result.push({
          type: 'removed',
          content: oldLines[oldIndex],
          lineNumber: oldIndex + 1,
        })
        oldIndex++
      }
      while (newIndex < newLines.length) {
        result.push({
          type: 'added',
          content: newLines[newIndex],
          lineNumber: newIndex + 1,
        })
        newIndex++
      }
    }
  }

  return result
}

/**
 * Finds the longest common subsequence between two arrays
 */
function longestCommonSubsequence(arr1: string[], arr2: string[]): string[] {
  const m = arr1.length
  const n = arr2.length
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0))

  // Build the LCS length table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to find the actual LCS
  const lcs: string[] = []
  let i = m
  let j = n

  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1])
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return lcs
}

/**
 * Computes a simple character-level diff for inline display
 */
export function computeInlineDiff(
  oldText: string,
  newText: string
): { type: 'added' | 'removed' | 'unchanged'; text: string }[] {
  // For simplicity, use word-level diff
  const oldWords = oldText.split(/(\s+)/)
  const newWords = newText.split(/(\s+)/)

  const lcs = longestCommonSubsequence(oldWords, newWords)
  const result: { type: 'added' | 'removed' | 'unchanged'; text: string }[] = []

  let oldIndex = 0
  let newIndex = 0
  let lcsIndex = 0

  while (oldIndex < oldWords.length || newIndex < newWords.length) {
    if (lcsIndex < lcs.length) {
      const lcsWord = lcs[lcsIndex]

      // Add deleted words
      while (oldIndex < oldWords.length && oldWords[oldIndex] !== lcsWord) {
        result.push({ type: 'removed', text: oldWords[oldIndex] })
        oldIndex++
      }

      // Add added words
      while (newIndex < newWords.length && newWords[newIndex] !== lcsWord) {
        result.push({ type: 'added', text: newWords[newIndex] })
        newIndex++
      }

      // Add unchanged word
      if (oldIndex < oldWords.length && newIndex < newWords.length) {
        result.push({ type: 'unchanged', text: oldWords[oldIndex] })
        oldIndex++
        newIndex++
        lcsIndex++
      }
    } else {
      // Add remaining as changes
      while (oldIndex < oldWords.length) {
        result.push({ type: 'removed', text: oldWords[oldIndex] })
        oldIndex++
      }
      while (newIndex < newWords.length) {
        result.push({ type: 'added', text: newWords[newIndex] })
        newIndex++
      }
    }
  }

  return result
}

/**
 * Checks if two content strings are different
 */
export function hasContentChanged(oldContent: string, newContent: string): boolean {
  // Simple trim comparison - if content is different, create a version
  // We want to capture all meaningful changes
  return oldContent.trim() !== newContent.trim()
}
