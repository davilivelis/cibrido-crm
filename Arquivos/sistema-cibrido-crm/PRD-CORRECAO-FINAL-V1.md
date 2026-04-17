# PRD — CORREÇÃO FINAL V1 CibridoCRM
## Documento de Requisitos para Claude Code
### Data: 06/04/2026

---

## CONTEXTO

O CibridoCRM V1 está online em https://cibrido-crm.vercel.app com 16 funcionalidades operacionais. Resta EXATAMENTE 1 correção visual para fechar o V1. O convite de equipe foi movido pra V2.

**Pasta do projeto:** C:\Users\Davi Jr\Downloads\PROJETOCLAUDECOUDE\cibrido-crm
**Stack:** Next.js 14 (App Router) + Supabase + TailwindCSS + shadcn/ui
**Deploy:** Vercel (vercel --prod)
**GitHub:** https://github.com/davilivelis/cibrido-crm (branch: main)

---

## CORREÇÃO ÚNICA: TELA DE LOGIN — LOGO + CENTRALIZAR + FONTE

### Estado atual (verificado em 06/04/2026)
A tela de login tem layout split-screen (lado esquerdo navy #1E2A3A, lado direito branco com formulário). O lado esquerdo hoje tem:
- Logo com fundo PRETO aparecendo (a imagem é JPEG sem transparência — quadrado preto feio)
- Efeito de rede/nodes atrás da logo — REAPROVEITAR como background sutil do lado esquerdo inteiro
- Texto "CibridoCRM" abaixo da logo
- Headline em 3 linhas (a copy JÁ ESTÁ nas 3 linhas corretas — NÃO ALTERAR O TEXTO)
- Subtexto cinza abaixo
- TUDO alinhado à ESQUERDA — precisa CENTRALIZAR

---

### AJUSTE 1: LOGO + FUNDO DE REDE SUTIL

A imagem `logo_sem_fundo.png` na raiz do projeto contém DUAS coisas:
1. Os **balões entrelaçados** coloridos (centro da imagem) — isso é a LOGO
2. Os **ícones de rede** ao redor (gráficos, envelopes, nodes, linhas) — isso é DECORAÇÃO

Vamos usar as duas coisas de forma inteligente:
- **LOGO (só os balões):** recortar o centro da imagem, remover fundo preto → usar como logo principal, grande e vibrante
- **FUNDO DE REDE (imagem inteira):** remover fundo preto → usar como background do lado esquerdo inteiro, com opacidade BAIXA (10-15%) pra criar uma textura sutil e tecnológica

#### Arquivo de origem
`logo_sem_fundo.png` na raiz do projeto. É JPEG com fundo PRETO sólido (512x512px).

#### O que fazer
1. Instalar Sharp (se não estiver instalado): `npm install sharp`
2. Criar um script que gera DOIS arquivos:
   - `/public/logo-cibrido.png` → só os balões, fundo transparente (crop do centro)
   - `/public/bg-network.png` → imagem inteira, fundo transparente (pra usar como background sutil)
3. Deletar o script temporário depois

#### Script de conversão:
```js
// remove-bg.js (temporário — deletar depois)
const sharp = require('sharp');

async function processImages() {
  // === IMAGEM 1: Fundo de rede inteiro (sem fundo preto) ===
  const fullImg = sharp('logo_sem_fundo.png');
  const { data: fullData, info: fullInfo } = await fullImg
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < fullData.length; i += 4) {
    const r = fullData[i], g = fullData[i+1], b = fullData[i+2];
    if (r < 30 && g < 30 && b < 30) {
      fullData[i+3] = 0;
    }
  }

  await sharp(fullData, {
    raw: { width: fullInfo.width, height: fullInfo.height, channels: 4 }
  })
    .png()
    .toFile('public/bg-network.png');

  console.log('Fundo de rede salvo em public/bg-network.png');

  // === IMAGEM 2: Só os balões (crop do centro + sem fundo preto) ===
  const cropSize = Math.floor(fullInfo.width * 0.55); // ~55% do centro
  const offset = Math.floor((fullInfo.width - cropSize) / 2);

  const croppedImg = sharp('logo_sem_fundo.png');
  const { data: cropData, info: cropInfo } = await croppedImg
    .extract({ left: offset, top: Math.floor(fullInfo.height * 0.15), width: cropSize, height: Math.floor(fullInfo.height * 0.7) })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < cropData.length; i += 4) {
    const r = cropData[i], g = cropData[i+1], b = cropData[i+2];
    if (r < 30 && g < 30 && b < 30) {
      cropData[i+3] = 0;
    }
  }

  await sharp(cropData, {
    raw: { width: cropInfo.width, height: cropInfo.height, channels: 4 }
  })
    .png()
    .toFile('public/logo-cibrido.png');

  console.log('Logo (só balões) salva em public/logo-cibrido.png');
}

processImages();
```

Rodar: `node remove-bg.js`
Depois: deletar o script (`del remove-bg.js` no Windows)

#### No componente de login — LOGO
Substituir a tag de imagem da logo atual por:
```tsx
<img 
  src="/logo-cibrido.png" 
  alt="Cíbrido" 
  className="h-40 w-auto relative z-10"
/>
```

**TAMANHO DA LOGO:** `h-40` (160px). O Davi quer a logo GRANDE e próxima do nome "CibridoCRM".

**A logo atual no `/public/Logo.png` tem o nome "Cíbrido" escrito dentro. NÃO USAR.** Usar SOMENTE `/public/logo-cibrido.png` (só os balões, sem texto).

#### No componente de login — FUNDO DE REDE SUTIL
Adicionar a imagem `bg-network.png` como background do container do lado esquerdo inteiro:
```tsx
{/* Container do lado esquerdo */}
<div className="relative w-1/2 bg-[#1E2A3A] flex flex-col items-center justify-center h-full text-center px-8 overflow-hidden">
  
  {/* Fundo de rede sutil — cobre a tela inteira com opacidade baixa */}
  <img
    src="/bg-network.png"
    alt=""
    className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none"
  />
  
  {/* Conteúdo por cima do fundo */}
  <div className="relative z-10">
    <img src="/logo-cibrido.png" alt="Cíbrido" className="h-40 w-auto mx-auto" />
    <p className="text-white font-bold text-[30px] mt-2">CibridoCRM</p>
    {/* ... headline e subtexto ... */}
  </div>
</div>
```

**Opacidade `0.08` (8%)** — sutil, quase uma textura. Dá profundidade e contexto tecnológico sem competir com a logo e o texto. Se ficar invisível demais, subir pra `0.12`. Se ficar poluído, descer pra `0.05`. O ponto certo é: o cliente sente que tem algo ali mas não distrai da leitura.

### IMPORTANTE — TAMANHOS E ESPAÇAMENTO

**CONTEXTO:** O Davi testou a versão atual com zoom de 125% e gostou do resultado. Isso significa que todos os tamanhos atuais estão ~25% MENORES do que o ideal. Todos os tamanhos abaixo já estão corrigidos pra ficarem bons no zoom 100% (tamanho normal da tela).

**ESPAÇAMENTO:** A logo precisa ficar PRÓXIMA ao nome "CibridoCRM" — gap curto (`mt-2`, 8px). O conjunto todo precisa parecer UM BLOCO coeso.

---

### AJUSTE 2: CENTRALIZAR TUDO NO LADO ESQUERDO

O código do Ajuste 1 já inclui a centralização (`items-center justify-center text-center`). Este ajuste é pra garantir que NENHUM elemento filho tenha `text-left` ou alinhamento à esquerda sobrando.

Verificar que TODOS os textos estão `text-center`. Se a headline tiver `text-left`, trocar por `text-center`.

A estrutura visual final do lado esquerdo, de cima pra baixo, centralizado:
```
[logo h-40 (160px) — só os balões, sem texto, sem fundo]
          ↕ mt-2 (8px) — BEM JUNTO do nome
CibridoCRM          ← texto branco, bold, text-[30px]
          ↕ mt-5 (20px)
Te entregamos um Sistema de IA      ← branco, bold, 38px
que organiza e acompanha             ← branco, bold, 38px
seu futuro e atual paciente          ← magenta #E91E7B, bold, 38px
          ↕ mt-5 (20px)
Desde o primeiro contato até o       ← cinza claro, text-xl (20px)
agendamento, para aumentar           ← cinza claro, text-xl (20px)
o seu faturamento.                   ← cinza claro, text-xl (20px)
```

**O texto "CibridoCRM" abaixo da logo:** `text-[30px]`, bold, branco. Espaço CURTO da logo (`mt-2`) — logo e nome praticamente colados.

**O subtexto "Desde o primeiro contato...":** `text-xl` (20px), `text-gray-400`, `leading-relaxed`. `max-w-[480px]` pra quebrar em 2 linhas. Centralizado.

---

### AJUSTE 3: AUMENTAR LEVEMENTE A FONTE DA HEADLINE

A copy das 3 linhas está correta e NÃO DEVE SER ALTERADA:
- Linha 1 (branco, bold): "Te entregamos um Sistema de IA"
- Linha 2 (branco, bold): "que organiza e acompanha"
- Linha 3 (magenta #E91E7B, bold): "seu futuro e atual paciente"

Aumentar a fonte pra **38px**. O Davi testou com zoom de 125% e gostou — 38px no zoom 100% equivale ao que ele viu com 30px no 125%.

Font-weight: bold (700)
Line-height: leading-tight (1.25)

Cada linha DEVE ser um elemento HTML separado (`<p>` ou `<div>`) com `whitespace-nowrap`:
```tsx
<div className="mt-5">
  <p className="text-[38px] font-bold leading-tight text-white whitespace-nowrap">
    Te entregamos um Sistema de IA
  </p>
  <p className="text-[38px] font-bold leading-tight text-white whitespace-nowrap">
    que organiza e acompanha
  </p>
  <p className="text-[38px] font-bold leading-tight text-[#E91E7B] whitespace-nowrap">
    seu futuro e atual paciente
  </p>
</div>
<p className="text-gray-400 text-xl mt-5 leading-relaxed max-w-[480px] mx-auto">
  Desde o primeiro contato até o agendamento, para aumentar o seu faturamento.
</p>
```

**Subtexto:** `text-xl` (20px). `max-w-[480px]` faz quebrar em 2 linhas. Centralizado.

Se 30px fizer alguma linha quebrar, descer pra 28px. As 3 linhas são INEGOCIÁVEIS.

---

## O QUE NÃO MEXER

- Lado direito do login (formulário com abas Entrar/Criar conta) — NÃO TOCAR
- Copy da headline — JÁ ESTÁ CORRETA, NÃO ALTERAR O TEXTO
- Funcionalidade do login — NÃO TOCAR em lógica, só visual
- Nenhuma outra página do CRM — só a tela de login

---

## PROCEDIMENTO OBRIGATÓRIO

1. Rodar `grep -rn "CibridoCRM\|Logo\|entregamos" src/ --include="*.tsx"` pra achar o arquivo exato
2. ABRIR o arquivo e ME MOSTRAR o código atual do lado esquerdo da tela de login
3. Rodar o script de conversão (Sharp) e confirmar que DOIS arquivos foram criados:
   - `/public/logo-cibrido.png` (só os balões, sem fundo)
   - `/public/bg-network.png` (rede inteira, sem fundo)
4. Aplicar os 3 ajustes (logo + fundo de rede, centralizar, fonte)
5. ME MOSTRAR o código DEPOIS das edições
6. Rodar `npm run dev` e abrir no browser local
7. CONFIRMAR visualmente: logo só balões, fundo de rede sutil, conteúdo centralizado, 3 linhas
8. Build, push, deploy + domínio

---

## DEPLOY + DOMÍNIO CUSTOMIZADO

### Deploy
```bash
npm run build
git add .
git commit -m "fix: login visual - tamanhos maiores + logo próxima do nome - FECHA V1"
git push origin main
vercel --prod
```

### Configurar domínio crm.cibrido.com.br na Vercel
Após o deploy, rodar:
```bash
vercel domains add crm.cibrido.com.br
```
Se pedir pra confirmar projeto, selecionar `cibrido-crm`.
Depois verificar:
```bash
vercel domains inspect crm.cibrido.com.br
```

### DNS no Cloudflare (Davi faz manualmente)
O domínio `cibrido.com.br` está no Registro.br, mas os nameservers apontam pro **Cloudflare** (emma.ns.cloudflare.com / keenan.ns.cloudflare.com). Então o registro DNS é criado no painel do Cloudflare, NÃO no Registro.br.

Passos pro Davi:
1. Acessar https://dash.cloudflare.com → login
2. Selecionar o domínio `cibrido.com.br`
3. Ir em **DNS** → **Records** → **Add record**
4. Preencher:
   - **Type:** CNAME
   - **Name:** crm
   - **Target:** cname.vercel-dns.com
   - **Proxy status:** DNS only (nuvem CINZA, NÃO laranja) — IMPORTANTE: desligar o proxy do Cloudflare senão o SSL da Vercel não funciona
   - **TTL:** Auto
5. Salvar

A propagação com Cloudflare é quase instantânea (1-5 minutos). Após propagar, `crm.cibrido.com.br` vai apontar pro CRM.

---

## REGRAS

1. Leia o código atual ANTES de editar — me mostra antes e depois
2. Testa local antes de subir
3. NÃO ALTERAR a copy da headline (já está certa nas 3 linhas)
4. NÃO MEXER no formulário do lado direito
5. Se algo quebrar no build, conserta antes de push
6. Avisa quando estiver live

---

## NOTA: CONVITE DE EQUIPE → V2

O convite de equipe nas Configurações foi movido pra V2. Erro atual: "permission denied for table users". Na V2 resolver junto com:
- Correção do RLS pra insert na tabela users pelo admin client
- Listagem de colaboradores cadastrados (pro dono ver quem tá no CRM)
- Limite de usuários por plano (definir na V2)
- Campo de visualização dos membros da equipe na tela de Configurações

---

*PRD criado em 06/04/2026 — Cíbrido Soluções em IA*
