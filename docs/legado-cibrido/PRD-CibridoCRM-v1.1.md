# PRD CibridoCRM — V1 FINALIZADA
## Documento de Requisitos de Produto — Atualizado
### Versão: 1.1 | Data: 07/04/2026
### Autor: Livelis (Claude) + Davi Junior

---

## 1. VISÃO GERAL

### O que é o CibridoCRM
Sistema SaaS de gestão de leads para clínicas odontológicas. Seu propósito é **lotar a agenda do dentista** através do controle de pacientes vindos do marketing digital (tráfego pago) e tradicional (prospecção de rua).

**O CRM NÃO é:** prontuário clínico, sistema de atendimento, software odontológico. Ele cuida do ANTES — captar, acompanhar, agendar, reconvocar.

### Duas faces operacionais
1. **Face Cíbrido (interno):** linguagem de marketing — leads, pipeline, conversão, CPL
2. **Face Dentista (SaaS):** linguagem do consultório — pacientes, jornada, consultas, retornos

### URL de produção
- **CRM:** https://crm.cibrido.com.br
- **GitHub:** https://github.com/davilivelis/cibrido-crm
- **Branch:** master

---

## 2. STACK TÉCNICO

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) |
| UI | TailwindCSS + shadcn/ui |
| Backend | Supabase (Auth + Database + RLS) |
| Deploy | Vercel |
| Domínio | crm.cibrido.com.br (Cloudflare DNS → Vercel) |
| Banco | PostgreSQL (Supabase, região São Paulo) |

### Credenciais
- **Supabase URL:** https://cktvqvsxogdzeikvoajz.supabase.co
- **ANON_KEY:** [REDACTED - use .env.local]
- **SERVICE_ROLE_KEY:** [REDACTED - use .env.local]
- **Admin:** livelisdigital@gmail.com / [REDACTED]

---

## 3. FUNCIONALIDADES V1 — ENTREGUES ✅

### 3.1 Autenticação e Onboarding
- ✅ Login com abas Entrar/Cadastrar (split-screen, logo Cíbrido, headline 3 linhas)
- ✅ Cadastro sem confirmação de email (entra direto)
- ✅ Onboarding simplificado (nome da clínica + telefone)
- ✅ Logout no dropdown do avatar
- ✅ Multi-tenant com RLS (clínica A não vê dados da clínica B)
- ✅ Middleware de redirecionamento (não logado → login, sem clínica → onboarding)

### 3.2 Dashboard
- ✅ 4 KPIs: Leads Ativos, Taxa de Conversão, Consultas Marcadas, Conversas WhatsApp
- ✅ Gráfico "Leads por Etapa" (barras coloridas por etapa do funil)
- ✅ Atividade Recente (timeline de ações)
- ✅ Subtítulo: "Acompanhe seus leads e consultas agendadas"

### 3.3 Leads
- ✅ Tabela com busca por nome/telefone/email
- ✅ Filtros por etapa, origem, status
- ✅ Criar novo lead (modal)
- ✅ Editar lead (inline na página de detalhe)
- ✅ Excluir lead (botão vermelho com dialog de confirmação)
- ✅ Importar/Exportar CSV
- ✅ Página de detalhe do lead (/leads/[id])
- ✅ Registrar atividade (Nota, Ligação, WhatsApp)
- ✅ Agendar consulta dentro do lead
- ✅ Histórico de atividades

### 3.4 Pipeline Kanban
- ✅ 8 colunas: Novo Lead → Contato Iniciado → Qualificado → Agendamento Pendente → Consulta Marcada → Compareceu → Venda Realizada → Perdido
- ✅ Drag-and-drop (desktop + touch mobile)
- ✅ Cards com nome, telefone, origem
- ✅ Modal Trello ao clicar no card
- ✅ Etapa mostrando NOME (não UUID)

### 3.5 Agenda
- ✅ Lista de consultas agendadas
- ✅ Empty state: "Nenhuma consulta agendada"
- ✅ Consultas criadas dentro do cadastro de cada lead

### 3.6 Conversas
- ✅ Preparado para WhatsApp (Evolution API)
- ✅ Empty state explicando que aparecerá quando WhatsApp conectar
- ⏳ Integração real → V2/V3

### 3.7 Tráfego Pago
- ✅ 4 métricas em funil: Verba Mensal → Cliques Link → Leads Gerados → CPL
- ✅ Cadastro de campanhas manuais
- ✅ Empty state com orientação
- ⏳ Webhook + UTM automático → V2

### 3.8 Recall
- ✅ Lista de recalls com filtros (Todos, Pendentes, Contactados, Agendados, Concluídos, Cancelados)
- ✅ Novo Recall
- ✅ Empty state com orientação

### 3.9 Configurações
- ✅ Dados da clínica (nome, telefone, email, endereço)
- ✅ Plano atual: Trial (10 dias grátis)
- ✅ Equipe: "Gerenciamento disponível em breve" (V2)
- ✅ Toast "Salvo com sucesso" ao salvar

### 3.10 Visual e UX
- ✅ Design System Cíbrido (magenta #E91E7B, dourado #F5A623, roxo #7B2D8E, navy #1E2A3A)
- ✅ Logo balões entrelaçados (sem fundo, transparente)
- ✅ Fundo de rede sutil no login (textura tecnológica)
- ✅ Favicon personalizado
- ✅ Título da aba "CibridoCRM" (com template por página)
- ✅ Toasts de confirmação em toda ação (Sonner)
- ✅ Loading spinners nos botões
- ✅ Empty states amigáveis em todas as telas vazias
- ✅ Página 404 personalizada em português
- ✅ Responsivo mobile (menu hamburguer, drawer, cards adaptados)
- ✅ 100% em português (zero inglês)

---

## 4. O QUE FICOU PARA V2

### Funcionalidades
- [ ] Convite de equipe (correção RLS + listagem de membros + limite por plano)
- [ ] Módulo de Serviços com valores (R$)
- [ ] Dashboard com faturamento (R$)
- [ ] Agenda estilo Google Calendar (mensal/semanal)
- [ ] Dark/Light mode toggle
- [ ] Recall com contagem regressiva ("Faltam X dias")
- [ ] WhatsApp direto nos leads (botão wa.me)
- [ ] Tour guiado primeiro acesso
- [ ] Email personalizado Cíbrido
- [ ] Logo tratada (versão só balões em SVG)
- [ ] Tráfego Pago: webhook + UTM automático
- [ ] Confirmação por email no cadastro (com template Cíbrido)

### Técnico
- [ ] Soft delete em vez de hard delete
- [ ] Otimização de queries (índices)
- [ ] Logs de auditoria
- [ ] Testes automatizados

---

## 5. O QUE FICOU PARA V3

- [ ] WhatsApp integrado (Evolution API + health check, Z-API fallback)
- [ ] Agentes IA conectados ao CRM (Juliano SDR + Agendador)
- [ ] Notificações real-time (WebSocket)
- [ ] Integração Asaas no painel (cobrança automática)
- [ ] Multi-pipeline (funis personalizados)
- [ ] Portal do paciente
- [ ] Relatórios avançados

---

## 6. PLANOS E PREÇOS

| Plano | Preço | Slogan |
|-------|-------|--------|
| Cibri-Lite | R$ 497/mês | "Nunca mais perca um paciente" |
| Cibri-Standard | R$ 897/mês | "Agenda sempre cheia!" |
| Cibri-Master | R$ 1.497/mês | "Gestão completa com IA" |

Billing via **Asaas** (integração V3).

---

## 7. PALETA DE CORES

| Cor | Hex | Uso |
|-----|-----|-----|
| Magenta/Pink | #E91E7B | Primária, CTAs, destaques |
| Dourado | #F5A623 | Acentos, badges |
| Roxo | #7B2D8E | Intersecção logo, acentos |
| Navy | #1E2A3A | Fundo escuro, sidebar, login |
| Branco | #FFFFFF | Texto sobre escuro |
| Off-white | #F8F9FB | Fundo das páginas internas |

---

## 8. DOMÍNIO E DNS

| Item | Valor |
|------|-------|
| Domínio | cibrido.com.br (Registro.br) |
| DNS | Cloudflare (emma/keenan.ns.cloudflare.com) |
| CRM | crm.cibrido.com.br → CNAME → cname.vercel-dns.com |
| Site | cibrido.com.br → a configurar (V2) |

---

*PRD atualizado em 07/04/2026 — Cíbrido Soluções em IA*
