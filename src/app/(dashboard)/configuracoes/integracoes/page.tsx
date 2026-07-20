import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getIntegrationConfig } from '@/lib/actions/integrations'
import { ArrowLeft } from 'lucide-react'
import IntegrationsClient from '@/components/configuracoes/IntegrationsClient'

export const metadata: Metadata = { title: 'Integrações' }

export default async function IntegracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const config = await getIntegrationConfig()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/configuracoes"
          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          aria-label="Voltar para configurações"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </Link>
        <div>
          <h1 className="text-xl lg:text-[28px] font-bold text-foreground">Integrações</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Conecte a Tintim, a Trinks ou seu sistema — as vendas viram prova de qual anúncio deu dinheiro
          </p>
        </div>
      </div>

      <IntegrationsClient config={config} />
    </div>
  )
}
