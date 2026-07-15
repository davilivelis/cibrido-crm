# PRD — POLISH FINAL V1 CibridoCRM
## Auditoria visual + correções de experiência do cliente
### Data: 07/04/2026

---

## CONTEXTO E POSICIONAMENTO

O CibridoCRM é um sistema para **lotar a agenda de clínicas odontológicas** através do controle de leads vindos do marketing digital e tradicional. NÃO é um sistema clínico, NÃO é prontuário, NÃO cuida de atendimento. Ele cuida do ANTES: captar o lead, acompanhar a jornada, agendar a consulta, fazer recall.

Todo texto, botão, mensagem e tela precisa comunicar isso com clareza. O dentista que abrir o CRM não pode ter dúvida do que fazer.

**Pasta do projeto:** C:\Users\Davi Jr\Downloads\PROJETOCLAUDECOUDE\cibrido-crm
**Stack:** Next.js 14 (App Router) + Supabase + TailwindCSS + shadcn/ui
**URL:** https://crm.cibrido.com.br

---

## BUGS CRÍTICOS ENCONTRADOS NA AUDITORIA

### BUG 1: Título da aba "Create Next App"
**Onde:** Todas as páginas (Dashboard, Leads, Pipeline, etc.)
**Problema:** O título da aba do browser mostra "Create Next App" — isso é o padrão do Next.js. Demonstra amadorismo.
**Exceções encontradas:** Agenda mostra "Agenda — CibridoCRM", Recall mostra "Recall — CibridoCRM", Tráfego mostra "Tráfego Pago — CibridoCRM". Então ALGUMAS páginas têm o título certo, outras NÃO.

**Correção:** No `src/app/layout.tsx`, definir o metadata global:
```tsx
export const metadata: Metadata = {
  title: {
    default: 'CibridoCRM',
    template: '%s — CibridoCRM'
  },
  description: 'Sistema de gestão de leads para clínicas odontológicas',
  icons: {
    icon: '/logo-cibrido.png',
  },
}
```
Depois verificar que CADA página que usa `metadata` exporta o título correto:
- Dashboard: `export const metadata = { title: 'Dashboard' }`
- Leads: `export const metadata = { title: 'Leads' }`
- Pipeline: `export const metadata = { title: 'Pipeline' }`
- Conversas: `export const metadata = { title: 'Conversas' }`
- Configurações: `export const metadata = { title: 'Configurações' }`

### BUG 2: Favicon padrão do Next.js
**Onde:** Aba do browser
**Problema:** Mostra o ícone padrão do Next.js em vez do logo da Cíbrido.
**Correção:** O arquivo `/public/logo-cibrido.png` já existe. Gerar um favicon de 32x32:
```js
const sharp = require('sharp');
sharp('public/logo-cibrido.png')
  .resize(32, 32)
  .toFile('public/favicon.png')
  .then(() => console.log('Favicon gerado!'));
```
Referenciar no metadata do layout.tsx (já incluído acima).
TAMBÉM gerar um de 180x180 pra Apple Touch Icon:
```js
sharp('public/logo-cibrido.png')
  .resize(180, 180)
  .toFile('public/apple-touch-icon.png');
```

### BUG 3: Configurações redireciona pro Dashboard
**Onde:** Clicar em "Configurações" na sidebar
**Problema:** Em vez de abrir a página de configurações, redireciona silenciosamente pro Dashboard. A rota `/configuracoes` não funciona em produção.
**Causa provável:** O componente da página de configurações pode ser um Server Component que crasha (provavelmente por causa do convite de equipe que usa SUPABASE_SERVICE_ROLE_KEY). O Next.js redireciona pra home em caso de erro.
**Correção:** 
1. Abrir `src/app/(dashboard)/configuracoes/page.tsx`
2. Envolver TODO o conteúdo em try/catch
3. A aba de "Equipe" (que dá o erro do convite) deve ter um fallback amigável em vez de crashar a página inteira
4. O convite de equipe foi movido pra V2 — então o formulário de convite pode ficar desabilitado com a mensagem "Funcionalidade disponível em breve" em vez de dar erro

```tsx
// Na aba Equipe, em vez do formulário que crasha:
<div className="text-center py-8">
  <p className="text-gray-500">Gerenciamento de equipe estará disponível em breve.</p>
  <p className="text-gray-400 text-sm mt-2">Na próxima atualização você poderá convidar membros da sua equipe.</p>
</div>
```

### BUG 4: Não é possível excluir lead
**Onde:** Página de detalhe do lead e lista de leads
**Problema:** O dentista cadastrou um lead errado e não tem como remover. Não existe botão de excluir em nenhum lugar.
**Correção — 3 pontos de exclusão:**

**A) Na página de detalhe do lead** (`/leads/[id]`): 
Adicionar botão "Excluir" vermelho ao lado do botão "Editar":
```tsx
<button 
  onClick={() => setShowDeleteConfirm(true)}
  className="text-red-500 hover:text-red-700 text-sm"
>
  Excluir
</button>
```

**B) Na lista de leads** (`/leads`):
Adicionar coluna de ações com ícone de lixeira em cada linha.

**C) Dialog de confirmação** (obrigatório antes de excluir):
```tsx
// Dialog de confirmação
<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
  <DialogContent>
    <DialogTitle>Excluir paciente</DialogTitle>
    <p>Tem certeza que deseja excluir {lead.name}? Esta ação não pode ser desfeita.</p>
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
        Cancelar
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Excluir
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

**D) Server action de exclusão:**
```tsx
'use server'
export async function deleteLead(leadId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId)
  
  if (error) return { error: error.message }
  
  revalidatePath('/leads')
  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
  return { success: true }
}
```

---

## MELHORIAS DE EXPERIÊNCIA DO CLIENTE

### MELHORIA 1: Toasts de confirmação em TODA ação

Instalar Sonner (se não estiver):
```bash
npx shadcn-ui@latest add sonner
```

Adicionar no layout.tsx:
```tsx
import { Toaster } from '@/components/ui/sonner'
// Dentro do body, após {children}:
<Toaster position="top-right" richColors />
```

Adicionar `toast()` em CADA ação:
```
Criar lead → toast.success('Paciente cadastrado com sucesso!')
Editar lead → toast.success('Dados atualizados!')
Excluir lead → toast.success('Paciente excluído')
Mover no pipeline → toast.success('Etapa atualizada!')
Criar consulta → toast.success('Consulta agendada!')
Salvar config → toast.success('Configurações salvas!')
Registrar atividade → toast.success('Atividade registrada!')
Criar campanha → toast.success('Campanha criada!')
Criar recall → toast.success('Recall cadastrado!')
QUALQUER erro → toast.error('Erro ao salvar. Tente novamente.')
```

Uso:
```tsx
import { toast } from 'sonner'

// Após salvar com sucesso:
toast.success('Paciente cadastrado com sucesso!')

// Após erro:
toast.error('Erro ao salvar. Tente novamente.')
```

### MELHORIA 2: Empty states amigáveis

Verificar cada tela quando não tem dados. Melhorar as mensagens:

**Dashboard (sem leads):**
O Dashboard já mostra 0 nos KPIs, o que é ok. Mas o gráfico "Leads por Etapa" vazio fica estranho. Adicionar mensagem:
```tsx
{totalLeads === 0 && (
  <div className="text-center py-8 text-gray-500">
    <p className="font-medium">Comece cadastrando seu primeiro paciente</p>
    <p className="text-sm mt-1">Os dados do seu funil aparecerão aqui automaticamente.</p>
  </div>
)}
```

**Leads (sem dados):**
```tsx
{leads.length === 0 && (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">👥</div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">
      Nenhum paciente cadastrado
    </h3>
    <p className="text-gray-500 mb-6 max-w-md">
      Cadastre seu primeiro paciente para começar a acompanhar a jornada dele até a consulta.
    </p>
    <Button onClick={openNovoLeadModal} className="bg-[#E91E7B] hover:bg-[#d11a6f]">
      + Cadastrar primeiro paciente
    </Button>
  </div>
)}
```

**Pipeline (colunas vazias):**
O texto "Solte aqui" já existe nas colunas vazias — isso é bom. Manter.

**Agenda:**
Já tem "Nenhuma consulta agendada" + "Consultas são criadas dentro do cadastro de cada lead." — está bom.

**Conversas:**
Já tem "Nenhuma conversa ainda" + explicação do WhatsApp — está bom.

**Tráfego Pago:**
Já tem "Nenhuma campanha cadastrada. Clique em Nova Campanha para começar." — está bom.

**Recall:**
Já tem "Nenhum recall encontrado. Clique em Novo Recall para cadastrar o primeiro." — está bom.

### MELHORIA 3: Subtítulo do Dashboard mais claro

**Atual:** "Dashboard — Visão geral da sua clínica"
**Melhor:** "Dashboard — Acompanhe seus leads e consultas agendadas"

Isso reforça que o CRM é sobre LEADS e AGENDAMENTOS, não gestão clínica.

### MELHORIA 4: Página 404 personalizada

**Atual:** "404 This page could not be found." (em inglês, genérico)
**Correção:** Criar `src/app/not-found.tsx`:
```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Página não encontrada</h1>
      <p className="text-gray-500 mb-6">A página que você procura não existe ou foi movida.</p>
      <Link href="/dashboard" className="bg-[#E91E7B] text-white px-6 py-3 rounded-lg hover:bg-[#d11a6f]">
        Voltar ao Dashboard
      </Link>
    </div>
  )
}
```

### MELHORIA 5: Loading spinner nos botões de salvar

Em todo botão que faz ação assíncrona (Salvar, Enviar, Cadastrar), mostrar spinner durante o processamento pra evitar clique duplo:
```tsx
<Button disabled={isLoading} onClick={handleSave}>
  {isLoading ? (
    <span className="flex items-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Salvando...
    </span>
  ) : 'Salvar'}
</Button>
```

Aplicar em: botão Novo Lead, botão Salvar (editar lead), botão Enviar Convite (desabilitado na V1), botão Salvar Configurações, botão Nova Campanha, botão Novo Recall.

### MELHORIA 6: Texto "Leads" → manter (DECISÃO)

Analisando a sidebar: os nomes "Leads", "Pipeline", "Recall" são termos de marketing que o dentista vai aprender. NÃO trocar pra "Pacientes" porque:
1. O PRD já definiu que a face interna usa linguagem de marketing
2. O dentista-cliente vai ser treinado no onboarding
3. Trocar agora gera confusão nos termos do funil

Manter como está. Na V2, o tour guiado vai explicar cada seção.

---

## PROCEDIMENTO

1. Começar pelos bugs críticos (título, favicon, configurações, excluir lead)
2. Depois melhorias de experiência (toasts, empty states, 404, loading)
3. Testar cada correção localmente
4. Build, push, deploy

Para cada correção:
- ME MOSTRA o código antes de editar
- ME MOSTRA o código depois de editar

---

## DEPLOY

```bash
npm run build
git add .
git commit -m "fix: polish V1 - titulo, favicon, excluir lead, toasts, 404, loading, config"
git push origin main
vercel --prod
```

---

## REGRAS

1. NÃO MEXER no layout do login (já está aprovado)
2. NÃO MEXER na funcionalidade do pipeline (drag-and-drop funciona)
3. NÃO MEXER nas cores e paleta (já aprovada)
4. NÃO ALTERAR nomes da sidebar (Leads, Pipeline, etc.)
5. Se algo quebrar no build, conserta antes de push
6. Avisa quando estiver live

---

*PRD criado em 07/04/2026 — Cíbrido Soluções em IA*
*Baseado em auditoria visual real de todas as telas do CRM*
