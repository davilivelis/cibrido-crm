// Templates padrão do motor de notificações.
// A clínica pode sobrescrever qualquer um na tela Configurações → Notificações.
// Variáveis disponíveis: {nome} {primeiro_nome} {data} {hora} {clinica} {link} {motivo}

export type NotificationType =
  | 'confirmacao'
  | 'vespera'
  | 'no_dia'
  | 'hora_antes'
  | 'aniversario'
  | 'recall'
  | 'avaliacao'
  | 'pesquisa'
  | 'relatorio_dono'

export const NOTIFICATION_LABELS: Record<NotificationType, { label: string; desc: string }> = {
  confirmacao:    { label: 'Confirmação ao agendar',  desc: 'Assim que a consulta é marcada, o paciente recebe pedido de confirmação com link' },
  vespera:        { label: 'Lembrete de véspera',     desc: '1 dia antes da consulta' },
  no_dia:         { label: 'Lembrete no dia',          desc: 'Na manhã do dia da consulta' },
  hora_antes:     { label: 'Lembrete 1h antes',        desc: 'Cerca de 1 hora antes do horário' },
  aniversario:    { label: 'Aniversário',              desc: 'Parabéns no aniversário do paciente' },
  recall:         { label: 'Recall automático',        desc: 'Chama de volta o paciente com retorno vencido' },
  avaliacao:      { label: 'Pedido de avaliação',      desc: 'No dia seguinte à consulta realizada, pede avaliação no Google' },
  pesquisa:       { label: 'Pesquisa de satisfação',   desc: 'No dia seguinte à consulta, pede nota do profissional e da recepção (interno + relatório)' },
  relatorio_dono: { label: 'Relatório semanal (dono)', desc: 'Toda segunda de manhã, resumo da semana no WhatsApp do dono' },
}

export const DEFAULT_TEMPLATES: Record<NotificationType, string> = {
  confirmacao:
    'Olá, {primeiro_nome}! Aqui é da {clinica}. 😊\n\nSua consulta foi agendada para *{data} às {hora}*.\n\nPor favor, confirme sua presença no link:\n{link}',
  vespera:
    'Oi, {primeiro_nome}! Passando pra lembrar da sua consulta *amanhã, {data} às {hora}* aqui na {clinica}.\n\nConfirma pra gente? {link}',
  no_dia:
    'Bom dia, {primeiro_nome}! ☀️\n\nHoje tem consulta na {clinica}: *{hora}*.\n\nTe esperamos!',
  hora_antes:
    '{primeiro_nome}, sua consulta na {clinica} é daqui a pouco, às *{hora}*. Já estamos te esperando! 😉',
  aniversario:
    'Parabéns, {primeiro_nome}! 🎉\n\nA equipe da {clinica} deseja um feliz aniversário — muita saúde (e muitos sorrisos)!',
  recall:
    'Oi, {primeiro_nome}! Aqui é da {clinica}.\n\nJá faz um tempo desde: {motivo}. Que tal agendar seu retorno? É só responder essa mensagem. 😊',
  avaliacao:
    '{primeiro_nome}, obrigado pela visita à {clinica} ontem! 💚\n\nSua opinião vale muito: pode deixar uma avaliação rapidinho? {link}',
  pesquisa:
    'Oi, {primeiro_nome}! Aqui é da {clinica}. 💚\n\nComo foi seu atendimento ontem? Leva 30 segundos pra avaliar (e ajuda a gente a melhorar):\n{link}',
  relatorio_dono:
    '*[{clinica} — Resumo da semana]* 📊\n\n{resumo}\n\n— CRM Livelis, trabalhando por você.',
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)
}

export function firstName(name: string | null | undefined): string {
  return (name ?? '').trim().split(/\s+/)[0] || 'tudo bem'
}
