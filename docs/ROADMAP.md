# Roadmap — Aegis402

**Deadline:** 11/mai/2026 · **Hoje:** 15/abr/2026 · **Janela restante:** ~26 dias.

Cronograma em **blocos de ~2-3 dias**, com owner sugerido. Ajustar após alinhamento com Perion.

Legenda de owners: **J** = Jack · **P** = Perion · **J+P** = par programming.

---

## Fase 0 — Alinhamento (antes do kick-off)

| Passo | Owner | Duração |
|---|---|---|
| Perion lê os 5 docs e levanta dúvidas | P | 1 dia |
| Definir divisão final de frentes + cadência | J+P | 0.5 dia |

---

## Fase 1 — Bootstrap (2 dias · dias 1-2)

- [ ] `pyproject.toml` com deps travadas (solders, solana-py, anthropic, fastapi, pydantic, sqlalchemy, httpx, pytest)
- [ ] Estrutura de pastas conforme `ARQUITETURA.md §5`
- [ ] `.env.example` (SOLANA_RPC_URL, ANTHROPIC_API_KEY, AEGIS_POLICY_PATH)
- [ ] `CLAUDE.md` com contexto do projeto para próximas sessões
- [ ] CI mínimo (`pytest` + lint) no GitHub Actions
- **Owner:** J

## Fase 2 — Decoder + Schemas (2 dias · dias 3-4)

- [ ] `schemas.py` — `IntentDeclaration`, `Verdict`, `TxAnalysis`, `DecodedInstruction`
- [ ] `engine/decoder.py` — decodifica System (transfer), SPL Token (transfer, approve), x402 facilitator
- [ ] Testes unitários cobrindo cada tipo de instrução
- **Owner:** J

## Fase 3 — Rules Engine (3 dias · dias 5-7)

- [ ] Estrutura de política YAML + parser
- [ ] Regras: blocklist, allowlist de programas, amount threshold (absoluto + %), dedup, rate limit/burst
- [ ] Extensibilidade plugável (registry de regras)
- [ ] Testes unitários (cobertura > 90% neste módulo)
- **Owner:** P (sugerido — frente independente, bom onboarding)

## Fase 4 — Audit Chain (2 dias · dias 8-9)

- [ ] Modelo SQLAlchemy + schema da tabela `audit_log`
- [ ] Função `append(record)` que calcula `prev_hash` e encadeia
- [ ] CLI `aegis audit verify` que recalcula a cadeia
- [ ] Testes: inserções, verificação, detecção de adulteração
- **Owner:** J

## Fase 5 — Intent Validator (Claude) (3 dias · dias 10-12)

- [ ] Prompt template (system + few-shot) com exemplos dos 5 ataques
- [ ] Integração Anthropic SDK com **prompt caching** nas partes estáticas
- [ ] Parser estruturado do output (`verdict | confidence | reasoning`)
- [ ] Timeout + fallback (`fail_closed` default)
- [ ] Testes com Anthropic mockado + 1 teste opt-in usando API real
- **Owner:** J

## Fase 6 — Simulator (2 dias · dias 13-14)

- [ ] Wrapper `simulateTransaction` via `httpx`
- [ ] Parse de `accounts` / `logs` / `unitsConsumed` / erros
- [ ] Diff de saldos SOL + SPL (comparar com `accounts` antes vs depois)
- [ ] Testes com fixtures de respostas reais de devnet
- **Owner:** P (sugerido)

## Fase 7 — Orchestrator (2 dias · dias 15-16)

- [ ] `engine/orchestrator.py` encadeando Rules → Simulator → Intent → Audit
- [ ] Fail-fast + short-circuit quando uma camada bloqueia
- [ ] Política `fail_open` / `fail_closed`
- [ ] Testes end-to-end com engine completo (sem proxy HTTP ainda)
- **Owner:** J+P

## Fase 8 — Proxy RPC (FastAPI) (3 dias · dias 17-19)

- [ ] `proxy/app.py` — servidor FastAPI
- [ ] Handler JSON-RPC: intercepta `sendTransaction`, `sendRawTransaction`, `simulateTransaction`
- [ ] Passthrough dos demais métodos
- [ ] Dockerfile + docker-compose para rodar localmente
- [ ] Smoke test: `curl` enviando TX → 403 com veredicto JSON
- **Owner:** P

## Fase 9 — SDK Python (1 dia · dia 20)

- [ ] `sdk/client.py` — `AegisClient.send_with_intent(tx, intent)`
- [ ] Exemplo em notebook (`examples/honest_agent.ipynb`)
- **Owner:** J

## Fase 10 — Harness x402 + demo layer (2 dias · dias 21-22)

- [ ] `demo/x402_server.py` — API paga mock com 1 endpoint
- [ ] `demo/honest_agent.py` — agente cliente que paga via x402 + Aegis402
- [ ] `demo/rogue_agent.py` — agente hackeado que tenta os 5 ataques
- **Owner:** J+P

## Fase 11 — Script de cenários de ataque (1 dia · dia 23)

- [ ] `demo/attack_scenarios.py` — roda os 5 ataques, imprime tabela com veredictos + referencia hashes no audit log
- [ ] Output formatado para screenshot/vídeo
- **Owner:** J

## Fase 12 — Video demo + polimento submission (3 dias · dias 24-26)

- [ ] Deploy do proxy em devnet (fly.io ou Render)
- [ ] Gravar vídeo 3min seguindo roteiro em `HACKATHON_PITCH.md`
- [ ] Polir README (screenshots do demo, badge de CI, quickstart)
- [ ] Submissão no Colosseum Arena com link do GitHub + vídeo + pitch
- [ ] Opcional: pitch deck (5-10 slides) para acelerador
- **Owner:** J+P

---

## Buffer de risco

Cronograma otimista = 26 dias. Buffer real: todos os estágios têm 20% a menos que o disponível. Se atrasar em 1-2 fases, cortar: dashboard web (nunca estava no MVP), fase 9 SDK pode ser só exemplo de uso direto do proxy.

---

## Definição de "pronto para submissão"

- [ ] Repo público no GitHub com README, LICENSE (MIT sugerido), CI verde
- [ ] `uv run python demo/attack_scenarios.py` roda e mostra os 5 ataques bloqueados
- [ ] Fluxo honesto funciona em devnet real (pagamento x402 de US$ 0.01 passa)
- [ ] `aegis audit verify` confirma cadeia íntegra
- [ ] Vídeo demo ≤ 3min publicado (YouTube ou Loom)
- [ ] Projeto registrado no Colosseum Arena

---

## O que NÃO está no MVP (roadmap pós-hackathon)

- Dashboard web de auditoria
- Múltiplos LLMs (hoje: só Claude)
- Policy editor GUI
- Métricas/alertas Prometheus
- Integrações nativas Phantom / Privy / MagicBlock
- Fine-tuning de modelo próprio com audit log
