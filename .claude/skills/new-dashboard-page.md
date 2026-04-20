---
name: new-dashboard-page
description: Add a new route under `app/app/` in the Next.js dashboard. Trigger when the user asks for a new dashboard page, view, or UI route.
---

# Skill: new-dashboard-page

Adds a Next.js App Router route to the operator dashboard.

## Preconditions

- The data the page reads is already exposed by the SDK (or by an indexer query that exists). If not, stop and add the SDK method first via `new-sdk-method`.
- Route is in scope per `docs/ROADMAP.md`. Do not add pages that belong to the "NOT in the MVP" list.

## Steps

1. **Write the component test first.** `app/src/app/<route>/__tests__/page.test.tsx`: render the client components in isolation with mocked SDK data, assert on user-visible output. Run `pnpm --filter app test` → red.
2. **Server component.** `app/src/app/<route>/page.tsx`: static / server-only parts (heading, layout, server-side prefetch). Marked as Server Component by default.
3. **Client component.** `app/src/app/<route>/<Feature>.client.tsx` with `"use client"`: wallet interactions, form state, TanStack Query hooks for on-chain reads.
4. **Data fetching.** Use TanStack Query. Query keys must be stable and prefixed (`["vault", vaultPda.toBase58()]`). No `useEffect` + `fetch`.
5. **Forms (if any).** `react-hook-form` + `zod` schema. Submission calls the relevant `AegisClient` method.
6. **Formatting.** Use `formatSol` from `app/src/lib/format.ts`. Never format lamports inline.
7. **Green.** `pnpm --filter app test` + `pnpm --filter app build` (Next build catches TS errors too).
8. **Docs.** If the page surfaces a new concept, link it from `wiki/Home.md` and add a section to the relevant wiki page.
9. **Commit.** `feat(app): add <route> page`.

## CI gate

Job `dashboard` on `.github/workflows/ci.yml` must pass.

## Rules

- Dashboard is a convenience layer. Never implement policy logic in the app — always call the program via the SDK.
- Do not duplicate SDK types into the app. Import from `@aegis/sdk`.
- Keep server/client boundary explicit via filename convention (`.client.tsx`).
