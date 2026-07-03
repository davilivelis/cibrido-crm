import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const hostname = request.headers.get('host') || ''

  // ── [03/07/2026] SITE PÚBLICO DESATIVADO ─────────────────────────────────
  // Cíbrido encerrada em 01/07/2026. A landing sai do ar, mas NADA foi deletado:
  // o código completo segue em src/components/landing/ e na rota /clinica-odontologica.
  // O CRM (crm.cibrido.com.br), previews e localhost NÃO são afetados.
  // PARA RESSUSCITAR O SITE: basta remover este bloco (até a linha do return).
  const isPublicCibridoSite = hostname === 'cibrido.com.br' || hostname === 'www.cibrido.com.br'
  if (isPublicCibridoSite && !path.startsWith('/api/webhooks')) {
    return new NextResponse(
      '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Site indisponível</title></head>' +
      '<body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1E2A3A;color:#fff">' +
      '<p>Este site está temporariamente desativado.</p></body></html>',
      { status: 410, headers: { 'content-type': 'text/html; charset=utf-8' } }
    )
  }
  // ─────────────────────────────────────────────────────────────────────────

  // crm.cibrido.com.br na raiz → rewrite para /login feito via next.config.ts rewrites()

  // crm.cibrido.com.br tentando acessar landing → bloqueia, manda para login
  if (hostname.startsWith('crm.') && path.startsWith('/clinica-odontologica')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Proteção do painel admin — só emails autorizados
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  const isAdmin = !!user && adminEmails.includes(user.email ?? '')
  if (path.startsWith('/admin') && !isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = user ? '/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  const isPublic =
    path === '/' ||
    path.startsWith('/clinica-odontologica') ||
    path.startsWith('/planos') ||
    path.startsWith('/images/landing') ||
    path.startsWith('/login') ||
    path.startsWith('/auth') ||
    path.startsWith('/convite') ||
    path.startsWith('/esqueceu-senha') ||
    path.startsWith('/redefinir-senha') ||
    path.startsWith('/api/webhooks')

  // Não autenticado tentando acessar rota protegida → login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Autenticado tentando acessar login → dashboard
  if (user && path.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
