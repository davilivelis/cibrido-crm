# PLANO MESTRE LIVELIS — ECOSSISTEMA CÍBRIDO
## Organização completa de todos os componentes
### Versão: 1.0 | Data: 08/04/2026

---

## VISÃO GERAL

O Livelis é o cérebro autônomo da Cíbrido. Ele orquestra todos os componentes do ecossistema: CRM, agentes IA, integrações, monitoramento e automações. Cada componente tem seu lugar, sua SKILL, e seu monitoramento.

---

## ESTRUTURA DE PASTAS DO PROJETO

```
PROJETOCLAUDECOUDE/
│
├── cibrido-crm/                    ← CRM (Next.js + Supabase)
│   ├── src/                        ← Código fonte
│   ├── public/                     ← Assets (logos, favicons)
│   ├── PRD-CibridoCRM-v1.1.md     ← PRD atualizado V1
│   ├── SKILL-CibridoCRM.md        ← Cérebro técnico do CRM
│   ├── CHECKLIST-V1-CibridoCRM.md ← Auditoria V1
│   ├── VISAO-V2-V3-CibridoCRM.md  ← Roadmap V2/V3
│   └── PRD-POLISH-FINAL-V1.md     ← Correções de experiência
│
├── Agentes/                        ← Agentes IA (GPT Maker → n8n)
│   ├── SKILL-JULIANO.md            ← Cérebro do Juliano (SDR)
│   ├── SKILL-LORENA.md             ← Cérebro da Lorena (Agendadora)
│   ├── SKILL-TREINAMENTO-AGENTES.md ← Manual de criar/treinar agentes
│   ├── PRD-AGENTES-IA-CIBRIDO.md   ← PRD completo dos agentes
│   └── TREINAMENTO-SPIN-JULIANO.md  ← Técnica SPIN detalhada
│
├── Automacoes/                     ← Workflows n8n (futuro)
│   ├── SKILL-N8N.md               ← Padrões e boas práticas n8n
│   ├── workflows/                  ← Exportações dos workflows
│   │   ├── asaas-cobranca.json
│   │   ├── meta-ads-sync.json
│   │   ├── whatsapp-evolution.json
│   │   ├── stress-test-agentes.json
│   │   └── cibrido-autoimune.json
│   └── README.md
│
├── Site/                           ← Site cibrido.com.br (futuro)
│   ├── PRD-Site-Cibrido.md
│   └── (código quando construir)
│
└── Livelis/                        ← Cérebro central
    ├── PLANO-MESTRE-LIVELIS.md     ← ESTE DOCUMENTO
    ├── SKILL-MASTER.md             ← SKILL mestre que referencia todas as outras
    └── CIBRIDO-AUTOIMUNE.md        ← Especificação do sistema autoimune
```

---

## COMPONENTES DO ECOSSISTEMA

### 1. CibridoCRM
- **Status:** V1 FECHADA ✅
- **URL:** crm.cibrido.com.br
- **Documentação:** cibrido-crm/SKILL-CibridoCRM.md
- **Próximo:** V2 (integrações, tráfego real, onboarding, painel admin)

### 2. Agentes IA

#### 2.1 Juliano (SDR)
- **Função:** Vende Cíbrido pro dono da clínica
- **Técnica:** SPIN Selling
- **Plataforma atual:** GPT Maker (GPT-4O)
- **Plataforma futura:** n8n + OpenAI API direto
- **Documentação:** Agentes/SKILL-JULIANO.md
- **Link teste:** https://app.gptmaker.ai/widget/3F144BE64FBF23C614565E6F7A612423/iframe

#### 2.2 Lorena (Agendadora)
- **Função:** Agenda consultas pro paciente da clínica
- **Integração:** CibridoCRM + Google Calendar (dupla)
- **Plataforma atual:** GPT Maker (GPT-4O)
- **Plataforma futura:** n8n + OpenAI API direto
- **Documentação:** Agentes/SKILL-LORENA.md

#### 2.3 Migração GPT Maker → n8n (V3)
- **Por quê:** Eliminar custo do GPT Maker, ter controle total, integrar com Cíbrido Autoimune
- **Como:** SKILL de treinamento de agentes documenta tudo que funcionou no GPT Maker → n8n reproduz via API da OpenAI
- **Documentação:** Agentes/SKILL-TREINAMENTO-AGENTES.md

### 3. Automações (n8n)

#### 3.1 Workflows planejados

| Workflow | Função | Versão |
|----------|--------|--------|
| Meta Ads → CRM | Sync métricas a cada 4h | V2 |
| Asaas → Cobrança | Lembretes + bloqueio + winback | V2 |
| Onboarding automático | Asaas paga → cria conta → email | V2 |
| WhatsApp Evolution | Receber/enviar mensagens | V3 |
| CibridoTrack | Links rastreáveis + retroalimentar Meta | V3 |
| Stress test agentes | Testar Juliano e Lorena periodicamente | V3 |
| Cíbrido Autoimune | Health check de todos os componentes | V3 |
| Google Calendar sync | Lorena agenda → evento no Calendar | V3 |
| Agente Juliano (n8n) | SDR rodando via API OpenAI no n8n | V3 |
| Agente Lorena (n8n) | Agendadora rodando via API OpenAI no n8n | V3 |

#### 3.2 Instância n8n
- **URL:** https://n8n-n8n.2f6tew.easypanel.host
- **Acesso:** Somente Davi
- **24 workflows existentes** (ClickUp, Evolution API, etc.)

### 4. CibridoTrack
- **Função:** Rastrear leads do WhatsApp (nosso "Tintim killer")
- **Status:** Planejado pra V3
- **Documentação:** Dentro de VISAO-V2-V3-CibridoCRM.md
- **Componentes:**
  - Links rastreáveis (crm.cibrido.com.br/t/)
  - Captura automática via Evolution API
  - Retroalimentação Meta Ads (Conversions API)

### 5. Cíbrido Autoimune
- **Função:** Monitoramento 24h de todos os componentes
- **Status:** Planejado pra V3
- **Documentação:** Livelis/CIBRIDO-AUTOIMUNE.md
- **Componentes monitorados:**
  - CRM (crm.cibrido.com.br)
  - Supabase (banco)
  - Evolution API (WhatsApp)
  - n8n (automações)
  - GPT Maker/Agentes IA
  - Asaas (billing)
  - Meta Ads API
  - DNS (Cloudflare)
  - Google Calendar sync
- **Níveis de resposta:**
  - Nível 1: Auto-fix (restart, re-deploy)
  - Nível 2: Consulta SKILL (erro conhecido)
  - Nível 3: Alerta WhatsApp pro Davi
  - Nível 4: Mensagem pro cliente afetado

### 6. Site cibrido.com.br
- **Status:** PRD criado, protótipos feitos, nenhum aprovado
- **Documentação:** Site/PRD-Site-Cibrido.md
- **Próximo:** Definir referências visuais, construir e deployar

---

## SKILLS — MAPA COMPLETO

Cada componente tem sua SKILL. Cada SKILL é um documento que ensina qualquer sessão do Claude Code a entender e operar aquele componente.

| SKILL | Componente | Status |
|-------|-----------|--------|
| SKILL-CibridoCRM.md | CRM | ✅ Criada |
| SKILL-JULIANO.md | Agente SDR | 🔄 Sendo criada (Claude Code) |
| SKILL-LORENA.md | Agente Agendadora | 🔄 Sendo criada (Claude Code) |
| SKILL-TREINAMENTO-AGENTES.md | Manual de criar/treinar agentes | ⏳ V3 (após validar no GPT Maker) |
| SKILL-N8N.md | Automações n8n | ⏳ V2 |
| SKILL-MASTER.md | Referência central Livelis | ⏳ V3 |
| CIBRIDO-AUTOIMUNE.md | Sistema de monitoramento | ⏳ V3 |

### Hierarquia das SKILLs
```
SKILL-MASTER.md (Livelis — cérebro central)
    │
    ├── SKILL-CibridoCRM.md (CRM)
    ├── SKILL-JULIANO.md (SDR)
    ├── SKILL-LORENA.md (Agendadora)
    ├── SKILL-TREINAMENTO-AGENTES.md (criar novos agentes)
    ├── SKILL-N8N.md (automações)
    └── CIBRIDO-AUTOIMUNE.md (monitoramento)
```

A SKILL-MASTER referencia todas as outras. Quando o Livelis (Claude) abre uma sessão, ele lê a SKILL-MASTER e sabe onde achar tudo.

---

## ROADMAP DE MIGRAÇÃO GPT MAKER → n8n

### Fase 1: Validar no GPT Maker (AGORA)
- ✅ Juliano criado e ativo
- 🔄 Treinamentos SPIN sendo adicionados
- 🔄 Lorena sendo criada
- ⏳ Stress test dos 10 cenários
- ⏳ Ajustes finos baseados no stress test

### Fase 2: Documentar na SKILL de Treinamento (V2)
- [ ] SKILL-TREINAMENTO-AGENTES.md com:
  - Como montar system prompt pra SDR
  - Como montar system prompt pra Agendador
  - Template de treinamento por tipo de clínica
  - Parâmetros ideais (temperatura, top_p, frequency_penalty)
  - Lista de cenários de stress test por tipo de agente
  - Critérios de aprovação (nota mínima 8/10 em cada cenário)
  - Padrões de resposta humanizada
  - O que funciona e o que não funciona (documentado dos testes)

### Fase 3: Migrar pro n8n (V3)
- [ ] Workflow "Agente Juliano" no n8n:
  - Recebe mensagem (webhook WhatsApp/webchat)
  - Monta prompt com system prompt SPIN + histórico da conversa
  - Chama API OpenAI (GPT-4o) diretamente
  - Envia resposta pro canal
  - Salva histórico no Supabase
  - Webhook pro CRM quando agendar diagnóstico

- [ ] Workflow "Agente Lorena" no n8n:
  - Recebe mensagem (webhook WhatsApp da clínica)
  - Monta prompt com system prompt + dados da clínica (procedimentos, horários, convênios)
  - Chama API OpenAI
  - Se agendar: cria no CRM + cria no Google Calendar
  - Envia confirmação pro paciente
  - Salva histórico

- [ ] Workflow "Stress Test Automatizado":
  - Trigger: manual ou agendado (diário 6h)
  - Loop pelos 10+ cenários
  - Envia mensagem simulada pro agente
  - Avalia resposta com Claude/GPT
  - Gera relatório com notas
  - Envia pro WhatsApp do Davi

### Fase 4: Desligar GPT Maker
- [ ] Todos os agentes rodando no n8n
- [ ] Stress test automatizado funcionando
- [ ] Cíbrido Autoimune monitorando
- [ ] Cancelar assinatura GPT Maker

---

## FERRAMENTAS DO ECOSSISTEMA

| Ferramenta | Papel | Custo |
|-----------|-------|-------|
| Claude (Opus/Sonnet) | Cérebro, orquestrador, desenvolvedor | Plano Pro |
| Claude Code | Executor no terminal | Incluso no Pro |
| Next.js + Vercel | Frontend CRM | Free tier |
| Supabase | Banco + Auth + RLS | Free tier |
| n8n | Motor de automação | Self-hosted (EasyPanel) |
| GPT Maker | Prototipagem de agentes (temporário) | Plano com créditos |
| OpenAI API | IA dos agentes (produção) | Pay-per-use (tokens) |
| Evolution API | WhatsApp | Self-hosted |
| Z-API | WhatsApp fallback | Pago |
| Asaas | Billing/cobrança | Taxa por transação |
| Cloudflare | DNS + segurança | Free tier |
| Google Calendar API | Agenda dos dentistas | Free |
| Meta Ads API | Dados de campanhas | Free (com app aprovado) |
| Google Ads API | Dados de campanhas | Free |

---

## PRINCÍPIOS INEGOCIÁVEIS

1. **"Se não está no PRD, não vai pro código"**
2. **Steve Jobs é o padrão de qualidade**
3. **Experiência do cliente acima de tudo**
4. **Cada componente tem sua SKILL**
5. **Tudo é monitorado pelo Cíbrido Autoimune**
6. **GPT Maker é temporário — n8n é o destino**
7. **O sistema se cura sozinho quando possível**
8. **Dados do cliente são sagrados — 90 dias de preservação**
9. **Comunicação clara — o dentista não pode ter dúvida**
10. **Pensar antes, fazer uma vez — não ficar remendando**

---

*Plano Mestre Livelis v1.0 — 08/04/2026*
*Cíbrido Soluções em IA*
*"O detalhe não é o detalhe. O detalhe é o design."*
