import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { APP_NAME } from '@/lib/branding'
import { Lock } from 'lucide-react'

export const metadata = { title: 'Acesso suspenso' }

// Tela de clínica bloqueada (S5) — inadimplência ou bloqueio manual.
// Sem sidebar, sem dados: só o aviso e o caminho pra regularizar.

export default async function BloqueadoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clinicId } = await supabase.rpc('get_user_clinic_id')
  if (!clinicId) redirect('/onboarding')

  const { data: clinic } = await createAdminClient()
    .from('clinics')
    .select('name, is_active, blocked_reason')
    .eq('id', clinicId)
    .maybeSingle()

  // Se voltou a ficar ativa, sai daqui sozinho
  if (clinic?.is_active !== false) redirect('/dashboard')

  const overdue = clinic.blocked_reason === 'payment_overdue'

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center space-y-5 shadow-sm">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-destructive" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-foreground">Acesso temporariamente suspenso</h1>
        <p className="text-sm text-muted-foreground">
          {overdue
            ? `O acesso da ${clinic.name} foi pausado por uma cobrança em aberto. Assim que o pagamento for confirmado, tudo volta sozinho — seus dados estão seguros e intactos.`
            : `O acesso da ${clinic.name} está pausado no momento. Fale com o suporte pra entender o motivo — seus dados estão seguros e intactos.`}
        </p>
        <a
          href="https://wa.me/5511960341082?text=Oi!%20Preciso%20regularizar%20o%20acesso%20do%20meu%20CRM."
          className="inline-block px-6 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Falar com o suporte no WhatsApp
        </a>
        <p className="text-xs text-muted-foreground pt-2">powered by {APP_NAME}</p>
      </div>
    </div>
  )
}
