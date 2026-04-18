# PRD — Painel Admin Cíbrido
> Versão 1.0 — 18/04/2026
> Autor: Livelis (desenvolvedor de produto)
> Aprovação necessária: Davi Junior

---

## 1. PROBLEMA

O Painel Admin atual é um MVP sem PRD — construído no improviso em 17/04/2026. Existe como espelho parcial do CRM do dentista, mas faltam as funcionalidades operacionais que Davi e Ricardo precisam para gerir clientes, controlar acessos e tomar decisões comerciais com dados reais.

**Dores atuais:**
- Não existe tela de detalhes do cliente — só lista com nome e plano
- Não é possível copiar o link de convite (ação manual, gera erro)
- Não existe exclusão de convite — só revogação
- Nenhuma notificação quando cliente ativa a conta
- Sem dados cadastrais completos por cliente
- Sem histórico de ações por cliente
- Sem integração com plataformas de tráfego pago
- Sem mensagem de boas-vindas personalizada Cíbrido

---

## 2. USUÁRIOS

| Usuário | Quem é | O que precisa |
|---|---|---|
| **Davi Junior** | Estratégia + tecnologia | Visão operacional, controle de acessos, dados de produto |
| **Ricardo Souza** | Comercial + presencial | Pipeline de leads, histórico de calls, status de clientes |

**Acesso:** exclusivo — protegido por `ADMIN_EMAILS` env var. Nenhum cliente dentista acessa.

---

## 3. ESCOPO V1.1 — O QUE ENTRA (5 dias)

### 3.1 /admin/clientes — Lista melhorada
- [x] Toggle ativo/inativo (já existe)
- [ ] Busca por nome da clínica
- [ ] Filtro por plano (Lite / Standard / Master)
- [ ] Filtro por status (ativo / inativo)
- [ ] Coluna "último acesso" (data do último login)
- [ ] Botão "Ver detalhes" → /admin/clientes/[id]

### 3.2 /admin/clientes/[id] — Tela de detalhes ← NOVA
**Dados cadastrais:**
- Nome da clínica
- Email do owner
- Telefone
- Plano atual + data de início
- Status da assinatura (ativo / inadimplente / cancelado)
- Data de cadastro

**Métricas de uso:**
- Total de leads cadastrados
- Total de agendamentos
- Último login (data e hora)
- Número de usuários na conta

**Histórico / timeline:**
- Quando foi criada a conta
- Quando ativou o convite
- Mudanças de plano (futuro)
- Anotações internas (Davi/Ricardo podem adicionar)

**Ações:**
- Toggle ativo/inativo
- Enviar novo convite
- Adicionar anotação interna

### 3.3 /admin/convites — Melhorias
- [x] Criar convite (já existe)
- [x] Revogar convite (já existe)
- [ ] **Copiar link do convite** (botão com feedback visual "Copiado!")
- [ ] **Excluir convite** (remove permanentemente — diferente de revogar)
- [ ] Badge de status colorido (pendente / usado / revogado / expirado)
- [ ] Coluna "expira em" com dias restantes

### 3.4 Notificações internas ← NOVA
- [ ] Quando cliente aceitar convite e ativar conta → notificação no painel admin
- [ ] Banner/badge no menu "Clientes" indicando nova ativação

### 3.5 Mensagem de boas-vindas personalizada ← NOVA
- [ ] Email automático enviado quando dentista ativa a conta via convite
- [ ] Template: logo Cíbrido + texto de boas-vindas + link para o CRM + contato suporte
- [ ] Enviado via Supabase Auth hook ou server action pós-ativação

---

## 4. O QUE NÃO ENTRA NA V1.1

| Item | Motivo | Versão |
|---|---|---|
| Integração Meta Ads / Google Ads | Requer OAuth por plataforma — complexidade alta | V2 |
| Dashboard financeiro (MRR, churn, LTV) | Depende do Asaas estar configurado | V2 |
| Gestão de webhooks | Sem demanda imediata | V2 |
| Relatório exportável por cliente | Prioridade baixa agora | V2 |
| Chat interno Davi↔Ricardo | ClickUp cobre isso | V3 |

---

## 5. FLUXO DE EXPERIÊNCIA — JORNADA DO ADMIN

### Cenário A — Novo cliente (fluxo completo)
```
Admin acessa /admin/convites
→ Clica "Novo convite"
→ Preenche email + plano + validade
→ Convite criado → link gerado
→ Clica "Copiar link" → feedback "Copiado!" ✓
→ Cola no WhatsApp ou email para o cliente
→ Cliente abre link → ativa conta
→ Admin vê notificação no painel "Nova ativação: Clínica X"
→ Cliente recebe email de boas-vindas automático
→ Admin acessa /admin/clientes → vê novo cliente na lista
→ Clica "Ver detalhes" → visualiza dados cadastrais + uso
```

### Cenário B — Gerenciar cliente existente
```
Admin acessa /admin/clientes
→ Filtra por plano ou busca por nome
→ Clica "Ver detalhes" em um cliente
→ Vê: dados cadastrais, métricas de uso, histórico
→ Adiciona anotação interna (ex: "Ricardo ligou em 20/04, interesse em upgrade")
→ Ou: desativa acesso temporariamente com toggle
```

### Cenário C — Pipeline + Call (já existe, mantém)
```
/admin/pipeline → Kanban comercial Cíbrido (leads próprios)
/admin/calls   → Histórico de reuniões comerciais
```

---

## 6. BANCO DE DADOS — MUDANÇAS NECESSÁRIAS

### 6.1 Tabela existente: `clinic_invites` (migration 006)
Adicionar coluna:
```sql
ALTER TABLE clinic_invites ADD COLUMN deleted_at TIMESTAMPTZ;
```
Convite "excluído" = soft delete (deleted_at preenchido). Não aparece mais na lista.

### 6.2 Nova tabela: `admin_notes`
```sql
CREATE TABLE admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: somente admin lê e escreve (via service role key)
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
```

### 6.3 Nova tabela: `admin_notifications`
```sql
CREATE TABLE admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'clinic_activated', 'payment_failed', etc.
  clinic_id UUID REFERENCES clinics(id),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
```

### 6.4 Trigger: notificação automática na ativação
```sql
-- Quando um convite for marcado como usado → cria notificação
CREATE OR REPLACE FUNCTION notify_admin_on_clinic_activation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_notifications (type, clinic_id, message)
  VALUES ('clinic_activated', NEW.clinic_id,
    'Nova clínica ativou a conta via convite: ' || NEW.clinic_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 7. SEGURANÇA — CHECKLIST OBRIGATÓRIO

```
□ Todas as novas tabelas com RLS ativado
□ Admin usa service role key (bypass RLS intencional — correto)
□ Nenhum dado de cliente A acessível pelo cliente B
□ admin_notes: somente admins leem/escrevem (nunca exposto ao dentista)
□ admin_notifications: somente admins leem
□ Migrations testadas localmente antes de aplicar em prod
□ Variável ADMIN_EMAILS protegida — nunca exposta no frontend
□ Soft delete em convites (nunca hard delete — auditoria)
□ Email de boas-vindas não expõe dados sensíveis
```

---

## 8. MOBILE — CHECKLIST OBRIGATÓRIO

```
□ /admin/clientes: tabela com scroll horizontal em mobile (min-w com overflow-x-auto)
□ /admin/clientes/[id]: layout em coluna única em mobile
□ Botão "Copiar link": toque mínimo 44px altura
□ Timeline de histórico: legível em 375px
□ Notificações: badge visível no menu mobile
□ Testado em: 320px · 375px · 412px · 768px · 1280px+
```

---

## 9. IDENTIDADE VISUAL — PADRÃO CÍBRIDO

- Sidebar: Navy `#1E2A3A` + active Magenta `#E91E7B` (igual ao CRM)
- Logo: `/public/logo.png` — 36px, objectPosition: top
- Admin badge: label "Painel Admin" em slate-500 abaixo do nome
- Cards: border `#E2E5EA` + shadow `0 1px 4px rgba(0,0,0,0.06)`
- Tipografia: Geist Sans (já no projeto)
- Badges de status: verde (ativo) / vermelho (inativo) / amarelo (pendente)
- Notificação: badge magenta com número no menu

---

## 10. CRITÉRIO DE PRONTO

```
□ /admin/clientes/[id] exibe dados cadastrais + métricas + histórico
□ Copiar link funciona com feedback visual "Copiado!"
□ Excluir convite remove da lista (soft delete)
□ Notificação aparece quando novo cliente ativa conta
□ Email de boas-vindas enviado automaticamente na ativação
□ Tudo funciona em mobile (375px testado)
□ Nenhum erro de console em produção
□ Migrations aplicadas no Supabase de prod
□ Commit no GitHub + build Vercel verde
```

---

## 11. O QUE NÃO PODE QUEBRAR

- Toggle ativo/inativo dos clientes existentes
- Sistema de convites atual (criar + revogar)
- Pipeline comercial /admin/pipeline
- Calls /admin/calls
- Acesso dos dentistas ao CRM (nenhuma migration pode afetar as tabelas do CRM)

---

## 12. ROADMAP PÓS V1.1

| Versão | Feature |
|---|---|
| V2 | Integração Meta Ads + Google Ads (tráfego por cliente) |
| V2 | Dashboard financeiro (MRR, churn) — depende Asaas |
| V2 | Exportar dados por cliente (CSV) |
| V3 | Log de auditoria completo (quem fez o quê, quando) |
| V3 | Separação física de dados por cliente (schema próprio) |

---

*PRD criado em 18/04/2026 — Livelis / Cíbrido Soluções em IA*
*Próxima revisão: após aprovação de Davi Junior*
