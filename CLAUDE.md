# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

**Pre-implementation — docs + engineering scaffolding.** There is no production source code for the program, SDK, or dashboard yet. What ships today is:

- `docs/` — architecture, roadmap, and engineering conventions.
- `.github/workflows/` — CI, GitHub Pages deploy, and GitHub Wiki sync.
- `site/` — Astro landing page source (published to GitHub Pages).
- `wiki/` — markdown source synced to the GitHub Wiki.
- `.claude/skills/` — versioned workflows Claude Code must use for recurring tasks.
- `.claude/settings.json` — shared permissions + hooks for the team.

Implementation of the program / SDK / dashboard starts in Phase 1 of `docs/ROADMAP.md`.

## Engineering discipline (read before editing code)

Authoritative guide: [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md). Non-negotiables reproduced here so nothing is missed:

- **Test-first, always.** Failing test → minimum implementation → green → refactor. Test and implementation ship in the same commit.
- **100% coverage on `programs/aegis402/` and `sdk/`.** CI fails if coverage drops.
- **Deny-by-default on-chain.** Critical rules live only inside the Anchor program.
- **Checked math on lamports.** Never raw `+`/`-` on `u64` in instruction code.
- **Events are the audit trail.** Every verdict emits `#[event]`.
- **Conventional Commits.**
- **Green CI is a merge prerequisite.** The `all-green` job on `.github/workflows/ci.yml` is the single required check.
- **Never skip hooks** (`--no-verify`, `SKIP=…`).

### Use the skills

Recurring tasks have dedicated skills under `.claude/skills/`. Calling the matching skill is required — it loads the correct TDD checklist and prevents drift.

- `new-anchor-instruction` — new instruction in `programs/aegis402/src/instructions/`
- `new-policy-rule` — new rule field on `Policy` + enforcement in `execute.rs`
- `new-sdk-method` — new method on `AegisClient`
- `new-dashboard-page` — new route under `app/app/`
- `review-policy-enforcement` — on-chain audit pass

## What this project is

**Aegis402** — on-chain financial governance middleware for AI agents on Solana. A Rust/Anchor program enforces spending policies at the smart-contract level so agents never hold private keys directly; funds live in PDA vaults governed by on-chain rules (per-TX limit, period limit, destination whitelist, program whitelist, rate limit). Targets the **Solana Frontier Hackathon 2026** (deadline **May 11, 2026**).

## Architecture (big picture)

Four layers that must stay consistent — changing one usually requires changes in the others:

1. **Anchor program** (`programs/aegis402/`, planned) — the authority. Every `execute_transaction` runs the full policy check atomically before the program signs with the vault PDA. A failed check means funds never move. PDAs are derived as:
   - `vault_pda  = findProgramAddress(["vault", operator_pubkey, vault_id], program_id)`
   - `policy_pda = findProgramAddress(["policy", vault_pda], program_id)`
2. **TypeScript SDK** (`sdk/`, planned) — wraps Web3.js to build `execute_transaction` instructions with the correct PDA derivation. Agents call the SDK instead of raw Solana transactions. x402 HTTP 402 flow is handled here.
3. **Next.js dashboard** (`app/`, planned) — operator UI for policy config, vault management, and live TX monitoring.
4. **Indexer** — listens to on-chain events emitted by the program; feeds the dashboard audit trail.

**Security invariant:** the middleware and dashboard are convenience layers. All enforcement is on-chain — compromising off-chain code must not move funds. Anything that weakens this invariant (e.g., off-chain signing, authority keys outside PDAs) is a design regression.

Planned folder layout is defined in `docs/ARCHITECTURE.md §7`. Follow it when scaffolding; don't improvise a different structure.

## Documentation rules

Two audiences, two language policies:

- **Developer docs (EN only).** `docs/CONVENTIONS.md`, `.claude/skills/*.md`, `wiki/*.md`, workflow comments. Written for devs + AI agents actively contributing.
- **Public-facing docs (EN + pt-BR siblings).** `README.md ↔ README.pt-BR.md`, `docs/ARCHITECTURE.md ↔ docs/ARCHITECTURE.pt-BR.md`, `docs/ROADMAP.md ↔ docs/ROADMAP.pt-BR.md`. When editing one, update the other in the same change. Mermaid diagrams and tables must match across languages.

## Publishing

- **Landing page:** `site/` (Astro static) published to GitHub Pages on every push to `main` that touches `site/**` or `README.md`. Workflow: `.github/workflows/pages.yml`.
- **Wiki:** `wiki/*.md` synced to the repo's GitHub Wiki on every push to `main` that touches `wiki/**`. Workflow: `.github/workflows/wiki.yml`. Edits made directly on the GitHub Wiki UI will be overwritten.

## Roadmap is the source of truth for scope

`docs/ROADMAP.md` defines the 22-day plan in ~2-3 day phases (Bootstrap → Core contract → Policy enforcement → SDK → Dashboard → Monitoring → x402 → Demo → Submission). Before adding anything, check whether it's in the MVP or in the explicit "NOT in the MVP" list at the bottom (e.g., multi-sig, SPL tokens beyond SOL, Prometheus, CPI). Don't pull post-hackathon items into the MVP without discussion.

## Ignored / private paths

`.gitignore` excludes `.claude/`, `.private/`, `.env*` (except `.env.example`), keypairs (`*.keypair.json`, `id_rsa*`, `*.key`, `*.pem`), and Anchor/Solana local artifacts (`target/`, `.anchor/`, `test-ledger/`).

**Exception:** `.claude/skills/`, `.claude/agents/`, and `.claude/settings.json` are explicitly unignored because they are team-shared. `.claude/settings.local.json` stays ignored — each developer keeps their own.

Never commit anything under the ignored paths.
