# FAQ

### Why on-chain enforcement? Why not a middleware-only firewall?

An off-chain firewall can be bypassed the moment the agent has direct access to a signing key. Aegis402 removes key custody from the agent entirely: funds live in a PDA-controlled vault, and the Anchor program is the only thing that can authorize a transfer. Even if the middleware is compromised, the on-chain rules still apply.

### Does the agent ever sign a Solana transaction directly?

No. The agent calls `AegisClient.executeTransaction`, which submits an `execute_transaction` instruction to the Aegis402 program. The program runs the policy checks and signs with the vault PDA on behalf of the agent.

### What token types are supported?

MVP supports SOL. SPL tokens beyond SOL are on the post-hackathon roadmap.

### How is this different from a multi-sig?

A multi-sig requires multiple human approvals per transaction. Aegis402 is rule-based and deterministic: any transaction that fits the declared policy is approved in one step, without a human in the loop. The operator sets policy; the agent operates within it.

### Where is the audit trail?

Every approved and blocked transaction emits an on-chain `#[event]`. The indexer mirrors events to a local database and the dashboard surfaces them. Because events are on-chain, the trail is tamper-evident and independently verifiable.

### Is Aegis402 an x402 facilitator?

No. Aegis402 is the agent-side guardrail. It composes with any x402-compatible facilitator. See [Architecture](Architecture) for the integration point.

### How do I add a new rule?

Use the `new-policy-rule` skill under `.claude/skills/` in the repo. It enforces the full TDD cycle — test first, then program, then SDK, then dashboard, then wiki.
