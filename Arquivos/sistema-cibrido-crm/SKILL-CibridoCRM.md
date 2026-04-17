# SKILL — CibridoCRM
## Documento técnico para Claude Code
## Versão: 1.0 | Data: 07/04/2026

---

## OBJETIVO DESTA SKILL

Este documento é o "cérebro especialista" do CibridoCRM. Qualquer sessão do Claude Code que ler este arquivo deve saber:
1. O que é o projeto e como funciona
2. A estrutura de pastas e arquivos
3. Erros conhecidos e como resolver
4. Padrões de código do projeto
5. Como diagnosticar problemas automaticamente
6. O que NÃO fazer

---

## 1. IDENTIDADE DO PROJETO

**Nome:** CibridoCRM
**Propósito:** Lotar a agenda de clínicas odontológicas via controle de leads do marketing
**NÃO é:** prontuário clínico, software odontológico, sistema de atendimento
**Stack:** Next.js 14 (App Router) + Supabase + TailwindCSS + shadcn/ui + Vercel
**URL:** https://crm.cibrido.com.br
**GitHub:** https://github.com/davilivelis/cibrido-crm
**Branch:** master (NÃO main)
**Pasta local:** C:\Users\Davi Jr\Downloads\PROJETOCLAUDECOUDE\cibrido-crm

---

## 2. ESTRUTURA DO PROJETO

```
cibrido-crm/
├── public/
│   ├── logo-cibrido.png      (logo balões, fundo transparente)
│   ├── bg-network.png         (fundo de rede, fundo transparente)
│   ├── favicon.png             (32x32)
│   └── apple-touch-icon.png    (180x180)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx  (tela de login split-screen)
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/      (dashboard principal)
│   │   │   ├── leads/          (lista + detalhe do lead)
│   │   │   ├── pipeline/       (kanban drag-and-drop)
│   │   │   ├── conversas/      (preparado pra WhatsApp)
│   │   │   ├── agenda/         (consultas agendadas)
│   │   │   ├── trafego/        (tráfego pago, métricas)
│   │   │   ├── recalls/        (recall de pacientes)
│   │   │   └── configuracoes/  (dados da clínica + equipe)
│   │   ├── onboarding/         (setup inicial da clínica)
│   │   ├── layout.tsx          (metadata global + Toaster)
│   │   └── not-found.tsx       (404 personalizado pt-BR)
│   ├── components/
│   │   └── ui/                 (shadcn/ui components)
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts       (browser client)
│       │   ├── server.ts       (server client)
│       │   └── admin.ts        (admin client com SERVICE_ROLE_KEY)
│       └── actions/            (server actions)
├── .env.local                  (credenciais — NÃO commitar)
└── PRD-*.md                    (documentos de requisitos)
```

---

## 3. CREDENCIAIS

```env
NEXT_PUBLIC_SUPABASE_URL=https://cktvqvsxogdzeikvoajz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[REDACTED - use .env.local]
SUPABASE_SERVICE_ROLE_KEY=[REDACTED - use .env.local]
```

**Admin login:** livelisdigital@gmail.com / [REDACTED]

**ATENÇÃO:** A ANON_KEY começa com o prefixo publishable, NÃO com `sb_secret_`. Se alguém trocar, o frontend para de funcionar.

---

## 4. CATÁLOGO DE ERROS E SOLUÇÕES

### ERRO 1: "permission denied for table X"
**Causa:** RLS do Supabase bloqueando operações
**Solução:**
```sql
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```
**Contexto:** Aconteceu na construção inicial e no convite de equipe.

### ERRO 2: "relation X already exists"
**Causa:** Tabelas de protótipo anterior (Lovable) conflitando
**Solução:**
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
```
Depois rodar o schema novo.

### ERRO 3: Loop de redirect infinito no middleware
**Causa:** Middleware com regras complexas demais (checar clínica, checar onboarding, etc.)
**Solução:** Simplificar pra 2 regras apenas:
1. Não logado → /login
2. Logado sem clínica → /onboarding
3. Logado com clínica → libera

### ERRO 4: Onboarding travando com "Erro ao salvar"
**Causa:** Campos obrigatórios (endereço, etc.) falhando no insert
**Solução:** Só nome da clínica obrigatório, resto opcional. Se falhar, pular pro dashboard.

### ERRO 5: UUID aparecendo no lugar do nome da etapa
**Causa:** `<Select>` do shadcn/ui mostrando o value (UUID) em vez do label
**Solução:** Trocar por `<select>` nativo HTML. O `<option>` sempre mostra o texto.

### ERRO 6: Nomes traduzidos pelo browser ("Pistas", "Gasoduto")
**Causa:** Chrome traduzindo automaticamente palavras em inglês
**Solução:** Adicionar `translate="no"` nos elementos ou usar a tag `<html lang="pt-BR">` no layout.

### ERRO 7: PID conflitante do servidor dev
**Causa:** Processo anterior do Next.js não foi encerrado
**Solução (Windows):**
```bash
taskkill /F /IM node.exe
npm run dev
```

### ERRO 8: Email redirecionando pro Lovable
**Causa:** Site URL no Supabase Auth apontando pra URL antiga
**Solução:** Atualizar Site URL pra `https://crm.cibrido.com.br` nas configurações do Supabase Auth.

### ERRO 9: Pasta errada no deploy
**Causa:** Vercel não encontra o projeto
**Solução:** Especificar caminho completo:
```bash
cd "C:\Users\Davi Jr\Downloads\PROJETOCLAUDECOUDE\cibrido-crm" && vercel --prod
```

### ERRO 10: Configurações redirecionando pro Dashboard
**Causa:** Server component da aba Equipe crasha (usa SERVICE_ROLE_KEY que não existe em produção)
**Solução:** Envolver em try/catch + desabilitar formulário de convite com mensagem "disponível em breve".

### ERRO 11: Logo com fundo preto
**Causa:** Imagem JPEG enviada como "sem fundo" mas JPEG não suporta transparência
**Solução:** Usar Sharp pra remover pixels pretos e salvar como PNG:
```js
const sharp = require('sharp');
// Remover fundo preto
const { data, info } = await sharp('logo.jpg').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  if (data[i] < 30 && data[i+1] < 30 && data[i+2] < 30) data[i+3] = 0;
}
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile('logo.png');
```

### ERRO 12: Logo distante do nome "CibridoCRM"
**Causa:** Imagem PNG tem espaço transparente ao redor dos balões
**Solução:** Usar `style={{ marginBottom: '-32px' }}` na tag da logo pra compensar o espaço.

### ERRO 13: Título da aba "Create Next App"
**Causa:** Metadata padrão do Next.js não foi alterado
**Solução:** No layout.tsx:
```tsx
export const metadata = {
  title: { default: 'CibridoCRM', template: '%s — CibridoCRM' },
  icons: { icon: '/logo-cibrido.png' }
}
```
E em cada page.tsx: `export const metadata = { title: 'NomeDaPágina' }`

---

## 5. PADRÕES DO PROJETO

### 5.1 Server Actions
- Sempre marcadas com `'use server'`
- Sempre retornam `{ success: true }` ou `{ error: 'mensagem' }`
- NUNCA usam throw — usam try/catch com retorno de erro
- Após mutação: `revalidatePath('/leads')` pra atualizar a página

### 5.2 Client Components
- Usam `toast.success('Mensagem')` após toda ação bem-sucedida
- Usam `toast.error('Erro...')` após todo erro
- Botões de ação têm loading spinner com `disabled={isLoading}`
- Exclusão sempre pede confirmação com Dialog

### 5.3 Supabase Clients
- **Browser client** (`lib/supabase/client.ts`): usado em componentes client
- **Server client** (`lib/supabase/server.ts`): usado em server components e server actions
- **Admin client** (`lib/supabase/admin.ts`): usado APENAS em server actions que precisam de permissão elevada (criar usuário, etc.)

### 5.4 Estilo
- Paleta Cíbrido: magenta #E91E7B, dourado #F5A623, roxo #7B2D8E, navy #1E2A3A
- Botões primários: `bg-[#E91E7B] hover:bg-[#d11a6f] text-white`
- Fundo das páginas: off-white #F8F9FB
- Cards: `bg-white border rounded-xl shadow-sm`
- Todo texto em pt-BR

### 5.5 Deploy
```bash
npm run build
git add .
git commit -m "descrição clara do que mudou"
git push origin master   # MASTER, não main
vercel --prod
```

---

## 6. ROTINA DE AUTO-DIAGNÓSTICO

Execute esta checklist quando algo parecer errado:

### 6.1 Servidor local
```bash
# Verificar se servidor está rodando
curl http://localhost:3000 2>/dev/null && echo "OK" || echo "SERVIDOR FORA"

# Se fora, matar processos e reiniciar
taskkill /F /IM node.exe 2>nul
npm run dev
```

### 6.2 Banco de dados
```bash
# Verificar conexão com Supabase
curl -s -H "apikey: [REDACTED - use .env.local]" \
  "https://cktvqvsxogdzeikvoajz.supabase.co/rest/v1/clinics?select=count" \
  && echo "BANCO OK" || echo "BANCO FORA"
```

### 6.3 Build
```bash
npm run build 2>&1 | tail -5
# Se der erro, ler a mensagem e corrigir antes de deploy
```

### 6.4 Rotas (verificar se todas respondem)
```
/login           → tela de login
/dashboard       → dashboard com KPIs
/leads           → tabela de leads
/pipeline        → kanban
/conversas       → tela de conversas
/agenda          → consultas
/trafego         → tráfego pago
/recalls         → recall
/configuracoes   → configurações
```

### 6.5 Funcionalidades críticas
- [ ] Login funciona (email + senha)
- [ ] Criar conta funciona (novo usuário)
- [ ] Criar lead funciona (modal + salva)
- [ ] Editar lead funciona (inline + salva)
- [ ] Excluir lead funciona (dialog + exclui)
- [ ] Pipeline carrega com cards
- [ ] Drag-and-drop funciona
- [ ] Multi-tenant isola dados (testar com 2 contas)

---

## 7. O QUE NÃO FAZER

1. **NÃO commitar .env.local** — tem credenciais
2. **NÃO usar `git push origin main`** — a branch é `master`
3. **NÃO trocar ANON_KEY por SECRET_KEY** — frontend para de funcionar
4. **NÃO alterar a copy do login** — já foi aprovada em 3 linhas pelo Davi
5. **NÃO alterar cores da paleta** — já aprovada pelo Davi
6. **NÃO remover translate="no"** — browser vai traduzir nomes da sidebar
7. **NÃO adicionar features fora do PRD** — "Se não está no PRD, não vai pro código"
8. **NÃO usar `<Select>` do shadcn/ui pra etapas** — mostra UUID. Usar `<select>` nativo.
9. **NÃO fazer deploy sem `npm run build` antes** — pode subir código quebrado
10. **NÃO mexer no layout do login desktop** — aprovado em 06/04/2026

---

## 8. GLOSSÁRIO DE TRADUÇÃO

| Face Cíbrido (interno) | Face Dentista (SaaS) |
|----------------------|---------------------|
| Lead | Paciente (em potencial) |
| Pipeline | Jornada do Paciente |
| Etapa do funil | Etapa da jornada |
| Conversão | Comparecimento |
| Venda realizada | Tratamento aceito |
| Perdido | Desistiu |
| Recall | Retorno/Reconvocação |
| CPL | Custo por paciente |
| Tráfego Pago | Marketing digital |
| Campanha | Campanha de captação |

---

## 9. HISTÓRICO DE DECISÕES

| Data | Decisão | Motivo |
|------|---------|--------|
| 01/04 | Abandonar Lovable, construir do zero | Bugs demais, sem controle do código |
| 01/04 | Regra "Se não está no PRD, não vai pro código" | Evitar scope creep |
| 02/04 | Onboarding só com nome da clínica | Cliente não pode travar no primeiro acesso |
| 02/04 | Cadastro sem confirmação de email | Reduzir fricção, V2 adiciona |
| 03/04 | Logo sem nome "Cíbrido" embutido | Fica mais limpo na sidebar e login |
| 06/04 | Convite de equipe → V2 | Erro de RLS complexo, não vale atrasar V1 |
| 06/04 | Manter termos "Leads/Pipeline/Recall" na sidebar | Tour guiado na V2 vai explicar |
| 06/04 | Fundo de rede sutil no login | Dá contexto tecnológico sem poluir |
| 06/04 | margin-bottom negativo na logo | Compensa espaço transparente da imagem |
| 07/04 | Hard delete de leads na V1 | Simples, soft delete na V2 |
| 07/04 | Desabilitar equipe com "disponível em breve" | Melhor que crashar a página |

---

## 10. ATUALIZAÇÃO PRA V2

Quando iniciar a V2, atualizar esta SKILL com:
- Novas features implementadas
- Novos erros e soluções encontrados
- Novos padrões de código adotados
- Decisões técnicas tomadas

---

*SKILL criada em 07/04/2026 — Cíbrido Soluções em IA*
*"Este documento é o cérebro do CibridoCRM. Leia antes de tocar em qualquer código."*
