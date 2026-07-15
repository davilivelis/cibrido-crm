# CHECKLIST CRÍTICO — CibridoCRM V1
## Análise profunda antes da entrega ao primeiro cliente
### Data: 06/04/2026

---

## FILOSOFIA

Steve Jobs não entregava um produto que "funcionava". Ele entregava um produto que o cliente AMAVA usar. O dentista que vai abrir esse CRM pela primeira vez não pode sentir que é um sistema inacabado. Cada detalhe importa.

---

## NÍVEL 1: BLOQUEADORES (impede a entrega)

Esses itens precisam estar 100% antes de qualquer cliente usar:

### 1.1 Primeira impressão
- [ ] Login mobile: logo + headline + formulário visíveis SEM scroll (tela inteira)
- [ ] Login mobile: formulário funciona (email, senha, entrar, criar conta)
- [ ] Login desktop: proporcional e bonito (já validamos hoje ✅)
- [ ] Criar conta: fluxo completo funciona (cria, entra, onboarding)
- [ ] Onboarding: pede só nome da clínica + telefone, não trava, vai pro dashboard

### 1.2 Navegação mobile
- [ ] Menu hamburguer aparece e funciona em todos os celulares
- [ ] Drawer abre com todos os itens do menu
- [ ] Drawer fecha ao clicar em item ou no overlay
- [ ] Todas as páginas acessíveis pelo menu mobile
- [ ] Voltar do browser (botão ←) funciona sem quebrar

### 1.3 Funcionalidades críticas
- [ ] Criar lead: modal abre, preenche, salva, aparece na lista
- [ ] Editar lead: campos editáveis, salva sem erro
- [ ] Pipeline: cards aparecem nas colunas corretas
- [ ] Pipeline: drag-and-drop funciona no desktop
- [ ] Pipeline: touch-drag funciona no mobile (ou alternativa)
- [ ] Pipeline: ao mover card, a etapa atualiza no banco
- [ ] Modal do lead: abre, mostra dados, fecha
- [ ] Agenda: criar consulta funciona
- [ ] Recall: lista carrega com dados corretos
- [ ] Logout: funciona e volta pro login

### 1.4 Dados e segurança
- [ ] Multi-tenant: clínica A não vê dados da clínica B (TESTAR com 2 contas)
- [ ] RLS funcionando em TODAS as tabelas
- [ ] Usuário sem clínica vai pro onboarding (não pro dashboard vazio)
- [ ] Senha mínima de 6 caracteres no cadastro
- [ ] Session expira e redireciona pro login corretamente

---

## NÍVEL 2: EXPERIÊNCIA DO CLIENTE (diferencia produto amador de profissional)

### 2.1 Feedback visual
- [ ] Toast de confirmação em TODA ação: "Lead salvo ✓", "Consulta agendada ✓"
- [ ] Loading spinner nos botões de salvar (evita clique duplo)
- [ ] Estado de erro claro: "Erro ao salvar. Tente novamente." (nunca mensagem técnica)
- [ ] Empty states bonitos: quando não tem leads, pipeline vazio, agenda vazia
  - Pipeline vazio: "Cadastre seu primeiro paciente" + botão de ação
  - Leads vazio: "Nenhum lead encontrado" + botão "Novo Lead"
  - Agenda vazia: "Nenhuma consulta agendada" + botão "Agendar"
  - Recall vazio: "Nenhum recall pendente" + mensagem positiva

### 2.2 Textos e linguagem
- [ ] ZERO inglês na interface (verificar TODOS os textos: botões, labels, placeholders, erros)
- [ ] Linguagem do dentista (paciente, consulta, tratamento — não lead, deal, pipeline)
  - Sidebar: verificar se os nomes estão em pt-BR
  - Dashboard: todos os KPIs em português
  - Formulários: labels e placeholders em português
- [ ] Placeholder nos inputs ajuda o usuário (ex: "nome@clinica.com", "(11) 99999-9999")
- [ ] Título da aba do browser: "CibridoCRM" (não "Create Next App")

### 2.3 Visual e polish
- [ ] Favicon da Cíbrido (não o ícone padrão do Next.js)
- [ ] Logo consistente em todos os lugares (login, sidebar, mobile header)
- [ ] Cores consistentes com a paleta Cíbrido
- [ ] Nenhum elemento cortado, sobrando, ou desalinhado
- [ ] Scroll horizontal indesejado em NENHUMA página
- [ ] Fontes legíveis em mobile (mínimo 14px corpo de texto)

### 2.4 Performance
- [ ] Cada página carrega em menos de 3 segundos
- [ ] Nenhum erro no console do browser (F12 → Console)
- [ ] Imagens otimizadas (logo não pode ser 2MB)

---

## NÍVEL 3: DETALHES QUE ENCANTAM (Steve Jobs level)

### 3.1 Micro-interações
- [ ] Hover nos cards do pipeline muda sombra/elevação
- [ ] Botões mudam de cor no hover
- [ ] Transições suaves entre páginas (não flash branco)
- [ ] Animação sutil ao abrir/fechar modal e drawer

### 3.2 Inteligência
- [ ] Dashboard mostra dados REAIS (se tem 0 leads, mostra 0, não dados fake)
- [ ] Gráfico "Leads por Etapa" reflete dados reais do pipeline
- [ ] Badge de recall no menu mostra número real de recalls vencidos

### 3.3 Acessibilidade básica
- [ ] Contraste suficiente (texto legível sobre todos os fundos)
- [ ] Inputs com labels visíveis (não só placeholder)
- [ ] Botão de fechar nos modais tem tamanho adequado pra toque

---

## NÍVEL 4: TESTES DE CENÁRIO (simular o dia a dia do dentista)

### Cenário 1: Primeiro acesso do dono da clínica
1. Abre crm.cibrido.com.br no celular
2. Clica "Criar conta"
3. Preenche nome, email, senha
4. Faz onboarding (nome da clínica)
5. Chega no dashboard
6. **Resultado esperado:** dashboard limpo, com empty states amigáveis, convite pra cadastrar primeiro paciente

### Cenário 2: Cadastrar o primeiro paciente
1. Clica em "Leads" ou "Novo Lead"
2. Preenche nome, telefone, email, interesse
3. Salva
4. Verifica que apareceu na lista de leads
5. Verifica que apareceu no pipeline (coluna "Novo Lead")
6. **Resultado esperado:** lead aparece em ambos os lugares, toast confirma

### Cenário 3: Mover paciente no pipeline
1. Abre Pipeline
2. Arrasta card de "Novo Lead" pra "Contato Iniciado"
3. Abre o card e verifica que a etapa mudou
4. **Resultado esperado:** card na nova coluna, etapa atualizada

### Cenário 4: Agendar consulta
1. Abre Agenda
2. Cria nova consulta (seleciona paciente, data, horário)
3. Verifica que aparece na agenda
4. **Resultado esperado:** consulta visível na data correta

### Cenário 5: Recall
1. Abre Recall
2. Verifica se tem pacientes com recall pendente
3. Clica em "Enviar lembrete" (se existir)
4. **Resultado esperado:** abre WhatsApp com mensagem pré-pronta

### Cenário 6: Multi-tenant
1. Cria conta com email A → clínica "Sorriso Perfeito"
2. Cadastra 3 pacientes
3. Logout
4. Cria conta com email B → clínica "Dental Premium"
5. Verifica que NÃO vê os pacientes do email A
6. **Resultado esperado:** isolamento total entre clínicas

---

## ITENS JÁ IDENTIFICADOS QUE PRECISAM CORREÇÃO

### Confirmados hoje:
1. **Título da aba:** "Create Next App" → trocar pra "CibridoCRM"
2. **Favicon:** ícone padrão Next.js → trocar pra logo Cíbrido
3. **Convite de equipe:** erro "permission denied" → movido pra V2
4. **Login mobile:** verificar se ficou ok após adaptação do Claude Code

### Prováveis (precisa verificar):
5. **Empty states:** provavelmente inexistentes ou genéricos
6. **Toasts de confirmação:** provavelmente faltam em várias ações
7. **Textos em inglês:** pode ter labels ou mensagens de erro em inglês
8. **Pipeline mobile:** touch-drag pode não estar configurado
9. **Erros no console:** pode ter warnings ou erros de runtime

---

## ORDEM DE EXECUÇÃO RECOMENDADA

### Fase 1: Bloqueadores (ANTES de entregar ao primeiro cliente)
1. Testar TODOS os itens do Nível 1
2. Corrigir o que falhar
3. Trocar título da aba e favicon
4. Testar multi-tenant com 2 contas

### Fase 2: Experiência (ANTES de entregar ao primeiro cliente pagante)
1. Testar TODOS os itens do Nível 2
2. Adicionar empty states
3. Adicionar toasts de confirmação
4. Revisar textos (zero inglês)
5. Rodar os 6 cenários de teste

### Fase 3: Polish (pode ser iterativo, melhoria contínua)
1. Micro-interações
2. Performance
3. Acessibilidade

---

## PRÓXIMOS PASSOS NO CRONOGRAMA (pós-checklist)

### Semana 1: Fechar V1 de verdade
- [ ] Rodar checklist completo
- [ ] Corrigir tudo que falhar
- [ ] Deploy final
- [ ] Documentar Skill do CibridoCRM

### Semana 2: Site + Agentes
- [ ] Site cibrido.com.br (home + LP dental)
- [ ] Agente Juliano (SDR) no GPT Maker — verificar/corrigir
- [ ] Agente Agendador — planejar

### Semana 3: Primeiro cliente
- [ ] Ricardo testa como se fosse cliente (cria conta, cadastra pacientes, usa pipeline)
- [ ] Corrigir feedback do Ricardo
- [ ] Preparar material de onboarding (vídeo curto ou guia PDF)
- [ ] Ativar trial de 10 dias no ClickUp

### Semana 4: V2 começa
- [ ] Módulo de Serviços com valores
- [ ] Convite de equipe corrigido
- [ ] Agenda estilo Google Calendar
- [ ] WhatsApp direto nos leads
- [ ] Dark/Light mode

---

*Checklist criado em 06/04/2026 — Cíbrido Soluções em IA*
*"O detalhe não é o detalhe. O detalhe é o design." — Charles Eames*
