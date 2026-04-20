# Engineering Conventions — Aegis402

Single source of truth for how code, tests, CI, and docs are produced in this repo. Written in English only — this document is for developers (human and AI) actively contributing code. For non-developer audiences see `README.pt-BR.md`.

If you are an AI agent working on this repo, read this file end-to-end before editing code.

---

## 0. Hard rules (non-negotiable)

These rules are enforced by CI. A PR that violates any of them does not merge.

1. **Test-first, always.** Order is `failing test → minimum implementation → green → refactor`. The failing test and the implementation ship in the same commit.
2. **100% coverage in `programs/aegis402/` and `sdk/`.** CI fails if coverage drops below 100% lines (`cargo llvm-cov --fail-under-lines 100`, `vitest --coverage` with thresholds 100/100/100/100). Dashboard coverage is not gated but policy-form logic must have component tests.
3. **Deny-by-default on-chain.** Critical rules live only inside the Anchor program. Off-chain middleware and dashboard are convenience layers. If enforcement can be bypassed by compromising off-chain code, the design is wrong.
4. **Checked math on lamports.** Use `checked_add` / `checked_sub` / `checked_mul` + `.ok_or(ErrorCode::MathOverflow)?`. Never raw `+` / `-` on `u64` in instruction code.
5. **Events are the audit trail.** Every verdict — approved or blocked — emits an Anchor `#[event]`. The indexer only reads events; it never re-derives verdicts.
6. **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`). Scope in parens when useful: `feat(program): enforce max_daily_volume`.
7. **Green CI is a merge prerequisite.** The `all-green` job on `ci.yml` is the single required check on `main`.
8. **Never skip hooks.** No `--no-verify`, no `--no-gpg-sign`, no `SKIP=…`. If a hook blocks you, fix the underlying problem.

---

## 1. Working with AI agents

The primary consumers of this file are Claude Code and similar agents. Rules below keep agents disciplined and save context.

- **Use the repo skills.** Recurring tasks have a skill under `.claude/skills/`. Calling the matching skill is required — it loads the correct TDD checklist.
  - `new-anchor-instruction` — new instruction in `programs/aegis402/src/instructions/`
  - `new-policy-rule` — new rule field on `Policy` + enforcement in `execute.rs`
  - `new-sdk-method` — new method on `AegisClient`
  - `new-dashboard-page` — new route under `app/app/`
  - `review-policy-enforcement` — on-chain audit pass
- **IDL is the source of truth.** After `anchor build`, the SDK imports types from `target/types/aegis402.ts`. Never retype structs by hand — it wastes context and introduces drift.
- **One file per concept.** One Anchor instruction per file under `instructions/`. Non-trivial SDK methods get their own file. Small files make `Grep` / `Glob` precise.
- **Searchable naming.** Prefix domain types: `PolicyRule`, `PolicyViolation`, `VaultAuthority`, `AegisError`. A `grep PolicyRule` should return zero false positives.
- **Delegate exploration.** Broad codebase questions go through `Explore` subagents in parallel, not 10 sequential `Grep` calls.
- **Record decisions in docs/memory**, not in chat. New conventions discovered mid-implementation land here or in `CLAUDE.md`.
- **Plan mode for multi-layer changes.** Anything touching two or more of {program, SDK, dashboard, indexer} starts in plan mode.
- **Never pull from `NOT in the MVP`.** `docs/ROADMAP.md` has an explicit out-of-scope list. Honor it.

---

## 2. TDD workflow

### Canonical cycle (any layer)

1. Write a test that encodes the intended behavior → **red**.
2. Run the full suite; confirm the new test is the only failure.
3. Implement the minimum change to pass → **green**.
4. Run the full suite; everything green.
5. Refactor with tests as a safety net.
6. Single commit with test + implementation + docs together.

### Worked example — adding a `max_daily_volume` policy rule

1. `tests/aegis402.ts`: write `it("rejects TX when daily volume would exceed cap", …)`.
2. `anchor test` → compile error because the field does not exist. That counts as red.
3. Add `max_daily_volume: u64` to `Policy` in `state.rs`. Add `require!(daily_spent.checked_add(amount).ok_or(MathOverflow)? <= policy.max_daily_volume, PolicyViolation)` in `instructions/execute.rs`. Add `MaxDailyVolumeExceeded` variant to `errors.rs`.
4. `anchor test` → green.
5. Add the happy-path test: `it("allows TX when daily volume is below cap", …)`.
6. Regenerate IDL (automatic via `anchor build`). SDK types in `sdk/src/types.ts` pick up the new field. Add SDK round-trip test for `policy.maxDailyVolume`.
7. Update `wiki/Policies.md` with the new rule.
8. Commit: `feat(program): enforce max_daily_volume policy rule`.

### Coverage tooling

- **Rust:** `cargo llvm-cov --all-features --workspace --fail-under-lines 100`.
- **TypeScript:** `vitest --coverage` with `coverage.thresholds = { lines: 100, functions: 100, branches: 100, statements: 100 }` for the `sdk` workspace.
- **Dashboard:** component tests for policy form logic. No global threshold.

---

## 3. Anchor program patterns (`programs/aegis402/`)

- **One instruction per file** under `instructions/`. `lib.rs` only dispatches.
- **Canonical bump.** Store `bump: u8` on every PDA account. Subsequent instructions use `seeds = […], bump = account.bump` — no repeated `find_program_address`.
- **Prefer Anchor constraints over manual checks.** `has_one`, `seeds`, `bump`, `constraint = …`, `signer`, `mut`.
- **Centralized `#[error_code]`** in `errors.rs`. Variants include `PolicyViolation`, `Unauthorized`, `MathOverflow`, `RateLimitExceeded`, `DestinationNotWhitelisted`, `ProgramNotWhitelisted`, `PeriodLimitExceeded`, `PerTxLimitExceeded`.
- Use `require!` / `require_keys_eq!` over `if … return Err(…)`.
- **Explicit sizing.** `#[derive(InitSpace)]` on state structs; `space = 8 + Struct::INIT_SPACE` on init. Never hand-count bytes.
- **State versioning.** `version: u8` on `Vault` and `Policy` for forward migration.
- **Time source.** `Clock::get()?.unix_timestamp` for period and rate-limit windows. Tests manipulate the local validator clock.
- **`emit!` on every verdict** — both success and rejection. Events are the indexer's contract.
- **Authority via account struct**, not inline logic. Operator vs agent distinguished by constraint on the `Accounts` derive.

Forbidden:

- `unwrap()` / `expect()` in instruction bodies.
- Reading client input without re-deriving PDAs on-chain.
- Zero-copy accounts (premature for MVP).
- CPI outside the whitelisted programs.

---

## 4. TypeScript SDK (`sdk/`)

- **Facade pattern.** `AegisClient` exposes domain methods (`createVault`, `deposit`, `executeTransaction`, `updatePolicy`, `withdraw`). `Program<Idl>` stays private.
- **Types from IDL.** Import from generated `target/types/aegis402.ts`. Zero retyping.
- **`pda.ts`** holds pure functions per seed: `vaultPda(operator, vaultId)`, `policyPda(vault)`.
- **Typed errors.** `AegisError` class maps `AnchorError.error.errorCode.code` to a TS enum. Callers use `instanceof`.
- **`bigint` for lamports.** `solToLamports` / `lamportsToSol` convert only at the boundary.
- **No side effects at import.** `Connection` and wallet injected in the constructor.
- **`tsconfig.json`:** `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.

---

## 5. Next.js dashboard (`app/`)

- **App Router.** Server Components by default; Client Components only where wallet / state requires it.
- **`@solana/wallet-adapter-react`** + official UI kit. Phantom + Solflare for MVP.
- **TanStack Query** for on-chain reads. No `useEffect` + `fetch` for data.
- **shadcn/ui + Tailwind** for UI primitives.
- **`react-hook-form` + `zod`** for policy forms. The zod schema doubles as policy-shape documentation.
- **Local UI state:** `useState` / Context. No Zustand / Redux for MVP.
- **Formatting:** single `formatSol(lamports: bigint)` in `lib/format.ts`. No inline formatting.
- **Tests:** Vitest + Testing Library for form logic. Optional Playwright smoke for operator flow.

---

## 6. Indexer

MVP is a Node worker using `program.addEventListener()` + SQLite file. No Helius / Shyft — avoids an external dependency judges cannot reproduce locally. Revisit post-hackathon.

---

## 7. Monorepo, tooling, dependencies

- **pnpm workspaces.** `pnpm-workspace.yaml` at root.
- **Rust:** `cargo fmt`, `cargo clippy -- -D warnings`.
- **TS:** ESLint + Prettier with `@typescript-eslint/recommended` and `next/core-web-vitals`.
- **Git hooks:** `lefthook` runs `pnpm -r lint` and the relevant test subset pre-commit; full suite + coverage pre-push.
- **`.env.example`** at root: `SOLANA_RPC_URL`, `ANCHOR_WALLET`, `PROGRAM_ID`.

### New dependencies (canonical list)

TypeScript: `astro`, `vitest`, `@vitest/coverage-v8`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`, `@tanstack/react-query`, `react-hook-form`, `zod`, `shadcn/ui` peer deps, `lefthook`.

Rust tooling: `cargo-llvm-cov`.

GitHub Actions: `actions/checkout`, `actions/setup-node`, `pnpm/action-setup`, `actions/cache`, `dtolnay/rust-toolchain`, an Anchor setup action (e.g. `metadaoproject/anchor-action`), `actions/upload-pages-artifact`, `actions/deploy-pages`, a maintained wiki-sync action (e.g. `Andrew-Chen-Wang/github-wiki-action`).

---

## 8. CI/CD, Pages, Wiki

Three workflows under `.github/workflows/`.

### `ci.yml`

Triggers: `pull_request`, `push` on `main`. Jobs:

- `lint` — `cargo fmt --check`, `cargo clippy -- -D warnings`, `pnpm -r lint`.
- `anchor` — `anchor build` + `anchor test`. Uploads IDL as artifact.
- `sdk` — `pnpm --filter sdk test --coverage` with 100% thresholds.
- `dashboard` — `pnpm --filter app test` + `pnpm --filter app build`.
- `coverage-program` — `cargo llvm-cov --fail-under-lines 100`.
- `all-green` — depends on all above. Branch protection requires this single check.

### `pages.yml`

Triggers: `push` on `main` touching `site/**` or `README.md`. Builds Astro in `site/` and deploys via `actions/deploy-pages`. Requires `pages: write` and `id-token: write` permissions.

### `wiki.yml`

Triggers: `push` on `main` touching `wiki/**`. Copies `wiki/` into the repo's `.wiki.git` using a maintained wiki-sync action.

**Operational rule.** When a CI job fails, fix the root cause — never disable the check, never comment out the failing test.

---

## 9. Where things live

| Concern | Location |
|---|---|
| Architecture reference | `docs/ARCHITECTURE.md` |
| Roadmap + MVP scope | `docs/ROADMAP.md` |
| This file (engineering conventions) | `docs/CONVENTIONS.md` |
| AI skills | `.claude/skills/*.md` |
| Shared Claude Code settings | `.claude/settings.json` |
| CI / Pages / Wiki automation | `.github/workflows/*.yml` |
| Landing page source | `site/` (Astro) |
| Wiki source | `wiki/` (synced to GitHub wiki) |
| Anchor program | `programs/aegis402/` |
| TypeScript SDK | `sdk/` |
| Dashboard | `app/` |
| Tests | `tests/` (Anchor) + per-package `__tests__/` (TS) |

---

## 10. Checklist before opening a PR

- [ ] Failing test written first, now green.
- [ ] Coverage unchanged or higher; no drop below 100% in gated packages.
- [ ] `cargo fmt`, `cargo clippy`, `pnpm -r lint` clean locally.
- [ ] `anchor test` green locally.
- [ ] Events emitted for any new verdict path.
- [ ] Docs touched when behavior changed (`wiki/`, `docs/`, IDL-driven SDK types regenerated).
- [ ] Conventional Commit title.
- [ ] No item pulled from `docs/ROADMAP.md` "NOT in the MVP" list.
