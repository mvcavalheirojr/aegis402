---
name: new-anchor-instruction
description: Add a new instruction to the Anchor program (`programs/aegis402/src/instructions/`) using the mandatory TDD cycle. Trigger when the user asks to create, add, or extend an Anchor instruction.
---

# Skill: new-anchor-instruction

Adds a new instruction to the Aegis402 program. Follow the steps in order. Do not skip the test-first step.

## Preconditions

- `docs/CONVENTIONS.md §0` hard rules apply.
- `docs/ARCHITECTURE.md §1.1` lists the canonical instruction set. If the new instruction is not aligned with that list, stop and ask whether the architecture doc should be updated first.

## Steps

1. **Write the failing test first.** In `tests/aegis402.ts`, add a describe block for the new instruction with at least one test that calls it and asserts the observable state change (or event) it must produce. Run `anchor test` — the compile error or assertion failure is the red state.
2. **Model state changes.** In `programs/aegis402/src/state.rs`, add / extend the account structs the instruction reads or mutates. Keep `#[derive(InitSpace)]`; bump `version` if the layout changes.
3. **Create the instruction file.** `programs/aegis402/src/instructions/<name>.rs`. Derive `Accounts`, use Anchor constraints (`seeds`, `bump = account.bump`, `has_one`, `signer`, `mut`) over manual checks. Body uses `require!` / `require_keys_eq!` and checked math.
4. **Dispatch.** Register the new function in `programs/aegis402/src/lib.rs`.
5. **Errors.** Add any new variant to `programs/aegis402/src/errors.rs` with a clear message.
6. **Event.** If the instruction produces a verdict or state transition that should be audited, define a matching `#[event]` and `emit!` it at the end of the happy path.
7. **Green.** Run `anchor test` — the previously-red test is now green.
8. **Regenerate IDL.** `anchor build` refreshes `target/types/aegis402.ts`. Never hand-edit that file.
9. **SDK binding.** Add a method to `AegisClient` (`sdk/src/client.ts`) that calls the instruction. Write an SDK test against the local validator in `sdk/__tests__/`.
10. **Coverage check.** Run `cargo llvm-cov --fail-under-lines 100` and `pnpm --filter sdk test --coverage`. Both must stay at 100%.
11. **Commit.** Single commit with test + instruction + SDK binding. Title: `feat(program): add <name> instruction`.

## CI gate

The `anchor` and `coverage-program` jobs in `.github/workflows/ci.yml` must pass before merge.

## Common mistakes

- Writing the instruction before the test.
- Forgetting to `emit!` an event for an auditable path.
- Retyping IDL structs in the SDK instead of importing from `target/types/aegis402.ts`.
