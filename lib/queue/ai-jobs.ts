import { generateTags } from '../ai/tagging'
import { generateSummary } from '../ai/summarize'

export type JobType = 'tagging' | 'summarize'
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface AIJob {
  id: string
  documentId: string
  jobType: JobType
  status: JobStatus
  retryCount: number
  errorMessage?: string
  result?: any
  createdAt: Date
  completedAt?: Date
}

const MAX_RETRIES = 3

export async function processAIJob(
  job: AIJob,
  documentTitle: string,
  documentContent: string
): Promise<{ status: JobStatus; result?: any; error?: string }> {
  try {
    let result: any

    if (job.jobType === 'tagging') {
      const tags = await generateTags(documentTitle, documentContent)
      result = { tags }
    } else if (job.jobType === 'summarize') {
      const summary = await generateSummary(documentTitle, documentContent)
      result = { summary }
    } else {
      throw new Error(`Unknown job type: ${job.jobType}`)
    }

    return {
      status: 'completed',
      result,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Check if we should retry
    if (job.retryCount < MAX_RETRIES) {
      return {
        status: 'pending', // Will be retried
        error: errorMessage,
      }
    }

    return {
      status: 'failed',
      error: errorMessage,
    }
  }
}

export function calculateRetryDelay(retryCount: number): number {
  // Exponential backoff: 1s, 2s, 4s
  return Math.pow(2, retryCount) * 1000
}
