import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClinicForm from '@/components/configuracoes/ClinicForm'
import TeamSection from '@/components/configuracoes/TeamSection'

export const metadata: Metadata = { title: 'Configurações' }

export default async function ConfiguracoesPage() {
  try {
    const supabase = await createClient()

    const { data: profile } = await supabase
      .from('users')
      .select('*, clinics(*)')
      .single()

    // Só owner acessa configurações
    if (profile?.role !== 'owner') redirect('/dashboard')

    const { data: team } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, created_at')
      .eq('clinic_id', profile.clinic_id)
      .order('created_at')

    const clinic = profile.clinics as {
      id: string; name: string; phone: string | null
      email: string | null; address: string | null; plan: string; created_at: string
      google_calendar_id: string | null; seat_limit: number
    } | null

    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-xl lg:text-[28px] font-bold text-foreground">Configurações</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">Dados da clínica e gerenciamento de equipe</p>
        </div>

        <a
          href="/configuracoes/notificacoes"
          className="block bg-card border border-border rounded-xl px-5 py-4 hover:border-primary transition-colors"
        >
          <p className="font-semibold text-foreground text-sm">🔔 Notificações automáticas</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Confirmação de consulta, lembretes, aniversário, recall e relatório semanal — no WhatsApp, sem ninguém apertar botão
          </p>
        </a>

        <a
          href="/configuracoes/integracoes"
          className="block bg-card border border-border rounded-xl px-5 py-4 hover:border-primary transition-colors"
        >
          <p className="font-semibold text-foreground text-sm">🔌 Integrações</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Conecte suas plataformas e sistemas — as vendas viram prova de qual anúncio deu dinheiro
          </p>
        </a>

        <ClinicForm clinic={clinic} calendarSaEmail={process.env.GOOGLE_CALENDAR_SA_EMAIL ?? null} />
        <TeamSection team={team ?? []} seatLimit={clinic?.seat_limit ?? 3} />
      </div>
    )
  } catch {
    // Se algo falhar, mostra a página vazia em vez de redirecionar pro dashboard
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-xl lg:text-[28px] font-bold text-foreground">Configurações</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">Dados da clínica e gerenciamento de equipe</p>
        </div>
        <ClinicForm clinic={null} />
        <TeamSection team={[]} seatLimit={3} />
      </div>
    )
  }
}
