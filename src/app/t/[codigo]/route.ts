import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// S4 — Link rastreável de campanha: /t/{codigo}
// O anúncio aponta pra cá; a rota registra o clique (com UTMs) e manda o
// visitante pro WhatsApp da clínica com o código na mensagem pré-pronta.
// Quando a pessoa manda a mensagem, o webhook casa o #codigo e carimba o
// lead com a campanha — atribuição anúncio → conversa → venda.

export async function GET(request: Request, ctx: RouteContext<'/t/[codigo]'>) {
  const { codigo } = await ctx.params
  const url = new URL(request.url)
  const admin = createAdminClient()

  const { data: campaign } = await admin
    .from('campaigns')
    .select('id, name, tracking_code, clinic:clinics(id, name, whatsapp_number)')
    .eq('tracking_code', codigo.toUpperCase())
    .maybeSingle()

  const clinic = (campaign?.clinic as unknown as { id: string; name: string; whatsapp_number: string | null } | null)

  if (!campaign || !clinic?.whatsapp_number) {
    // Link quebrado não pode virar beco: manda pro site
    return NextResponse.redirect('https://crm.livelis.com.br', 302)
  }

  // Registra o clique com as UTMs que vieram do anúncio
  await admin.from('tracking_clicks').insert({
    clinic_id: clinic.id,
    campaign_id: campaign.id,
    utm_source: url.searchParams.get('utm_source'),
    utm_medium: url.searchParams.get('utm_medium'),
    utm_campaign: url.searchParams.get('utm_campaign'),
    utm_content: url.searchParams.get('utm_content'),
    user_agent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
  })

  const phone = clinic.whatsapp_number.replace(/\D/g, '')
  const text = encodeURIComponent(`Olá! Vi o anúncio de vocês e quero saber mais 😊 [#${campaign.tracking_code}]`)
  return NextResponse.redirect(`https://wa.me/${phone}?text=${text}`, 302)
}
