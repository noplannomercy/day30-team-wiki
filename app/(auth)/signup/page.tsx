import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'
import { GoogleButton } from '@/components/auth/google-button'
import { Separator } from '@/components/ui/separator'

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Start managing your team&apos;s knowledge today.
        </p>

        <div className="mt-6 space-y-4">
          <GoogleButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <SignupForm />
        </div>
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
