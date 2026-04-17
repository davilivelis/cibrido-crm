import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/leads/export — gera e devolve o CSV de leads
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      name, phone, email, source,
      status, lost_reason, notes,
      utm_source, utm_medium, utm_campaign,
      created_at, converted_at,
      stage:pipeline_stages(name),
      assigned_user:users(name)
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Monta o CSV
  const headers = [
    'Nome', 'Telefone', 'Email', 'Origem',
    'Etapa', 'Status', 'Motivo de Perda',
    'Responsável', 'Observações',
    'UTM Source', 'UTM Medium', 'UTM Campaign',
    'Cadastrado em', 'Convertido em',
  ]

  const statusLabels: Record<string, string> = {
    active: 'Ativo', lost: 'Perdido', converted: 'Convertido',
  }

  function esc(val: unknown): string {
    if (val == null) return ''
    const s = String(val).replace(/"/g, '""')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s
  }

  function fmt(dateStr: string | null) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const rows = (leads ?? []).map((l) => {
    const stage    = l.stage as unknown as { name: string } | null
    const assigned = l.assigned_user as unknown as { name: string } | null
    return [
      esc(l.name),
      esc(l.phone),
      esc(l.email),
      esc(l.source),
      esc(stage?.name),
      esc(statusLabels[l.status] ?? l.status),
      esc(l.lost_reason),
      esc(assigned?.name),
      esc(l.notes),
      esc(l.utm_source),
      esc(l.utm_medium),
      esc(l.utm_campaign),
      esc(fmt(l.created_at)),
      esc(fmt(l.converted_at)),
    ].join(',')
  })

  // BOM UTF-8 para o Excel abrir corretamente em pt-BR
  const bom  = '\uFEFF'
  const csv  = bom + [headers.join(','), ...rows].join('\r\n')
  const date = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${date}.csv"`,
    },
  })
}
