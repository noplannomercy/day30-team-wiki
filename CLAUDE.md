# TeamWiki - Developer Quick Reference

> **AI-Powered Knowledge Management for Teams (5-50 members)**

## Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind + shadcn/ui, Tiptap editor
- **Backend**: Next.js API Routes + Server Actions, PostgreSQL 16, Drizzle ORM
- **Auth**: NextAuth.js v5 (Google OAuth + Email/Password, no email verification)
- **AI**: OpenRouter API (Claude Sonnet 4), Sharp (image optimization)
- **Deploy**: Vercel + Neon PostgreSQL

## MVP Features (10)
1. Markdown editor (Tiptap) - Auto-save + LocalStorage backup
2. Templates (meeting notes, PRD, tech specs)
3. Full-text search (docs + comments, PostgreSQL GIN)
4. AI auto-tagging (background job, user accepts/rejects)
5. AI summarization (editable)
6. Comments/mentions (Viewer can comment)
7. Share links (UUID tokens, password/expiry optional)
8. Permissions (Owner/Admin/Editor/Viewer)
9. Folders (max 5 levels, color coded)
10. Dark mode

## Database (14 Tables)
```
workspaces → workspace_members → users
workspaces → folders (max depth 5) → documents
documents → versions (permanent), images (PNG/JPG/GIF), tags, comments, share_links, ai_jobs
users → favorites (max 20)
```

## Critical Rules
- **Auth**: No email verification, password min 6 chars, bcrypt hashing
- **Images**: PNG/JPG/GIF only, auto-optimize if >1MB (Sharp, 80-85%, max 1920px), cascade delete
- **AI**: Background jobs, max 3 retries, user approves/rejects tags, full content to OpenRouter (30-day retention)
- **Auto-save**: Debounce 2s → LocalStorage backup → Server (5 retries) → Clear backup on success
- **Limits**: 100 docs max (hard limit), show counter (95/100), red at ≥90
- **Folders**: Max 5 levels deep (validate on creation)
- **Titles**: Duplicates allowed (ID-based URLs: `/documents/{uuid}`)
- **Permissions**: Viewer can comment, Editor can't delete others' docs, Admin can delete any comment

## Permissions Matrix
| Role | Create | Edit Own | Edit Others | Delete Own | Delete Others | Comment |
|------|--------|----------|-------------|-----------|---------------|---------|
| Owner/Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Viewer | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Implementation Phases

### Phase 1: Core (3-4h)
- Next.js setup + Drizzle migration (14 tables)
- NextAuth (Google + Email/Password)
- Tiptap editor + auto-save (LocalStorage backup)
- Document CRUD + folders (depth validation)
- Image upload (Sharp optimization)

### Phase 2: Collaboration (2-3h)
- Comments (Viewer can create, resolved by creator/owner)
- @mentions + notifications
- Permission middleware
- Share links (UUID tokens)

### Phase 3: AI (2-3h)
- OpenRouter integration
- Background job queue (ai_jobs table)
- AI tagging (accept/reject UI)
- AI summarization
- Full-text search (GIN indexes)

### Phase 4: Polish (2-3h)
- Version history (permanent)
- Dark mode, tags, favorites (max 20), activity feed

## Environment Setup
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://..."
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
OPENROUTER_API_KEY="..."
UPLOADTHING_SECRET="..."  # or S3 credentials
```

## Drizzle Commands
```bash
npm run db:generate  # Generate migration
npm run db:migrate   # Run migrations
npm run db:studio    # Visual DB browser
```

## Checklist
- [ ] 14 tables migrated (indexes + constraints)
- [ ] Google OAuth configured (client ID/secret)
- [ ] Image storage (Uploadthing/S3)
- [ ] Privacy policy (OpenRouter disclosure)
- [ ] Document counter (real-time)
- [ ] Folder depth validation (max 5)
- [ ] AI retry logic (max 3)
- [ ] LocalStorage backup UI
- [ ] Permission middleware (all routes)
- [ ] 100 doc limit (disable button at limit)

## Full Documentation
- `/docs/SRS_FINAL.md` - Complete requirements
- `/docs/ARCHITECTURE.md` - System architecture (Mermaid diagrams)
- `/docs/DATABASE.md` - Schema + Drizzle code
- `/docs/COMPONENTS.md` - Component structure + props
- `/docs/INTERVIEW.md` - Requirement decisions
