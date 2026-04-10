# KYC — In All Media

A Know Your Client (KYC) tool that walks a potential client through the full
onboarding lifecycle for **In All Media**:

1. **Research & Evaluation** — Claude (with web search) investigates the
   prospect's business profile, creditworthiness, vendor history, and
   reputation, producing a structured report with a **GO / NO_GO / HOLD**
   recommendation.
2. **Legal Document Analysis & Redline** — upload the client's MSA / SOW / NDA /
   DPA. Claude (Opus) acts as outside counsel for In All Media's vendor side,
   identifies risky clauses, and proposes protective edits.
3. **Negotiation Tracking** — track document versions and back-and-forth
   events through the negotiation loop until signing.
4. **Coderfull Handoff** — after signing, Claude drafts the Coderfull payload
   and an Accounts notification email. Sending it pushes the client into
   Coderfull (currently a **mock** implementation that writes to
   `./uploads/coderfull-outbox/`) and notifies the Accounts group.

## Tech stack

- **Next.js 15** (App Router, full-stack TypeScript)
- **Prisma + SQLite** (zero-ops; schema is portable to Postgres)
- **Anthropic SDK** with Claude Sonnet 4.6 (research / handoff) and Opus 4.6
  (legal redlines)
- **Tailwind CSS**
- **pdf-parse** + **mammoth** for PDF / DOCX text extraction
- **Zod** for input + LLM-output validation

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env and set ANTHROPIC_API_KEY

# 3. Initialize the database
npm run prisma:migrate         # creates ./prisma/dev.db
npm run db:seed                # seeds the single MVP user

# 4. Run the dev server
npm run dev
```

Then open <http://localhost:3000>.

## Project structure

```
app/
  api/                        # Route handlers (REST)
    prospects/                #   CRUD + research / events / sign / handoff
    documents/[id]/...        #   Versions + analyze
    redlines/[id]/            #   Update redline status
    files/[key]/              #   Stream stored files
  prospects/                  # Pages (dashboard, list, detail, phase tabs)
components/                   # Shared React components
lib/
  db.ts                       # Prisma singleton
  session.ts                  # getCurrentUser() shim (single-user MVP)
  utils.ts                    # cn(), safeJsonParse, formatRelative
  validators.ts               # Zod input schemas for API routes
  claude/
    client.ts                 # Anthropic SDK wrapper + tool-use loop
    schemas.ts                # Zod schemas for Claude structured outputs
    prompts/{research,redline,handoff}.ts
  storage/{index,local}.ts    # StorageAdapter interface + local-FS impl
  coderfull/{index,mock}.ts   # CoderfullClient interface + mock impl
  research/{index,claude-web}.ts  # ResearchSource interface + Claude impl
  docs/parse.ts               # PDF/DOCX → plaintext + clause IDs
prisma/
  schema.prisma               # SQLite schema for all entities
  seed.ts                     # Seeds the single MVP user
uploads/                      # Local file storage (gitignored)
```

## Architecture notes

The tool is designed so the MVP swaps cleanly to production:

| Concern | MVP | Future swap |
|---|---|---|
| Storage | Local FS (`lib/storage/local.ts`) | S3 — implement `StorageAdapter` |
| Coderfull | Mock that writes to `uploads/coderfull-outbox/` | Real client — implement `CoderfullClient` |
| Auth | Single user via `getCurrentUser()` shim | NextAuth — replace `lib/session.ts` |
| Database | SQLite | Postgres — change `prisma/schema.prisma` provider |
| Research | Claude `web_search` only | Add OpenCorporates / D&B sources behind `ResearchSource` |

Every Claude structured output is validated with a Zod schema (`lib/claude/schemas.ts`)
before being persisted, so model drift is caught at the boundary.

## Verification (manual end-to-end)

### Phase 1 — Research
1. Create a prospect (any real company name).
2. Open the **Research** tab → click **Run research**.
3. Wait 1–3 minutes. Confirm:
   - Sections render (Summary, Company, Creditworthiness, Vendor History,
     Trust, Risks, Sources).
   - The recommendation is one of GO / NO_GO / HOLD.
   - The prospect's **decision** auto-fills from the recommendation.

### Phase 2 — Legal
1. Open the **Legal** tab → upload an MSA PDF or DOCX.
2. Click into the document → **Analyze with Claude**.
3. Confirm at least one redline appears with `clauseId`, `originalText`,
   `suggestedText`, `riskLevel`, `category`, and `rationale`. The matching
   clause is highlighted in the document text on the left.
4. Accept one redline, reject one, modify one. Reload — state persists.

### Phase 3 — Negotiation
1. Upload a v2 of a document marked as "In All Media (sent)" — a
   `VERSION_SENT` event appears in the timeline.
2. Log a free-form comment.
3. Click **Mark as signed** — status changes to SIGNED, a SIGNED event is
   recorded.

### Phase 4 — Handoff
1. Open the **Handoff** tab → **Draft with Claude**.
2. Review the payload + email; edit if needed.
3. Click **Send to Coderfull & notify Accounts**.
4. Confirm:
   - Status becomes HANDED_OFF
   - `./uploads/coderfull-outbox/cf_xxxxx/client.json` exists with the payload
   - Each signed document was copied into `cf_xxxxx/documents/`
   - An `email_*.json` file is in the outbox

### Cross-cutting
- `npm run prisma:studio` to inspect data
- Forcing a bad `ANTHROPIC_API_KEY` produces a graceful UI error
- `npm run test` runs Vitest unit tests

## License
Internal use only.
