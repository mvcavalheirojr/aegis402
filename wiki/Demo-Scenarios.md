# Demo Scenarios

Five attack vectors the MVP blocks. Each scenario ships as a script in `demo/` and is exercised by `demo/attack_scenarios.ts` during the submission video.

| # | Name | Attack vector | Blocking rule(s) |
|---|---|---|---|
| 1 | Wallet Drain | Agent hallucinates and transfers full balance | `max_per_tx` + `period_cap` |
| 2 | Unauthorized Protocol | TX calls a program outside the whitelist | `allowed_programs` |
| 3 | Intent Drift | Declared intent doesn't match the real destination | `allowed_destinations` |
| 4 | Replay | Same TX submitted multiple times | `max_tx_per_period` |
| 5 | Dust-Drain | Many micro-TXs to exhaust fees | `max_tx_per_period` + `period_cap` |

## How to run

```bash
pnpm --filter demo run attacks
```

Output is a verdict table: each scenario is submitted, the program rejects it, and the event carries the triggering rule. The honest-agent counterpart (`demo/honest_agent.ts`) runs the same configuration and succeeds.

## Why these five

They map one-to-one to the attack vectors documented in the repo pitch and cover every rule currently defined in [Policies](Policies). If a new rule is added post-MVP, a matching scenario should be added here.
