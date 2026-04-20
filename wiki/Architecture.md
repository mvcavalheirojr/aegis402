# Architecture

The canonical architecture document lives in the repo at [`docs/ARCHITECTURE.md`](https://github.com/). This page mirrors the essentials for wiki readers; do not duplicate long content here.

## In one paragraph

Aegis402 is a single Anchor program that owns PDA-controlled vaults and policy accounts. Every outbound transfer from a vault is gated by `execute_transaction`, which atomically checks every rule on the policy account before signing with the vault's PDA authority. Off-chain layers — the TypeScript SDK, the Next.js dashboard, and the indexer — are conveniences; they cannot move funds and cannot bypass the policy.

## Components

| Layer | Role |
|---|---|
| Anchor program (`programs/aegis402/`) | PDA vault management, on-chain policy enforcement, events. |
| TypeScript SDK (`sdk/`) | `AegisClient` facade that builds instructions for agents and operators. |
| Dashboard (`app/`) | Operator UI for policy config, monitoring, and audit trail. |
| Indexer | Listens to program events and stores them for dashboard queries. |

## PDA derivation

```
vault_pda  = findProgramAddress(["vault", operator, vault_id], program_id)
policy_pda = findProgramAddress(["policy", vault_pda], program_id)
```

## Security invariant

All enforcement is on-chain. Compromising off-chain code must not allow funds to move. See [Policies](Policies) for the rule catalog.
