# Getting Started

This page is a stub until the Anchor program and SDK scaffolds land (Phase 1 of [`docs/ROADMAP.md`](https://github.com/) in the repo). The steps below describe the target experience.

## Prerequisites

- Rust toolchain (see `rust-toolchain.toml` once published).
- Solana CLI `1.18.x`.
- Anchor `0.30.x` installed via `avm`.
- Node.js 20 + pnpm 9.

## 1. Clone and install

```bash
git clone https://github.com/<owner>/aegis402.git
cd aegis402
pnpm install
```

## 2. Build the Anchor program

```bash
anchor build
```

This generates the IDL at `target/idl/aegis402.json` and the TypeScript types at `target/types/aegis402.ts` — the SDK consumes those.

## 3. Run tests (local validator)

```bash
anchor test
```

## 4. Deploy to devnet

```bash
solana config set --url devnet
anchor deploy --provider.cluster devnet
```

## 5. Run the dashboard locally

```bash
pnpm --filter app dev
```

Connect Phantom or Solflare on devnet, fund the operator wallet, and create the first vault.

## 6. First transaction through the vault

See `demo/honest_agent.ts` in the repo for a minimal agent that deposits SOL, configures a policy, and pays a mock x402 endpoint through the vault.
