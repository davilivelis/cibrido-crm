# PRD — CORREÇÃO FINAL V1 CibridoCRM
## Documento de Requisitos para Claude Code
### Data: 06/04/2026

---

## CONTEXTO

O CibridoCRM V1 está online em https://cibrido-crm.vercel.app com 16 funcionalidades operacionais. Restam EXATAMENTE 2 correções para fechar o V1. Essas correções já foram tentadas DUAS VEZES antes e NÃO foram aplicadas corretamente. Este PRD documenta com precisão cirúrgica o que precisa ser feito.

**Pasta do projeto:** C:\Users\Davi Jr\Downloads\PROJETOCLAUDECOUDE\cibrido-crm
**Stack:** Next.js 14 (App Router) + Supabase + TailwindCSS + shadcn/ui
**Deploy:** Vercel (vercel --prod)
**GitHub:** https://github.com/davilivelis/cibrido-crm (branch: main)

---

## CORREÇÃO 1: COPY DA TELA DE LOGIN

### Problema atual
A headline do lado esquerdo da tela de login (split-screen, fundo navy #1E2A3A) está quebrando em **5 linhas** porque a fonte (34px) é grande demais pro container estreito. O text-wrap automático gera:
```
Te entregamos um
Sistema de IA
que organiza e
acompanha
seu futuro e atual paciente
```
Isso é feio e amador. Precisa ser corrigido.

### Resultado esperado — EXATAMENTE 3 LINHAS (não negociável)
```
Linha 1 (branco, bold):   "Te entregamos um Sistema de IA"
Linha 2 (branco, bold):   "que organiza e acompanha"
Linha 3 (magenta #E91E7B, bold):  "seu futuro e atual paciente"
```
Subtexto abaixo (cinza claro, fonte menor):
"Desde o primeiro contato até o agendamento, para aumentar o seu faturamento."

### Lógica da solução (PENSE antes de codar)
O problema é que 34px não cabe em 3 linhas no container atual. Existem 2 caminhos:
- **Caminho A:** Reduzir a fonte pra um tamanho que caiba (ex: 26-28px)
- **Caminho B:** Aumentar o container (dar mais largura pro lado esquerdo)
- **Caminho ideal:** Combinar os dois — ajustar a fonte E o container pra ficar proporcional

Na versão Lovable (que funcionava bem visualmente), a proporção era equilibrada: a fonte era menor, o container do lado esquerdo tinha espaço suficiente, e o resultado era limpo e profissional. USE ESSA LÓGICA.

### Implementação técnica — 3 ELEMENTOS BLOCK FORÇADOS
Cada linha DEVE ser um elemento HTML separado (`<p>` ou `<div>`). O texto NÃO pode depender de text-wrap automático pra quebrar — se o browser quiser quebrar em 4 ou 5, ele vai. Por isso cada linha é um elemento separado com `display: block`.

**Arquivo:** `src/app/(auth)/login/page.tsx` (ou onde estiver o componente de login)

**Código exato:**
```tsx
<div className="max-w-[520px]">
  <p className="text-[28px] font-bold leading-tight text-white whitespace-nowrap">
    Te entregamos um Sistema de IA
  </p>
  <p className="text-[28px] font-bold leading-tight text-white whitespace-nowrap">
    que organiza e acompanha
  </p>
  <p className="text-[28px] font-bold leading-tight text-[#E91E7B] whitespace-nowrap">
    seu futuro e atual paciente
  </p>
  <p className="text-gray-400 text-sm mt-6 leading-relaxed max-w-[400px]">
    Desde o primeiro contato até o agendamento, para aumentar o seu faturamento.
  </p>
</div>
```

**Por que `whitespace-nowrap`:** impede que QUALQUER linha quebre internamente. Cada `<p>` é uma linha, ponto. Sem surpresas.

**Por que `text-[28px]` e não `text-[34px]`:** 34px é grande demais. 28px mantém impacto visual mas cabe no container sem forçar. Teste: se 28px ficar pequeno, suba pra 30px. Se 28px ainda quebrar alguma linha, desça pra 26px. O importante: 3 LINHAS VISÍVEIS.

### Por que falhou 3 vezes antes
1. **1ª vez:** Claude Code disse que aplicou mas não editou o arquivo
2. **2ª vez:** Usou 3 elementos mas manteve 34px sem `whitespace-nowrap`, então o browser ainda quebrava
3. **3ª vez:** Nada mudou — confirmado visualmente em 06/04/2026

### Procedimento obrigatório DESTA VEZ
1. Rodar `grep -rn "Te entregamos" src/` pra achar o arquivo exato
2. Abrir o arquivo e ME MOSTRAR o código atual da headline
3. Substituir pelo código acima (3 `<p>` com `whitespace-nowrap`)
4. Rodar `npm run dev` e abrir no browser local
5. Confirmar visualmente que são 3 linhas
6. SE alguma linha estiver quebrando: ajustar o font-size até caber
7. ME MOSTRAR screenshot ou confirmação visual antes de commitar

### Critério de aceite
- 3 linhas de headline, sem exceção
- Linhas 1 e 2 em branco, linha 3 em magenta #E91E7B
- Proporcional, limpo, profissional
- Subtexto cinza abaixo com espaço respirável
- Funciona em tela 1920px e em tela 1366px (notebook comum)

---

## CORREÇÃO 2: CONVITE DE EQUIPE NAS CONFIGURAÇÕES

### Problema atual
Na página de Configurações > aba Equipe, ao clicar no botão de convidar membro, aparece erro genérico de server component:
> "Ocorreu um erro na renderização dos componentes do servidor. A mensagem específica é omitida nas versões de produção para evitar o vazamento de informações confidenciais."

### Diagnóstico provável (baseado no histórico)
O server action de convite usa um **admin client do Supabase** (com `SUPABASE_SERVICE_ROLE_KEY`) para chamar `supabase.auth.admin.createUser()`. O erro acontece porque:

1. A variável `SUPABASE_SERVICE_ROLE_KEY` pode não estar configurada na Vercel, OU
2. O server action está importando o admin client de forma errada, OU  
3. O server action tenta acessar uma variável de ambiente que não existe em runtime na Vercel e dá erro de "undefined"

### Solução técnica — PASSO A PASSO

**Passo 1 — Verificar variáveis na Vercel:**
```bash
vercel env ls
```
Se `SUPABASE_SERVICE_ROLE_KEY` não aparecer, adicionar:
```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Valor: [ver .env.local]
# Ambiente: Production, Preview, Development
```

**Passo 2 — Verificar o admin client:**
O arquivo do admin client (provavelmente `src/lib/supabase/admin.ts` ou similar) DEVE:
- Usar `createClient` do `@supabase/supabase-js` (NÃO o server client do Next.js)
- Ler `process.env.SUPABASE_SERVICE_ROLE_KEY` (sem NEXT_PUBLIC_)
- Ter fallback/validação: se a key não existir, logar erro claro em vez de crashar

```ts
// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY não configurada!')
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

**Passo 3 — Verificar o server action de convite:**
O server action (provavelmente em `src/lib/actions/team.ts` ou `src/app/configuracoes/actions.ts`) DEVE:
- Ser marcado como `'use server'`
- Importar o `supabaseAdmin` (admin client)
- Usar `supabaseAdmin.auth.admin.createUser({ email, email_confirm: true })`
- Após criar o user no Auth, inserir registro na tabela `users` com `clinic_id` e `role`
- Retornar erro amigável em vez de crashar o server component
- Usar try/catch com retorno de `{ error: string }` em vez de throw

```ts
'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function inviteTeamMember(email: string, role: string = 'dentist') {
  try {
    // Verificar se admin client está configurado
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: 'Configuração do servidor incompleta. Contate o suporte.' }
    }

    // Pegar clinic_id do usuário logado
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado' }

    const { data: currentUser } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', user.id)
      .single()

    if (!currentUser?.clinic_id) return { error: 'Clínica não encontrada' }

    // Criar usuário via admin
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { clinic_id: currentUser.clinic_id, role }
    })

    if (createError) return { error: createError.message }

    // Inserir na tabela users
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUser.user.id,
        email,
        clinic_id: currentUser.clinic_id,
        role,
        name: email.split('@')[0]
      })

    if (insertError) return { error: insertError.message }

    return { success: true, message: `Convite enviado para ${email}` }
  } catch (err: any) {
    console.error('Erro ao convidar membro:', err)
    return { error: 'Erro interno ao convidar membro. Tente novamente.' }
  }
}
```

**Passo 4 — O componente que chama o server action:**
O componente de equipe NÃO deve ser um server component que crasha. Deve:
- Chamar o server action via `useTransition` ou formulário
- Exibir o resultado (sucesso/erro) em toast ou mensagem inline
- NUNCA deixar o server action crashar o render

### Critério de aceite
- Acessar Configurações > Equipe
- Digitar email de teste (ex: teste@cibrido.com.br)
- Clicar em convidar
- Ver mensagem de sucesso OU mensagem de erro amigável (NUNCA crash da página)

---

## DEPLOY

Após as 2 correções:
```bash
npm run build          # Verificar se builda sem erro
git add .
git commit -m "fix: copy login 3 linhas + convite equipe corrigido - FECHA V1"
git push origin main
vercel --prod
```

---

## CREDENCIAIS (para referência do Claude Code)

- **Supabase URL:** https://cktvqvsxogdzeikvoajz.supabase.co
- **ANON_KEY:** sb_publishable_GiKnWq5x4o07pIvyRoT4TA_urZ71kF-
- **SERVICE_ROLE_KEY:** [ver .env.local]
- **Vercel URL:** https://cibrido-crm.vercel.app
- **Admin login:** livelisdigital@gmail.com / Cibrido2026!

---

## REGRAS

1. Não remende — leia o arquivo atual, entenda a estrutura, faça a correção correta
2. ME MOSTRA o código ANTES e DEPOIS de cada edição
3. Testa local com `npm run dev` antes de subir
4. Se algo der erro no build, conserta antes de fazer push
5. Deploy final com `vercel --prod`
6. Avisa quando estiver live

---

*PRD criado em 06/04/2026 — Cíbrido Soluções em IA*
