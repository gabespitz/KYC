# Handoff prompt — paste this into the Sales Dashboard Claude Code session

> Copy everything between the horizontal rules into your Sales Dashboard Claude Code session as a single message.

---

I want you to integrate a **KYC (Know Your Client) tool suite** into this Sales Dashboard. The four sub-tools (Research, Legal redline, Negotiation, Coderfull handoff) should appear in the sidebar under a new heading called **"Sales / Growth"** and feel like native features of this app — shared auth, shared deployment, shared database.

There is already a **fully working reference implementation** as a standalone Next.js app at:

- GitHub repo: `gabespitz/KYC`
- Branch: `claude/create-kyc-tool-P93yN`
- Integration brief: `INTEGRATION.md` at the root of that repo

Please:

1. **Read `INTEGRATION.md` in that repo first.** It contains the full engineering plan: target architecture, Prisma schema, dependency list, file-by-file port mapping table (Next.js → React/Vite/Express), sidebar spec, environment variables, and a verification checklist. Do not improvise architectural choices — follow the brief.

2. **Fetch the reference code as needed.** For each Next.js file you're porting, read it from the `gabespitz/KYC` repo (branch `claude/create-kyc-tool-P93yN`) and translate it to this app's stack:
   - React 18 + Vite + TypeScript SPA (frontend)
   - Express BFF on `:3001` (backend)
   - Tailwind + shadcn/ui + IAM design system (Montserrat + Roboto Mono)
   - Add Prisma + SQLite (dev) / Postgres (prod) to the BFF — it currently has no DB
   - Add `@anthropic-ai/sdk` to the BFF — this will be the first Claude integration on this stack

3. **Use `claude-sonnet-4-6` for research and handoff calls, `claude-opus-4-6` for legal redline calls.** Both are in the 4.6 Claude model family.

4. **Raise the open decisions with the user before making irreversible choices.** The `INTEGRATION.md` lists them explicitly — Pipedrive entity mapping (Organization vs Deal vs separate), file storage location, and whether to apply role-based auth gating on day one.

5. **Ship incrementally.** Recommended order:
   - (a) Add Prisma to the BFF + copy the schema from `gabespitz/KYC:prisma/schema.prisma`. Run migrations.
   - (b) Copy the framework-agnostic libraries (`lib/claude/*`, `lib/docs/parse.ts`, `lib/storage/*`, `lib/coderfull/*`, `lib/research/*`, `lib/badges.ts`, `lib/validators.ts`) into appropriate places (see `INTEGRATION.md` for the exact paths).
   - (c) Port the API routes into Express endpoints (the BFF). Confirm each responds with `curl` before moving on.
   - (d) Add the "Sales / Growth" sidebar group + 4 nav items in this app's existing sidebar component.
   - (e) Port the page components one sub-tool at a time (Research first — it's the most valuable). Client-side data fetching; no SSR needed.
   - (f) Port the Prospect detail / tabs pages (`/sales-growth/prospects/:id/...`) last.
   - (g) Verify the end-to-end flow in the `INTEGRATION.md` verification section.

6. **Match the existing Sales Dashboard's code conventions.** If this repo has `src/features/...` organisation, folder naming, a specific data-fetching pattern (TanStack Query, SWR, plain fetch), or a shared `AppError` pattern — use those. Where `INTEGRATION.md` specifies paths like `src/features/kyc/`, adjust to fit local conventions.

7. **Do NOT include the Next.js-specific primitives.** `next/link` becomes `react-router-dom` `<Link>`, `usePathname` becomes `useLocation()`, async server components become client components with `useEffect`/data-fetching, `app/api/**/route.ts` become Express routes. The `INTEGRATION.md` port table spells each case out.

8. Commit incrementally with clear messages. Run the project's existing tests / lint / typecheck after each sub-tool is wired up.

When you're done, do a manual walkthrough: navigate to Sales / Growth → Research, run research on a test company, verify the GO/NO_GO recommendation renders, then walk through Legal → Negotiation → Handoff.

If anything in `INTEGRATION.md` is ambiguous or seems wrong for this codebase, ask me before deviating.

---

**Tip for the user:** Before pasting the prompt above, if your Sales Dashboard Claude Code session doesn't have access to the `gabespitz/KYC` repo, either:

- grant it access to that repo via your GitHub MCP / repo permissions, or
- paste the contents of `INTEGRATION.md` and any referenced files directly into the chat.
