import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: January 2026
              </p>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              TeamWiki (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, and safeguard your personal
              information when you use our team documentation platform.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Account Information</h3>
            <ul>
              <li>Email address</li>
              <li>Name</li>
              <li>Profile picture (if using Google OAuth)</li>
              <li>Password (encrypted with bcrypt, min 6 characters)</li>
            </ul>

            <h3>2.2 Document Content</h3>
            <ul>
              <li>Document titles and content you create</li>
              <li>Comments and mentions</li>
              <li>Tags and categories</li>
              <li>Images and attachments you upload</li>
              <li>Version history of your documents</li>
            </ul>

            <h3>2.3 Usage Information</h3>
            <ul>
              <li>Activity logs (document creation, updates, sharing)</li>
              <li>Search queries</li>
              <li>Favorites and preferences</li>
            </ul>

            <h2>3. AI Processing and Third-Party Services</h2>

            <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
              <h3 className="mt-0 text-amber-900 dark:text-amber-100">
                Important: AI Data Processing
              </h3>
              <p className="mb-0">
                <strong>We use OpenRouter API</strong> for AI-powered features (auto-tagging
                and summarization). When you use these features:
              </p>
              <ul className="mb-0">
                <li>
                  Your document titles and content are sent to OpenRouter&apos;s servers for
                  processing
                </li>
                <li>
                  OpenRouter uses Claude AI models (Anthropic) to generate tags and
                  summaries
                </li>
                <li>
                  <strong>Data retention:</strong> OpenRouter retains request data for 30
                  days for operational purposes, then permanently deletes it
                </li>
                <li>
                  You can choose not to use AI features - they are entirely optional and
                  user-initiated
                </li>
                <li>
                  OpenRouter does not use your data to train AI models
                </li>
              </ul>
            </div>

            <h2>4. How We Use Your Information</h2>
            <ul>
              <li>Provide and maintain the TeamWiki service</li>
              <li>Process your documents and enable collaboration</li>
              <li>Generate AI suggestions (only when you explicitly request them)</li>
              <li>Send notifications about document activity</li>
              <li>Improve our service and user experience</li>
              <li>Ensure security and prevent abuse</li>
            </ul>

            <h2>5. Data Storage and Security</h2>
            <ul>
              <li>All data is stored on secure PostgreSQL databases</li>
              <li>Passwords are hashed using bcrypt (10 rounds)</li>
              <li>Images are stored locally in /public/uploads (optimized with Sharp)</li>
              <li>We use HTTPS encryption for all data transmission</li>
              <li>Database connections are encrypted</li>
              <li>Session tokens are JWT-based with secure cookies</li>
            </ul>

            <h2>6. Data Sharing</h2>
            <p>We do not sell your personal information. We share data only in these cases:</p>
            <ul>
              <li>
                <strong>With your workspace members:</strong> Documents, comments, and
                activity are visible to users in your workspace based on permission
                settings
              </li>
              <li>
                <strong>Via share links:</strong> Documents you explicitly share via public
                links (with optional password protection)
              </li>
              <li>
                <strong>With AI service providers:</strong> Document content sent to
                OpenRouter when you use AI features (see section 3)
              </li>
              <li>
                <strong>For legal compliance:</strong> When required by law or to protect
                our rights
              </li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Export all your documents and data</li>
              <li>Delete your account and all associated data</li>
              <li>Opt out of AI features (simply don&apos;t use them)</li>
              <li>Request correction of inaccurate data</li>
            </ul>

            <h2>8. Data Retention</h2>
            <ul>
              <li>
                <strong>Active accounts:</strong> Data retained indefinitely while account is
                active
              </li>
              <li>
                <strong>Deleted accounts:</strong> Data permanently deleted within 30 days
              </li>
              <li>
                <strong>Version history:</strong> Stored permanently (per MVP design)
              </li>
              <li>
                <strong>Activity logs:</strong> Retained for 90 days
              </li>
              <li>
                <strong>OpenRouter AI processing:</strong> 30 days, then permanently deleted
              </li>
            </ul>

            <h2>9. Cookies and Local Storage</h2>
            <ul>
              <li>
                <strong>Authentication cookies:</strong> Session management (JWT tokens)
              </li>
              <li>
                <strong>LocalStorage:</strong> Auto-save backup, theme preference, UI state
              </li>
              <li>We do not use tracking or advertising cookies</li>
            </ul>

            <h2>10. Children&apos;s Privacy</h2>
            <p>
              TeamWiki is not intended for users under 13 years of age. We do not
              knowingly collect information from children.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy. Changes will be posted on this page with
              an updated &quot;Last updated&quot; date.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your rights, contact us at:
              privacy@teamwiki.example.com
            </p>

            <h2>13. GDPR Compliance (for EU Users)</h2>
            <p>
              If you are in the European Economic Area (EEA), you have additional rights
              under GDPR:
            </p>
            <ul>
              <li>Right to data portability</li>
              <li>Right to restrict processing</li>
              <li>Right to object to processing</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>

            <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <p className="mb-0 text-sm text-blue-900 dark:text-blue-100">
                <strong>Summary:</strong> We respect your privacy, use AI services
                transparently (OpenRouter with 30-day retention), store your data securely,
                and give you full control over your information. AI features are entirely
                optional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
