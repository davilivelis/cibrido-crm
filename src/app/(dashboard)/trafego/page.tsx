// Página de Tráfego Pago — métricas e gestão de campanhas
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TrafegoClient from '@/components/trafego/TrafegoClient'
import { Campaign } from '@/types/database'

export const metadata = { title: 'Tráfego Pago — CibridoCRM' }

export default async function TrafegoPagoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  return <TrafegoClient campaigns={(campaigns ?? []) as Campaign[]} />
}
