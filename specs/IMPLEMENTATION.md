# TeamWiki - Phase-by-Phase Implementation Plan

> **Total Estimated Time: 10-14 hours**
> Based on: SRS_FINAL.md, ARCHITECTURE.md, DATABASE.md, COMPONENTS.md, CLAUDE.md

---

## Phase 1: Project Setup & Database (2 hours)

**Goal:** Initialize Next.js project and setup database with all tables

**Estimated Time:** 2 hours

**Files to Create:**
- [ ] `package.json` (Next.js 16, TypeScript, dependencies)
- [ ] `tsconfig.json` (TypeScript configuration)
- [ ] `tailwind.config.ts` (Tailwind + shadcn/ui setup)
- [ ] `.env.local` (environment variables)
- [ ] `lib/db/index.ts` (Drizzle connection)
- [ ] `lib/db/schema.ts` (All 14 tables)
- [ ] `drizzle.config.ts` (Drizzle Kit config)
- [ ] `drizzle/migrations/0000_initial.sql` (Initial migration)
- [ ] `components/ui/button.tsx` (shadcn Button component)
- [ ] `components/ui/input.tsx` (shadcn Input component)
- [ ] `lib/utils.ts` (cn utility for Tailwind)

**Implementation Strategy:**
1. Initialize Next.js 16 with TypeScript and App Router
2. Install dependencies (Drizzle, PostgreSQL, Tailwind, shadcn/ui)
3. Setup database connection (Neon or local PostgreSQL)
4. Define all 14 table schemas in `schema.ts`
5. Generate and run initial migration
6. Verify tables created with `npm run db:studio`

**Testing Checklist:**
- [ ] `npm run dev` starts without errors
- [ ] Database connection successful
- [ ] All 14 tables exist in database
- [ ] Drizzle Studio shows tables correctly
- [ ] TypeScript compiles without errors

**Acceptance Criteria:**
- [ ] Next.js app runs on localhost:3000
- [ ] Database has all 14 tables with indexes
- [ ] No console errors or warnings
- [ ] Environment variables loaded correctly
- [ ] shadcn/ui components render properly

---

## Phase 2: Authentication & User Management (2-3 hours)

**Goal:** Implement NextAuth.js with Google OAuth and Email/Password login

**Estimated Time:** 2-3 hours

**Files to Create:**
- [ ] `app/api/auth/[...nextauth]/route.ts` (NextAuth config)
- [ ] `lib/auth/config.ts` (NextAuth options)
- [ ] `lib/auth/session.ts` (getSession helper)
- [ ] `app/(auth)/layout.tsx` (Auth page layout)
- [ ] `app/(auth)/login/page.tsx` (Login page)
- [ ] `app/(auth)/signup/page.tsx` (Signup page)
- [ ] `components/auth/login-form.tsx` (Email/Password form)
- [ ] `components/auth/google-button.tsx` (Google OAuth button)
- [ ] `components/providers.tsx` (SessionProvider wrapper)
- [ ] `middleware.ts` (Route protection)

**Implementation Strategy:**
1. Setup NextAuth.js v5 with Google Provider
2. Add Credentials provider for Email/Password
3. Implement bcrypt password hashing (min 6 chars)
4. Create login/signup pages with forms
5. Add session middleware for protected routes
6. Test both authentication methods

**Testing Checklist:**
- [ ] Google OAuth login works
- [ ] Email/Password signup works (no email verification)
- [ ] Password hashing with bcrypt verified
- [ ] Session persists after refresh
- [ ] Protected routes redirect to login
- [ ] Logout functionality works

**Acceptance Criteria:**
- [ ] Users can signup with email (min 6 chars password)
- [ ] Users can login with Google account
- [ ] Session management working correctly
- [ ] Unauthenticated users redirected to login
- [ ] User data stored in database
- [ ] No security vulnerabilities

---

## Phase 3: Core Document Management (3-4 hours)

**Goal:** Tiptap editor with auto-save, folders, and basic CRUD

**Estimated Time:** 3-4 hours

**Files to Create:**
- [ ] `app/(dashboard)/layout.tsx` (Main app layout)
- [ ] `app/(dashboard)/page.tsx` (Dashboard/home page)
- [ ] `app/(dashboard)/documents/new/page.tsx` (New document)
- [ ] `app/(dashboard)/documents/[id]/page.tsx` (Document view)
- [ ] `app/(dashboard)/documents/[id]/edit/page.tsx` (Document editor)
- [ ] `components/layout/header.tsx` (Header with search/counter)
- [ ] `components/layout/sidebar.tsx` (Sidebar with folders)
- [ ] `components/layout/document-counter.tsx` (95/100 counter)
- [ ] `components/editor/tiptap-editor.tsx` (Main editor)
- [ ] `components/editor/editor-toolbar.tsx` (Formatting toolbar)
- [ ] `components/editor/auto-save-indicator.tsx` (Save status)
- [ ] `components/document/template-selector.tsx` (Template modal)
- [ ] `components/folder/folder-tree.tsx` (Recursive folder view)
- [ ] `lib/hooks/use-auto-save.ts` (Auto-save hook with LocalStorage)
- [ ] `lib/hooks/use-document-count.ts` (Document counter hook)
- [ ] `app/actions/documents.ts` (Server actions for CRUD)
- [ ] `app/actions/folders.ts` (Folder depth validation)

**Implementation Strategy:**
1. Create dashboard layout (Header + Sidebar)
2. Implement document counter (show 95/100, red at ≥90)
3. Setup Tiptap editor with StarterKit
4. Add auto-save with 2-second debounce
5. Implement LocalStorage backup on network failure
6. Create folder tree with max 5 levels validation
7. Add document templates (meeting notes, PRD, blank)
8. Implement document CRUD with server actions

**Testing Checklist:**
- [ ] Dashboard layout renders correctly
- [ ] Document counter shows current count
- [ ] Counter turns red at 90+ documents
- [ ] Create document button disabled at 100 docs
- [ ] Tiptap editor loads and is editable
- [ ] Auto-save works (2 second debounce)
- [ ] LocalStorage backup created on save failure
- [ ] Manual retry button appears on failure
- [ ] Folder tree displays correctly (max 5 levels)
- [ ] Folder depth validation prevents 6th level
- [ ] Template selector shows 3+ templates
- [ ] Document CRUD operations work
- [ ] Title duplicates allowed

**Acceptance Criteria:**
- [ ] Users can create documents from templates
- [ ] Editor auto-saves every 2 seconds
- [ ] Save failures backed up to LocalStorage
- [ ] Document counter accurate and real-time
- [ ] Hard limit of 100 documents enforced
- [ ] Folders max 5 levels deep
- [ ] No data loss on network issues
- [ ] Mobile responsive (basic)

---

## Phase 4: Image Upload & Optimization (1-2 hours)

**Goal:** Image upload with Sharp optimization and storage

**Estimated Time:** 1-2 hours

**Files to Create:**
- [ ] `app/api/images/upload/route.ts` (Upload endpoint)
- [ ] `app/api/images/[id]/route.ts` (Delete endpoint)
- [ ] `lib/image/optimize.ts` (Sharp optimization logic)
- [ ] `lib/storage/uploadthing.ts` (Uploadthing config)
- [ ] `components/editor/image-upload-handler.tsx` (Drag-drop handler)
- [ ] `components/editor/image-upload-button.tsx` (Upload button)

**Implementation Strategy:**
1. Setup Uploadthing or S3 for file storage
2. Create image upload API endpoint
3. Implement Sharp optimization (>1MB → 80-85% quality, max 1920px)
4. Validate file types (PNG/JPG/GIF only)
5. Add drag-and-drop to Tiptap editor
6. Store image metadata in database
7. Implement cascade delete (document → images)

**Testing Checklist:**
- [ ] Image upload button visible in editor
- [ ] Drag-and-drop works for images
- [ ] Only PNG/JPG/GIF accepted
- [ ] Large images (>1MB) optimized automatically
- [ ] Optimization reduces file size visibly
- [ ] Images display in editor after upload
- [ ] Image URLs stored in database
- [ ] Images deleted when document deleted

**Acceptance Criteria:**
- [ ] PNG/JPG/GIF uploads working
- [ ] Images >1MB auto-optimized (Sharp)
- [ ] File size reduced by ~40-60% when optimized
- [ ] Images display correctly in documents
- [ ] Drag-and-drop functionality works
- [ ] Cascade delete implemented
- [ ] No orphaned files in storage

---

## Phase 5: Collaboration Features (2-3 hours)

**Goal:** Comments, mentions, permissions, and sharing

**Estimated Time:** 2-3 hours

**Files to Create:**
- [ ] `app/api/comments/route.ts` (Comment CRUD)
- [ ] `app/api/comments/[id]/route.ts` (Single comment ops)
- [ ] `app/api/share/route.ts` (Create share link)
- [ ] `app/share/[token]/page.tsx` (Public share view)
- [ ] `components/document/comment-thread.tsx` (Comment list)
- [ ] `components/document/comment-form.tsx` (New comment form)
- [ ] `components/document/mention-input.tsx` (@mention autocomplete)
- [ ] `components/document/share-dialog.tsx` (Share modal)
- [ ] `components/settings/members-list.tsx` (Team members)
- [ ] `lib/permissions/check.ts` (Permission validation)
- [ ] `middleware.ts` (Add permission checks)
- [ ] `app/actions/comments.ts` (Comment server actions)
- [ ] `app/actions/members.ts` (Member removal logic)

**Implementation Strategy:**
1. Implement comment CRUD with threading support
2. Add @mention autocomplete for team members
3. Create permission middleware (Owner/Admin/Editor/Viewer)
4. Implement share links with UUID tokens
5. Add optional password and expiry for share links
6. Build member management (removal preserves docs)
7. Add comment resolution (creator or doc owner)

**Testing Checklist:**
- [ ] Viewer role can create comments
- [ ] Viewer role cannot edit documents
- [ ] Editor can delete own documents only
- [ ] Editor cannot delete others' documents
- [ ] Admin can delete any comment
- [ ] Comment threading works (replies)
- [ ] @mention autocomplete shows team members
- [ ] @mention sends notification (basic)
- [ ] Share links generate unique UUID tokens
- [ ] Password-protected shares work
- [ ] Share link expiry respected
- [ ] View count increments on share access
- [ ] Removed member's docs stay (marked "탈퇴한 사용자")

**Acceptance Criteria:**
- [ ] Permission matrix fully implemented
- [ ] Viewer can comment (collaboration-first)
- [ ] Comments can be resolved/reopened
- [ ] Share links work without authentication
- [ ] Team member removal preserves knowledge
- [ ] All permission rules enforced
- [ ] No unauthorized access possible

---

## Phase 6: AI Integration (2-3 hours)

**Goal:** OpenRouter AI for tagging and summarization

**Estimated Time:** 2-3 hours

**Files to Create:**
- [ ] `lib/ai/openrouter.ts` (OpenRouter client)
- [ ] `lib/ai/tagging.ts` (Tag generation logic)
- [ ] `lib/ai/summarize.ts` (Summarization logic)
- [ ] `lib/queue/ai-jobs.ts` (Background job processor)
- [ ] `app/api/ai/tag/route.ts` (Trigger tagging)
- [ ] `app/api/ai/tag/accept/route.ts` (Accept suggestions)
- [ ] `app/api/ai/tag/reject/route.ts` (Reject suggestions)
- [ ] `app/api/ai/summarize/route.ts` (Trigger summary)
- [ ] `app/api/webhooks/ai-job/route.ts` (Job status webhook)
- [ ] `components/document/ai-tag-suggestions.tsx` (Accept/Reject UI)
- [ ] `components/document/ai-summary-display.tsx` (Summary display)
- [ ] `lib/hooks/use-ai-suggested-tags.ts` (Tags state hook)

**Implementation Strategy:**
1. Setup OpenRouter API client (Claude Sonnet 4)
2. Create background job queue (ai_jobs table)
3. Implement tagging: extract document content → send to AI → parse tags
4. Implement summarization: send content → get TL;DR → store
5. Build accept/reject UI for AI tag suggestions
6. Add retry logic (max 3 attempts, exponential backoff)
7. Update privacy policy (OpenRouter 30-day retention)
8. Make AI processing non-blocking (background)

**Testing Checklist:**
- [ ] OpenRouter API connection works
- [ ] Document save triggers AI job creation
- [ ] AI job status tracked (pending/processing/completed/failed)
- [ ] Tags generated and stored as suggestions
- [ ] Summary generated and editable
- [ ] Accept button moves tag to active tags
- [ ] Reject button removes tag suggestion
- [ ] Bulk accept/reject works
- [ ] Retry logic activates on failure (max 3)
- [ ] Failed jobs logged with error message
- [ ] AI processing doesn't block user
- [ ] Privacy policy updated with disclosure

**Acceptance Criteria:**
- [ ] AI auto-tags documents after save
- [ ] User can accept/reject each tag individually
- [ ] AI summaries generated and editable
- [ ] Background processing doesn't block UI
- [ ] Retry logic handles transient failures
- [ ] Permanent failures logged clearly
- [ ] Privacy policy discloses AI data usage
- [ ] OpenRouter 30-day retention mentioned

---

## Phase 7: Search & Discovery (1-2 hours)

**Goal:** Full-text search on documents and comments

**Estimated Time:** 1-2 hours

**Files to Create:**
- [ ] `app/api/search/route.ts` (Search endpoint)
- [ ] `app/(dashboard)/search/page.tsx` (Search results page)
- [ ] `components/layout/search-bar.tsx` (Cmd+K search input)
- [ ] `components/search/search-results.tsx` (Results display)
- [ ] `components/search/search-filters.tsx` (Author/date filters)
- [ ] `lib/search/postgres-fts.ts` (PostgreSQL full-text search)

**Implementation Strategy:**
1. Create GIN indexes on documents.title, documents.content, comments.content
2. Implement PostgreSQL full-text search (to_tsvector/plainto_tsquery)
3. Build search API that queries docs + comments
4. Add result ranking (ts_rank)
5. Show source type (document vs comment) in results
6. Add Cmd+K keyboard shortcut
7. Implement search filters (author, date, tags)

**Testing Checklist:**
- [ ] Search bar visible in header
- [ ] Cmd+K opens search modal
- [ ] Typing query shows real-time results
- [ ] Search finds matches in document titles
- [ ] Search finds matches in document content
- [ ] Search finds matches in comments
- [ ] Results show source (doc vs comment)
- [ ] Results ranked by relevance
- [ ] Filters work (author, date, tags)
- [ ] Clicking result navigates to document
- [ ] Search highlights matches

**Acceptance Criteria:**
- [ ] Full-text search covers docs + comments
- [ ] Results appear within 500ms
- [ ] Relevance ranking works well
- [ ] Source type clearly indicated
- [ ] Cmd+K shortcut functional
- [ ] Mobile search interface usable

---

## Phase 8: Version History (1-2 hours)

**Goal:** Permanent version history with diff viewing

**Estimated Time:** 1-2 hours

**Files to Create:**
- [ ] `app/(dashboard)/documents/[id]/versions/page.tsx` (Version history)
- [ ] `app/api/versions/[id]/route.ts` (Get version)
- [ ] `app/api/versions/[id]/restore/route.ts` (Restore version)
- [ ] `components/document/version-timeline.tsx` (Timeline view)
- [ ] `components/document/version-diff.tsx` (Diff viewer)
- [ ] `lib/version/diff.ts` (Diff algorithm)
- [ ] `app/actions/versions.ts` (Version server actions)

**Implementation Strategy:**
1. Auto-create version on document save (if content changed)
2. Store full snapshot + diff from previous version
3. Build timeline UI showing all versions
4. Implement diff viewer (side-by-side or inline)
5. Add restore functionality (owner/creator only)
6. Show "who changed what when"

**Testing Checklist:**
- [ ] Version created on document save
- [ ] No version created if content unchanged
- [ ] Timeline shows all versions
- [ ] Each version shows timestamp and author
- [ ] Diff viewer highlights changes
- [ ] Restore button visible (if authorized)
- [ ] Restore functionality works
- [ ] Restored version becomes current
- [ ] No versions auto-deleted (permanent retention)

**Acceptance Criteria:**
- [ ] Every save creates new version (if changed)
- [ ] Versions stored permanently
- [ ] Timeline easy to navigate
- [ ] Diff viewer shows changes clearly
- [ ] Owner can restore any version
- [ ] Version history complete and accurate

---

## Phase 9: Advanced Features (2-3 hours)

**Goal:** Tags, favorites, activity feed, dark mode

**Estimated Time:** 2-3 hours

**Files to Create:**
- [ ] `app/api/tags/route.ts` (Tag CRUD)
- [ ] `app/api/favorites/route.ts` (Favorites CRUD)
- [ ] `app/api/activities/route.ts` (Activity log)
- [ ] `components/layout/tag-cloud.tsx` (Tag list in sidebar)
- [ ] `components/layout/favorites-list.tsx` (Favorites with drag-drop)
- [ ] `components/activity/activity-feed.tsx` (Activity timeline)
- [ ] `components/activity/activity-item.tsx` (Single activity)
- [ ] `components/theme/theme-toggle.tsx` (Dark mode switch)
- [ ] `lib/hooks/use-favorites.ts` (Favorites state + reorder)
- [ ] `app/actions/favorites.ts` (Favorite server actions)

**Implementation Strategy:**
1. Implement tag system (manual + AI-generated)
2. Build favorites with max 20 limit
3. Add drag-and-drop reordering for favorites
4. Create activity feed (recent actions)
5. Implement dark mode toggle (system/manual)
6. Add tag filtering and search

**Testing Checklist:**
- [ ] Manual tags can be created
- [ ] Tag colors customizable
- [ ] Tags displayed in sidebar
- [ ] Favorites can be added (documents + folders)
- [ ] Max 20 favorites enforced
- [ ] Drag-and-drop reordering works
- [ ] Activity feed shows recent actions
- [ ] Activity types: created/updated/commented/shared
- [ ] Dark mode toggle works
- [ ] Dark mode persists across sessions
- [ ] System theme detection works

**Acceptance Criteria:**
- [ ] Tag system fully functional
- [ ] Favorites limited to 20 items
- [ ] Favorites reorderable by drag-drop
- [ ] Activity feed shows all workspace actions
- [ ] Dark mode works throughout app
- [ ] No visual glitches in dark mode

---

## Phase 10: Polish & Deployment (2-3 hours)

**Goal:** Final polish, testing, and production deployment

**Estimated Time:** 2-3 hours

**Files to Create:**
- [ ] `app/privacy/page.tsx` (Privacy policy with AI disclosure)
- [ ] `app/terms/page.tsx` (Terms of service)
- [ ] `components/errors/error-boundary.tsx` (Error handling)
- [ ] `components/errors/not-found.tsx` (404 page)
- [ ] `components/loading/document-skeleton.tsx` (Loading states)
- [ ] `tests/auth.test.ts` (Basic auth tests)
- [ ] `tests/documents.test.ts` (Document CRUD tests)
- [ ] `README.md` (Project documentation)
- [ ] `vercel.json` (Deployment config)

**Implementation Strategy:**
1. Write privacy policy (OpenRouter AI disclosure)
2. Add error boundaries and 404 pages
3. Implement loading skeletons
4. Test all critical user flows
5. Fix any remaining bugs
6. Optimize images and bundle size
7. Setup Vercel deployment
8. Configure environment variables in Vercel
9. Run production build and test

**Testing Checklist:**
- [ ] All 10 MVP features working
- [ ] No console errors or warnings
- [ ] Error boundaries catch errors gracefully
- [ ] 404 page displays correctly
- [ ] Loading states show during data fetching
- [ ] Privacy policy mentions OpenRouter
- [ ] Mobile responsive (basic) on all pages
- [ ] Document counter accurate
- [ ] 100 document limit enforced
- [ ] Folder depth limit enforced (5 levels)
- [ ] Permission rules all working
- [ ] Auto-save + LocalStorage backup working
- [ ] Image optimization working
- [ ] AI tagging/summarization working
- [ ] Search working (docs + comments)
- [ ] Version history working

**Deployment Checklist:**
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Database connection string updated
- [ ] Google OAuth credentials updated
- [ ] OpenRouter API key added
- [ ] Uploadthing/S3 credentials added
- [ ] Production build succeeds
- [ ] Database migrations run on production
- [ ] Production site loads correctly
- [ ] All features work in production
- [ ] SSL certificate active

**Acceptance Criteria:**
- [ ] All MVP features fully functional
- [ ] No critical bugs remaining
- [ ] Performance acceptable (pages load <2s)
- [ ] Mobile usable (basic responsive)
- [ ] Production deployment successful
- [ ] Privacy policy compliant
- [ ] Ready for team usage

---

## Final Validation Checklist

### Core Features (10/10)
- [ ] 1. Markdown editor with auto-save
- [ ] 2. Document templates (3+)
- [ ] 3. Full-text search (docs + comments)
- [ ] 4. AI auto-tagging (user controlled)
- [ ] 5. AI summarization (editable)
- [ ] 6. Comments/mentions (Viewer can comment)
- [ ] 7. Share links (UUID tokens)
- [ ] 8. Permissions (4 roles)
- [ ] 9. Folders (max 5 levels)
- [ ] 10. Dark mode

### Critical Requirements
- [ ] No email verification (instant signup)
- [ ] Password min 6 chars (bcrypt)
- [ ] Google OAuth working
- [ ] Images auto-optimized (>1MB)
- [ ] LocalStorage backup on save fail
- [ ] Document counter (95/100, red ≥90)
- [ ] 100 doc hard limit (button disabled)
- [ ] Folder depth validated (max 5)
- [ ] Viewer can comment
- [ ] Editor can't delete others' docs
- [ ] AI suggestions user-controlled
- [ ] Privacy policy with AI disclosure

### Performance & Security
- [ ] Pages load under 2 seconds
- [ ] No console errors
- [ ] HTTPS enabled
- [ ] Database encrypted
- [ ] Passwords hashed (bcrypt)
- [ ] Session secure
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] SQL injection prevented (Drizzle)

### Documentation
- [ ] README.md complete
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] All environment variables documented
- [ ] Deployment guide written

---

## Time Tracking Summary

| Phase | Estimated Time | Cumulative |
|-------|----------------|------------|
| Phase 1: Setup & Database | 2h | 2h |
| Phase 2: Authentication | 2-3h | 4-5h |
| Phase 3: Document Management | 3-4h | 7-9h |
| Phase 4: Image Upload | 1-2h | 8-11h |
| Phase 5: Collaboration | 2-3h | 10-14h |
| Phase 6: AI Integration | 2-3h | 12-17h |
| Phase 7: Search | 1-2h | 13-19h |
| Phase 8: Version History | 1-2h | 14-21h |
| Phase 9: Advanced Features | 2-3h | 16-24h |
| Phase 10: Polish & Deploy | 2-3h | 18-27h |

**Realistic Total: 12-17 hours** (accounting for debugging and iterations)

---

## Daily Milestones (for Day 30 Project)

If working on this as a single-day project:

**Morning (4-5 hours)**
- Phases 1-2: Setup + Auth

**Afternoon (4-5 hours)**
- Phases 3-4: Document management + Images

**Evening (4-5 hours)**
- Phases 5-6: Collaboration + AI

**Late Evening (2-3 hours)**
- Phases 7-8: Search + Versions (or defer to Phase 4)

**Deploy**
- Phase 10: Final polish and production deploy

---

## Common Pitfalls to Avoid

1. **Forgetting LocalStorage backup** - Implement early in Phase 3
2. **Missing permission checks** - Add middleware in Phase 5
3. **Not validating folder depth** - Add check in Phase 3
4. **Skipping image optimization** - Sharp setup critical in Phase 4
5. **AI blocking UI** - Must be async background jobs in Phase 6
6. **Missing privacy policy** - Required for AI disclosure in Phase 10
7. **Not testing document limit** - Test at 90, 99, 100 docs
8. **Forgetting cascade delete** - Images must delete with document

---

## Success Criteria

### MVP Complete When:
✅ All 10 features functional
✅ 100 document limit enforced
✅ Auto-save with LocalStorage backup works
✅ AI tagging/summarization operational
✅ Permission matrix fully implemented
✅ No critical bugs
✅ Basic mobile responsive
✅ Production deployed

### Ready for Team Use When:
✅ Privacy policy published
✅ 5-person team can work simultaneously
✅ No data loss scenarios
✅ Search returns relevant results
✅ Performance acceptable (<2s page loads)
✅ Documentation complete

---

**End of Implementation Plan**

> For detailed technical specifications, refer to:
> - `/docs/SRS_FINAL.md` - Complete requirements
> - `/docs/ARCHITECTURE.md` - System architecture
> - `/docs/DATABASE.md` - Database schema
> - `/docs/COMPONENTS.md` - Component details
> - `/CLAUDE.md` - Quick developer reference
