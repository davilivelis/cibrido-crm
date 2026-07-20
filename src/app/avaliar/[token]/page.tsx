import { createAdminClient } from '@/lib/supabase/admin'
import { APP_NAME } from '@/lib/branding'
import { SurveyForm } from '@/components/SurveyForm'
import { CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'Avaliar atendimento' }

// Página PÚBLICA de pesquisa de satisfação — o paciente chega pelo link do
// WhatsApp (token único). Sem login. Avalia o profissional e a recepção.

export default async function AvaliarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: survey } = await admin
    .from('satisfaction_surveys')
    .select('id, status, clinic:clinics(name), lead:leads(name)')
    .eq('token', token)
    .maybeSingle()

  const clinicName = (survey?.clinic as { name?: string } | null)?.name ?? APP_NAME
  const firstName = ((survey?.lead as { name?: string } | null)?.name ?? '').split(' ')[0]

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm">
        <div className="flex justify-center">
          <img src="/logo-mark.svg" alt={clinicName} style={{ width: 44, height: 44 }} />
        </div>

        {!survey ? (
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-foreground">Link inválido ou expirado</h1>
            <p className="text-sm text-muted-foreground">Fale direto com a {clinicName} pelo WhatsApp. 😉</p>
          </div>
        ) : survey.status === 'responded' ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: 'var(--primary-strong)' }} />
            <h1 className="text-xl font-bold text-foreground">Você já avaliou 💚</h1>
            <p className="text-sm text-muted-foreground">Obrigado pelo carinho com a {clinicName}!</p>
          </div>
        ) : (
          <SurveyForm token={token} clinicName={clinicName} firstName={firstName} />
        )}

        <p className="text-xs text-muted-foreground text-center pt-2">powered by {APP_NAME}</p>
      </div>
    </div>
  )
}
