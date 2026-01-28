# TeamWiki - Team Documentation Platform

> A collaborative knowledge management platform with AI-powered features, built with Next.js 16, PostgreSQL, and OpenRouter AI.

## 🚀 Features

### Core Functionality (MVP)
1. **Markdown Editor** - Rich text editing with Tiptap, auto-save (2s debounce), LocalStorage backup
2. **Document Templates** - 7 pre-built templates (Blank, Meeting Notes, PRD, Technical Design, Weekly Report, Onboarding, Bug Report)
3. **Full-Text Search** - PostgreSQL FTS with relevance ranking, search docs + comments
4. **AI Auto-Tagging** - OpenRouter + Claude AI for intelligent tag suggestions (optional)
5. **AI Summarization** - Generate document summaries with AI (editable, optional)
6. **Comments & Mentions** - Threaded comments, @mentions, resolve/reopen
7. **Share Links** - UUID-based public sharing with optional password + expiry
8. **Permission System** - 4 roles (Owner, Admin, Editor, Viewer) with granular permissions
9. **Folders** - Hierarchical organization, max 5 levels depth
10. **Dark Mode** - System/light/dark theme with persistence

### Additional Features
- **Version History** - Permanent version tracking with diff viewer (split/unified)
- **Activity Feed** - Real-time workspace activity timeline
- **Favorites** - Max 20 favorites with drag-drop reordering
- **Tags System** - Custom tags with 8 color options
- **Image Upload** - Sharp optimization (>1MB → 80-85% quality, max 1920px)
- **Document Counter** - Shows current/100, red warning at ≥90 documents

## 📋 MVP Constraints

- **Max 10 team members** per workspace
- **Max 100 documents** per workspace (hard limit enforced)
- **Max 5 folder levels** depth validation
- **Max 20 favorites** per user
- **Max 10MB** per image upload

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Database:** PostgreSQL 16 + Drizzle ORM
- **Authentication:** NextAuth.js v4 (Google OAuth + Credentials)
- **Editor:** Tiptap with StarterKit, Image, Link extensions
- **UI:** shadcn/ui + Radix UI + Tailwind CSS 4
- **AI:** OpenRouter API (Claude Sonnet 4)
- **Image Processing:** Sharp
- **Password Hashing:** bcryptjs (10 rounds, min 6 chars)

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 16+
- Google OAuth credentials (optional)
- OpenRouter API key (optional, for AI features)

### Setup

1. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

2. **Configure environment**

Create `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/teamwiki"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key" # openssl rand -base64 32
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
OPENROUTER_API_KEY="your-openrouter-api-key"
```

3. **Setup database**
```bash
npm run db:generate  # Generate migration
npm run db:migrate   # Run migrations
```

4. **Create search indexes**

Run in your database:
```sql
CREATE INDEX idx_documents_fts ON documents
  USING GIN (to_tsvector('english', title || ' ' || content));

CREATE INDEX idx_comments_fts ON comments
  USING GIN (to_tsvector('english', content));
```

5. **Start development**
```bash
npm run dev
```

Visit http://localhost:3000

## 🔒 Security

- bcrypt password hashing (10 rounds, min 6 chars)
- JWT-based session management
- Role-based access control (RBAC)
- UUID share link tokens with optional password + expiry
- Parameterized queries (SQL injection prevention)
- Image validation and Sharp sanitization

## 🤖 AI Features (Optional)

**Provider:** OpenRouter API
**Model:** Claude Sonnet 4
**Data Retention:** 30 days, then permanently deleted
**Privacy:** Does not train on your data

### Features
- **Auto-Tagging:** 3-5 relevant tags
- **Summarization:** 2-3 sentence summaries

Users can accept/reject suggestions individually or in bulk.

## 🎨 UI Features

- **Theme System:** Light/Dark/System with LocalStorage persistence
- **Auto-Save:** 2s debounce with LocalStorage backup on failure
- **Keyboard Shortcuts:** Cmd/Ctrl + K for search
- **Responsive Design:** Mobile-friendly (basic)

## 📁 Project Structure

```
day30-team-wiki/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages
│   ├── (dashboard)/        # Main app
│   ├── api/                # API routes
│   ├── privacy/            # Privacy policy
│   └── terms/              # Terms of service
├── components/             # React components
│   ├── activity/           # Activity feed
│   ├── auth/               # Auth forms
│   ├── document/           # Document UI
│   ├── editor/             # Tiptap editor
│   └── ui/                 # shadcn components
├── lib/                    # Utilities
│   ├── ai/                 # AI integration
│   ├── db/                 # Database
│   ├── search/             # Full-text search
│   └── version/            # Diff algorithm
└── drizzle/                # Database migrations
```

## 🚢 Deployment (Vercel)

1. **Create Vercel project**
```bash
vercel
```

2. **Configure environment variables** in Vercel Dashboard

3. **Deploy**
```bash
vercel --prod
```

4. **Run migrations** on production database

## 📝 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:generate  # Generate migration
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

## 🔗 Important Pages

- **/privacy** - Privacy policy with AI disclosure
- **/terms** - Terms of service
- **/activity** - Workspace activity feed
- **/search** - Full-text search

## 🛣 Roadmap (Post-MVP)

- Real-time collaboration
- Email notifications
- Advanced search filters
- Mobile apps
- API access
- Integrations (Slack, GitHub)
- Enterprise features (SSO, audit logs)

## 📄 License

MIT License

## 🤝 Support

- Privacy: privacy@teamwiki.example.com
- Legal: legal@teamwiki.example.com
- Support: support@teamwiki.example.com

---

**Built with ❤️ using Next.js 16, PostgreSQL, and Claude AI**
Generated with [Claude Code](https://claude.com/claude-code)
