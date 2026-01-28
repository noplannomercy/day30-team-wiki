import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Clock } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { documents, workspaceMembers } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { formatDistanceToNow } from 'date-fns'

export default async function DashboardPage() {
  const session = await getSession()

  let recentDocuments: any[] = []

  if (session?.user) {
    // Get user's workspace
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, session.user.id),
          eq(workspaceMembers.isActive, true)
        )
      )
      .limit(1)

    if (membership) {
      // Fetch recent documents
      recentDocuments = await db
        .select()
        .from(documents)
        .where(eq(documents.workspaceId, membership.workspaceId))
        .orderBy(desc(documents.updatedAt))
        .limit(5)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to TeamWiki
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Start creating and organizing your team&apos;s knowledge
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/documents/new">
          <div className="group cursor-pointer rounded-lg border border-dashed border-gray-300 p-6 transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-950">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Create Document
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Start from scratch or use a template
                </p>
              </div>
            </div>
          </div>
        </Link>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Recent Documents
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {recentDocuments.length} document{recentDocuments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {recentDocuments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No documents yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="block rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {doc.title}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(doc.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
