// Página de Tráfego Pago — métricas, gestão de campanhas e atribuição real
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TrafegoClient, { CampaignAttribution } from '@/components/trafego/TrafegoClient'
import { Campaign } from '@/types/database'

export const metadata = { title: 'Tráfego Pago' }

export default async function TrafegoPagoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  // Atribuição REAL (S4): cliques no link, leads que chegaram pelo código,
  // consultas desses leads e consultas realizadas (proxy de venda)
  const ids = (campaigns ?? []).map((c) => c.id)
  const attribution: Record<string, CampaignAttribution> = {}

  if (ids.length > 0) {
    const [clicksRes, leadsRes, convsRes] = await Promise.all([
      supabase.from('tracking_clicks').select('campaign_id').in('campaign_id', ids),
      supabase.from('leads').select('id, campaign_id').in('campaign_id', ids),
      supabase.from('conversions').select('campaign_id, value').in('campaign_id', ids),
    ])

    const leadIds = (leadsRes.data ?? []).map((l) => l.id)
    const { data: apts } = leadIds.length
      ? await supabase.from('appointments').select('lead_id, status').in('lead_id', leadIds)
      : { data: [] as { lead_id: string; status: string }[] }

    const leadCampaign = new Map((leadsRes.data ?? []).map((l) => [l.id, l.campaign_id as string]))

    for (const id of ids) attribution[id] = { clicks: 0, leads: 0, appointments: 0, attended: 0, revenue: 0 }
    for (const c of clicksRes.data ?? []) {
      if (c.campaign_id) attribution[c.campaign_id].clicks++
    }
    for (const l of leadsRes.data ?? []) {
      if (l.campaign_id) attribution[l.campaign_id].leads++
    }
    for (const a of apts ?? []) {
      const cid = leadCampaign.get(a.lead_id)
      if (!cid) continue
      attribution[cid].appointments++
      if (a.status === 'attended') attribution[cid].attended++
    }
    // N3 — faturamento por campanha (das conversões: webhook Trinks/Tintim ou manual)
    for (const cv of convsRes.data ?? []) {
      if (cv.campaign_id) attribution[cv.campaign_id].revenue += Number(cv.value ?? 0)
    }
  }

  return <TrafegoClient campaigns={(campaigns ?? []) as Campaign[]} attribution={attribution} />
}
