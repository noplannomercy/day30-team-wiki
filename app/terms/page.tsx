import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to App
          </Button>
        </Link>

        <div className="rounded-lg border bg-white p-8 dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-8 flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold">Terms of Service</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: January 2026
              </p>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using TeamWiki, you accept and agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use our
              service.
            </p>

            <h2>2. Service Description</h2>
            <p>
              TeamWiki is a team documentation and knowledge management platform that
              provides:
            </p>
            <ul>
              <li>Markdown document creation and editing</li>
              <li>Team collaboration with comments and sharing</li>
              <li>AI-powered tagging and summarization (optional)</li>
              <li>Version history and full-text search</li>
              <li>Document organization with folders and tags</li>
            </ul>

            <h2>3. Account Registration</h2>
            <ul>
              <li>You must provide accurate and complete information</li>
              <li>Minimum password length is 6 characters</li>
              <li>You are responsible for maintaining account security</li>
              <li>One account per person; shared accounts are not permitted</li>
              <li>You must be at least 13 years old to use TeamWiki</li>
            </ul>

            <h2>4. Acceptable Use</h2>
            <h3>You agree NOT to:</h3>
            <ul>
              <li>Upload illegal, harmful, or offensive content</li>
              <li>Violate intellectual property rights of others</li>
              <li>Use the service to spam or harass others</li>
              <li>Attempt to breach security or access others&apos; data</li>
              <li>Reverse engineer or copy the service</li>
              <li>Use automated tools to scrape or access the service</li>
              <li>Store sensitive personal data (SSNs, credit cards, health records)</li>
            </ul>

            <h2>5. MVP Limitations</h2>
            <p>
              This is a Minimum Viable Product (MVP) with the following constraints:
            </p>
            <ul>
              <li>
                <strong>Max 10 team members</strong> per workspace
              </li>
              <li>
                <strong>Max 100 documents</strong> per workspace (hard limit)
              </li>
              <li>
                <strong>Max 5 folder levels</strong> depth
              </li>
              <li>
                <strong>Max 20 favorites</strong> per user
              </li>
              <li>
                <strong>Max 10MB</strong> per image upload
              </li>
              <li>Local storage only (no S3/CDN in MVP)</li>
              <li>No real-time collaboration (coming in future versions)</li>
            </ul>

            <h2>6. AI Features and Data Processing</h2>
            <ul>
              <li>
                AI features (tagging, summarization) are <strong>optional</strong> and
                user-initiated
              </li>
              <li>
                When you use AI features, your document content is sent to OpenRouter API
              </li>
              <li>OpenRouter retains data for 30 days, then permanently deletes it</li>
              <li>AI-generated suggestions are not guaranteed to be accurate</li>
              <li>You are responsible for reviewing and approving AI suggestions</li>
              <li>
                See our <Link href="/privacy">Privacy Policy</Link> for full AI disclosure
              </li>
            </ul>

            <h2>7. Content Ownership and License</h2>
            <h3>Your Content:</h3>
            <ul>
              <li>You retain all rights to your documents and content</li>
              <li>You grant us a license to store, display, and process your content</li>
              <li>You can export and delete your content at any time</li>
            </ul>

            <h3>Shared Content:</h3>
            <ul>
              <li>
                Content you share with your workspace is accessible to all workspace
                members
              </li>
              <li>Public share links make documents accessible to anyone with the link</li>
              <li>You are responsible for content you choose to share</li>
            </ul>

            <h2>8. Version History</h2>
            <ul>
              <li>All document versions are stored <strong>permanently</strong></li>
              <li>Versions cannot be deleted (by design for accountability)</li>
              <li>Only document creators can restore previous versions</li>
              <li>Version history is included in data exports</li>
            </ul>

            <h2>9. Permissions and Access Control</h2>
            <ul>
              <li>
                <strong>Owner:</strong> Full control including workspace deletion
              </li>
              <li>
                <strong>Admin:</strong> Manage members, delete any content
              </li>
              <li>
                <strong>Editor:</strong> Create and edit documents, cannot delete others&apos;
                content
              </li>
              <li>
                <strong>Viewer:</strong> Read-only access, can add comments
              </li>
            </ul>

            <h2>10. Service Availability</h2>
            <ul>
              <li>We strive for 99% uptime but do not guarantee it</li>
              <li>Scheduled maintenance will be announced in advance when possible</li>
              <li>We are not liable for data loss due to service interruptions</li>
              <li>
                <strong>Auto-save with LocalStorage backup</strong> helps prevent data loss
              </li>
            </ul>

            <h2>11. Data Backup and Export</h2>
            <ul>
              <li>We perform regular database backups</li>
              <li>You can export your data at any time</li>
              <li>We are not responsible for backing up your local drafts</li>
              <li>
                LocalStorage backups are temporary and may be cleared by your browser
              </li>
            </ul>

            <h2>12. Termination</h2>
            <h3>You may:</h3>
            <ul>
              <li>Delete your account at any time</li>
              <li>Your data will be permanently deleted within 30 days</li>
            </ul>

            <h3>We may terminate your account if:</h3>
            <ul>
              <li>You violate these Terms of Service</li>
              <li>You engage in abusive or illegal behavior</li>
              <li>Your account is inactive for over 1 year</li>
            </ul>

            <h2>13. Liability and Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE ARE NOT
              LIABLE FOR:
            </p>
            <ul>
              <li>Data loss or corruption</li>
              <li>Inaccurate AI-generated suggestions</li>
              <li>Actions taken by workspace members</li>
              <li>Third-party service failures (OpenRouter, authentication providers)</li>
              <li>Business losses resulting from service use or unavailability</li>
            </ul>

            <h2>14. Indemnification</h2>
            <p>
              You agree to indemnify TeamWiki against claims arising from your use of the
              service, including content you upload and actions you take.
            </p>

            <h2>15. Changes to Terms</h2>
            <ul>
              <li>We may update these Terms at any time</li>
              <li>Material changes will be communicated via email or in-app notification</li>
              <li>Continued use after changes constitutes acceptance</li>
            </ul>

            <h2>16. Governing Law</h2>
            <p>
              These Terms are governed by the laws of [Your Jurisdiction]. Disputes will be
              resolved in the courts of [Your Jurisdiction].
            </p>

            <h2>17. Contact</h2>
            <p>
              For questions about these Terms, contact us at: legal@teamwiki.example.com
            </p>

            <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <p className="mb-0 text-sm text-blue-900 dark:text-blue-100">
                <strong>Key Points:</strong> You own your content. MVP has limits (100 docs,
                10 members). AI features are optional. Versions are permanent. Be respectful
                and don&apos;t abuse the service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
