import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, ArrowLeft, History } from 'lucide-react'
import { CommentThread } from '@/components/document/comment-thread'
import { ShareDialog } from '@/components/document/share-dialog'
import { Separator } from '@/components/ui/separator'
import { db } from '@/lib/db'
import { documents, workspaceMembers, documentTags, tags } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params
  const session = await getSession()

  if (!session?.user) {
    notFound()
  }

  // Fetch document from database
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1)

  if (!document) {
    notFound()
  }

  // Check workspace membership
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, document.workspaceId),
        eq(workspaceMembers.userId, session.user.id),
        eq(workspaceMembers.isActive, true)
      )
    )
    .limit(1)

  if (!membership) {
    notFound()
  }

  // Fetch document tags
  const docTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
    })
    .from(documentTags)
    .innerJoin(tags, eq(documentTags.tagId, tags.id))
    .where(
      and(
        eq(documentTags.documentId, id),
        eq(documentTags.isAccepted, true)
      )
    )

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {document.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ShareDialog documentId={id} documentTitle={document.title} />
            <Link href={`/documents/${id}/versions`}>
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </Link>
            <Link href={`/documents/${id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Tags */}
          {docTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {docTags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color || '#3B82F6' }}
                  className="text-white"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <div
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />

          <Separator />

          <CommentThread documentId={id} />
        </div>
      </div>
    </div>
  )
}
