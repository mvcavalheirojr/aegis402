# SDK Reference

`@aegis/sdk` wraps the Anchor program for TypeScript agents and operators. This page is filled in during Phase 4 of the roadmap; the signatures below describe the target API.

## `AegisClient`

```ts
import { AegisClient } from "@aegis/sdk";

const client = new AegisClient({ connection, wallet, programId });
```

### Methods

| Method | Description |
|---|---|
| `createVault(operator, vaultId)` | Initializes a vault PDA + policy account. Operator-only. |
| `deposit(vault, amountLamports)` | Transfers SOL into the vault. |
| `withdraw(vault, amountLamports, destination)` | Operator-only withdrawal. |
| `updatePolicy(vault, partialPolicy)` | Operator-only policy update. |
| `executeTransaction(vault, instruction)` | Agent-initiated transfer; program validates against policy. |

### Types

All types are generated from the IDL at `target/types/aegis402.ts`. Do not retype them.

### Errors

`AegisError` is a typed error class. Catch it by `instanceof`:

```ts
try {
  await client.executeTransaction(vault, ix);
} catch (e) {
  if (e instanceof AegisError) {
    if (e.code === "PerTxLimitExceeded") { /* handle */ }
  }
}
```

### PDA helpers

```ts
import { vaultPda, policyPda } from "@aegis/sdk/pda";

const [vault] = vaultPda(operator, vaultId);
const [policy] = policyPda(vault);
```

### Units

All lamport amounts are `bigint`. Convert only at the boundary:

```ts
import { solToLamports, lamportsToSol } from "@aegis/sdk/units";
```
