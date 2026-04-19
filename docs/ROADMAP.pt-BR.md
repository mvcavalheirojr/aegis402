# Roadmap — Aegis402

[🇺🇸 English](ROADMAP.md) · **🇧🇷 Português**

**Deadline:** 11/mai/2026 · **Janela restante:** ~22 dias.

Cronograma em **blocos de ~2-3 dias**. Ownership das frentes é tratado internamente pelo time.

---

## Fase 0 — Alinhamento (antes do kick-off)

- [ ] Time lê os docs públicos e levanta dúvidas
- [ ] Divisão final de frentes + cadência acordada

## Fase 1 — Bootstrap (2 dias · d1-2)

- [ ] `Anchor.toml` + scaffold do projeto Anchor
- [ ] Estrutura de pastas conforme `ARCHITECTURE.pt-BR.md §7`
- [ ] `package.json` com config de workspace (programs, sdk, app, tests)
- [ ] `.env.example` (SOLANA_RPC_URL, ANCHOR_WALLET, PROGRAM_ID)
- [ ] CI mínimo (Anchor build + test) no GitHub Actions

## Fase 2 — Smart Contract: Core (3 dias · d3-5)

- [ ] `state.rs` — structs das contas `Vault` e `Policy`
- [ ] `instructions/initialize.rs` — criar cofre PDA + conta de política
- [ ] `instructions/deposit.rs` — transferir SOL/SPL para o cofre
- [ ] `instructions/withdraw.rs` — saque do operador com verificação de autoridade
- [ ] `errors.rs` — tipos de erro customizados (PolicyViolation, Unauthorized, etc.)
- [ ] Testes Anchor para ciclo de vida do cofre (init → deposit → withdraw)

## Fase 3 — Smart Contract: Enforcement de Políticas (3 dias · d6-8)

- [ ] `instructions/execute.rs` — transação iniciada pelo agente com verificação completa de políticas
- [ ] Enforcement de limite por TX
- [ ] Rastreamento de limite por período (conta de contador diário/semanal)
- [ ] Verificação de whitelist de destinos
- [ ] Verificação de whitelist de programas
- [ ] Enforcement de rate limit
- [ ] `instructions/update_policy.rs` — operador atualiza parâmetros de política
- [ ] Testes Anchor para cada regra (casos de aprovação + violação)

## Fase 4 — SDK TypeScript (2 dias · d9-10)

- [ ] `sdk/src/pda.ts` — helpers de derivação PDA (vault, policy)
- [ ] `sdk/src/client.ts` — `AegisClient` encapsulando chamadas do programa Anchor
- [ ] `sdk/src/types.ts` — tipos TypeScript espelhando structs on-chain
- [ ] Testes do SDK contra localnet

## Fase 5 — Dashboard Web: Core (3 dias · d11-13)

- [ ] Scaffold do projeto Next.js com Tailwind + wallet adapter
- [ ] Página de listagem de cofres — mostrar todos os cofres da wallet conectada
- [ ] Página de detalhe do cofre — saldo, resumo de política, ações de depósito/saque
- [ ] Editor de políticas — atualizar limites de gastos, whitelists, rate limits
- [ ] Conexão de wallet (Phantom / Solflare)

## Fase 6 — Dashboard Web: Monitoramento (2 dias · d14-15)

- [ ] Feed de histórico de transações com status de veredicto (aprovado/bloqueado)
- [ ] Indexer de eventos on-chain (escutar eventos do programa, armazenar em DB local)
- [ ] Visualizador de trilha de auditoria com filtros por cofre, veredicto, data
- [ ] Atualizações em tempo real via WebSocket ou polling

## Fase 7 — Integração x402 (2 dias · d16-17)

- [ ] Handler de fluxo de pagamento x402 no SDK
- [ ] Servidor x402 mock (API paga com 1 endpoint)
- [ ] Teste end-to-end: agente → resposta 402 → pagamento via cofre Aegis402 → resposta da API

## Fase 8 — Demo Layer (2 dias · d18-19)

- [ ] `demo/honest_agent.ts` — agente fazendo pagamentos x402 legítimos pelo cofre
- [ ] `demo/rogue_agent.ts` — agente comprometido tentando os 5 ataques
- [ ] `demo/attack_scenarios.ts` — roda todos os cenários, imprime tabela de veredictos
- [ ] Output formatado para screenshot/vídeo

## Fase 9 — Vídeo Demo + Polimento da Submission (3 dias · d20-22)

- [ ] Deploy do programa na devnet
- [ ] Deploy do dashboard (Vercel ou similar)
- [ ] Gravar vídeo 3min seguindo roteiro interno de pitch
- [ ] Polir README (screenshots do demo, badge de CI, quickstart)
- [ ] Submissão no Colosseum Arena com link do GitHub + vídeo + pitch
- [ ] Opcional: pitch deck (5-10 slides) para acelerador

---

## Buffer de risco

Cronograma otimista = 22 dias. Se atrasar em 1-2 fases, cortar: monitoramento do dashboard pode ser simplificado para lista básica de TXs; SDK Python é opcional e pode ser adiado para pós-hackathon.

---

## Definição de "pronto para submissão"

- [ ] Repo público no GitHub com README, LICENSE (MIT), CI verde
- [ ] Programa Anchor deployado na devnet com build verificado
- [ ] `demo/attack_scenarios.ts` roda e mostra os 5 ataques bloqueados
- [ ] Fluxo honesto x402 funciona na devnet (micropagamento passa pelo cofre)
- [ ] Dashboard live e conectado à devnet
- [ ] Vídeo demo ≤ 3min publicado (YouTube ou Loom)
- [ ] Projeto registrado no Colosseum Arena

---

## O que NÃO está no MVP (roadmap pós-hackathon)

- Autoridade de cofre multi-sig
- Suporte a tokens SPL além de SOL
- Validação de intenção com IA (camada Claude sobre regras on-chain)
- Dashboard mobile-friendly
- Métricas/alertas Prometheus
- RBAC granular para operadores multi-agente
- Invocação cross-program (CPI) para fluxos DeFi complexos
