# Roadmap — Aegis402

**🇺🇸 English** · [🇧🇷 Português](ROADMAP.pt-BR.md)

**Deadline:** May 11, 2026 · **Window remaining:** ~26 days.

Schedule in **~2-3 day blocks**. Ownership is handled internally by the team.

---

## Phase 0 — Alignment (before kickoff)

- [ ] Team reviews the 5 public docs and raises questions
- [ ] Final split of work streams + cadence agreed

## Phase 1 — Bootstrap (2 days · d1-2)

- [ ] `pyproject.toml` with pinned deps (solders, solana-py, anthropic, fastapi, pydantic, sqlalchemy, httpx, pytest)
- [ ] Folder structure per `ARCHITECTURE.md §5`
- [ ] `.env.example` (SOLANA_RPC_URL, ANTHROPIC_API_KEY, AEGIS_POLICY_PATH)
- [ ] `CLAUDE.md` with project context for future sessions
- [ ] Minimal CI (`pytest` + lint) via GitHub Actions

## Phase 2 — Decoder + Schemas (2 days · d3-4)

- [ ] `schemas.py` — `IntentDeclaration`, `Verdict`, `TxAnalysis`, `DecodedInstruction`
- [ ] `engine/decoder.py` — decodes System (transfer), SPL Token (transfer, approve), x402 facilitator
- [ ] Unit tests covering each instruction type

## Phase 3 — Rules Engine (3 days · d5-7)

- [ ] YAML policy structure + parser
- [ ] Rules: blocklist, program allowlist, amount threshold (absolute + %), dedup, rate limit / burst
- [ ] Pluggable extensibility (rule registry)
- [ ] Unit tests (>90% coverage on this module)

## Phase 4 — Audit Chain (2 days · d8-9)

- [ ] SQLAlchemy model + `audit_log` table schema
- [ ] `append(record)` function computing `prev_hash` and chaining
- [ ] CLI `aegis audit verify` recomputing the chain
- [ ] Tests: inserts, verification, tamper detection

## Phase 5 — Intent Validator (Claude) (3 days · d10-12)

- [ ] Prompt template (system + few-shot) with examples of the 5 attacks
- [ ] Anthropic SDK integration with **prompt caching** on static parts
- [ ] Structured output parser (`verdict | confidence | reasoning`)
- [ ] Timeout + fallback (default `fail_closed`)
- [ ] Tests with Anthropic mocked + 1 opt-in test hitting the real API

## Phase 6 — Simulator (2 days · d13-14)

- [ ] `simulateTransaction` wrapper via `httpx`
- [ ] Parsing of `accounts` / `logs` / `unitsConsumed` / errors
- [ ] SOL + SPL balance diff (compare `accounts` before vs after)
- [ ] Tests with fixtures of real devnet responses

## Phase 7 — Orchestrator (2 days · d15-16)

- [ ] `engine/orchestrator.py` chaining Rules → Simulator → Intent → Audit
- [ ] Fail-fast + short-circuit when a layer blocks
- [ ] `fail_open` / `fail_closed` policy
- [ ] End-to-end tests with the full engine (no HTTP proxy yet)

## Phase 8 — RPC Proxy (FastAPI) (3 days · d17-19)

- [ ] `proxy/app.py` — FastAPI server
- [ ] JSON-RPC handler: intercepts `sendTransaction`, `sendRawTransaction`, `simulateTransaction`
- [ ] Passthrough for other methods
- [ ] Dockerfile + docker-compose for local runs
- [ ] Smoke test: `curl` sending a malicious TX → 403 with JSON verdict

## Phase 9 — Python SDK (1 day · d20)

- [ ] `sdk/client.py` — `AegisClient.send_with_intent(tx, intent)`
- [ ] Notebook example (`examples/honest_agent.ipynb`)

## Phase 10 — x402 harness + demo layer (2 days · d21-22)

- [ ] `demo/x402_server.py` — mock paid API with 1 endpoint
- [ ] `demo/honest_agent.py` — client agent paying via x402 + Aegis402
- [ ] `demo/rogue_agent.py` — compromised agent attempting the 5 attacks

## Phase 11 — Attack scenarios script (1 day · d23)

- [ ] `demo/attack_scenarios.py` — runs the 5 attacks, prints a table with verdicts + audit log hash references
- [ ] Screenshot-/video-ready output

## Phase 12 — Demo video + submission polish (3 days · d24-26)

- [ ] Deploy the proxy to devnet (fly.io or Render)
- [ ] Record 3-minute video following the internal pitch script
- [ ] Polish README (demo screenshots, CI badge, quickstart)
- [ ] Submit on Colosseum Arena with GitHub link + video + pitch
- [ ] Optional: 5-10 slide pitch deck for the accelerator

---

## Risk buffer

Optimistic schedule = 26 days. Real buffer: each stage has 20% less than available. If 1-2 phases slip, cut: web dashboard (never in the MVP); Phase 9 SDK can collapse into a proxy-direct usage example.

---

## Submission-ready definition

- [ ] Public GitHub repo with README, LICENSE (MIT), green CI
- [ ] `uv run python demo/attack_scenarios.py` runs and shows the 5 attacks blocked
- [ ] Honest flow works on real devnet (US$ 0.01 x402 payment goes through)
- [ ] `aegis audit verify` confirms chain integrity
- [ ] Demo video ≤ 3min published (YouTube or Loom)
- [ ] Project registered on Colosseum Arena

---

## NOT in the MVP (post-hackathon roadmap)

- Web audit dashboard
- Multiple LLMs (today: Claude only)
- Policy editor GUI
- Prometheus metrics/alerts
- Native integrations with Phantom / Privy / MagicBlock
- Fine-tuning a proprietary model with audit log data
