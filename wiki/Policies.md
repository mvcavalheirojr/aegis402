# Policies

On-chain rules enforced in `programs/aegis402/src/instructions/execute.rs`. Every rule is:

1. A field on the `Policy` account.
2. A check inside `execute_transaction`.
3. A dedicated `#[error_code]` variant.
4. Covered by one rejection test and one happy-path test.
5. Editable via `update_policy` (operator only).

## Rule catalog (MVP)

| Rule | Field on `Policy` | Error variant | Enforcement summary |
|---|---|---|---|
| Per-TX limit | `max_per_tx: u64` | `PerTxLimitExceeded` | `amount <= max_per_tx` |
| Period limit | `period_cap: u64`, `period_seconds: u32` | `PeriodLimitExceeded` | Rolling counter against `Clock::get()?.unix_timestamp` |
| Destination whitelist | `allowed_destinations: Vec<Pubkey>` | `DestinationNotWhitelisted` | Recipient must be in the list |
| Program whitelist | `allowed_programs: Vec<Pubkey>` | `ProgramNotWhitelisted` | Called program ID must be in the list |
| Rate limit | `max_tx_per_period: u16` | `RateLimitExceeded` | Counter reset per window |

## Verdict events

Every approved and blocked path emits an event with:

- `vault: Pubkey`
- `policy_version: u8`
- `rule: PolicyRule` (enum)
- `amount: u64`
- `destination: Pubkey`
- `program: Pubkey`
- `verdict: Verdict` (`Approved` | `Blocked`)

The indexer reads these events and surfaces them in the dashboard audit trail.

## Adding a new rule

Use the [`new-policy-rule`](https://github.com/) skill under `.claude/skills/`. It enforces the TDD cycle end-to-end.
