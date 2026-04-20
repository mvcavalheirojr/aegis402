---
name: review-policy-enforcement
description: Run a security audit pass over the on-chain policy enforcement logic. Trigger before submission, after any change to `execute.rs` / `state.rs` / `errors.rs`, or when the user asks to audit / review / verify the Anchor program's security.
---

# Skill: review-policy-enforcement

Audit the on-chain enforcement layer. This skill produces a gap list, not code changes. If gaps are found, the fixes go through the relevant TDD skill (`new-policy-rule`, `new-anchor-instruction`).

## Inputs

Read, in this order:

1. `programs/aegis402/src/state.rs` — account layouts.
2. `programs/aegis402/src/instructions/execute.rs` — the enforcement path.
3. `programs/aegis402/src/instructions/update_policy.rs` — who can change rules.
4. `programs/aegis402/src/errors.rs` — rejection vocabulary.
5. `tests/aegis402.ts` — coverage of rejection and happy paths.
6. `docs/ARCHITECTURE.md §3`, `§6`, `§9` — declared rules and invariants.

## Invariant checklist

For each item, note whether the code enforces it. Do not assume — point to the file:line.

- [ ] Every numeric operation on lamports uses `checked_*` with `.ok_or(MathOverflow)?`.
- [ ] Every PDA is re-derived from seeds on-chain (no trusted client-supplied `Pubkey`).
- [ ] `execute_transaction` runs all policy checks atomically before signing.
- [ ] Every rule has a dedicated error variant; no generic `PolicyViolation` for specific rules.
- [ ] Every verdict path emits an `#[event]` with enough context to identify the triggering rule.
- [ ] `update_policy` requires operator signature and rejects unauthorized keys via Anchor constraints.
- [ ] Period and rate counters reset correctly against `Clock::get()?.unix_timestamp`.
- [ ] No `unwrap()` / `expect()` in instruction bodies.
- [ ] No CPI outside the whitelisted programs.
- [ ] Each rule in `docs/ARCHITECTURE.md §3` has: a state field, an enforcement check, an error variant, a rejection test, a happy test.
- [ ] Each attack scenario in `docs/ARCHITECTURE.md §6` has an end-to-end test that reproduces the block.

## Output

Return a punch list:

```
Gaps found:
- <file>:<line> — <what's missing or weak>
- ...

No gaps: if all checklist items are green, say so and stop.
```

Do not edit code inside this skill. Hand the list back; fixes flow through the TDD skills.
