# Architecture — Aegis402

**🇺🇸 English** · [🇧🇷 Português](ARCHITECTURE.pt-BR.md)

Technical reference document. No code in this phase — only components, flows, and the planned structure.

---

## 1. Components

### 1.1 RPC Proxy
- FastAPI server exposing the same JSON-RPC methods as a Solana RPC.
- Specifically intercepts: `sendTransaction`, `sendRawTransaction`, `simulateTransaction`.
- All other methods are transparently forwarded to the upstream RPC (devnet/mainnet).
- **x402 integration point:** in the canonical x402 flow, the facilitator/client calls `sendTransaction` to settle payment. Pointing the RPC URL at Aegis402 makes every TX go through a verdict before reaching Solana.

### 1.2 Python SDK (`aegis402`)
- Wrapper on top of `solders`/`solana-py`.
- Primary method: `client.send_with_intent(transaction, intent_declaration, context)`.
- Useful for agents that emit a structured intent (natural language + parameters) alongside the TX.

### 1.3 Forensic Engine

Orchestrator chains: **Rules → Simulator → Intent Validator → Audit**. Fail-fast: if an earlier layer rejects, later ones don't run.

#### 1.3.1 Rules (deterministic)
- Address blocklist (known sinks, mixers, zero-reputation fresh accounts)
- Allowlist of called programs (System, SPL Token, official x402 facilitator, etc.)
- Value caps (absolute + % of agent wallet balance)
- Dedup by message hash within an N-second window
- Rate limit / burst detection (dust-drain)
- Policy pluggable via YAML (`policies/default.yaml`)

#### 1.3.2 Simulator
- Calls `simulateTransaction` on the upstream RPC.
- Parses the result: SOL balance deltas, SPL balance deltas, execution errors.
- Compares the simulated diff against the policy thresholds.

#### 1.3.3 Intent Validator (Claude)
- Input: `(intent_declaration, decoded_transaction, agent_context)`.
- Output: `{verdict: allow|block|warn, confidence: 0..1, reasoning: str}`.
- Prompt caching (Anthropic) on the static parts of the prompt (schema, rules, examples) → effective per-TX cost drops dramatically.
- Short timeout + deterministic fallback if Claude is unavailable.

#### 1.3.4 Audit Chain
- Append-only SQLite.
- Each record: `{hash, prev_hash, timestamp, agent_id, intent, tx_bytes, verdict, reasoning, layer_blocked}`.
- Merkle-style chained hash (each record embeds `prev_hash`).
- CLI `aegis audit verify` recomputes the chain and fails if any record was tampered with.

### 1.4 Demo Layer
- Mock **x402 server** (paid API charging a micropayment per call).
- **Client agent** (typical agent stack with `anthropic` + `solders`).
- **Rogue agent** — "compromised" agent attempting 5 canonical attacks.

---

## 2. End-to-end flow (legit TX)

```
AI Agent                 Aegis402 Proxy              Solana RPC
    │                           │                         │
    │ sendTransaction(tx)       │                         │
    ├──────────────────────────▶│                         │
    │                           │ Rules.check(tx)         │
    │                           │  OK                     │
    │                           │                         │
    │                           │ simulateTransaction ───▶│
    │                           │◀── simulation result ───│
    │                           │                         │
    │                           │ IntentValidator.check() │
    │                           │  (Claude: intent==tx ✓) │
    │                           │                         │
    │                           │ Audit.append(verdict)   │
    │                           │                         │
    │                           │ sendTransaction ───────▶│
    │                           │◀─────── tx signature ───│
    │◀── signature ─────────────│                         │
```

## 3. End-to-end flow (malicious TX — intent drift)

```
Rogue Agent             Aegis402 Proxy               Solana RPC
    │                         │                            │
    │ intent="pay 0.01 SOL    │                            │
    │        for API X"       │                            │
    │ tx=transfer 5 SOL → 0xATTACKER                       │
    ├────────────────────────▶│                            │
    │                         │ Rules: amount > cap ⚠     │
    │                         │ Simulator: balance drain⚠ │
    │                         │ Intent: mismatch ✗         │
    │                         │                            │
    │                         │ Audit.append(BLOCKED)      │
    │                         │                            │
    │◀── HTTP 403 + verdict   │                            │
```

---

## 4. Attack scenarios demonstrated in the MVP

| # | Name | Vector | Blocking layer |
|---|---|---|---|
| 1 | **Wallet Drain** | Agent hallucinates an address and transfers full balance | Rules (amount threshold) + Intent (mismatch) |
| 2 | **Scam Program Call** | TX invokes a program outside the allowlist | Rules (allowlist) |
| 3 | **Intent Drift** | Declared intent ≠ decoded action | Intent Validator (Claude) |
| 4 | **Replay / Duplicate** | Same TX submitted within a short window | Rules (dedup by hash) |
| 5 | **Dust-Drain** | N micro-TXs aiming to exhaust fees | Rules (rate limit / burst) |

Each scenario appends a record to the audit log with a chained `prev_hash`, demonstrating forensic auditability.

---

## 5. Planned folder structure

```
aegis402/
├── README.md
├── README.pt-BR.md
├── pyproject.toml
├── .env.example
├── CLAUDE.md                    ← context for future sessions
├── docs/
│   ├── ARCHITECTURE.md         ARCHITECTURE.pt-BR.md
│   └── ROADMAP.md              ROADMAP.pt-BR.md
├── src/aegis402/
│   ├── __init__.py
│   ├── config.py
│   ├── schemas.py               ← IntentDeclaration, Verdict, TxAnalysis
│   ├── proxy/
│   │   ├── app.py               ← FastAPI, /rpc and /analyze routes
│   │   └── handlers.py          ← per-method JSON-RPC logic
│   ├── sdk/
│   │   └── client.py            ← AegisClient.send_with_intent()
│   ├── engine/
│   │   ├── orchestrator.py      ← Rules → Simulator → Intent → Audit
│   │   ├── rules.py
│   │   ├── simulator.py
│   │   ├── intent.py            ← Claude + prompt caching
│   │   ├── decoder.py           ← decode SystemProgram, SPL Token, x402
│   │   └── audit.py             ← hash chain
│   └── policies/
│       └── default.yaml
├── demo/
│   ├── x402_server.py           ← mock paid API
│   ├── honest_agent.py
│   ├── rogue_agent.py
│   └── attack_scenarios.py      ← pitch centerpiece
└── tests/
    ├── test_rules.py
    ├── test_decoder.py
    ├── test_intent.py           ← Anthropic mocked
    ├── test_audit_chain.py
    ├── test_proxy.py
    └── test_e2e_devnet.py
```

---

## 6. x402 integration — exact interception point

Canonical x402 flow:
1. Client calls a paid endpoint → receives HTTP 402 with payment requirements.
2. Client builds a Solana TX (usually USDC or SOL) with x402 metadata.
3. Client signs and submits TX via `sendTransaction`.
4. Server verifies on-chain and releases the response.

**Aegis402 hooks into step 3:** the agent points its RPC at the Aegis402 proxy instead of a direct RPC. Zero code change on the agent/x402 client side — just swap the `SOLANA_RPC_URL` env var.

---

## 7. Non-functional considerations

- **Latency:** Rules run in < 5ms. Simulator depends on the RPC (~100ms). Intent validator with Claude + caching: ~400-800ms. Overhead is acceptable for x402 (which already waits for on-chain confirmation).
- **Cost:** Prompt caching cuts input tokens by ~90% after the first call. Estimated production cost per validated TX: ~US$ 0.001–0.005.
- **Fail-safe:** if the engine crashes, policy-configurable: `fail_open` (let through, log) or `fail_closed` (block all). Default = `fail_closed`.
- **Privacy:** declared intents may carry sensitive data — optional redaction before sending to Claude.
