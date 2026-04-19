# Roadmap — Aegis402

**🇺🇸 English** · [🇧🇷 Português](ROADMAP.pt-BR.md)

**Deadline:** May 11, 2026 · **Window remaining:** ~22 days.

Schedule in **~2-3 day blocks**. Ownership is handled internally by the team.

---

## Phase 0 — Alignment (before kickoff)

- [ ] Team reviews public docs and raises questions
- [ ] Final split of work streams + cadence agreed

## Phase 1 — Bootstrap (2 days · d1-2)

- [ ] `Anchor.toml` + Anchor project scaffold
- [ ] Folder structure per `ARCHITECTURE.md §7`
- [ ] `package.json` with workspace config (programs, sdk, app, tests)
- [ ] `.env.example` (SOLANA_RPC_URL, ANCHOR_WALLET, PROGRAM_ID)
- [ ] Minimal CI (Anchor build + test) via GitHub Actions

## Phase 2 — Smart Contract: Core (3 days · d3-5)

- [ ] `state.rs` — `Vault` and `Policy` account structs
- [ ] `instructions/initialize.rs` — create PDA vault + policy account
- [ ] `instructions/deposit.rs` — transfer SOL/SPL into vault
- [ ] `instructions/withdraw.rs` — operator withdrawal with authority check
- [ ] `errors.rs` — custom error types (PolicyViolation, Unauthorized, etc.)
- [ ] Anchor tests for vault lifecycle (init → deposit → withdraw)

## Phase 3 — Smart Contract: Policy Enforcement (3 days · d6-8)

- [ ] `instructions/execute.rs` — agent-initiated transaction with full policy checks
- [ ] Per-TX spending limit enforcement
- [ ] Period limit tracking (daily/weekly counter account)
- [ ] Destination whitelist check
- [ ] Program whitelist check
- [ ] Rate limit enforcement
- [ ] `instructions/update_policy.rs` — operator updates policy params
- [ ] Anchor tests for each policy rule (pass + violation cases)

## Phase 4 — TypeScript SDK (2 days · d9-10)

- [ ] `sdk/src/pda.ts` — PDA derivation helpers (vault, policy)
- [ ] `sdk/src/client.ts` — `AegisClient` wrapping Anchor program calls
- [ ] `sdk/src/types.ts` — TypeScript types mirroring on-chain structs
- [ ] SDK tests against localnet

## Phase 5 — Web Dashboard: Core (3 days · d11-13)

- [ ] Next.js project scaffold with Tailwind + wallet adapter
- [ ] Vault list page — show all vaults for connected wallet
- [ ] Vault detail page — balance, policy summary, deposit/withdraw actions
- [ ] Policy editor — update spending limits, whitelists, rate limits
- [ ] Wallet connection (Phantom / Solflare)

## Phase 6 — Web Dashboard: Monitoring (2 days · d14-15)

- [ ] Transaction history feed with verdict status (approved/blocked)
- [ ] On-chain event indexer (listen to program events, store in local DB)
- [ ] Audit trail viewer with filtering by vault, verdict, date
- [ ] Real-time updates via WebSocket or polling

## Phase 7 — x402 Integration (2 days · d16-17)

- [ ] x402 payment flow handler in the SDK
- [ ] Mock x402 server (paid API with 1 endpoint)
- [ ] End-to-end test: agent → x402 402 response → Aegis402 vault payment → API response

## Phase 8 — Demo Layer (2 days · d18-19)

- [ ] `demo/honest_agent.ts` — agent making legitimate x402 payments through vault
- [ ] `demo/rogue_agent.ts` — compromised agent attempting the 5 attacks
- [ ] `demo/attack_scenarios.ts` — runs all scenarios, prints verdict table
- [ ] Screenshot-/video-ready output

## Phase 9 — Demo Video + Submission Polish (3 days · d20-22)

- [ ] Deploy program to devnet
- [ ] Deploy dashboard (Vercel or similar)
- [ ] Record 3-minute video following the internal pitch script
- [ ] Polish README (demo screenshots, CI badge, quickstart)
- [ ] Submit on Colosseum Arena with GitHub link + video + pitch
- [ ] Optional: 5-10 slide pitch deck for the accelerator

---

## Risk buffer

Optimistic schedule = 22 days. If 1-2 phases slip, cut: dashboard monitoring can be simplified to a basic TX list; Python SDK is optional and can be deferred post-hackathon.

---

## Submission-ready definition

- [ ] Public GitHub repo with README, LICENSE (MIT), green CI
- [ ] Anchor program deployed on devnet with verified build
- [ ] `demo/attack_scenarios.ts` runs and shows the 5 attacks blocked
- [ ] Honest x402 flow works on devnet (micropayment goes through vault)
- [ ] Dashboard live and connected to devnet
- [ ] Demo video ≤ 3min published (YouTube or Loom)
- [ ] Project registered on Colosseum Arena

---

## NOT in the MVP (post-hackathon roadmap)

- Multi-sig vault authority
- SPL token support beyond SOL
- AI-powered intent validation (Claude layer on top of on-chain rules)
- Mobile-friendly dashboard
- Prometheus metrics/alerts
- Fine-grained RBAC for multi-agent operators
- Cross-program invocation (CPI) support for complex DeFi flows
