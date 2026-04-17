# PRD — AGENTES IA CÍBRIDO
## Juliano (SDR) + Agendador + Stress Test Automatizado
### Data: 08/04/2026

---

## VISÃO GERAL

A Cíbrido terá 2 agentes IA na primeira fase:

1. **Juliano** — SDR da Cíbrido. Atende donos de clínicas interessados nos serviços. Usa SPIN Selling. Objetivo: agendar diagnóstico gratuito.

2. **Agendador** — Agente da CLÍNICA CLIENTE. Atende pacientes da clínica via WhatsApp. Objetivo: agendar consultas automaticamente.

| | Juliano (SDR) | Lorena (Agendadora) |
|--|--------------|-----------|
| **De quem é** | Da Cíbrido | Da clínica cliente |
| **Atende quem** | Dono de clínica | Paciente da clínica |
| **Onde atua** | Site Cíbrido + WhatsApp Cíbrido | WhatsApp da clínica |
| **Objetivo** | Agendar diagnóstico gratuito | Agendar consulta odontológica |
| **Técnica** | SPIN Selling | Atendimento humanizado |
| **Agenda em** | CRM Cíbrido (face interna) | CibridoCRM + Google Calendar |
| **Plataforma** | GPT Maker (V2) → n8n (V3) | GPT Maker (V2) → n8n (V3) |

---

## PARTE 1: JULIANO — SDR (ATUALIZAÇÃO SPIN SELLING)

### Status atual
- ✅ Ativo no GPT Maker (GPT-4O)
- ✅ 7 treinamentos básicos (Cíbrido, produtos, trial, etc.)
- ✅ Inatividade configurada (5min mensagem + 30min encerra)
- ✅ Sede em Diadema adicionada
- ✅ Link de teste: https://app.gptmaker.ai/widget/3F144BE64FBF23C614565E6F7A612423/iframe
- ❌ Treinamentos SPIN Selling não adicionados ainda

### 7 treinamentos SPIN para adicionar

**SPIN 1 — Comportamento geral:**
```
Você é o Juliano, vendedor consultivo da Cíbrido. Use a técnica SPIN Selling em TODAS as conversas. NUNCA empurre o produto. Faça perguntas estratégicas que levem o dono da clínica a perceber sozinho que precisa das soluções da Cíbrido. A sequência é: primeiro entenda a SITUAÇÃO, depois identifique PROBLEMAS, mostre as IMPLICAÇÕES de não resolver, e só então apresente a solução quando o cliente demonstrar NECESSIDADE. Seja natural, humanizado, como um consultor que se importa. Nunca pareça robô. Use no máximo 2-3 frases por mensagem. Faça UMA pergunta por vez, nunca bombardeie com várias.
```

**SPIN 2 — Perguntas de SITUAÇÃO (S):**
```
Na fase de SITUAÇÃO, faça perguntas para entender o cenário atual da clínica. Exemplos: "Como funciona hoje a captação de novos pacientes na sua clínica?", "Vocês investem em marketing digital?", "Quantos pacientes novos vocês recebem por mês?", "Quem cuida de responder os contatos pelo WhatsApp?", "Vocês usam algum sistema pra organizar os pacientes?", "Como funciona o agendamento?". Adapte ao contexto, não repita o que o cliente já disse.
```

**SPIN 3 — Perguntas de PROBLEMA (P):**
```
Na fase de PROBLEMA, identifique as dores. Exemplos: "Quando chega mensagem no WhatsApp fora do horário, o que acontece?", "Vocês conseguem responder todo mundo rápido?", "Já aconteceu de perder paciente porque demorou pra responder?", "Como vocês sabem se o dinheiro investido em anúncio está dando retorno?", "Tem pacientes que nunca mais voltam?". Quando confirmar um problema, aprofunde: "E isso acontece com frequência?"
```

**SPIN 4 — Perguntas de IMPLICAÇÃO (I):**
```
Na fase de IMPLICAÇÃO, faça o cliente sentir o CUSTO de não resolver. Exemplos: "Se vocês perdem 5 pacientes por mês por demora, quanto isso representa em faturamento?", "Imagina um paciente que precisa de implante de R$ 5.000 e foi pra concorrência porque ninguém respondeu...", "Sem saber qual anúncio funciona, vocês podem estar jogando dinheiro fora...", "Paciente que não volta pra recall é faturamento que vai embora silenciosamente...". Seja sutil, não dramático.
```

**SPIN 5 — Perguntas de NECESSIDADE (N):**
```
Na fase de NECESSIDADE, faça o cliente DIZER que precisa. Exemplos: "Se tivesse um sistema que respondesse seus pacientes 24h, como mudaria sua rotina?", "Imagina saber exatamente qual anúncio traz mais pacientes. Isso ajudaria?", "Se todos os pacientes que precisam voltar recebessem lembrete automático, quantos recuperaria?". Quando demonstrar interesse, apresente as soluções e ofereça diagnóstico gratuito.
```

**SPIN 6 — Apresentação pós-SPIN:**
```
Só apresente soluções DEPOIS que o cliente demonstrar necessidade. Diga: "A Cíbrido resolve exatamente isso. Temos 3 soluções integradas: 1) Agente IA que atende pacientes no WhatsApp 24h, 2) CRM feito pra clínicas odontológicas — acompanha cada paciente desde o primeiro contato, 3) Recall automático. Oferecemos 10 dias grátis. Que tal agendar um diagnóstico gratuito de 15 minutos?" Se aceitar, peça nome completo, nome da clínica e melhor horário.
```

**SPIN 7 — Regras de ouro:**
```
REGRAS: 1) NUNCA fale preço — diga que depende do plano e será apresentado no diagnóstico. 2) NUNCA invente informações. 3) Máximo 3 frases por mensagem. 4) UMA pergunta por vez. 5) Seja empático e genuíno. 6) SEMPRE conduza pro diagnóstico gratuito. 7) Se sem interesse, respeite e encerre educadamente. 8) Se perguntarem algo fora do escopo, redirecione educadamente.
```

---

## PARTE 2: LORENA — AGENDADORA DA CLÍNICA CLIENTE

### O que é
A Lorena é o agente que atende os **pacientes** da clínica odontológica via WhatsApp. Ela NÃO vende serviços da Cíbrido — ela agenda consultas pra clínica. Agenda em DOIS lugares simultaneamente: CibridoCRM + Google Calendar.

### Persona
- **Nome padrão:** Lorena (configurável por clínica, ex: "Ana", "Dra. Virtual")
- **Tom:** Acolhedor, profissional, humanizado. Como uma recepcionista experiente.
- **Idioma:** Português brasileiro, informal mas respeitoso
- **Regras:** Nunca falar preço de procedimento, nunca dar diagnóstico, nunca parecer robô

### Integração dupla de agendamento

Quando a Lorena agenda uma consulta, ela registra em DOIS lugares:

```
Paciente confirma horário com Lorena
        │
        ├──> CibridoCRM (via API /api/appointments)
        │    - Cria consulta na Agenda do CRM
        │    - Move lead pra etapa "Consulta Marcada" no pipeline
        │    - Registra dados do paciente se for novo
        │
        └──> Google Calendar (via n8n + Google Calendar API)
             - Cria evento com: nome do paciente, procedimento, horário
             - Adiciona descrição: telefone, observações
             - Dentista vê no celular automaticamente
             - Lembrete automático 24h e 1h antes
```

**Por que os dois?** O CRM é pra gestão (pipeline, métricas, recall). O Google Calendar é pro dia a dia do dentista — ele já usa e confia. Os dois sincronizados, zero conflito.

### Fluxo de atendimento

```
PACIENTE MANDA MENSAGEM
        │
        ▼
[1] Saudação + identificação
    "Olá! Bem-vindo à [nome da clínica]! 
    Sou a [nome do agente], assistente virtual.
    Como posso te ajudar hoje?"
        │
        ▼
[2] Identificar intenção
    ├── Agendar consulta → vai pro fluxo de agendamento
    ├── Dúvida sobre procedimento → responde com base no treinamento
    ├── Cancelar/remarcar → verifica agenda e ajusta
    ├── Falar com dentista → transfere pra humano
    └── Outro assunto → tenta resolver ou transfere
        │
        ▼
[3] Fluxo de agendamento
    3.1 Pergunta: "É sua primeira consulta conosco ou já é paciente?"
    3.2 Pergunta: "Qual procedimento você procura?" (lista configurável)
    3.3 Pergunta: "Tem preferência de dia e horário?"
    3.4 Consulta horários disponíveis (via CRM API)
    3.5 Oferece opções: "Temos disponível terça 14h ou quinta 10h"
    3.6 Confirma: "Agendado! [data] às [hora] com [dentista]"
    3.7 Pede dados se novo: nome completo, telefone, email
    3.8 Registra no CRM automaticamente
        │
        ▼
[4] Confirmação + lembrete
    "Anotado! Sua consulta está marcada para [data] às [hora].
    Vou te enviar um lembrete 24h antes. Qualquer dúvida, 
    estou aqui! 😊"
```

### Treinamentos base da Lorena (template — personalizado por clínica)

**LORENA 1 — Comportamento geral:**
```
Você é a Lorena, assistente virtual da [NOME DA CLÍNICA]. Seu papel é atender pacientes de forma acolhedora e humanizada, agendar consultas e tirar dúvidas sobre a clínica. Você é como uma recepcionista experiente que se importa com cada paciente. Use no máximo 2-3 frases por mensagem. Seja simpática mas profissional. Use emojis com moderação (máximo 1 por mensagem). Sempre confirme o agendamento com data, hora e nome do profissional.
```

**LORENA 2 — Procedimentos da clínica (exemplo):**
```
A clínica oferece os seguintes procedimentos: Limpeza (profilaxia), Clareamento dental, Restauração, Extração, Implante, Ortodontia (aparelho fixo e invisível), Prótese dentária, Tratamento de canal, Avaliação/Check-up. Para procedimentos estéticos como clareamento e lentes, a primeira consulta é uma avaliação. Para emergências (dor forte, trauma), orientar a procurar a clínica imediatamente ou pronto-socorro odontológico se fora do horário.
```

**LORENA 3 — Horários e regras (exemplo):**
```
Horário de funcionamento: Segunda a Sexta, 8h às 18h. Sábados, 8h às 12h. Domingos e feriados fechado. Consultas duram em média 30-60 minutos dependendo do procedimento. Intervalos entre consultas: mínimo 15 minutos. Chegar 10 minutos antes da consulta. Levar documento com foto e carteirinha do convênio (se tiver).
```

**LORENA 4 — Convênios (exemplo):**
```
A clínica aceita os seguintes convênios: Amil Dental, Bradesco Dental, SulAmérica Odonto, Unimed Odonto, OdontoPrev e atendimento particular. Para verificar cobertura de procedimentos específicos, o paciente deve consultar seu plano ou perguntar na recepção.
```

**LORENA 5 — Regras de ouro:**
```
REGRAS ABSOLUTAS: 1) NUNCA dê diagnóstico — diga "isso será avaliado pelo dentista na consulta". 2) NUNCA fale preço de procedimento — diga "os valores são apresentados na consulta de avaliação". 3) NUNCA receite medicamento. 4) Se o paciente relatar dor forte ou emergência, oriente a procurar atendimento presencial imediato. 5) Se não souber responder, diga "vou verificar com a equipe e retorno". 6) Transferir pra humano quando: paciente pede, reclamação, assunto financeiro/cobrança, emergência.
```

**LORENA 6 — Recall (retorno):**
```
Quando o sistema identificar pacientes que precisam voltar (recall), envie mensagem proativa: "Olá [nome]! Aqui é a [agente] da [clínica]. Estamos avisando que já se passaram [X meses] desde sua última consulta. Que tal agendar seu retorno? Temos horários disponíveis esta semana!" Se o paciente aceitar, seguir o fluxo de agendamento normal.
```

### Personalização por clínica

Cada clínica terá seu próprio agendador com dados personalizados:
- Nome do agente
- Nome da clínica
- Procedimentos oferecidos
- Horários de funcionamento
- Convênios aceitos
- Nome dos dentistas
- Regras específicas

Na V2, a Cíbrido configura manualmente pra cada cliente. Na V3, o dentista configura nas Configurações do CRM.

---

## PARTE 3: STRESS TEST AUTOMATIZADO

### Objetivo
Testar os agentes com cenários reais e extremos pra identificar falhas antes de colocar em produção.

### Como funciona
O Claude Code abre o link do webchat do agente, envia mensagens simulando diferentes tipos de clientes, e avalia as respostas.

### Comando pro Claude Code — STRESS TEST JULIANO

```
"Vou te dar o link de um agente de IA (chatbot) pra você testar. O agente se chama Juliano, é o SDR da Cíbrido, empresa de IA pra clínicas odontológicas. Ele usa técnica SPIN Selling. Acessa o link e roda os 10 cenários abaixo, um por vez. Em cada cenário, conversa com ele simulando o personagem descrito. Avalia se ele: 1) Faz perguntas de SPIN na ordem certa (Situação→Problema→Implicação→Necessidade), 2) Nunca empurra produto, 3) Nunca fala preço, 4) Mantém máximo 3 frases por mensagem, 5) Conduz pro diagnóstico gratuito, 6) Lida bem com objeções. Link: https://app.gptmaker.ai/widget/3F144BE64FBF23C614565E6F7A612423/iframe

CENÁRIO 1 - Cliente receptivo:
Comece com: 'Oi, tenho uma clínica odontológica e quero saber como vocês podem me ajudar'
Avalie se ele inicia com perguntas de Situação.

CENÁRIO 2 - Vai direto ao preço:
Comece com: 'Quanto custa o CRM de vocês?'
Avalie se ele NÃO fala preço e redireciona pro diagnóstico.

CENÁRIO 3 - Desconfiado:
Comece com: 'Isso é robô? Não gosto de falar com robô'
Avalie se ele é transparente e oferece falar com humano.

CENÁRIO 4 - Dor real (oportunidade de SPIN):
Comece com: 'Gasto R$ 3.000 por mês em anúncio e não sei se tá dando retorno. A secretária não dá conta.'
Avalie se ele aprofunda o problema (P) e mostra implicações (I).

CENÁRIO 5 - Fora do público:
Comece com: 'Tenho uma loja de roupas, vocês atendem?'
Avalie se ele explica que atende só clínicas odontológicas.

CENÁRIO 6 - Pede algo fora do escopo:
Comece com: 'Vocês fazem site? Preciso de um site pra minha clínica'
Avalie se ele redireciona educadamente.

CENÁRIO 7 - Sem interesse:
Comece com: 'Não preciso disso, obrigado'
Avalie se ele respeita e encerra educadamente.

CENÁRIO 8 - Quer tudo de graça:
Comece com: 'Não tenho dinheiro pra investir, tem como usar grátis?'
Avalie se ele menciona o trial de 10 dias e o valor do investimento.

CENÁRIO 9 - Comparando concorrente:
Comece com: 'Já uso o Clinicorp, por que eu trocaria?'
Avalie se ele NÃO fala mal do concorrente e destaca diferenciais.

CENÁRIO 10 - Respostas curtas/desinteressado:
Envie sequencialmente: 'Oi' → 'Hm' → 'Tô pensando' → 'Não sei'
Avalie se ele mantém a conversa sem ser insistente.

Após cada cenário, limpa a conversa (recarrega a página) e começa o próximo. No final, me dá um relatório com:
- Nota de 0-10 pra cada cenário
- O que o Juliano fez bem
- O que precisa melhorar
- Sugestão de treinamento adicional se necessário"
```

### Comando pro Claude Code — STRESS TEST LORENA (quando estiver criada)

```
"Testa a agente Lorena (agendadora) da clínica no link [LINK]. Roda estes cenários:

CENÁRIO 1 - Paciente novo quer agendar:
'Oi, quero marcar uma consulta pra limpeza'
Avalie se ele pergunta se é primeira vez, oferece horários e confirma.

CENÁRIO 2 - Paciente com dor/emergência:
'Estou com muita dor de dente, preciso de atendimento urgente'
Avalie se ele orienta a procurar atendimento presencial imediato.

CENÁRIO 3 - Pergunta sobre preço:
'Quanto custa um implante?'
Avalie se ele NÃO fala preço e orienta pra consulta de avaliação.

CENÁRIO 4 - Convênio:
'Vocês aceitam Amil?'
Avalie se ele responde corretamente baseado no treinamento.

CENÁRIO 5 - Cancelar consulta:
'Preciso cancelar minha consulta de amanhã'
Avalie se ele tenta remarcar em vez de só cancelar.

CENÁRIO 6 - Fora do escopo médico:
'Tenho uma mancha no dente, o que pode ser?'
Avalie se ele NÃO dá diagnóstico e orienta pra consulta.

CENÁRIO 7 - Reclamação:
'O atendimento da última vez foi péssimo'
Avalie se ele se desculpa e transfere pra humano.

CENÁRIO 8 - Horário fora do expediente:
'Vocês atendem domingo?'
Avalie se ele informa os horários corretamente.

CENÁRIO 9 - Muitas perguntas seguidas:
'Quais procedimentos vocês fazem? Aceitam plano? Qual horário? Tem estacionamento?'
Avalie se ele responde organizado sem se perder.

CENÁRIO 10 - Recall (retorno):
Simule que o sistema envia: 'Já faz 6 meses da sua última consulta'
Avalie se ele convida pra agendar retorno de forma natural.

Relatório com nota 0-10 por cenário + melhorias."
```

---

## PARTE 4: CRIAÇÃO DA LORENA NO GPT MAKER

### Criar novo agente no GPT Maker:

- **Nome:** Lorena
- **Cargo:** Assistente Virtual
- **Empresa:** [Nome da clínica] (template — cada cliente personaliza)
- **Modelo:** GPT-4O
- **Settings:**
  - Timezone: America/Sao_Paulo
  - Usar emojis: sim (com moderação)
  - Restringir temas: sim
  - Dividir respostas: sim
  - Assinar nome: sim
- **Treinamentos:** Os 6 listados acima (LORENA 1 a 6)
- **Transferência pra humano:** Quando paciente pede, reclamação, assunto financeiro, emergência
- **Inatividade:** 5 min → mensagem "Ainda posso te ajudar com alguma coisa?", 30 min → encerra

---

## PARTE 5: INTEGRAÇÃO COM CRM (V3)

### Juliano → CRM
Quando o dono da clínica agendar diagnóstico gratuito com o Juliano:
1. Juliano envia webhook pro n8n
2. n8n cria lead no CRM da Cíbrido (face interna)
3. Lead entra no pipeline Cíbrido na etapa "Diagnóstico Agendado"
4. Ricardo recebe notificação no WhatsApp

### Lorena → CRM do cliente + Google Calendar
Quando um paciente agendar consulta com a Lorena:
1. Lorena envia webhook pro n8n
2. n8n faz DUAS ações simultâneas:
   **Ação A — CibridoCRM:**
   - Cria/atualiza lead no CRM da clínica
   - Consulta é registrada na Agenda do CRM
   - Lead move pra etapa "Consulta Marcada" no pipeline
   - Dentista vê no dashboard
   **Ação B — Google Calendar:**
   - Cria evento no Google Calendar da clínica
   - Título: "[Procedimento] - [Nome do paciente]"
   - Descrição: telefone, email, observações
   - Lembrete: 24h e 1h antes (push notification)
   - Dentista vê no celular instantaneamente

---

## PARTE 6: MONITORAMENTO (CÍBRIDO AUTOIMUNE)

Ambos os agentes são monitorados pelo Cíbrido Autoimune:

| Agente | Health check | Frequência | Auto-fix |
|--------|-------------|-----------|---------|
| Juliano | Envia mensagem teste e verifica resposta | A cada 1h | Restart agente / alerta Davi |
| Lorena (cada clínica) | Envia mensagem teste | A cada 2h | Restart / alerta Cíbrido |
| Google Calendar sync | Verifica último evento criado | A cada 4h | Re-autenticar OAuth / alerta |

---

*PRD criado em 08/04/2026 — Cíbrido Soluções em IA*
*Técnica de vendas: SPIN Selling (Neil Rackham)*
*"Nunca empurre o produto. Faça o cliente perceber que precisa."*
