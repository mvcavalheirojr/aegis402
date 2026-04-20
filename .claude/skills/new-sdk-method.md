---
name: new-sdk-method
description: Add a new method to the TypeScript SDK `AegisClient` (`sdk/src/client.ts`). Trigger when the user asks to expose a new operation to agents, add an SDK helper, or wrap a new Anchor instruction in TypeScript.
---

# Skill: new-sdk-method

Adds a method to `AegisClient`. Usually follows `new-anchor-instruction` — do that one first if the underlying instruction does not yet exist.

## Preconditions

- The corresponding Anchor instruction exists and is covered by tests.
- `target/types/aegis402.ts` is up to date (run `anchor build` if unsure).

## Steps

1. **Write the SDK test first.** `sdk/__tests__/<method>.test.ts`: spin up a local validator fixture, build the inputs, call the method, assert the resulting on-chain state or thrown error. Run `pnpm --filter sdk test` → red.
2. **Define the public signature.** `sdk/src/client.ts`: method signature uses `bigint` for lamports, domain types (`PublicKey`, generated IDL types) for structs. No raw `Buffer` or `anchor.BN` in the public API.
3. **Implementation.** The method builds the instruction via `this.program.methods.<instruction>(...)`, wires accounts with PDA helpers from `sdk/src/pda.ts`, and returns a typed result (signature + logs, or parsed account data).
4. **Error mapping.** Wrap the call in a try/catch; convert `AnchorError` to `AegisError` with the matching typed code. Add the code to the `AegisError` enum if new.
5. **Green.** `pnpm --filter sdk test` passes.
6. **Coverage.** `pnpm --filter sdk test --coverage` at 100/100/100/100.
7. **Docs.** Update `wiki/SDK-Reference.md` with the new method: signature, example, errors it can throw.
8. **Commit.** `feat(sdk): add AegisClient.<method>`.

## CI gate

Job `sdk` on `.github/workflows/ci.yml` must pass.

## Rules

- Never retype structs from the IDL. Import from `target/types/aegis402.ts`.
- Never accept or return `number` for lamport amounts — always `bigint`.
- Never initialize `Connection` or load keys inside the method. Inject via constructor.
