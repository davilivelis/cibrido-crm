import { createAdminClient } from '@/lib/supabase/admin'
import { APP_NAME } from '@/lib/branding'
import { syncAppointmentToGoogle } from '@/lib/google/calendar'
import { revalidatePath } from 'next/cache'
import { CheckCircle2, XCircle, CalendarDays } from 'lucide-react'

export const metadata = { title: 'Confirmar consulta' }

// Página PÚBLICA de confirmação de consulta — o paciente chega pelo link
// do WhatsApp (token único por consulta). Sem login.

function fmt(dtIso: string): string {
  const d = new Date(new Date(dtIso).getTime() - 3 * 3600_000) // relógio de São Paulo
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mi = String(d.getUTCMinutes()).padStart(2, '0')
  return `${dd}/${mm} às ${hh}:${mi}`
}

export default async function ConfirmarPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ r?: string }>
}) {
  const { token } = await params
  const { r } = await searchParams
  const admin = createAdminClient()

  const { data: apt } = await admin
    .from('appointments')
    .select('id, scheduled_at, status, clinic:clinics(name), lead:leads(name)')
    .eq('confirm_token', token)
    .maybeSingle()

  async function responder(formData: FormData) {
    'use server'
    const resposta = formData.get('resposta')
    const admin = createAdminClient()
    const { data: apt } = await admin
      .from('appointments')
      .select('id, status')
      .eq('confirm_token', token)
      .maybeSingle()
    if (!apt || !['scheduled', 'confirmed'].includes(apt.status)) return
    await admin
      .from('appointments')
      .update({ status: resposta === 'sim' ? 'confirmed' : 'cancelled' })
      .eq('id', apt.id)
    await syncAppointmentToGoogle(apt.id)
    revalidatePath(`/confirmar/${token}`)
  }

  const clinicName = (apt?.clinic as { name?: string } | null)?.name ?? APP_NAME
  const leadName = ((apt?.lead as { name?: string } | null)?.name ?? '').split(' ')[0]

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center space-y-5 shadow-sm">
        <div className="flex justify-center">
          <img src="/logo-mark.svg" alt={clinicName} style={{ width: 48, height: 48 }} />
        </div>

        {!apt ? (
          <>
            <h1 className="text-xl font-bold text-foreground">Link inválido ou expirado</h1>
            <p className="text-sm text-muted-foreground">Fale direto com a clínica pelo WhatsApp. 😉</p>
          </>
        ) : apt.status === 'confirmed' ? (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: 'var(--primary-strong)' }} />
            <h1 className="text-xl font-bold text-foreground">Presença confirmada{leadName ? `, ${leadName}` : ''}! 🎉</h1>
            <p className="text-sm text-muted-foreground">{clinicName} te espera em {fmt(apt.scheduled_at)}.</p>
          </>
        ) : apt.status === 'cancelled' ? (
          <>
            <XCircle className="w-12 h-12 mx-auto text-destructive" />
            <h1 className="text-xl font-bold text-foreground">Consulta cancelada</h1>
            <p className="text-sm text-muted-foreground">Sem problemas! A {clinicName} vai entrar em contato pra remarcar.</p>
          </>
        ) : (
          <>
            <CalendarDays className="w-12 h-12 mx-auto" style={{ color: 'var(--primary-strong)' }} />
            <h1 className="text-xl font-bold text-foreground">{leadName ? `${leadName}, c` : 'C'}onfirma sua consulta?</h1>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{clinicName}</strong> — {fmt(apt.scheduled_at)}
            </p>
            <form action={responder} className="flex gap-3 justify-center pt-2">
              <button
                name="resposta" value="sim"
                className="px-6 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                ✓ Sim, confirmo
              </button>
              <button
                name="resposta" value="nao"
                className="px-6 py-3 rounded-xl font-semibold border border-border text-foreground hover:bg-muted transition-colors"
              >
                Não posso ir
              </button>
            </form>
          </>
        )}

        <p className="text-xs text-muted-foreground pt-3">powered by {APP_NAME}</p>
      </div>
    </div>
  )
}
