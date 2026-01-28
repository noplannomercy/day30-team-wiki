'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CommentForm } from './comment-form'
import { MessageSquare, Check, Trash2, Reply } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Comment {
  id: string
  documentId: string
  userId: string
  content: string
  parentCommentId?: string
  resolved: boolean
  resolvedBy?: string
  createdAt: string
  updatedAt: string
  isEdited: boolean
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
  replies?: Comment[]
}

interface CommentThreadProps {
  documentId: string
}

export function CommentThread({ documentId }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [documentId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?documentId=${documentId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const handleResolve = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: true }),
      })

      if (response.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Failed to resolve comment:', error)
    }
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`flex gap-3 ${isReply ? 'ml-12 mt-3' : 'mt-4'} ${
        comment.resolved ? 'opacity-60' : ''
      }`}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user.avatarUrl} />
        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {comment.user.name}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
          {comment.isEdited && (
            <span className="text-xs text-gray-500">(edited)</span>
          )}
          {comment.resolved && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Check className="h-3 w-3" />
              Resolved
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
          {comment.content}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyingTo(comment.id)}
          >
            <Reply className="mr-1 h-3 w-3" />
            Reply
          </Button>

          {!comment.resolved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleResolve(comment.id)}
            >
              <Check className="mr-1 h-3 w-3" />
              Resolve
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(comment.id)}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
        </div>

        {replyingTo === comment.id && (
          <div className="mt-3">
            <CommentForm
              documentId={documentId}
              parentCommentId={comment.id}
              onSuccess={() => {
                setReplyingTo(null)
                fetchComments()
              }}
              onCancel={() => setReplyingTo(null)}
              placeholder="Write a reply..."
              autoFocus
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-gray-500">Loading comments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments
        </h3>
        <span className="text-sm text-gray-500">({comments.length})</span>
      </div>

      <CommentForm documentId={documentId} onSuccess={fetchComments} />

      {comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  )
}
