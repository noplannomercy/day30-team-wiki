'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-gray-900">
      <div className="text-center">
        <FileQuestion className="mx-auto mb-6 h-24 w-24 text-gray-400" />

        <h1 className="mb-2 text-6xl font-bold text-gray-900 dark:text-white">404</h1>

        <h2 className="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Page Not Found
        </h2>

        <p className="mb-8 text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Link href="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Need help? Check our{' '}
          <Link href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400">
            Privacy Policy
          </Link>{' '}
          or{' '}
          <Link href="/terms" className="text-blue-600 hover:underline dark:text-blue-400">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  )
}
