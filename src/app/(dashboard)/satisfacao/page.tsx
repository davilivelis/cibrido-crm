import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Star, Smile } from 'lucide-react'

export const metadata: Metadata = { title: 'Satisfação' }

interface Survey {
  professional: string | null
  reception_rating: number | null
  professional_rating: number | null
  comment: string | null
  responded_at: string | null
}

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="w-4 h-4"
          style={{
            fill: value >= n - 0.25 ? 'var(--primary)' : 'transparent',
            color: value >= n - 0.25 ? 'var(--primary)' : 'var(--border)',
          }}
        />
      ))}
    </div>
  )
}

export default async function SatisfacaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('satisfaction_surveys')
    .select('professional, reception_rating, professional_rating, comment, responded_at')
    .eq('status', 'responded')
    .order('responded_at', { ascending: false })
    .limit(500)

  const responded = (data ?? []) as Survey[]

  const avgOf = (key: 'reception_rating' | 'professional_rating') => {
    const vals = responded.map((s) => s[key]).filter((v): v is number => v != null)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  }
  const avgProfessional = avgOf('professional_rating')
  const avgReception = avgOf('reception_rating')

  // Nota média por profissional
  const byProf = new Map<string, { sum: number; count: number }>()
  for (const s of responded) {
    if (s.professional_rating == null) continue
    const p = s.professional || 'Geral'
    const e = byProf.get(p) ?? { sum: 0, count: 0 }
    e.sum += s.professional_rating
    e.count++
    byProf.set(p, e)
  }
  const profStats = [...byProf.entries()]
    .map(([name, e]) => ({ name, avg: e.sum / e.count, count: e.count }))
    .sort((a, b) => b.avg - a.avg)

  const comments = responded.filter((s) => s.comment)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-[28px] font-bold text-foreground">Satisfação</h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-1">
          Nota do profissional e da recepção — direto do paciente, no dia seguinte à consulta
        </p>
      </div>

      {responded.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 lg:p-16 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
            <Smile className="w-5 h-5 text-primary-strong" />
          </div>
          <p className="font-medium text-foreground">Nenhuma avaliação ainda</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Ligue a “Pesquisa de satisfação” em Configurações → Notificações. No dia seguinte à consulta, o
            paciente recebe o link e a nota aparece aqui.
          </p>
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Nota do profissional', value: avgProfessional },
              { label: 'Nota da recepção', value: avgReception },
            ].map((c) => (
              <div key={c.label} className="bg-card rounded-xl border border-border p-5">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-3xl font-bold text-foreground">{c.value.toFixed(1)}</p>
                  <div className="mb-1.5"><StarRow value={c.value} /></div>
                </div>
              </div>
            ))}
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-sm text-muted-foreground">Avaliações respondidas</p>
              <p className="text-3xl font-bold text-foreground mt-1">{responded.length}</p>
            </div>
          </div>

          {/* Por profissional */}
          {profStats.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Nota por profissional</h2>
              </div>
              <div className="divide-y divide-border">
                {profStats.map((p) => (
                  <div key={p.name} className="px-5 py-3 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <StarRow value={p.avg} />
                      <span className="text-sm font-bold text-foreground w-8 text-right">{p.avg.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground w-16 text-right">{p.count} nota{p.count > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comentários */}
          {comments.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Comentários dos pacientes</h2>
              </div>
              <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {comments.map((s, i) => (
                  <div key={i} className="px-5 py-3 space-y-1">
                    <div className="flex items-center gap-3">
                      {s.professional_rating != null && <StarRow value={s.professional_rating} />}
                      {s.professional && <span className="text-xs text-muted-foreground">· {s.professional}</span>}
                    </div>
                    <p className="text-sm text-foreground">“{s.comment}”</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
