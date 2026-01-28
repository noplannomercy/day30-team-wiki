'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Share2, Copy, Check, Loader2 } from 'lucide-react'

interface ShareDialogProps {
  documentId: string
  documentTitle: string
}

export function ShareDialog({ documentId, documentTitle }: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [password, setPassword] = useState('')
  const [expiresIn, setExpiresIn] = useState('never')

  const handleCreateLink = async () => {
    setLoading(true)

    try {
      const expiresAt = expiresIn === 'never'
        ? null
        : new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000)

      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          password: password || null,
          expiresAt,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create share link')
      }

      const data = await response.json()
      setShareLink(data.url)
    } catch (error) {
      console.error('Failed to create share link:', error)
      alert('Failed to create share link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shareLink) return

    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Create a shareable link for &quot;{documentTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        {!shareLink ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Password (optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave empty for no password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="expires">Expires</Label>
              <select
                id="expires"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
              >
                <option value="never">Never</option>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
              </select>
            </div>

            <Button
              onClick={handleCreateLink}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Share Link'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Share Link</Label>
              <div className="mt-1 flex gap-2">
                <Input value={shareLink} readOnly className="flex-1" />
                <Button onClick={handleCopy} size="icon" variant="outline">
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              {password && <p>🔒 Password protected</p>}
              {expiresIn !== 'never' && (
                <p>⏰ Expires in {expiresIn} day(s)</p>
              )}
              {!password && expiresIn === 'never' && (
                <p>🌐 Public link (no password, no expiry)</p>
              )}
            </div>

            <Button
              onClick={() => {
                setShareLink(null)
                setPassword('')
                setExpiresIn('never')
              }}
              variant="outline"
              className="w-full"
            >
              Create Another Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
