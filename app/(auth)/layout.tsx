export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            TeamWiki
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            AI-Powered Knowledge Management
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
