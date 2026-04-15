# Roadmap — Aegis402

[🇺🇸 English](ROADMAP.md) · **🇧🇷 Português**

**Deadline:** 11/mai/2026 · **Janela restante:** ~26 dias.

Cronograma em **blocos de ~2-3 dias**. Ownership das frentes é tratado internamente pelo time.

---

## Fase 0 — Alinhamento (antes do kick-off)

- [ ] Time lê os 5 docs públicos e levanta dúvidas
- [ ] Divisão final de frentes + cadência acordada

## Fase 1 — Bootstrap (2 dias · d1-2)

- [ ] `pyproject.toml` com deps travadas (solders, solana-py, anthropic, fastapi, pydantic, sqlalchemy, httpx, pytest)
- [ ] Estrutura de pastas conforme `ARCHITECTURE.pt-BR.md §5`
- [ ] `.env.example` (SOLANA_RPC_URL, ANTHROPIC_API_KEY, AEGIS_POLICY_PATH)
- [ ] `CLAUDE.md` com contexto do projeto para próximas sessões
- [ ] CI mínimo (`pytest` + lint) no GitHub Actions

## Fase 2 — Decoder + Schemas (2 dias · d3-4)

- [ ] `schemas.py` — `IntentDeclaration`, `Verdict`, `TxAnalysis`, `DecodedInstruction`
- [ ] `engine/decoder.py` — decodifica System (transfer), SPL Token (transfer, approve), x402 facilitator
- [ ] Testes unitários cobrindo cada tipo de instrução

## Fase 3 — Rules Engine (3 dias · d5-7)

- [ ] Estrutura de política YAML + parser
- [ ] Regras: blocklist, allowlist de programas, amount threshold (absoluto + %), dedup, rate limit/burst
- [ ] Extensibilidade plugável (registry de regras)
- [ ] Testes unitários (cobertura > 90% neste módulo)

## Fase 4 — Audit Chain (2 dias · d8-9)

- [ ] Modelo SQLAlchemy + schema da tabela `audit_log`
- [ ] Função `append(record)` que calcula `prev_hash` e encadeia
- [ ] CLI `aegis audit verify` que recalcula a cadeia
- [ ] Testes: inserções, verificação, detecção de adulteração

## Fase 5 — Intent Validator (Claude) (3 dias · d10-12)

- [ ] Prompt template (system + few-shot) com exemplos dos 5 ataques
- [ ] Integração Anthropic SDK com **prompt caching** nas partes estáticas
- [ ] Parser estruturado do output (`verdict | confidence | reasoning`)
- [ ] Timeout + fallback (`fail_closed` default)
- [ ] Testes com Anthropic mockado + 1 teste opt-in usando API real

## Fase 6 — Simulator (2 dias · d13-14)

- [ ] Wrapper `simulateTransaction` via `httpx`
- [ ] Parse de `accounts` / `logs` / `unitsConsumed` / erros
- [ ] Diff de saldos SOL + SPL (comparar `accounts` antes vs depois)
- [ ] Testes com fixtures de respostas reais de devnet

## Fase 7 — Orchestrator (2 dias · d15-16)

- [ ] `engine/orchestrator.py` encadeando Rules → Simulator → Intent → Audit
- [ ] Fail-fast + short-circuit quando uma camada bloqueia
- [ ] Política `fail_open` / `fail_closed`
- [ ] Testes end-to-end com engine completo (sem proxy HTTP ainda)

## Fase 8 — Proxy RPC (FastAPI) (3 dias · d17-19)

- [ ] `proxy/app.py` — servidor FastAPI
- [ ] Handler JSON-RPC: intercepta `sendTransaction`, `sendRawTransaction`, `simulateTransaction`
- [ ] Passthrough dos demais métodos
- [ ] Dockerfile + docker-compose para rodar localmente
- [ ] Smoke test: `curl` enviando TX → 403 com veredicto JSON

## Fase 9 — SDK Python (1 dia · d20)

- [ ] `sdk/client.py` — `AegisClient.send_with_intent(tx, intent)`
- [ ] Exemplo em notebook (`examples/honest_agent.ipynb`)

## Fase 10 — Harness x402 + demo layer (2 dias · d21-22)

- [ ] `demo/x402_server.py` — API paga mock com 1 endpoint
- [ ] `demo/honest_agent.py` — agente cliente que paga via x402 + Aegis402
- [ ] `demo/rogue_agent.py` — agente hackeado que tenta os 5 ataques

## Fase 11 — Script de cenários de ataque (1 dia · d23)

- [ ] `demo/attack_scenarios.py` — roda os 5 ataques, imprime tabela com veredictos + referencia hashes no audit log
- [ ] Output formatado para screenshot/vídeo

## Fase 12 — Video demo + polimento submission (3 dias · d24-26)

- [ ] Deploy do proxy em devnet (fly.io ou Render)
- [ ] Gravar vídeo 3min seguindo roteiro interno de pitch
- [ ] Polir README (screenshots do demo, badge de CI, quickstart)
- [ ] Submissão no Colosseum Arena com link do GitHub + vídeo + pitch
- [ ] Opcional: pitch deck (5-10 slides) para acelerador

---

## Buffer de risco

Cronograma otimista = 26 dias. Buffer real: todos os estágios têm 20% a menos que o disponível. Se atrasar em 1-2 fases, cortar: dashboard web (nunca estava no MVP); Fase 9 SDK pode virar só exemplo de uso direto do proxy.

---

## Definição de "pronto para submissão"

- [ ] Repo público no GitHub com README, LICENSE (MIT), CI verde
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
