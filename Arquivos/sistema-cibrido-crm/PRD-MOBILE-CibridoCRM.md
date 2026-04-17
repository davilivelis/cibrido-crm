# PRD — ADAPTAÇÃO MOBILE CibridoCRM
## Documento de Requisitos para Claude Code
### Data: 06/04/2026

---

## CONTEXTO

O CibridoCRM V1 está online em https://crm.cibrido.com.br. Todas as funcionalidades foram construídas para desktop. O CRM precisa funcionar perfeitamente em **celulares** (iPhone SE até iPhone 15 Pro Max, Samsung Galaxy, Xiaomi, Motorola) e **tablets** (iPad, Galaxy Tab) — tanto iOS quanto Android.

O público-alvo são **dentistas** e **gestores de clínicas odontológicas**. Eles vão acessar o CRM pelo celular no consultório entre pacientes, no trânsito, e em casa. A experiência mobile não pode ser uma versão "piorada" do desktop — precisa ser funcional, rápida e agradável.

**Pasta do projeto:** C:\Users\Davi Jr\Downloads\PROJETOCLAUDECOUDE\cibrido-crm
**Stack:** Next.js 14 (App Router) + Supabase + TailwindCSS + shadcn/ui
**Deploy:** Vercel (vercel --prod)
**GitHub:** https://github.com/davilivelis/cibrido-crm (branch: main)

---

## BREAKPOINTS DE REFERÊNCIA

```
Mobile pequeno:    320px - 375px   (iPhone SE, Galaxy A)
Mobile médio:      376px - 414px   (iPhone 14, Pixel)
Mobile grande:     415px - 430px   (iPhone 15 Pro Max, Galaxy S24 Ultra)
Tablet retrato:    431px - 834px   (iPad Mini, iPad Air retrato)
Tablet paisagem:   835px - 1024px  (iPad Air paisagem, iPad Pro)
Desktop:           1025px+         (notebooks e monitores)
```

Tailwind breakpoints usados:
- `sm:` → 640px+
- `md:` → 768px+
- `lg:` → 1024px+
- `xl:` → 1280px+

---

## TELA 1: LOGIN (PRIORIDADE MÁXIMA)

### Problema atual
O lado esquerdo (logo + headline) tem `hidden lg:flex` — desaparece completamente no mobile. O usuário só vê o formulário solto.

### Solução mobile
No mobile (< 1024px), o layout muda de **split-screen horizontal** pra **coluna vertical única**:

```
┌─────────────────────┐
│   [fundo navy]      │
│   logo (h-16)       │
│   CibridoCRM        │
│   headline 3 linhas │
│   (fonte menor)     │
│   subtexto          │
├─────────────────────┤
│   [fundo branco]    │
│   Entrar | Cadastrar│
│   Email             │
│   Senha             │
│   [Entrar no CRM]   │
│   © 2026 Cíbrido    │
└─────────────────────┘
```

### Implementação técnica

O container pai muda de `flex-row` pra `flex-col`:
```tsx
{/* Container principal */}
<div className="flex flex-col lg:flex-row min-h-screen">

  {/* Lado esquerdo — aparece em TODOS os tamanhos */}
  <div className="relative w-full lg:w-1/2 bg-[#1E2A3A] flex flex-col items-center justify-center text-center 
    px-6 py-10 lg:py-0 lg:h-screen overflow-hidden">
    
    {/* Fundo de rede sutil */}
    <img src="/bg-network.png" alt="" 
      className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none" />
    
    {/* Conteúdo */}
    <div className="relative z-10">
      <img src="/logo-cibrido.png" alt="Cíbrido" 
        className="h-16 sm:h-20 lg:h-32 w-auto mx-auto" 
        style={{ marginBottom: '-16px' }} />
        {/* mobile: -16px, desktop: -32px (ajustar com lg:style se necessário) */}
      
      <span className="text-white font-bold text-lg sm:text-xl lg:text-[30px] block">
        CibridoCRM
      </span>
      
      <div className="mt-3 lg:mt-5">
        <p className="text-xl sm:text-2xl lg:text-[38px] font-bold leading-tight text-white">
          Te entregamos um Sistema de IA
        </p>
        <p className="text-xl sm:text-2xl lg:text-[38px] font-bold leading-tight text-white">
          que organiza e acompanha
        </p>
        <p className="text-xl sm:text-2xl lg:text-[38px] font-bold leading-tight text-[#E91E7B]">
          seu futuro e atual paciente
        </p>
      </div>
      
      <p className="text-gray-400 text-sm sm:text-base lg:text-xl mt-3 lg:mt-5 leading-relaxed max-w-[480px] mx-auto">
        Desde o primeiro contato até o agendamento, para aumentar o seu faturamento.
      </p>
    </div>
  </div>

  {/* Lado direito — formulário */}
  <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-8 lg:py-0 min-h-[50vh] lg:min-h-screen">
    {/* Formulário existente — NÃO MEXER no conteúdo interno */}
  </div>
</div>
```

### Pontos críticos
- `hidden lg:flex` → trocar por `flex` (mostrar em todos os tamanhos)
- Logo: `h-16` no mobile, `h-20` no sm, `h-32` no lg
- Headline: `text-xl` no mobile, `text-2xl` no sm, `text-[38px]` no lg
- `whitespace-nowrap` REMOVER no mobile — no celular o texto precisa quebrar naturalmente
- Padding vertical `py-10` no mobile pra não ficar colado
- A tela inteira rola (scroll) se o conteúdo não couber na viewport

---

## TELA 2: SIDEBAR / NAVEGAÇÃO

### Problema atual
A sidebar esquerda (220px fixa) ocupa espaço demais no mobile. Provavelmente já tem `hidden lg:block` ou similar.

### Solução mobile
A sidebar vira um **menu hamburguer** no mobile:

```
┌─────────────────────┐
│ ☰ CibridoCRM    👤  │  ← top bar fixa
├─────────────────────┤
│                     │
│   conteúdo da       │
│   página atual      │
│                     │
└─────────────────────┘
```

Ao clicar no ☰, a sidebar abre como **drawer** (overlay lateral esquerdo):

```
┌──────────┬──────────┐
│ ✕ Menu   │ (escuro) │
│          │ overlay  │
│ Dashboard│          │
│ Leads    │          │
│ Pipeline │          │
│ Agenda   │          │
│ Conversas│          │
│ Tráfego  │          │
│ Recall   │          │
│          │          │
│ Config   │          │
│ Sair     │          │
└──────────┴──────────┘
```

### Implementação técnica

Verificar se o layout já tem componente `Sidebar.tsx` ou se está no `layout.tsx`. Adicionar:

1. **Top bar mobile** (`lg:hidden`): logo pequena + ☰ hamburguer + avatar
2. **Drawer overlay** (`lg:hidden`): sidebar completa que abre/fecha com state
3. **Sidebar desktop** (`hidden lg:block`): manter como está
4. Fechar drawer ao clicar em qualquer item do menu
5. Fechar drawer ao clicar no overlay escuro

```tsx
// Estado do drawer
const [menuOpen, setMenuOpen] = useState(false);

// Top bar mobile
<div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b h-14 flex items-center justify-between px-4">
  <button onClick={() => setMenuOpen(true)} className="text-2xl">☰</button>
  <span className="font-bold text-lg">CibridoCRM</span>
  <div className="w-8 h-8 rounded-full bg-gray-200" /> {/* avatar */}
</div>

// Drawer
{menuOpen && (
  <div className="lg:hidden fixed inset-0 z-50">
    <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl p-4 overflow-y-auto">
      <button onClick={() => setMenuOpen(false)} className="text-xl mb-4">✕</button>
      {/* Itens do menu — mesmos da sidebar desktop */}
    </div>
  </div>
)}

// Conteúdo principal com padding-top no mobile
<main className="pt-14 lg:pt-0 lg:pl-[220px]">
  {/* conteúdo */}
</main>
```

---

## TELA 3: DASHBOARD

### Adaptações mobile
- KPIs (4 cards): mudar de `grid-cols-4` pra `grid-cols-2` no mobile (2x2)
- Gráfico "Leads por Etapa": largura 100%, scroll horizontal se necessário
- "Atividade Recente": lista vertical, sem mudança necessária
- Textos dos KPIs: reduzir fonte se necessário

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
  {/* KPI cards */}
</div>
```

---

## TELA 4: LEADS (TABELA)

### Problema
Tabelas com muitas colunas não cabem no mobile.

### Solução mobile
- No mobile, mostrar apenas colunas essenciais: **Nome, Telefone, Etapa**
- As demais colunas (email, origem, data) ficam visíveis só no desktop
- Botão de ação rápida (WhatsApp, editar) visível em cada linha
- Input de busca: largura 100%
- Botão "Novo Lead": largura 100% ou flutuante (FAB)

```tsx
{/* Colunas responsivas */}
<th className="hidden lg:table-cell">Email</th>
<th className="hidden lg:table-cell">Origem</th>
<th className="hidden md:table-cell">Data</th>
```

Alternativa melhor pra mobile: trocar a tabela por **cards empilhados**:
```
┌─────────────────────┐
│ João Silva          │
│ (11) 99999-1234  📱 │
│ Etapa: Qualificado  │
│ [Ver] [WhatsApp]    │
├─────────────────────┤
│ Maria Santos        │
│ (11) 98888-5678  📱 │
│ Etapa: Agendado     │
│ [Ver] [WhatsApp]    │
└─────────────────────┘
```

Implementação: verificar se existe componente de tabela. No mobile (`< md`), renderizar cards em vez de tabela. No desktop, manter tabela.

---

## TELA 5: PIPELINE KANBAN

### Problema
Pipeline horizontal com 7-8 colunas lado a lado não cabe no mobile.

### Solução mobile
**Scroll horizontal** nas colunas do kanban. O usuário desliza pro lado pra ver as próximas etapas.

```tsx
<div className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory">
  {columns.map(col => (
    <div key={col.id} className="min-w-[280px] sm:min-w-[300px] flex-shrink-0 snap-start">
      {/* coluna do kanban */}
    </div>
  ))}
</div>
```

- Cada coluna: `min-w-[280px]` (cabe no mobile)
- `snap-x snap-mandatory` pra snap ao deslizar
- Cards dentro da coluna: mesma aparência, toque pra abrir modal
- Drag-and-drop: funciona com touch (dnd-kit já suporta `TouchSensor`)
- Se `TouchSensor` não estiver configurado, adicionar:

```tsx
import { TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 }
  })
);
```

---

## TELA 6: MODAL TRELLO (DETALHE DO LEAD)

### Adaptação mobile
- No desktop: modal overlay no centro
- No mobile: modal **full-screen** (ocupa a tela inteira)

```tsx
<div className="fixed inset-0 z-50 bg-white lg:bg-black/50 lg:flex lg:items-center lg:justify-center">
  <div className="h-full lg:h-auto lg:max-h-[90vh] lg:w-[600px] lg:rounded-xl bg-white overflow-y-auto">
    {/* conteúdo do modal */}
  </div>
</div>
```

- Botão de fechar: `✕` fixo no topo direito
- Scroll vertical no conteúdo
- Botões de ação (WhatsApp, Agendar, Nota): largura 100%, empilhados

---

## TELA 7: AGENDA

### Adaptação mobile
- Calendário: reduzir tamanho das células, manter funcional
- Lista de consultas: empilhar verticalmente
- Criar consulta: modal full-screen no mobile

---

## TELA 8: CONVERSAS

### Adaptação mobile
- Se tiver layout de duas colunas (lista de conversas + chat), no mobile mostrar só a lista primeiro, clicar numa conversa abre o chat full-screen
- Input de mensagem fixo no bottom

---

## TELA 9: TRÁFEGO PAGO

### Adaptação mobile
- Métricas (Verba, Cliques, Leads, CPL): `grid-cols-2` no mobile
- Tabela de campanhas: mesma abordagem dos Leads (cards empilhados ou colunas escondidas)

---

## TELA 10: RECALL

### Adaptação mobile
- Cards de recall: empilhar verticalmente, largura 100%
- Badges e filtros: scroll horizontal se muitos filtros
- Botão "Enviar lembrete": largura 100%

---

## TELA 11: CONFIGURAÇÕES

### Adaptação mobile
- Tabs (Clínica / Equipe): manter tabs, scroll horizontal se necessário
- Formulários: inputs largura 100%
- Botão salvar: largura 100%, fixo no bottom ou no final do form

---

## TELA 12: PERFIL DO USUÁRIO

### Adaptação mobile
- Formulário simples: inputs largura 100%
- Sem problemas previsíveis

---

## REGRAS GLOBAIS MOBILE

### 1. Touch targets
- Todos os botões e links: mínimo **44x44px** de área tocável (padrão Apple/Google)
- Espaço entre elementos clicáveis: mínimo 8px

### 2. Fontes
- Corpo de texto: mínimo `text-sm` (14px) no mobile
- Títulos: reduzir proporcionalmente (usar `text-lg` onde desktop usa `text-2xl`)

### 3. Inputs
- Todos os inputs: largura 100% no mobile
- `font-size: 16px` mínimo nos inputs (evita zoom automático no iOS)
- Type correto: `type="email"` pro email, `type="tel"` pro telefone

### 4. Scroll
- A página principal rola normalmente (sem `overflow-hidden` no body)
- Modais no mobile: full-screen com scroll interno

### 5. Safe areas
- Respeitar `safe-area-inset-*` pra iPhones com notch/Dynamic Island:
```css
padding-bottom: env(safe-area-inset-bottom);
```

### 6. Orientação
- Funcionar em retrato (portrait) e paisagem (landscape)
- Não travar orientação

### 7. Performance
- Imagens: usar `next/image` com `loading="lazy"`
- Não carregar fontes extras desnecessárias

---

## PROCEDIMENTO DE IMPLEMENTAÇÃO

1. Começar pelo **Login** (mais visível, primeira impressão)
2. Depois **Sidebar/Navegação** (afeta todas as páginas)
3. Depois **Dashboard** (página principal)
4. Depois **Leads** e **Pipeline** (mais usados)
5. Por último **demais telas** (Agenda, Conversas, Tráfego, Recall, Config, Perfil)

Para cada tela:
1. Abrir o arquivo do componente
2. ME MOSTRAR o código atual
3. Adicionar classes responsivas do Tailwind (`sm:`, `md:`, `lg:`)
4. ME MOSTRAR o código depois
5. Testar no browser com DevTools (Chrome → F12 → toggle device toolbar)
6. Testar em 3 tamanhos: iPhone SE (375px), iPhone 14 (390px), iPad (768px)

---

## TESTES OBRIGATÓRIOS

Antes do deploy, testar no Chrome DevTools (F12 → Ctrl+Shift+M) nos seguintes dispositivos:

1. **iPhone SE** (375 x 667) — menor tela popular
2. **iPhone 14** (390 x 844) — tamanho médio
3. **iPhone 15 Pro Max** (430 x 932) — maior tela
4. **iPad Mini** (768 x 1024) — tablet retrato
5. **iPad Air** (820 x 1180) — tablet retrato

Testar em cada um:
- [ ] Login aparece completo (logo + headline + formulário)
- [ ] Menu hamburguer funciona
- [ ] Dashboard KPIs legíveis
- [ ] Leads: tabela/cards funcional
- [ ] Pipeline: scroll horizontal funciona
- [ ] Modal: abre full-screen
- [ ] Todos os botões tocáveis (44px mínimo)
- [ ] Nenhum texto cortado
- [ ] Nenhum overflow horizontal (sem scroll lateral na página)

---

## DEPLOY

```bash
npm run build
git add .
git commit -m "feat: adaptação mobile completa - login, sidebar, dashboard, leads, pipeline"
git push origin main
vercel --prod
```

---

## REGRAS

1. Leia o código atual ANTES de editar — me mostra antes e depois
2. Use SOMENTE classes responsivas do Tailwind (sm:, md:, lg:) — não crie media queries separadas
3. NÃO ALTERAR funcionalidade — só visual/layout
4. NÃO ALTERAR cores, fontes, copy — só tamanhos e distribuição
5. Testa no DevTools em 3 tamanhos antes de commitar
6. Se algo quebrar no desktop ao adaptar pro mobile, conserta antes de push

---

*PRD criado em 06/04/2026 — Cíbrido Soluções em IA*
