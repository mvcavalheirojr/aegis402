# Aegis402

> Camada de segurança **x402-native** para agentes de IA que pagam autonomamente na Solana.

**Status:** pré-implementação — este repositório contém apenas a documentação do projeto. Código será adicionado na próxima sprint.
**Hackathon:** [Solana Frontier Hackathon 2026](https://colosseum.com/frontier) · Submissão: **11/mai/2026**

---

## Pitch

Aegis402 é a camada de **perícia forense em tempo real** para a nova economia de agentes IA que já começou a pagar APIs, outros agentes e serviços via o padrão **x402** na Solana. Antes de cada transação ser assinada, o Aegis402 intercepta, valida a **intenção declarada** contra a **ação real** usando regras determinísticas + Claude, grava em **log de auditoria criptograficamente encadeado**, e libera ou bloqueia. Agentes alucinam — Aegis402 não deixa a alucinação virar prejuízo.

---

## Problema

A [economia de agentes autônomos](https://solana.com/x402/hackathon) já existe: agentes IA pagam APIs, outros agentes e serviços em tempo real via x402 (HTTP 402 + micropagamentos on-chain). Cada chamada vira uma transação Solana assinada por uma carteira de agente.

Três vetores de risco novos:
1. **Alucinação:** o LLM "decide" transferir saldo inteiro para um endereço inventado.
2. **Prompt injection:** um HTML hostil manipula o agente a assinar TX maliciosa.
3. **Intent drift:** o agente diz que vai "pagar US$ 0,01 pela API X" mas a TX real envia 5 SOL para outro destino.

Não existe hoje uma camada padrão que valide **intenção declarada vs ação real** antes da assinatura.

---

## Solução — Aegis402 em 3 bullets

- **Proxy RPC + SDK Python** que qualquer agente ou stack x402 pluga em minutos (sem mudar o agente).
- **Perícia híbrida:** camada determinística (blocklist, limites, simulação) + Claude validando semanticamente se a intenção declarada bate com a TX decodificada.
- **Audit chain:** todo veredicto é gravado em log append-only com hash encadeado — trilha forense verificável, pronta para compliance.

---

## Diferencial técnico

| Camada | O que faz | Tecnologia |
|---|---|---|
| Rules | Fail-fast em ataques óbvios (amount threshold, allowlist de programas, dedup, rate limit) | Python puro, plugável via YAML |
| Simulator | Executa `simulateTransaction` na Solana e analisa diff de saldos antes de liberar | `solders` / `solana-py` |
| Intent Validator | Claude Opus 4.6 compara intenção declarada ↔ transação decodificada, com prompt caching | Anthropic SDK |
| Audit Chain | Append-only SQLite com hash Merkle encadeado — verificável | SQLite + hashlib |

---

## Arquitetura (resumo)

```
┌──────────────┐      ┌──────────────────────────────────────┐      ┌───────────┐
│ Agente IA /  │      │           Aegis402 (middleware)      │      │  Solana   │
│ Stack x402   │─────▶│  Proxy RPC  →  Forensic Engine       │─────▶│  devnet/  │
│              │      │              ┌──────────────────┐    │      │  mainnet  │
└──────┬───────┘      │              │ Rules            │    │      └───────────┘
       │              │              │ Simulator        │    │
       │  SDK         │              │ Intent (Claude)  │    │
       └─────────────▶│              │ Audit chain ⛓    │    │
                      │              └──────────────────┘    │
                      └──────────────────────────────────────┘
```

Detalhes em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

---

## Stack prevista

- **Python 3.11+**
- `solders` + `solana-py` — cliente Solana
- `anthropic` — Claude Opus 4.6 com prompt caching
- `fastapi` + `uvicorn` — proxy RPC
- `pydantic` v2 — schemas
- `sqlalchemy` + SQLite — audit log
- `httpx` — upstream RPC + testes
- `pytest` + `pytest-asyncio`

---

## Estado atual do repositório

```
aegis402/
├── README.md           ← você está aqui
├── LICENSE
└── docs/
    ├── ARQUITETURA.md
    └── ROADMAP.md
```

Nenhum código-fonte ainda. Implementação começa após alinhamento desta documentação.

---

## Próximos passos

1. Colher feedback sobre esta documentação.
2. Kick-off da implementação seguindo [`docs/ROADMAP.md`](docs/ROADMAP.md).
3. Submissão no Colosseum Arena até 11/mai/2026.

---

## Links do hackathon

- Landing Frontier: https://colosseum.com/frontier
- Inscrição (trilha Brasil): https://arena.colosseum.org?ref=brasil
- Wiki de submission (Superteam BR): https://wiki.superteam.com.br
- Discord Superteam BR: https://discord.com/invite/superteambrasil
