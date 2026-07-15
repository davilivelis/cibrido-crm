# VISÃO V2 E V3 — CibridoCRM
## CibridoTrack + Cíbrido Autoimune + Agentes IA + Integrações + Inadimplência
### Versão: 2.0 | Data: 07/04/2026

---

## FILOSOFIA DO PRODUTO

O CibridoCRM existe pra **lotar a agenda de clínicas odontológicas**. Tudo que entra no sistema precisa responder a uma pergunta: isso ajuda o dentista a ter mais pacientes na cadeira?

A grande maioria das campanhas dos clientes será direcionada pro **WhatsApp**. Isso significa que o rastreamento tradicional (pixel, formulário, landing page) não funciona — o WhatsApp é um buraco negro de dados. O CibridoTrack resolve isso.

Todo componente do ecossistema Cíbrido é monitorado 24h pelo **Cíbrido Autoimune** — se algo quebrar, o sistema detecta e corrige sozinho.

---

## PARTE 1: CibridoTrack — RASTREAMENTO NATIVO DE LEADS WHATSAPP

### 1.1 O problema que resolve

Quando uma campanha do Meta Ads direciona pro WhatsApp, o gerenciador de anúncios não sabe:
- Quantas conversas viraram consulta
- Qual criativo gerou mais agendamentos
- Qual campanha trouxe leads qualificados vs curiosos
- Qual o CPL real (considerando quem de fato agendou)

O dentista paga R$ 2.000/mês em tráfego e não sabe se está funcionando. O gestor de tráfego da Cíbrido não tem dados pra otimizar.

### 1.2 Como o CibridoTrack funciona

3 mecanismos integrados ao CRM:

**Mecanismo 1: Links rastreáveis Cíbrido**

Em vez de usar `wa.me/numero` no anúncio, usa:
```
crm.cibrido.com.br/t/{codigo_unico}
```

Esse link:
1. Registra a origem (campanha, adset, ad, placement)
2. Captura UTMs automaticamente
3. Redireciona pro WhatsApp da clínica
4. O CRM sabe exatamente de onde veio cada lead

Exemplo: o anúncio "Implantes Abril" usa o link `crm.cibrido.com.br/t/imp-abr-01`. Quando o lead clica, o CRM registra: campanha=Implantes Abril, placement=Stories, criativo=video-depoimento. Depois redireciona pro WhatsApp.

**Mecanismo 2: Captura automática via Evolution API**

Quando o lead manda a primeira mensagem no WhatsApp:
1. Evolution API recebe a mensagem
2. Webhook dispara pro CRM
3. CRM cria o lead automaticamente no pipeline (etapa "Novo Lead")
4. Vincula à campanha de origem (se veio por link rastreável)
5. Preenche nome e telefone automaticamente

O dentista não digita NADA. O lead aparece no CRM sozinho.

**Mecanismo 3: Retroalimentação do Meta Ads**

Quando o dentista move o lead no pipeline:
- "Agendamento Pendente" → CRM envia evento "lead" pro Pixel do Meta via Conversions API
- "Consulta Marcada" → CRM envia evento "schedule" pro Pixel
- "Compareceu" → CRM envia evento "purchase" pro Pixel
- "Venda Realizada" → CRM envia evento "purchase" com valor

O Meta Ads recebe esses eventos e aprende: "o anúncio X gera mais consultas que o Y". As campanhas se otimizam AUTOMATICAMENTE.

### 1.3 Tela de Tráfego Pago — painel completo com dados reais

#### Cards de resumo (topo)
```
Orçamento → Alcance → Impressões → Cliques → CPC → Resultados → CPL
```

#### Tabela de campanhas (dados reais do Meta/Google)

| Coluna | Descrição |
|--------|-----------|
| Campanha | Nome exato do anúncio no Meta/Google |
| Local do Anúncio | Feed, Stories, Reels, Search |
| Criativo | Thumbnail clicável (imagem/vídeo do anúncio) |
| Orçamento | Valor gasto |
| Alcance | Pessoas únicas |
| Impressões | Total de exibições |
| Cliques | Cliques no link |
| CPC | Custo por clique |
| Resultado | Leads gerados |

#### Diferencial vs concorrentes (Tintim, etc.)

O Tintim é uma ferramenta isolada que rastreia WhatsApp mas precisa se integrar com CRM externo. O CibridoTrack é **nativo do CRM** — nasceu dentro dele:
- Sem ferramenta extra, sem custo adicional
- Sem delay de 5 segundos no redirect
- Pipeline integrado (mover lead no kanban retroalimenta o Meta automaticamente)
- O dentista vê tudo num lugar só: leads, pipeline, campanhas, resultados

---

## PARTE 2: AGENTES IA — JULIANO (SDR) + AGENDADOR

### 2.1 Status atual do Juliano

**Plataforma:** GPT Maker
**Modelo:** GPT-4O
**Status:** ATIVO (criado em 31/03/2026)
**Pendências:**
- Existe um agente duplicado que precisa ser deletado
- Ações de inatividade não configuradas (erro 500 na API)
- Precisa adicionar treinamento sobre sede em Diadema
- Nenhum canal conectado ainda (widget, WhatsApp, Instagram)

### 2.2 Juliano — SDR humanizado

**Papel:** Primeiro contato com o dono da clínica. Capta interesse, qualifica a dor, agenda diagnóstico gratuito.

**Onde vai atuar:**
- V2: Widget no site cibrido.com.br
- V3: WhatsApp da Cíbrido (Evolution API) + Instagram DM

**Treinamentos atuais (6):**
1. O que é a Cíbrido e seus 3 produtos
2. Agente de atendimento virtual humanizado
3. Agente agendador humanizado
4. CibridoCRM — o que é e pra que serve
5. Trial de 10 dias gratuito
6. Cíbrido NÃO faz marketing — agenda com especialista parceiro

**Treinamentos pendentes:**
- Sede em Diadema, São Paulo
- Planos e preços (Lite R$497, Standard R$897, Master R$1.497) — OU regra de NÃO falar preço e agendar reunião
- Depoimentos de clientes (quando tiver)
- FAQ sobre o CRM (como funciona, quanto tempo leva pra implementar)

**Regra de transferência:** Transfere pra humano quando o lead fecha interesse no diagnóstico, pede pra falar com humano, ou quer saber preços/contratos.

### 2.3 Agendador — agente que marca consultas

**Papel:** Após o dentista virar cliente Cíbrido, o Agendador atua no WhatsApp da CLÍNICA (não da Cíbrido). Ele atende os pacientes da clínica e agenda consultas automaticamente.

**Onde vai atuar:**
- WhatsApp do cliente (via Evolution API)
- Conectado à agenda do CRM

**O que faz:**
1. Recebe mensagem do paciente
2. Identifica: paciente novo ou retorno?
3. Pergunta qual tratamento/procedimento
4. Consulta horários disponíveis na agenda do CRM
5. Marca a consulta
6. Envia confirmação pro paciente
7. Registra no CRM automaticamente (pipeline + agenda)

**Treinamentos necessários:**
- Procedimentos da clínica (configurável por cliente)
- Convênios aceitos (configurável por cliente)
- Horários de atendimento (puxa do CRM)
- Regras de agendamento (intervalo entre consultas, etc.)
- Tom de voz humanizado (não pode parecer robô)
- Nunca falar de preços (direcionar pra clínica)

**Decisão técnica:** O Agendador pode ser criado no GPT Maker (prototipagem rápida) e depois migrado pra n8n (produção com mais controle). O GPT Maker é bom pra testar o comportamento, o n8n é melhor pra produção com health check e monitoramento.

### 2.4 Ações imediatas — Agentes

| Ação | Quando |
|------|--------|
| Deletar Juliano duplicado no GPT Maker | Agora |
| Adicionar treinamento sede Diadema | Agora |
| Configurar ações de inatividade do Juliano | Agora |
| Conectar Juliano ao site (widget) | Quando site estiver pronto |
| Projetar Agendador no GPT Maker | V2 |
| Conectar Agendador ao WhatsApp do cliente | V3 |
| Migrar agentes pro n8n | V3 |

---

## PARTE 3: ONBOARDING DO CLIENTE PAGANTE

### Jornada completa
```
PAGAMENTO (Asaas) → EMAIL BOAS-VINDAS → 1º ACESSO → SETUP (2min) → TOUR GUIADO → USO
```

### Passo a passo

1. **Asaas confirma pagamento** → webhook → n8n
2. **n8n cria:** usuário no Supabase + clínica no banco + envia email
3. **Email:** link de acesso + credenciais + plano ativo
4. **Primeiro acesso:** cria senha → onboarding (nome clínica + telefone + origens de lead)
5. **Tour guiado:** 5 passos mostrando Leads, Pipeline, Agenda, Recall, Tráfego
6. **Dados de exemplo:** 3 pacientes fictícios no pipeline pra entender o fluxo
7. **Botão "Limpar e começar"** quando estiver pronto

---

## PARTE 4: CICLO DE INADIMPLÊNCIA

### Timeline completo

| Dia | Status | Ação | CRM |
|-----|--------|------|-----|
| 0 | 🟢 Ativo | Pagamento OK | Normal |
| 1 | 🟡 Vencido | WhatsApp lembrete | Normal |
| 3 | 🟡 Vencido | Email + WhatsApp | Normal + banner amarelo |
| 5 | 🟠 Carência | WhatsApp firme | Normal + banner laranja |
| 7 | 🟠 Carência | Último aviso | Normal + banner vermelho |
| 10 | 🔴 Bloqueado | Acesso suspenso | Tela de bloqueio |
| 15 | 💜 Winback | Contato humano (Ricardo) | Bloqueado |
| 30 | 💜 Winback | Oferta 20% desconto | Bloqueado |
| 60 | 💜 Winback | Aviso exclusão em 30 dias | Bloqueado |
| 90 | ⚫ Cancelado | Dados excluídos | Conta deletada |

### Regras inegociáveis
- Cliente NUNCA perde dados sem aviso (90 dias de preservação)
- Bloqueio é REVERSÍVEL (pagou → voltou instantaneamente)
- Cliente pode EXPORTAR dados mesmo bloqueado
- Comunicação é firme mas RESPEITOSA
- Contato de winback é HUMANO (Ricardo), não robô

### Automação (n8n)
```
Asaas "payment.overdue" → n8n → lembretes → bloqueio → winback
Asaas "payment.received" → n8n → status "active" → desbloqueia CRM
```

---

## PARTE 5: CÍBRIDO AUTOIMUNE — MONITORAMENTO 24H

### Conceito

Assim como o sistema imunológico do corpo humano detecta invasores e se repara, o Cíbrido Autoimune:
1. **Detecta falhas** em qualquer componente do ecossistema
2. **Diagnostica** usando a SKILL como memória imunológica
3. **Corrige** automaticamente quando possível
4. **Alerta** o Davi quando precisa de intervenção humana

### Componentes monitorados

| Componente | Health check | Frequência | Auto-fix |
|-----------|-------------|-----------|---------|
| CRM (crm.cibrido.com.br) | Verifica se responde 200 | A cada 5 min | Restart Vercel deploy |
| Supabase (banco) | Query test | A cada 15 min | Alerta Davi |
| Evolution API (WhatsApp) | Status da instância | A cada 10 min | Restart instância |
| n8n (automações) | Verifica workflows ativos | A cada 30 min | Restart workflow |
| GPT Maker (agentes) | Verifica se Juliano responde | A cada 1h | Alerta Davi |
| Asaas (billing) | Verifica webhooks | A cada 1h | Alerta Davi |
| Meta Ads API | Verifica última sync | A cada 4h | Re-autenticar |
| DNS (Cloudflare) | Resolve crm.cibrido.com.br | A cada 1h | Alerta Davi |

### Fluxo de detecção e resposta

```
[Health Check] → [FALHA DETECTADA]
       │
       ├── Nível 1 (auto-fix): restart, re-deploy, re-sync
       │   └── Se resolveu → log + continua monitorando
       │
       ├── Nível 2 (SKILL): consulta catálogo de erros
       │   └── Erro conhecido → aplica solução documentada
       │
       ├── Nível 3 (alerta): WhatsApp pro Davi
       │   └── "⚠️ CRM fora do ar há 10 min. Não consegui resolver. Preciso de ajuda."
       │
       └── Nível 4 (cliente): se afetar cliente
           └── Mensagem automática: "Estamos realizando uma manutenção rápida. Voltamos em instantes."
```

### Implementação técnica (n8n)

Cada health check é um workflow no n8n:
1. **HTTP Request** pra URL do componente
2. **IF** status != 200 → dispara ação
3. **Ação Nível 1:** tenta auto-fix (restart, re-deploy)
4. **Ação Nível 2:** consulta SKILL (arquivo de erros/soluções)
5. **Ação Nível 3:** envia WhatsApp pro Davi
6. **Log:** registra tudo num banco de logs pra análise posterior

### Dashboard Autoimune (futuro)

Tela no CRM (acesso só Cíbrido, não cliente) que mostra:
- Status de cada componente (🟢🟡🔴)
- Uptime dos últimos 30 dias
- Incidentes detectados e resolvidos
- Tempo médio de resposta/correção

---

## PARTE 6: INTEGRAÇÕES TÉCNICAS

### API do CRM (V2)

Endpoint pra receber leads de fontes externas:
```
POST /api/leads
Headers: x-api-key: {chave-da-clinica}
Body: { name, phone, email, origin, utm_source, utm_campaign, ... }
Response: { success: true, lead_id: "uuid" }
```

Endpoint pra receber dados de campanhas:
```
POST /api/campaigns
Headers: x-api-key: {chave-da-clinica}
Body: { campaign_name, ad_name, placement, creative_url, spend, reach, impressions, clicks, cpc, results }
Response: { success: true }
```

### Webhook de saída (V3)

O CRM envia webhook quando eventos acontecem:
```
Lead criado → POST webhook → n8n → automação
Lead mudou etapa → POST webhook → Conversions API Meta
Consulta agendada → POST webhook → lembrete WhatsApp
Lead perdido → POST webhook → campanha reengajamento
```

### Configurações > Integrações (V2)

- API Key por clínica (gerada automaticamente)
- Webhook URL (copiar e colar no n8n)
- Status Meta Ads (conectado/desconectado)
- Status Google Ads (conectado/desconectado)
- Última sincronização

---

## PARTE 7: ROADMAP DE EXECUÇÃO

### V2 — 4-6 semanas

**Semana 1-2:**
- API /api/leads + /api/campaigns + API Key por clínica
- Campos novos no banco (subscription_status, plan, api_key)
- Middleware de bloqueio por inadimplência + tela de bloqueio
- Banners de aviso (amarelo, laranja, vermelho)

**Semana 2-3:**
- Tráfego Pago com dados reais (tabela completa com 9 colunas)
- Workflow n8n: Meta Ads → CRM (sync a cada 4h)
- CibridoTrack: links rastreáveis (crm.cibrido.com.br/t/)
- Configurações > Integrações

**Semana 3-4:**
- Onboarding em 3 passos + tour guiado + dados de exemplo
- Convite de equipe corrigido (RLS + listagem + limite por plano)
- Agenda estilo Google Calendar
- Workflow n8n: Asaas → lembretes → bloqueio → winback

**Semana 4-5:**
- Dark/Light mode
- WhatsApp direto nos leads (botão wa.me)
- Recall com contagem regressiva
- Confirmação por email no cadastro (template Cíbrido)

**Semana 5-6:**
- Testes com Ricardo como primeiro cliente
- Correções de feedback
- Deploy final V2

### V3 — 6-8 semanas (após V2)

- WhatsApp integrado (Evolution API + Z-API fallback)
- Agente Agendador conectado ao CRM
- CibridoTrack: retroalimentação Meta Ads (Conversions API)
- OAuth Meta/Google pra dentista conectar sozinho
- Notificações real-time (WebSocket)
- Asaas integrado no painel
- Multi-pipeline
- Portal do paciente
- Relatórios PDF
- **Cíbrido Autoimune: monitoramento 24h de todos os componentes**
- Dashboard Autoimune (painel de status interno)
- Módulo de Serviços com valores (R$)
- Dashboard com faturamento real

---

## PARTE 8: ANÁLISE CRÍTICA — RISCOS E PREVENÇÃO

| Risco | Prevenção |
|-------|-----------|
| Meta muda API | Camada n8n absorve sem tocar no CRM |
| Email cai no spam | SPF/DKIM + fallback WhatsApp |
| Cliente não entende | Tour guiado + dados de exemplo |
| Bloqueio agressivo demais | 10 dias carência + contato humano |
| Dados perdidos | 90 dias preservação + exportar |
| n8n fora do ar | Cíbrido Autoimune monitora e reinicia |
| WhatsApp desconecta | Health check a cada 10 min + auto-restart |
| Webhook duplicado | Idempotência (verifica se lead existe) |
| Agente GPT Maker cai | Health check a cada 1h + alerta |
| Tintim como concorrente | CibridoTrack é nativo, sem custo extra |

---

*Documento criado em 07/04/2026 — Cíbrido Soluções em IA*
*Ecossistema: CRM + CibridoTrack + Cíbrido Autoimune + Agentes IA*
*"Se não está no PRD, não vai pro código."*
