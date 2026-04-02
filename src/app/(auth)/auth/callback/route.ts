// Rota de callback para confirmar email e magic links do Supabase
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? ''

  // Usa sempre a URL do site em produção para evitar redirects para URLs antigas
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cibrido-crm.vercel.app'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Redireciona para next se especificado, senão verifica se precisa de onboarding
      if (next) {
        return NextResponse.redirect(`${siteUrl}${next}`)
      }
      const { data: { user } } = await supabase.auth.getUser()
      const onboardingComplete = user?.user_metadata?.onboarding_complete
      return NextResponse.redirect(`${siteUrl}${onboardingComplete ? '/dashboard' : '/onboarding'}`)
    }
  }

  return NextResponse.redirect(`${siteUrl}/login?error=auth`)
}
