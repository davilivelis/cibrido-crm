-- 018 — inclui 'pesquisa' no CHECK de notification_rules.type (senão a notificação
-- de pesquisa de satisfação nunca liga — viola CHECK 23514). Aplicada 20/07/2026.
ALTER TABLE notification_rules DROP CONSTRAINT IF EXISTS notification_rules_type_check;
ALTER TABLE notification_rules ADD CONSTRAINT notification_rules_type_check
  CHECK (type IN ('confirmacao','vespera','no_dia','hora_antes','aniversario','recall','avaliacao','pesquisa','relatorio_dono'));
