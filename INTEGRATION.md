# Integration Brief — KYC → Sales Dashboard

The full KYC reference implementation is this repo on branch `claude/create-kyc-tool-P93yN`. Use it as the spec. Port it into the Sales Dashboard as described below.

## Goal
Integrate the 4 KYC sub-tools into the Sales Dashboard under a new sidebar heading **"Sales / Growth"**:
- Research — Claude-powered KYC report with GO / HOLD / NO-GO recommendation
- Legal redline — upload MSA/NDA, Claude proposes protective edits
- Negotiation — track document versions + events through to signing
- Handoff — draft Coderfull payload + Accounts email, then send

Feel like native Sales Dashboard features. Shared deployment, shared auth, shared DB.

## Target stack (Sales Dashboard)
- React 18 + Vite + TypeScript SPA (frontend)
- Express BFF on `:3001` (backend) — add Prisma + SQLite/Postgres (no DB today)
- Tailwind + shadcn + IAM design system (Montserrat + Roboto Mono)
- Add `@anthropic-ai/sdk` — first Claude integration on this stack

## What to copy, from where

All paths below refer to this KYC repo (`gabespitz/KYC`, branch `claude/create-kyc-tool-P93yN`):

### Backend (into the BFF)
Framework-agnostic — copy as-is into `bff/src/`:
- `lib/db.ts` — Prisma singleton
- `lib/claude/client.ts` + `lib/claude/prompts/{research,redline,handoff}.ts` + `lib/claude/schemas.ts`
- `lib/docs/parse.ts` — PDF (pdf-parse) + DOCX (mammoth) extraction
- `lib/storage/{index,local}.ts` — `StorageAdapter` interface + local-FS impl
- `lib/coderfull/{index,mock}.ts` — mock Coderfull client
- `lib/research/{index,claude-web}.ts` — Claude-backed research source
- `lib/validators.ts` — zod request schemas

Prisma schema: copy `prisma/schema.prisma` verbatim into `bff/prisma/schema.prisma`. Switch provider to Postgres for production, keep SQLite for dev. Run `prisma migrate dev --name init`.

### API routes — port Next.js route handlers to Express
One-for-one. Read each `app/api/**/route.ts` — they're short (50-150 lines each). Produce an Express route with the same method + path + body shape:

| Next.js path | Express path | Methods |
|---|---|---|
| `app/api/prospects/route.ts` | `/api/prospects` | GET, POST |
| `app/api/prospects/[id]/route.ts` | `/api/prospects/:id` | GET, PATCH, DELETE |
| `app/api/prospects/search/route.ts` | `/api/prospects/search` | GET |
| `app/api/prospects/[id]/research/route.ts` | `/api/prospects/:id/research` | GET, POST |
| `app/api/prospects/[id]/documents/route.ts` | `/api/prospects/:id/documents` | GET, POST (multipart — use `multer`) |
| `app/api/documents/[id]/analyze/route.ts` | `/api/documents/:id/analyze` | POST |
| `app/api/documents/[id]/versions/route.ts` | `/api/documents/:id/versions` | POST (multipart — use `multer`) |
| `app/api/redlines/[id]/route.ts` | `/api/redlines/:id` | PATCH, DELETE |
| `app/api/prospects/[id]/events/route.ts` | `/api/prospects/:id/events` | GET, POST |
| `app/api/prospects/[id]/sign/route.ts` | `/api/prospects/:id/sign` | POST |
| `app/api/prospects/[id]/handoff/draft/route.ts` | `/api/prospects/:id/handoff/draft` | POST |
| `app/api/prospects/[id]/handoff/send/route.ts` | `/api/prospects/:id/handoff/send` | POST |
| `app/api/files/[key]/route.ts` | `/api/files/:key` | GET (stream file via `res.send(buffer)`) |

Swap `NextResponse.json(x)` → `res.json(x)`, `NextResponse.json(x, { status: 400 })` → `res.status(400).json(x)`. Validate request bodies with the existing zod schemas in `lib/validators.ts` + `lib/claude/schemas.ts`.

### Frontend (into the SD)
Copy into `src/features/kyc/` (or wherever the SD organizes features):
- `components/ProspectPicker.tsx` — search/create combobox
- `components/ProspectTabs.tsx` — 4-phase tab strip
- `lib/badges.ts` — `statusBadge`, `decisionBadge`, `riskBadge` helpers (pure functions)
- All pages under `app/tools/**/*.tsx` and `app/prospects/**/*.tsx`

**Next.js primitives to swap:**
- `next/link` → `react-router-dom`'s `<Link>`
- `next/navigation` `useRouter`, `usePathname`, `useParams` → `react-router-dom` equivalents (`useNavigate`, `useLocation`, `useParams`)
- `async` server components → client components with `useEffect` / TanStack Query (whichever the SD already uses)
- `app/**/layout.tsx` nesting → nested routes (`react-router-dom` outlet pattern)
- Dynamic route params (`[id]`) → URL param config in router

**Styles**: `app/globals.css` has the IAM design system. The SD already has the IAM design system loaded, so only copy any missing utility classes: `.timeline`, `.risk-card`, `.metric-grid-6`, `.table-wrap`. Everything else is already there.

### Sidebar spec
Add a new group to the SD's existing sidebar:

```
Sales / Growth
  ├── Research         icon Search           → /sales-growth/research
  ├── Legal redline    icon FileText         → /sales-growth/legal
  ├── Negotiation      icon MessageSquare    → /sales-growth/negotiation
  └── Handoff          icon Package          → /sales-growth/handoff
```

URL prefix is `/sales-growth/` (match the SD's convention if different). All KYC routes nest under this prefix.

## Dependencies to add

**BFF `package.json`:**
```
@anthropic-ai/sdk  @prisma/client  prisma (dev)
pdf-parse  mammoth  zod  nanoid  multer  @types/multer
```

**Frontend `package.json`** (skip any already present):
```
react-router-dom  lucide-react  date-fns  zod
react-hook-form  @hookform/resolvers  nanoid  diff-match-patch  @types/diff-match-patch
```

## Environment variables (add to `.env`)

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL_RESEARCH=claude-sonnet-4-6
ANTHROPIC_MODEL_REDLINE=claude-opus-4-6
ANTHROPIC_MODEL_HANDOFF=claude-sonnet-4-6
DATABASE_URL=file:./dev.db           # or a Postgres URL in prod
KYC_UPLOAD_DIR=./uploads
CODERFULL_MODE=mock
```

## Data model notes

- KYC keeps its own `Prospect` table (don't try to collapse into Pipedrive yet). Add an optional `pipedriveOrgId String?` field on `Prospect` so future sync is possible. Confirm with the user before making this a hard FK to Pipedrive.
- `User` model is a single-user stub — either wire to the SD's existing auth user table or keep the stub for now.
- `ResearchReport.payload` and `ResearchReport.sources` are JSON strings (SQLite limitation). On Postgres you can use `Json` type.

## Open decisions — ask the user before acting

1. **Pipedrive mapping**: does a KYC prospect == a Pipedrive Organization? If yes, add `pipedriveOrgId` as an FK and add a background sync. Recommended: start as an optional nullable string, cross-link later.
2. **File storage**: keep local-FS (`./uploads/`) or move to S3/GCS? Keep local for MVP.
3. **Auth + role gating**: which SD roles see which sub-tool? Default: show all to everyone; add role gating later.
4. **Home page vs queue page**: should `/sales-growth/` land on the existing Sales Dashboard home (with a KYC panel) or on a dedicated KYC dashboard (like `app/page.tsx` in this repo)? Ask the user.

## Build order (ship incrementally)

1. BFF: add Prisma + schema + migrations. Copy `lib/claude/*`, `lib/docs/parse.ts`, `lib/storage/*`, `lib/coderfull/*`, `lib/research/*`, `lib/validators.ts`. Set env vars.
2. BFF: port the prospect CRUD + search endpoints. Verify with `curl`.
3. BFF: port research + legal + events + handoff endpoints + file-serving route.
4. Frontend: add the sidebar group + routes. Port `ProspectPicker` and `ProspectTabs`.
5. Frontend: port Research sub-tool first (queue + new + prospect detail). Verify end-to-end against the running BFF.
6. Frontend: port Legal, Negotiation, Handoff sub-tools in sequence.
7. Add any missing IAM design system utility classes to the SD's global CSS.

## Verification (end-to-end)

- Create a prospect via `/sales-growth/research` → pick/create → prospect detail page loads
- Run research → Claude returns a report within 1-3 min → GO/HOLD/NO-GO badge renders prominently
- Upload an MSA on Legal tab → Claude analyzes → redlines appear with risk badges → accept/reject/modify persists
- Mark prospect signed on Negotiation tab → status changes
- Draft Coderfull payload on Handoff → send → check `uploads/coderfull-outbox/cf_xxxxx/` for payload + documents + email JSON
- Sidebar active state highlights the correct "Sales / Growth" sub-item
- Dark mode works (already compatible)
- `npm run build` + existing tests still pass on both frontend and BFF

## Not in scope for first pass

- SSE progress streaming for long Claude calls (simple POST/await is fine)
- Role-based access control beyond whatever the SD already has
- S3 uploads
- Pipedrive two-way sync
- Deploy to production — local dev working is the MVP

## References in this repo
- Verification details: `/README.md`
- Design system: `/IAM-DESIGN-SYSTEM-PORTABLE.md`
- Handoff kick-off prompt (paste this into the other Claude session): `/HANDOFF-PROMPT.md`
