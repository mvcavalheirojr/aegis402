---
name: new-policy-rule
description: Add a new on-chain policy rule (per-TX limit, period limit, destination whitelist, program whitelist, rate limit, or similar). Trigger when the user asks to add a rule, new policy field, or new enforcement check to the Aegis402 program.
---

# Skill: new-policy-rule

Adds a new policy rule to the Aegis402 program. Policy rules are the core security feature — treat changes here as high-risk and TDD-mandatory.

## Preconditions

- `docs/CONVENTIONS.md §0` hard rules apply.
- Rule must be in scope per `docs/ARCHITECTURE.md §3`. If not listed there, add it to that table in the same PR.
- Rule must be enforceable deterministically on-chain. If it requires off-chain data, stop and ask.

## Steps

1. **Write the rejection test first.** `tests/aegis402.ts`: `it("rejects TX when <rule> violated", …)`. Run `anchor test` → red.
2. **Write the happy-path test.** Same describe block: `it("allows TX when <rule> satisfied", …)`. Still red.
3. **Extend `Policy` state.** Add the field to `programs/aegis402/src/state.rs`. Bump `version` if the layout changes. Keep `#[derive(InitSpace)]`.
4. **Enforce the rule.** `programs/aegis402/src/instructions/execute.rs`: add the check inside the policy-enforcement block. Order the checks so that cheap checks run first (short-circuit).
   - Use checked math on any numeric rule.
   - Use `require!(…, ErrorCode::<Specific>Violated)` with a dedicated error variant.
5. **Add the error variant.** `programs/aegis402/src/errors.rs`: one variant per rule, e.g. `MaxDailyVolumeExceeded`, with a human-readable message.
6. **Emit a verdict event.** The existing verdict event must carry the field that triggered the block, so the indexer and dashboard can surface *which* rule rejected the TX.
7. **`update_policy` support.** `programs/aegis402/src/instructions/update_policy.rs`: allow the operator to set the new field. Add a test covering the update path.
8. **Green.** `anchor test` — all three tests pass.
9. **Regenerate IDL.** `anchor build`.
10. **SDK.** `sdk/src/types.ts` picks up the new field via IDL import. Add it to `AegisClient.updatePolicy(...)` inputs. Add an SDK round-trip test.
11. **Dashboard form.** `app/src/app/policies/…`: extend the `zod` schema, add the form field, surface rejection reason via the event-driven TX feed.
12. **Wiki.** Update `wiki/Policies.md` with the new rule: description, enforcement, example.
13. **Coverage.** `cargo llvm-cov --fail-under-lines 100` + `pnpm --filter sdk test --coverage`.
14. **Commit.** `feat(program): enforce <rule> policy rule`.

## CI gate

Jobs `anchor`, `coverage-program`, and `sdk` on `.github/workflows/ci.yml` must pass.

## Risk notes

- A bug here means funds move when they should not. Prefer adding redundant checks over clever code.
- Never read rule config from anywhere outside the `Policy` account on-chain.
- A new rule that affects existing vaults requires a migration story — call it out in the PR description.
