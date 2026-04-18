# PRD — Agentes IA Cíbrido (Juliano + Lorena)
> Versão 1.1 — 18/04/2026
> Autor: Livelis (desenvolvedor de produto)
> Aprovação necessária: Davi Junior + Ricardo Souza

---

## 0. DECISÃO REGISTRADA — 18/04/2026

| Item | Status | Origem |
|---|---|---|
| Juliano — SPIN Selling | ✅ Migrar do backup com ajustes | Backup GPT Maker (20 treinamentos) |
| Juliano — Conhecimento Cíbrido | ✅ Migrar + adicionar fundadores e planos | Backup GPT Maker (treinamentos 14-20) |
| Juliano — Lead scoring numérico | 🔴 Construir do zero no n8n | Não existe no backup |
| Lorena — Agendadora comercial Cíbrido | 🔴 Construir do zero — backup não serve | Backup era para clínica cliente, não para Cíbrido |

**Lorena no backup = versão para o dentista cliente** (procedimentos, convênios, horários de clínica).
**Lorena que precisamos = funcionária Cíbrido** que agenda calls comerciais com Davi/Ricardo — construir do zero.

---

## 1. PROBLEMA

GPT Maker cancelado em 16/04/2026. Backup exportado. Juliano e Lorena existem como conceito e treinamento documentado, mas não têm infraestrutura ativa. Prospecção começa em 23/04 — os agentes precisam estar operacionais para demonstração e para o funil comercial da Cíbrido funcionar.

**Situação atual:**
- Juliano: 20 treinamentos exportados, sem plataforma ativa
- Lorena: 6 treinamentos exportados, sem plataforma ativa
- WhatsApp (11) 96034-1082 com Evolution API configurada — sem agente conectado
- n8n ativo no Hetzner VPS — pronto para receber os workflows

---

## 2. QUEM SÃO OS AGENTES

### Juliano — SDR da Cíbrido
| Atributo | Definição |
|---|---|
| **Nome interno** | Juliano |
| **Nome público** | Agente Qualificador de Pacientes |
| **Função** | SDR — qualifica leads, aplica SPIN Selling, faz lead scoring |
| **Canal** | WhatsApp (11) 96034-1082 via Evolution API |
| **Vínculo** | Funcionário Cíbrido — alinhado com Ricardo |
| **Plataforma** | n8n + OpenAI API |

### Lorena — Agendadora da Cíbrido
| Atributo | Definição |
|---|---|
| **Nome interno** | Lorena |
| **Nome público** | Agente Agendador de Consultas |
| **Função** | Agenda calls comerciais com Davi/Ricardo → confirma no CRM Admin + Google Calendar |
| **Canal** | WhatsApp — recebe lead transferido do Juliano |
| **Vínculo** | Funcionária Cíbrido — alinhada com Ricardo |
| **Plataforma** | n8n + OpenAI API |

---

## 3. FUNIL COMPLETO — VISÃO GERAL

```
Anúncio (Meta Ads / Google Ads)
        ↓
Landing page (cibrido.com.br/clinica-odontologica)
        ↓
WhatsApp (11) 96034-1082
        ↓
┌─────────────────────────────────────┐
│           JULIANO (SDR)             │
│  Recebe lead → SPIN Selling         │
│  → Lead scoring                     │
│  → Qualificado? → transfere Lorena  │
│  → Não qualificado? → nurtura       │
└─────────────────────────────────────┘
        ↓ (lead qualificado)
┌─────────────────────────────────────┐
│           LORENA (Agendadora)       │
│  Recebe lead qualificado            │
│  → Agenda call com Davi/Ricardo     │
│  → Confirma no CRM Admin            │
│  → Confirma no Google Calendar      │
│  → Envia confirmação ao lead        │
└─────────────────────────────────────┘
        ↓
Call com Davi/Ricardo
        ↓
CRM Admin → Pipeline Comercial
```

---

## 4. SCOPO V1.0 — JULIANO

### 4.1 Persona e tom
- Nome: Juliano
- Tom: profissional, direto, empático — nunca robótico
- Idioma: PT-BR, linguagem de negócio acessível
- Não menciona que é IA a menos que perguntado diretamente
- Nunca promete o que não pode entregar

### 4.2 O que vem do backup (migrar com ajustes)
- SPIN Selling completo (20 treinamentos)
- Regra anti-SPIN-precoce (mínimo 3 perguntas Situação + 2 Problema antes de apresentar solução)
- Tom: humanizado, máximo 3 frases, 1 pergunta por vez, sem emoji
- O que NÃO faz: NUNCA fala preço, NUNCA inventa, NUNCA apresenta solução antes de sentir a dor

### 4.3 O que adicionar (não está no backup)
- Fundadores: Davi Junior (estratégia + tecnologia) e Ricardo Souza (comercial + presencial)
- Planos: Cibri-Lite (R$497), Cibri-Standard (R$897), Cibri-Master (R$1.497) — Juliano NUNCA cita preço, mas sabe os nomes
- Lead scoring numérico (construir no n8n)
- Transferência formal para Lorena com contexto completo

### 4.4 Fluxo de conversa principal
```
1. RECEPÇÃO
   Lead chega via WhatsApp
   → Juliano cumprimenta pelo nome (se disponível)
   → "Oi! Aqui é o Juliano da Cíbrido. Vi que você demonstrou
      interesse em automatizar o atendimento da sua clínica. Posso
      te fazer algumas perguntas rápidas?"

2. SPIN SELLING — 4 fases
   S — Situação: "Quantos pacientes vocês atendem por mês?"
   P — Problema: "Qual o maior desafio hoje no agendamento?"
   I — Implicação: "Isso já custou pacientes para vocês?"
   N — Necessidade: "Se vocês pudessem resolver isso, o que mudaria?"

3. LEAD SCORING — critérios internos
   Pontos positivos (+):
   → Clínica odontológica confirmada (+20)
   → Mais de 50 pacientes/mês (+15)
   → Tem WhatsApp ativo para atendimento (+10)
   → Sente dor com agendamento/qualificação (+15)
   → Decisor na conversa (dono/gestor) (+20)

   Pontos negativos (-):
   → Não é clínica odontológica (-50, encerra conversa)
   → Menos de 20 pacientes/mês (-20)
   → Sem orçamento mensal (-15)

   Score ≥ 50 → qualificado → transfere para Lorena
   Score < 50 → não qualificado → nurtura com conteúdo

4. TRANSFERÊNCIA PARA LORENA
   "Ótimo! Com base no que você me contou, acredito que o Sistema
   Cíbrido pode ajudar muito a sua clínica. Vou te conectar com
   a Lorena, que vai agendar uma conversa com nosso time para
   mostrar tudo na prática. Um momento!"
   → Passa contexto completo para Lorena (nome, clínica, dores, score)
```

### 4.3 Limites do Juliano
```
NÃO FAZ:
→ Não fecha venda (só qualifica)
→ Não cita preço sem contexto (redireciona para call)
→ Não promete resultados específicos ("você vai ter X pacientes")
→ Não fala mal de concorrentes
→ Não responde perguntas fora do escopo da Cíbrido
→ Não inventa informações sobre o produto

FAZ:
→ Qualifica leads com SPIN
→ Faz lead scoring interno
→ Explica o produto em alto nível
→ Transfere para Lorena quando qualificado
→ Nutre leads não qualificados com conteúdo
→ Registra lead no CRM Admin (cibrido_leads)
```

### 4.4 Integrações Juliano
| Sistema | Ação | Como |
|---|---|---|
| Evolution API | Recebe/envia mensagens WhatsApp | Webhook n8n |
| Supabase (cibrido_leads) | Cria/atualiza lead com score | HTTP Request n8n |
| n8n | Orquestra todo o fluxo | Workflow principal |
| OpenAI API | Processamento de linguagem natural | GPT-4o mini (custo baixo) |

---

## 5. ESCOPO V1.0 — LORENA

### 5.1 Persona e tom
- Nome: Lorena
- Tom: caloroso, organizado, eficiente — como uma assistente executiva
- Idioma: PT-BR
- Representa a Cíbrido com profissionalismo

### 5.2 Fluxo de conversa principal
```
1. RECEPÇÃO DO LEAD (vindo do Juliano)
   Lorena recebe contexto: nome, clínica, dores, score
   → "Olá [Nome]! Aqui é a Lorena da Cíbrido. O Juliano me
      passou sua conversa e fiquei feliz de saber que você quer
      conhecer melhor o nosso sistema. Vou agendar uma conversa
      com nosso time — leva só 30 minutos!"

2. COLETA DE DISPONIBILIDADE
   → "Qual o melhor horário para você? Trabalhamos de
      segunda a sexta, das 9h às 18h."
   → Oferece 3 opções de horário baseadas na agenda

3. CONFIRMAÇÃO
   → Registra no CRM Admin (cibrido_calls)
   → Adiciona no Google Calendar (cibrido@gmail.com)
   → Envia confirmação por WhatsApp:
      "✅ Confirmado! Sua conversa com o time Cíbrido está
      agendada para [data] às [hora]. Qualquer dúvida, estou aqui!"

4. LEMBRETE (24h antes)
   → "Olá [Nome]! Só um lembrete da sua conversa com a Cíbrido
      amanhã às [hora]. Estamos animados para te mostrar tudo! 🎯"
```

### 5.3 Limites da Lorena
```
NÃO FAZ:
→ Não qualifica (recebe lead já qualificado)
→ Não fecha venda
→ Não agenda fora do horário comercial
→ Não faz mais de 3 tentativas de reagendamento

FAZ:
→ Agenda calls com Davi/Ricardo
→ Registra no CRM Admin
→ Adiciona no Google Calendar
→ Envia confirmação e lembrete
→ Reagenda se necessário (até 2x)
```

### 5.4 Integrações Lorena
| Sistema | Ação | Como |
|---|---|---|
| Evolution API | Recebe/envia mensagens WhatsApp | Webhook n8n |
| Supabase (cibrido_calls) | Cria registro de call agendada | HTTP Request n8n |
| Google Calendar | Adiciona evento na agenda | Google Calendar API / n8n |
| OpenAI API | Processamento de linguagem natural | GPT-4o mini |
| n8n | Orquestra o fluxo | Workflow Lorena |

---

## 6. ARQUITETURA N8N

### Workflow Juliano
```
[Webhook Evolution API]
        ↓
[Filtro: é nova conversa ou continuação?]
        ↓
[OpenAI: processa mensagem + contexto]
        ↓
[Switch: fase da conversa (recepção/spin/scoring/transferência)]
        ↓
[Ação por fase]
        ├── Recepção → envia boas-vindas
        ├── SPIN → envia próxima pergunta
        ├── Scoring → calcula score interno
        └── Qualificado → notifica Lorena
        ↓
[Evolution API: envia resposta]
        ↓
[Supabase: atualiza lead (cibrido_leads)]
```

### Workflow Lorena
```
[Trigger: Juliano notifica lead qualificado]
        ↓
[Recebe contexto do lead]
        ↓
[OpenAI: gera mensagem de boas-vindas personalizada]
        ↓
[Evolution API: envia mensagem]
        ↓
[Coleta disponibilidade via WhatsApp]
        ↓
[Confirma horário]
        ↓
[Google Calendar: cria evento]
        ↓
[Supabase: cria registro em cibrido_calls]
        ↓
[Evolution API: envia confirmação]
        ↓
[Agenda lembrete 24h antes]
```

---

## 7. BANCO DE DADOS — TABELAS UTILIZADAS

### Existente: `cibrido_leads`
```
id, name, phone, source, stage, score (adicionar), 
clinic_name, pain_points (adicionar), created_at
```
Adicionar colunas:
```sql
ALTER TABLE cibrido_leads
  ADD COLUMN score INTEGER DEFAULT 0,
  ADD COLUMN pain_points TEXT,
  ADD COLUMN qualification_notes TEXT;
```

### Existente: `cibrido_calls`
Já tem: lead_id, scheduled_at, attended_by, outcome, next_step
Adicionar:
```sql
ALTER TABLE cibrido_calls
  ADD COLUMN lead_context TEXT, -- resumo da conversa do Juliano
  ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
```

---

## 8. SEGURANÇA — CHECKLIST

```
□ API Keys OpenAI: somente em variáveis de ambiente do n8n (nunca no código)
□ Evolution API token: somente no n8n
□ Supabase service role key: somente no n8n (nunca exposta)
□ Google Calendar OAuth: credenciais no n8n
□ Webhook URL do n8n: protegido com token de validação
□ Dados do lead: nunca logados em texto plano
□ Score do lead: campo interno — nunca enviado para o lead
□ Migrations testadas localmente antes de prod
```

---

## 9. MOBILE — CHECKLIST (contexto: n8n não tem UI mobile)

```
□ Mensagens do WhatsApp: máximo 300 caracteres por mensagem
□ Sem formatação complexa (tabelas, listas longas)
□ Emojis usados com moderação (no máximo 1 por mensagem)
□ Links sempre encurtados (Bitly MCP disponível)
□ Respostas em até 3 segundos (UX de chat)
```

---

## 10. MÉTRICA DE SUCESSO (Rafael Milagre)

> *"Qual número prova que está funcionando?"*

| Métrica | Meta V1 | Como medir |
|---|---|---|
| Taxa de resposta do Juliano | > 95% | n8n execution logs |
| Tempo médio de resposta | < 5 segundos | n8n logs |
| Taxa de qualificação | > 30% dos leads | cibrido_leads (score ≥ 50) |
| Taxa de agendamento (Lorena) | > 70% dos qualificados | cibrido_calls |
| Taxa de comparecimento na call | > 60% | outcome = 'compareceu' |

---

## 11. CRITÉRIO DE PRONTO

```
□ Juliano responde mensagens no WhatsApp (11) 96034-1082
□ SPIN Selling aplicado em sequência correta
□ Lead scoring calculado e salvo em cibrido_leads
□ Lead qualificado transferido para Lorena automaticamente
□ Lorena agenda call e confirma via WhatsApp
□ Evento criado no Google Calendar cibrido@gmail.com
□ Registro criado em cibrido_calls no CRM Admin
□ Lembrete enviado 24h antes da call
□ Testado com lead real (não mock) — 3 conversas completas
□ Métricas sendo coletadas e visíveis no CRM Admin
```

---

## 12. O QUE NÃO PODE QUEBRAR

- WhatsApp (11) 96034-1082 — número principal da Cíbrido
- Evolution API — conexão deve permanecer estável
- Google Calendar cibrido@gmail.com — compartilhado Davi + Ricardo
- CRM Admin — nenhuma migration pode afetar tabelas do CRM do dentista

---

## 13. PRIORIDADE DE EXECUÇÃO

```
FASE 1 (antes da prospecção — 23/04)
→ Juliano: fluxo básico funcional (recepção + SPIN + scoring)
→ Lorena: agendamento + confirmação + Calendar
→ Integração Juliano → Lorena testada com lead real

FASE 2 (semana seguinte)
→ Lembrete automático 24h
→ Nurtura de leads não qualificados
→ Métricas no CRM Admin (dashboard de conversão dos agentes)

FASE 3 (V2)
→ A/B test de abordagem do Juliano
→ Multi-canal (Instagram DM)
→ Relatório semanal automático via Routine
```

---

*PRD criado em 18/04/2026 — Livelis / Cíbrido Soluções em IA*
*Aprovação necessária: Davi Junior + Ricardo Souza antes de qualquer execução no n8n*
