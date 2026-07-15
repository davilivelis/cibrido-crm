# PRD CibridoCRM — V1.2
## Documento de Requisitos de Produto
### Versão: 1.2 | Data: 17/04/2026
### Autor: Livelis (Claude) + Davi Junior

---

## 1. VISÃO GERAL

### O que é o Sistema Cíbrido

A Cíbrido Soluções em IA oferece um ecossistema completo para clínicas odontológicas:
- **Dois Agentes de IA** (Juliano + Lorena) que operam no WhatsApp da Cíbrido para qualificar e agendar dentistas interessados
- **CRM SaaS** vendido às clínicas para gestão de leads e pacientes
- **Painel Interno Cíbrido** para controle comercial e operacional da própria empresa

### O que cada sistema faz

| Sistema | Usuário | Propósito |
|---|---|---|
| CRM Dentista (`crm.cibrido.com.br`) | O dentista cliente | Lotar a agenda: captar, acompanhar, agendar, reconvocar pacientes |
| Painel Interno Cíbrido | Davi + Ricardo (admins) | Gerenciar leads da Cíbrido, status de assinaturas, acesso dos clientes |
| Agentes Juliano + Lorena | Operados pela Cíbrido | Qualificar e agendar dentistas interessados no sistema |

> **Regra permanente:** CRM Dentista ≠ Painel Interno Cíbrido. São sistemas distintos com usuários, fluxos e KPIs diferentes. Nunca misturar o código de negócio dos dois.

> **Exceção validada:** A Cíbrido pode usar o próprio CRM do dentista internamente para testar o produto e coletar feedback. Quando isso acontecer, documentar as limitações como feedback de produto.

### O que o CRM NÃO é
Não é prontuário clínico, sistema de atendimento odontológico, software de faturamento clínico. Cuida do **ANTES** — captar, acompanhar, agendar, reconvocar.

### URLs de produção
- **CRM Dentista:** https://crm.cibrido.com.br
- **Landing Page:** https://cibrido.com.br/clinica-odontologica
- **GitHub:** https://github.com/davilivelis/cibrido-crm (branch: master)

---

## 2. ARQUITETURA DE AGENTES — FUNCIONÁRIOS CÍBRIDO

### Conceito central
Juliano e Lorena são **funcionários da Cíbrido**, não ferramentas entregues ao cliente. Eles operam no ecossistema da Cíbrido e fazem o processo comercial acontecer automaticamente.

### Agente Juliano — SDR da Cíbrido
- **Plataforma:** n8n + OpenAI API (migrado do GPT Maker)
- **Canal:** WhatsApp da Cíbrido (11) 96034-1082 via Evolution API
- **Função:** Atender TODOS os primeiros contatos de dentistas interessados. Aplicar metodologia SPIN Selling. Fazer lead scoring para identificar o perfil ideal de cliente.
- **Output:** Lead qualificado com score → aciona Lorena
- **Valor estratégico:** O dentista que chega à call com Ricardo/Davi já foi qualificado pelo Juliano. O próprio processo é a demonstração do produto.

### Agente Lorena — Agendadora da Cíbrido
- **Plataforma:** n8n + OpenAI API (migrado do GPT Maker)
- **Canal:** WhatsApp da Cíbrido, acionada pelo Juliano após qualificação
- **Função:** Agendar call entre o dentista qualificado e Ricardo ou Davi
- **Output:** Agendamento disparado simultaneamente para:
  1. Painel Interno Cíbrido (registro do lead + data/hora da call)
  2. Google Calendar cibrido@gmail.com (acesso compartilhado Davi + Ricardo)
- **Regra de notificação:** Ambos (Davi e Ricardo) recebem o agendamento. Visibilidade 100% compartilhada entre os dois administradores.

### Fluxo completo do processo comercial
```
[Dentista vê anúncio / QR code panfleto]
        ↓
[cibrido.com.br/clinica-odontologica]
  → Pixel: ViewContent (rolou até #planos)
  → Pixel: Lead (clicou no WhatsApp)
        ↓
[WhatsApp Cíbrido — Agente Juliano]
  → SPIN Selling
  → Lead scoring
  → Qualificado? → aciona Lorena
        ↓
[Agente Lorena]
  → Agenda call com Ricardo ou Davi
  → Dispara para CRM interno Cíbrido + Google Calendar
        ↓
[Call comercial — Ricardo ou Davi]
  → Demo ao vivo do CRM
  → Fecha plano
        ↓
[Dentista cria conta em crm.cibrido.com.br]
  → Pixel: CompleteRegistration
  → Admin Cíbrido ativa período trial (10 dias)
  → Agente exclusivo treinado para a clínica em até 7 dias
        ↓
[Dentista usa CRM + Agente exclusivo por 10 dias]
        ↓
[Assina plano pago → Asaas libera acesso permanente]
```

---

## 3. TRIAL DE 10 DIAS — PROTOCOLO

### Modelo
Cada dentista que entra no trial recebe um agente de IA **exclusivo e treinado para a clínica dele** (procedimentos, convênios, tom, objeções dos pacientes).

### Por que isso importa (retenção estrutural)
Ao final do trial, o dentista não está abandonando um software — está abandonando um agente que já conhece a clínica dele. Cancelar vai doer.

### Documento de onboarding (entregue pelo dentista no início do trial)
O dentista preenche antes de ativar o agente exclusivo:

| Campo | Exemplo |
|---|---|
| Nome da clínica | Odonto Silva |
| Endereço | Rua X, 100 — Diadema/SP |
| WhatsApp da clínica | (11) 99999-9999 |
| Procedimentos atendidos | Implante, clareamento, ortodontia |
| Atende convênio? | Sim: Unimed, SulAmérica / Não |
| Horário de funcionamento | Seg-Sex 8h-18h / Sab 8h-12h |
| Tom de atendimento | Formal / Informal |
| Objeções mais comuns | "Está caro", "Vou pensar" |
| O que NÃO pode falar | Não mencionar preços sem consultar |

### SLA de entrega
**7 dias** após o dentista entregar o documento preenchido.

### Quem treina o agente
- **Fase inicial (até ~5 clientes):** Treinamento supervisionado pelo Davi
- **Evolução:** Processo semi-automatizado com checklist de qualidade
- **Meta futura:** IA se auto-melhora a partir dos históricos — validação ainda necessária

### Gate de qualidade obrigatório (V1)
Antes de ativar o agente exclusivo para qualquer cliente, Davi valida o resultado. Nenhum agente vai a ar sem aprovação manual enquanto o processo não estiver provado.

---

## 4. STACK TÉCNICO

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.x (App Router) |
| UI | TailwindCSS + shadcn/ui |
| Backend | Supabase (Auth + Database + RLS) |
| Deploy | Vercel (projeto: cibrido-crm, branch: master) |
| Domínio principal | cibrido.com.br (Cloudflare DNS) |
| Domínio CRM | crm.cibrido.com.br (CNAME → Vercel) |
| Banco | PostgreSQL (Supabase, região São Paulo) |
| Agentes IA | n8n + OpenAI API (Hetzner VPS + EasyPanel) |
| WhatsApp | Evolution API (Hetzner VPS) |
| Automação | n8n |
| Billing | Asaas (cartão recorrente + PIX + boleto) |
| Analytics | GA4 (G-9R56EDXRY5) |
| Pixel | Meta Pixel (1246668694114760) |
| Emails | cibrido.com.br via Hostgator (MX + SPF + DKIM) |
| Calendar | cibrido@gmail.com (Google Calendar compartilhado) |

### Credenciais e IDs
- **Supabase URL:** https://cktvqvsxogdzeikvoajz.supabase.co
- **Supabase Admin:** livelisdigital@gmail.com
- **Meta Pixel ID:** 1246668694114760 (domínio cibrido.com.br verificado ✅)
- **GA4 ID:** G-9R56EDXRY5
- **WhatsApp Cíbrido:** (11) 96034-1082

---

## 5. INFRAESTRUTURA — STATUS

| Item | Status |
|---|---|
| GitHub → Vercel conectado | ✅ 16/04/2026 |
| Meta Pixel instalado (landing + CRM) | ✅ 16/04/2026 |
| Domínio cibrido.com.br verificado no Meta | ✅ 16/04/2026 |
| Eventos Pixel: ViewContent, Lead, CompleteRegistration, CRM_Login | ✅ 16/04/2026 |
| Migration 005_fix_grants.sql aplicada no Supabase | ✅ 16/04/2026 |
| Emails profissionais (davijunior@, ricosouza@, suporte@cibrido.com.br) | ✅ 17/04/2026 |
| DNS Cloudflare limpo (registros Lovable removidos) | ✅ 17/04/2026 |
| proxy.ts ativo (proteção de rotas + separação CRM/landing) | ✅ 17/04/2026 |
| Migration 006_admin_invites.sql (tabelas: invites, subscriptions, cibrido_leads, cibrido_calls) | ✅ 17/04/2026 |
| Painel Interno Cíbrido MVP ao vivo (/admin) | ✅ 17/04/2026 |
| Sistema de convites: token único expirante + /convite/[token] | ✅ 17/04/2026 |
| Asaas webhook endpoint /api/webhooks/asaas (aguardando conta) | ✅ endpoint pronto |
| Supabase Site URL → crm.cibrido.com.br (email reset corrigido) | ✅ 17/04/2026 |
| crm.cibrido.com.br verificado no Meta | 🔴 Pendente |
| Asaas conta criada + env vars configurados | 🔴 Pendente |
| Domínio crm.cibrido.com.br no Meta BM | 🔴 Pendente |

---

## 6. FUNCIONALIDADES V1 — ENTREGUES ✅

### 6.1 Autenticação e Onboarding
- ✅ Login com abas Entrar/Cadastrar (split-screen, logo Cíbrido)
- ✅ Cadastro bloqueado — acesso por convite apenas (tab "Criar conta" mostra mensagem + botão WhatsApp)
- ✅ Onboarding simplificado (nome da clínica + telefone)
- ✅ Logout no dropdown do avatar
- ✅ Multi-tenant com RLS (clínica A não vê dados da clínica B)
- ✅ proxy.ts ativo (não logado → login / CRM não cai na landing / /admin protegido por ADMIN_EMAILS)
- ✅ Recuperação de senha: "Esqueceu a senha?" + /esqueceu-senha + /redefinir-senha (17/04/2026)
- ✅ Email de reset personalizado com branding Cíbrido (template Supabase atualizado)
- ✅ Supabase Site URL → https://crm.cibrido.com.br (corrigido 17/04/2026)
- ✅ Página /convite/[token] — dentista ativa conta via link único enviado pelo admin
- ✅ Painel Interno Cíbrido /admin — layout com sidebar, logo Cíbrido, proteção ADMIN_EMAILS
- ✅ /admin/clientes — lista de clientes com stats, toggle ativar/bloquear, modal criar convite
- ✅ /admin/convites — gestão de links de convite (criar, listar, revogar)
- ✅ /admin/pipeline — Kanban comercial Cíbrido (Lead → Qualificado → Call Agendada → Proposta Enviada → Cliente Ativo → Churned)
- ✅ /admin/calls — registro de calls comerciais
- ✅ lib/actions/admin.ts — server actions com supabaseAdmin (service_role): getAdminClients, toggleClientAccess, createInvite, getCibridoLeads, getCibridoCalls
- ✅ /api/webhooks/asaas — endpoint pronto para auto-gerar convite ao confirmar pagamento

### 6.2 Dashboard
- ✅ 4 KPIs: Leads Ativos, Taxa de Conversão, Consultas Marcadas, Conversas WhatsApp
- ✅ Gráfico Leads por Etapa
- ✅ Atividade Recente (timeline)

### 6.3 Leads
- ✅ Tabela com busca e filtros
- ✅ Criar, editar, excluir lead
- ✅ Importar/Exportar CSV
- ✅ Página de detalhe (/leads/[id])
- ✅ Registrar atividade (Nota, Ligação, WhatsApp)
- ✅ Agendar consulta dentro do lead
- ✅ Histórico de atividades

### 6.4 Pipeline Kanban
- ✅ 8 colunas: Novo Lead → Contato Iniciado → Qualificado → Agendamento Pendente → Consulta Marcada → Compareceu → Venda Realizada → Perdido
- ✅ Drag-and-drop (desktop + touch mobile)
- ✅ Modal Trello ao clicar no card

### 6.5 Agenda, Conversas, Tráfego, Recall, Configurações
- ✅ Conforme documentado na V1.1 (sem alterações)

### 6.6 Rastreamento e Analytics
- ✅ GA4 instalado no layout raiz
- ✅ Meta Pixel instalado no layout raiz
- ✅ ViewContent: usuário rola até #planos na landing (IntersectionObserver 30%)
- ✅ Lead: usuário clica em qualquer link wa.me na landing (event delegation)
- ✅ CompleteRegistration: após cadastro bem-sucedido no CRM
- ✅ CRM_Login: após login bem-sucedido no CRM (evento custom)

---

## 7. ROADMAP — PRÓXIMAS VERSÕES

### V2 — CRM Dentista (produto) + Painel Interno Cíbrido

#### 7.1 CRM Dentista — melhorias
- [ ] Pipeline comercial renomeado (estágios em linguagem de clínica)
- [ ] Convite de equipe (múltiplos usuários por clínica)
- [ ] Módulo de Serviços com valores (R$)
- [ ] Dashboard com faturamento estimado
- [ ] Agenda estilo Google Calendar (mensal/semanal)
- [ ] Recall com contagem regressiva
- [ ] WhatsApp direto nos leads (botão wa.me)
- [ ] Tour guiado primeiro acesso
- [ ] Tráfego Pago: webhook + UTM automático
- [ ] Evento Pixel `CRM_Active` (3º acesso — requer contador de sessões)

#### 7.2 Painel Interno Cíbrido — MVP
Acessível apenas para Davi e Ricardo (admin-only). Construção incremental.

**MVP obrigatório — CONSTRUÍDO ✅ (17/04/2026):**
- ✅ Lista de clientes (nome, clínica, plano, status, ações ativar/bloquear)
- ✅ Status de assinatura por cliente (trial ativo / pago / bloqueado / cancelado)
- ✅ Toggle de acesso: ativar / bloquear cliente manualmente
- ✅ Registro de call (data, quem atendeu, próximo passo)
- ✅ Pipeline comercial Cíbrido: Lead → Qualificado → Call Agendada → Proposta Enviada → Cliente Ativo → Churned
- ✅ Gestão de convites: criar link único com validade, listar, revogar

**V2 do painel (após primeiros 3 clientes):**
- [ ] Histórico de interações por cliente
- [ ] Métricas comerciais (CAC, LTV, churn)
- [ ] Integração com Google Calendar (ver calls agendadas pelo Lorena)
- [ ] Controle de plano por cliente (Lite / Standard / Master)

#### 7.3 Billing e controle de acesso
- [ ] Tabela `subscriptions` no Supabase (status, plano, data_inicio, data_fim)
- [ ] Middleware verifica status da assinatura em cada requisição do CRM
- [ ] Asaas webhook → Supabase atualiza status automaticamente
- [ ] Métodos de pagamento: cartão recorrente (prioridade) + PIX + boleto
- [ ] Tela de pagamento para cliente com acesso bloqueado

### V3 — Agentes no CRM + WhatsApp integrado
- [ ] WhatsApp integrado no CRM (Evolution API + Z-API fallback)
- [ ] Agentes Cíbrido (Juliano + Lorena) conectados ao Painel Interno via n8n
- [ ] Notificações real-time (WebSocket)
- [ ] Relatórios avançados
- [ ] Multi-pipeline (funis personalizados por clínica)

---

## 8. PAINEL INTERNO CÍBRIDO — ESPECIFICAÇÃO MVP

### Quem acessa
Somente Davi Junior e Ricardo Souza. Autenticação separada ou flag `is_admin` no Supabase.

### Telas do MVP
1. **Lista de clientes** — tabela com: nome, clínica, plano, status, data de início, próxima cobrança, ações (ativar/bloquear)
2. **Detalhe do cliente** — histórico de calls, notas, documentos, status do agente exclusivo
3. **Pipeline comercial** — Kanban com estágios comerciais (prospects da Cíbrido, não pacientes de clínica)
4. **Configurações de acesso** — toggle por cliente: trial ativo / pago / bloqueado

### Linguagem do painel
Linguagem comercial e processual. Nunca linguagem de consultório dentário.

---

## 9. AGENTES IA — ESPECIFICAÇÃO (PRD SEPARADO A CRIAR)

### Status atual
- GPT Maker: cancelado ✅ (backup completo salvo em `Livelis/outputs/BACKUP-AGENTES-CIBRIDO-GPTMaker.md`)
- Plataforma destino: n8n + OpenAI API (Hetzner VPS)
- PRD de agentes: **pendente de criação**

### O que o PRD de agentes precisa cobrir
- Fluxo detalhado Juliano (SPIN + lead scoring + critérios de qualificação)
- Fluxo detalhado Lorena (agendamento + integração CRM interno + Google Calendar)
- Treinamento inicial e protocolo de auto-melhoria
- Critérios de handoff Juliano → Lorena
- Fallback: o que acontece se o agente não souber responder

---

## 10. PLANOS E PREÇOS

| Plano | Preço | Conteúdo |
|-------|-------|--------|
| Cibri-Lite | R$ 497/mês | Agente Qualificador + organização WhatsApp |
| Cibri-Standard | R$ 897/mês | Lite + Agente Agendador + 10 dias CRM grátis |
| Cibri-Master | R$ 1.497/mês | Standard + CRM completo + atendimento dedicado |

---

## 11. REGRAS DE COPY (PERMANENTES)

- "clínica odontológica" (nunca só "clínica")
- "Agente de IA" (nunca "robô")
- "Sistema Cíbrido" (nunca "Tecnologia GPT-4")
- Copy sempre resultado/benefício, nunca ferramentas
- Botão CTA: "Agende o seu Diagnóstico Gratuito"

---

## 12. PALETA DE CORES

| Cor | Hex | Uso |
|-----|-----|-----|
| Magenta | #E91E7B | Primária, CTAs, destaques |
| Dourado | #F5A623 | Acentos, badges |
| Roxo | #7B2D8E | Intersecção logo, acentos |
| Navy | #1E2A3A | Fundo escuro, sidebar, login |
| Branco | #FFFFFF | Texto sobre escuro |
| Off-white | #F8F9FB | Fundo das páginas internas |

---

## 13. DOMÍNIO, DNS E EMAILS

| Item | Valor | Status |
|------|-------|--------|
| Domínio | cibrido.com.br (Registro.br) | ✅ |
| DNS | Cloudflare (emma/keenan.ns.cloudflare.com) | ✅ |
| CRM | crm.cibrido.com.br → CNAME → cname.vercel-dns.com | ✅ |
| Landing | cibrido.com.br → A → 76.76.21.21 (Vercel) | ✅ |
| Redirect raiz | cibrido.com.br → /clinica-odontologica (301) | ✅ |
| Email Davi | davijunior@cibrido.com.br | ✅ |
| Email Ricardo | ricosouza@cibrido.com.br | ✅ |
| Email suporte | suporte@cibrido.com.br | ✅ |
| SPF | v=spf1 include:hostgator.com ~all | ✅ |
| DKIM | Configurado via Cloudflare | ✅ |
| Calendar | cibrido@gmail.com (compartilhado Davi + Ricardo) | ✅ |

---

*PRD atualizado em 17/04/2026 — Cíbrido Soluções em IA*
*Versão anterior: PRD-CibridoCRM-v1.1.md (07/04/2026)*
