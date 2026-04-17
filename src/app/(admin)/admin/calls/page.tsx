import { getCibridoCalls } from '@/lib/actions/admin'

export default async function CallsPage() {
  const calls = await getCibridoCalls()

  const OUTCOME_STYLES: Record<string, string> = {
    fechou:       'bg-green-100 text-green-700',
    pendente:     'bg-yellow-100 text-yellow-700',
    nao_apareceu: 'bg-red-100 text-red-700',
    perdeu:       'bg-gray-100 text-gray-500',
  }
  const OUTCOME_LABELS: Record<string, string> = {
    fechou: 'Fechou', pendente: 'Pendente', nao_apareceu: 'Não apareceu', perdeu: 'Perdeu',
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Calls</h1>
        <p style={{ fontSize: '15px', color: '#6b7280', marginTop: 4 }}>Histórico de reuniões comerciais</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E5EA', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table className="w-full">
          <thead style={{ background: '#F8F9FB' }}>
            <tr>
              {['Lead', 'Clínica', 'Agendado para', 'Atendido por', 'Resultado', 'Próximo passo'].map(h => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calls.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center" style={{ fontSize: 15, color: '#9ca3af' }}>Nenhuma call registrada ainda.</td></tr>
            )}
            {calls.map((c: Record<string, unknown>) => (
              <tr key={c.id as string} style={{ borderTop: '1px solid #F3F4F6' }} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-5 py-3.5" style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{(c.cibrido_leads as Record<string, string>)?.name ?? '—'}</td>
                <td className="px-5 py-3.5" style={{ fontSize: 15, color: '#374151' }}>{(c.cibrido_leads as Record<string, string>)?.clinic_name ?? '—'}</td>
                <td className="px-5 py-3.5" style={{ fontSize: 14, color: '#374151' }}>
                  {new Date(c.scheduled_at as string).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-5 py-3.5" style={{ fontSize: 14, color: '#374151', textTransform: 'capitalize' }}>{c.attended_by as string}</td>
                <td className="px-5 py-3.5">
                  {c.outcome ? (
                    <span className={OUTCOME_STYLES[c.outcome as string] ?? 'bg-gray-100 text-gray-500'} style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                      {OUTCOME_LABELS[c.outcome as string] ?? c.outcome as string}
                    </span>
                  ) : <span style={{ fontSize: 14, color: '#d1d5db' }}>—</span>}
                </td>
                <td className="px-5 py-3.5" style={{ fontSize: 14, color: '#6b7280' }}>{(c.next_step as string) ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
