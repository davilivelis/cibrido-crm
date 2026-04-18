import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Users, TrendingUp, CalendarCheck, MessageCircle, Tag, StickyNote, PhoneCall, MessageSquare, CalendarPlus } from 'lucide-react'
import FunnelChart from '@/components/dashboard/FunnelChart'
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist'

export const metadata: Metadata = { title: 'Dashboard' }

const EVENT_ICONS: Record<string, React.ElementType> = {
  stage_change: Tag,
  note:         StickyNote,
  call:         PhoneCall,
  whatsapp:     MessageSquare,
  appointment:  CalendarPlus,
}

const EVENT_LABELS: Record<string, string> = {
  stage_change: 'Etapa alterada',
  note:         'Nota',
  call:         'Ligação',
  whatsapp:     'WhatsApp',
  appointment:  'Agendamento',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: clinicIdData } = await supabase.rpc('get_user_clinic_id')

  const [leadsResult, appointmentsResult, conversationsResult, stagesResult, eventsResult, clinicResult] = await Promise.all([
    supabase.from('leads').select('id, status, stage_id, created_at'),
    supabase.from('appointments').select('id, status', { count: 'exact' }).eq('status', 'scheduled'),
    supabase.from('conversations').select('id', { count: 'exact' }),
    supabase.from('pipeline_stages').select('id, name, color, position').eq('is_active', true).order('position'),
    supabase
      .from('lead_events')
      .select('id, type, description, created_at, lead:leads(id, name), user:users(id, name)')
      .order('created_at', { ascending: false })
      .limit(8),
    clinicIdData
      ? supabase.from('clinics').select('phone').eq('id', clinicIdData).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const clinic            = clinicResult.data
  const leads             = leadsResult.data ?? []
  const totalLeads        = leads.length
  const leadsAtivos       = leads.filter((l) => l.status === 'active').length
  const leadsConvertidos  = leads.filter((l) => l.status === 'converted').length
  const consultasMarcadas = appointmentsResult.count ?? 0
  const totalConversas    = conversationsResult.count ?? 0
  const taxaConversao     = totalLeads > 0 ? Math.round((leadsConvertidos / totalLeads) * 100) : 0

  const stages     = stagesResult.data ?? []
  const funnelData = stages.map((stage) => ({
    name:  stage.name,
    total: leads.filter((l) => l.stage_id === stage.id && l.status === 'active').length,
    color: stage.color,
  }))

  const cards = [
    { label: 'Leads Ativos',       value: leadsAtivos,         icon: Users,         color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Taxa de Conversão',  value: `${taxaConversao}%`, icon: TrendingUp,    color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Consultas Marcadas', value: consultasMarcadas,   icon: CalendarCheck, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Conversas WhatsApp', value: totalConversas,      icon: MessageCircle, color: 'text-blue-600',   bg: 'bg-blue-50' },
  ]

  const events = eventsResult.data ?? []

  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div>
        <h1 className="text-xl lg:text-[28px] font-bold text-gray-900 leading-tight">Dashboard</h1>
        <p className="text-sm lg:text-base text-gray-500 mt-1">Acompanhe seus leads e consultas agendadas</p>
      </div>

      {/* Checklist de configuração inicial */}
      <OnboardingChecklist
        totalLeads={totalLeads}
        totalAppointments={consultasMarcadas}
        clinicPhone={clinic?.phone ?? null}
      />

      {/* Cards de métricas — KPI principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white flex items-center gap-5"
              style={{
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #E2E5EA',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div className={`w-14 h-14 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-7 h-7 ${card.color}`} />
              </div>
              <div>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#111827', lineHeight: 1 }}>
                  {card.value}
                </p>
                <p style={{ fontSize: '16px', fontWeight: 500, color: '#6b7280', marginTop: '4px' }}>
                  {card.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráfico + Atividade recente */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Gráfico de funil */}
        <div
          className="lg:col-span-3 bg-white"
          style={{ padding: '24px', borderRadius: '12px', border: '1px solid #E2E5EA', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#374151' }}>Leads por Etapa</h2>
            <span style={{ fontSize: '14px', color: '#9ca3af' }}>{leadsAtivos} ativos</span>
          </div>
          {totalLeads === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: '#fdf2f8' }}
              >
                <Users className="w-7 h-7" style={{ color: '#E91E7B' }} />
              </div>
              <div className="text-center">
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                  Seu funil está esperando
                </p>
                <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
                  Cadastre o primeiro paciente para visualizar os dados aqui.
                </p>
              </div>
              <a
                href="/leads"
                className="px-5 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#E91E7B', color: '#fff', fontSize: '14px' }}
              >
                Cadastrar primeiro paciente
              </a>
            </div>
          ) : (
            <FunnelChart data={funnelData} />
          )}
        </div>

        {/* Atividade recente */}
        <div
          className="lg:col-span-2 bg-white"
          style={{ padding: '24px', borderRadius: '12px', border: '1px solid #E2E5EA', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#374151', marginBottom: '20px' }}>
            Atividade Recente
          </h2>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <StickyNote className="w-8 h-8" style={{ color: '#e5e7eb' }} />
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#9ca3af' }}>Nenhuma atividade ainda</p>
              <p style={{ fontSize: '13px', color: '#d1d5db', textAlign: 'center' }}>
                As notas, ligações e agendamentos dos leads aparecerão aqui.
              </p>
            </div>
          ) : (
            <ol className="space-y-[16px]">
              {events.map((ev) => {
                const Icon = EVENT_ICONS[ev.type] ?? StickyNote
                const lead = ev.lead as unknown as { id: string; name: string } | null
                const user = ev.user as unknown as { name: string } | null
                return (
                  <li key={ev.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.4' }}>
                        <span style={{ fontWeight: 600 }}>{EVENT_LABELS[ev.type] ?? ev.type}</span>
                        {lead && <> · <span style={{ color: '#6366f1' }}>{lead.name}</span></>}
                      </p>
                      {ev.description && (
                        <p className="truncate" style={{ fontSize: '14px', color: '#9ca3af', marginTop: '2px' }}>
                          {ev.description}
                        </p>
                      )}
                      <p style={{ fontSize: '14px', color: '#d1d5db', marginTop: '2px' }}>
                        {user?.name && <>{user.name} · </>}
                        {new Date(ev.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
