import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { shareLinks, documents, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface PageProps {
  params: Promise<{
    token: string
  }>
}

export default async function SharedDocumentPage({ params }: PageProps) {
  const { token } = await params

  // Fetch share link from database by token
  const [shareLinkData] = await db
    .select({
      shareLink: shareLinks,
      document: documents,
      creator: {
        name: users.name,
        email: users.email,
      },
    })
    .from(shareLinks)
    .innerJoin(documents, eq(shareLinks.documentId, documents.id))
    .leftJoin(users, eq(documents.createdBy, users.id))
    .where(eq(shareLinks.token, token))
    .limit(1)

  // Check if share link exists
  if (!shareLinkData) {
    notFound()
  }

  const { shareLink, document, creator } = shareLinkData

  // Check if expired
  if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Link Expired
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This share link has expired and is no longer accessible.
          </p>
        </div>
      </div>
    )
  }

  // Check if password protected
  if (shareLink.password) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-4 rounded-lg border bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Password Protected
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This document requires a password to view. Password protection feature coming soon.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Increment view count (fire and forget)
  db.update(shareLinks)
    .set({ viewCount: shareLink.viewCount + 1 })
    .where(eq(shareLinks.id, shareLink.id))
    .then(() => {})
    .catch((err) => console.error('Failed to increment view count:', err))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {document.title}
            </h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Shared via TeamWiki</span>
              {creator && <span>By {creator.name}</span>}
              <span>
                {shareLink.viewCount + 1} view{shareLink.viewCount !== 0 ? 's' : ''}
              </span>
            </div>
          </div>

          <div
            className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            Powered by <span className="font-semibold">TeamWiki</span>
          </p>
        </div>
      </div>
    </div>
  )
}
