# LIÇÕES DA ERA CÍBRIDO — ler antes de repetir qualquer erro

> O produto nasceu como CibridoCRM (empresa Cíbrido, Davi + Ricardo, encerrada 01/07/2026).
> Em 15/07/2026 virou **CRM Livelis** — produto próprio do Davi (MEI Davi Santos Junior), white-label na venda.
> Esta pasta guarda os PRDs/checklists originais. Este índice destila os erros que NÃO podem se repetir.

## Erros técnicos documentados (e o conserto)
1. **Trigger de signup falhava** (`handle_new_user`) — foi preciso criar fallback `setup_first_user` (migration 004). → Em banco novo, SEMPRE testar o signup de ponta a ponta antes de convidar gente real.
2. **Permissões faltando** — a migration 005 é um remendo de GRANTs criado depois que `authenticated`/`service_role` quebraram em runtime. → Aplicar TODAS as migrations em ordem, inclusive a 005; nunca assumir que RLS policy basta sem GRANT.
3. **Convite de equipe frágil** — "permission denied" no V1, empurrado pra V2 e nunca fechado direito. → Refazer o fluxo de convite de equipe com reset guiado antes de vender multi-usuário.
4. **URLs hardcoded** — reset de senha e fallbacks apontavam pro domínio da empresa; quando a empresa morreu, viraram bombas silenciosas. → Domínio SEMPRE via env var; fallback aponta pro domínio vivo.
5. **Cópia-espelho do projeto dentro do projeto** (`Arquivos/sistema-cibrido-crm`, 100 arquivos) — poluiu buscas e análises por meses. → Backup é git/branch/tag, nunca pasta duplicada na árvore.
6. **Deploy antigo cancelado às pressas** ("gente fuçando lá dentro") — deploy compartilhado com sociedade desfeita vira risco de segurança. → Infra de produto SEMPRE em conta própria do dono.

## Erros de negócio (contexto Cíbrido)
7. **Produto sem dono claro na sociedade** → hoje: produto é do Davi, ponto. Parceiros (ex.: Juninho) são canal/campeão com fronteira ESCRITA antes de construir.
8. **Construído 100% pra um nicho (odonto) sem cliente pagante** → agora: piloto com dor validada (Fast Escova/Trinks) antes de expandir feature.

## O que continua valendo destes documentos
- `VISAO-V2-V3-CibridoCRM.md` — spec do rastreamento (CibridoTrack) que virou o roadmap do produto-alvo (links `/t/`, captura WhatsApp, Conversions API). É a planta da F3.
- `PRD-CibridoCRM-v1.2.md` — inventário do V1 entregue.
