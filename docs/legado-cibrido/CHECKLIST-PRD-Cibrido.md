# Checklist PRD — Cíbrido
## Use ANTES de mandar qualquer projeto pro Claude Code
### Se algum item não foi pensado, PARE e pense antes de executar

---

## 1. AUTENTICAÇÃO E ACESSO
- [ ] Tela de login (email + senha)
- [ ] Tela de cadastro (novo usuário)
- [ ] Esqueci minha senha (recuperação por email)
- [ ] Login com Google/social (se aplicável)
- [ ] Mostrar/ocultar senha (ícone olho)
- [ ] Validação de senha (mínimo caracteres)
- [ ] Loading/feedback visual nos botões
- [ ] Termos de Uso e Política de Privacidade (checkbox + links)
- [ ] Logout (botão visível, fácil de achar)
- [ ] Sessão expira por inatividade?
- [ ] Quem é o admin? Como ele acessa?
- [ ] Multi-tenant: como isolar dados entre clientes?

## 2. ONBOARDING (PRIMEIRO ACESSO)
- [ ] O que é obrigatório preencher?
- [ ] O que é opcional (preenche depois)?
- [ ] O que acontece se der erro? (nunca travar)
- [ ] Mensagem de boas-vindas personalizada
- [ ] Dados de exemplo pra plataforma não parecer vazia
- [ ] Tour guiado / tutorial interativo
- [ ] Botão "Limpar dados de exemplo"

## 3. NAVEGAÇÃO E LAYOUT
- [ ] Sidebar: quais páginas, quais ícones, qual ordem
- [ ] Logo no topo (como aparece, qual versão)
- [ ] Nome do cliente/empresa visível no header
- [ ] Breadcrumb ou indicação de localização
- [ ] Responsivo: funciona no celular e tablet?
- [ ] Modo escuro / modo claro?
- [ ] Fonte: tamanho base (16px mínimo), hierarquia de headings
- [ ] Cores: definir paleta completa ANTES de codar
- [ ] Toda interface em português brasileiro

## 4. CADASTROS E FORMULÁRIOS
- [ ] Quais campos são obrigatórios vs opcionais?
- [ ] Quais campos são dropdown vs texto livre?
- [ ] Dropdowns são fixos ou o cliente cadastra opções? (ex: serviços)
- [ ] Campos têm validação? (email válido, telefone formatado)
- [ ] Feedback visual de sucesso/erro (toast)
- [ ] Upload de arquivo/foto necessário?
- [ ] Importação em massa (CSV)?
- [ ] Exportação (CSV/PDF)?

## 5. MÓDULO DE SERVIÇOS / PRODUTOS
- [ ] O cliente cadastra seus próprios serviços?
- [ ] Cada serviço tem: nome, preço, duração, status?
- [ ] Serviços pré-cadastrados como exemplo?
- [ ] Serviços aparecem em quais partes? (leads, agendamento, pipeline, dashboard)
- [ ] Valor do lead/card é calculado pelos serviços?

## 6. PIPELINE / KANBAN
- [ ] Quais etapas padrão?
- [ ] Cliente pode customizar etapas?
- [ ] Drag-and-drop funcional
- [ ] O que acontece ao clicar no card? (modal Trello, slide-over, página nova?)
- [ ] Quais informações aparecem no card resumido?
- [ ] Quais informações aparecem no card expandido?
- [ ] Ações rápidas (WhatsApp, ligar, agendar, nota)
- [ ] Valor por card e total por coluna
- [ ] Empty state (pipeline vazio)

## 7. AGENDA / CALENDÁRIO
- [ ] Visualização: dia, semana, mês?
- [ ] Clicar em horário vazio abre agendamento?
- [ ] Cores por status (agendado, confirmado, no-show, cancelado)
- [ ] Dia atual destacado
- [ ] Integração com Google Calendar?
- [ ] Duração da consulta automática pelo serviço?

## 8. DASHBOARD / MÉTRICAS
- [ ] Quais KPIs mostrar? (listar todos)
- [ ] Os dados são reais (calculados do banco) ou placeholder?
- [ ] Gráficos: quais tipos? (barras, pizza, funil, linha)
- [ ] Período filtrável (hoje, semana, mês, ano)?
- [ ] Faturamento: potencial vs realizado
- [ ] Ranking de serviços / fontes / etc
- [ ] Atividades recentes

## 9. COMUNICAÇÃO E INTEGRAÇÕES
- [ ] WhatsApp: botão direto pra conversa (wa.me)?
- [ ] Mensagens pré-prontas (templates)?
- [ ] Email: envio pelo sistema?
- [ ] Integração com WhatsApp API (Evolution/Z-API)?
- [ ] Integração com Google Calendar?
- [ ] Integração com sistema de pagamento?
- [ ] Webhooks / APIs externas?

## 10. RECALL / RETORNO
- [ ] Como o recall é criado? (manual, automático após consulta?)
- [ ] Status do recall (pendente, contatado, agendado, concluído)
- [ ] Alerta visual de vencidos
- [ ] Contagem regressiva ("falta X dias" / "atrasado há X dias")
- [ ] Ação rápida: enviar lembrete WhatsApp com mensagem pré-pronta
- [ ] Badge na sidebar com quantidade de recalls vencidos

## 11. CONFIGURAÇÕES
- [ ] Dados da clínica (nome, telefone, email, endereço, logo)
- [ ] Gestão de equipe (convidar, remover, definir cargo)
- [ ] Cadastro de serviços
- [ ] Customização do pipeline (etapas)
- [ ] Templates de mensagem
- [ ] Dados do plano/assinatura
- [ ] Limpar dados de exemplo

## 12. EXPERIÊNCIA GERAL (UX)
- [ ] Toast de confirmação em TODAS as ações
- [ ] Loading skeleton enquanto carrega
- [ ] Empty states com CTA em todas as listas vazias
- [ ] Botão de suporte/WhatsApp Cíbrido flutuante
- [ ] Undo (desfazer) em ações críticas?
- [ ] Notificações em tempo real?
- [ ] Busca global?

## 13. SEGURANÇA E COMPLIANCE
- [ ] LGPD: exportar/deletar dados do paciente
- [ ] Termos de Uso escritos
- [ ] Política de Privacidade escrita
- [ ] RLS (Row Level Security) em todas as tabelas
- [ ] Backup automático
- [ ] Rate limiting nos endpoints

## 14. DEPLOY E INFRAESTRUTURA
- [ ] Onde vai hospedar? (Vercel, etc)
- [ ] Domínio configurado?
- [ ] SSL/HTTPS?
- [ ] CI/CD (deploy automático)?
- [ ] Monitoramento de erros?
- [ ] Analytics (GA4, etc)?

## 15. DESIGN SYSTEM
- [ ] Paleta de cores definida (hex codes)
- [ ] Tipografia definida (font family, tamanhos)
- [ ] Componentes: botões, cards, modais, tabelas, forms
- [ ] Ícones: qual biblioteca?
- [ ] Logo: versão completa, ícone, monocromática
- [ ] Gradientes da marca
- [ ] Espaçamentos padrão

---

## REGRA DE OURO
> "Se não está no PRD, não vai pro código."
> Descobriu algo novo? Volta pro PRD, adiciona, DEPOIS manda executar.

---

*Checklist criado em 01/04/2026 — Cíbrido Soluções em IA*
