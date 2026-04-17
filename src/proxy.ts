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

  // crm.cibrido.com.br na raiz → login
  if (hostname.startsWith('crm.') && path === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

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
