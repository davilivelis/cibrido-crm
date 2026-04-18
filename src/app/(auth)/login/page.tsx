'use client'

import { useState } from 'react'

declare global { interface Window { fbq?: (...args: unknown[]) => void } }
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signUpConfirmed } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Tab = 'entrar' | 'cadastrar'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [tab,     setTab]     = useState<Tab>('entrar')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [regName,    setRegName]    = useState('')
  const [regEmail,   setRegEmail]   = useState('')
  const [regPass,    setRegPass]    = useState('')

  function switchTab(t: Tab) { setTab(t); setError(null); setSuccess(null) }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou senha incorretos.'); setLoading(false); return }
    if (!rememberMe) sessionStorage.setItem('cibrido_session_only', '1')
    window.fbq?.('trackCustom', 'CRM_Login')
    router.push('/dashboard'); router.refresh()
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setSuccess(null)
    try {
      // Cria conta via server action com email já confirmado (sem precisar clicar em link)
      await signUpConfirmed({ email: regEmail, password: regPass, name: regName })
      // Faz login automaticamente após cadastro
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: regEmail,
        password: regPass,
      })
      if (loginErr) {
        setSuccess('Conta criada! Faça login para continuar.')
        setLoading(false)
        return
      }
      window.fbq?.('track', 'CompleteRegistration')
      router.push('/onboarding'); router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ fontSize: '16px' }}>

      {/* Lado esquerdo — mobile: full width topo | desktop: 50% fixo */}
      <div
        className="relative flex flex-col items-center justify-center w-full lg:w-1/2 lg:shrink-0 py-10 px-6 lg:px-12 lg:pt-8 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #2d1a32 100%)' }}
      >
        {/* Fundo de rede sutil — textura tecnológica, 8% opacidade */}
        <img
          src="/bg-network.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none select-none"
        />

        {/* Conteúdo por cima do fundo */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo só balões — responsiva */}
          <img
            src="/logo-cibrido.png"
            alt="Cíbrido"
            className="h-16 lg:h-32 w-auto mx-auto -mb-4 lg:-mb-8"
          />
          <span className="text-white font-bold text-lg lg:text-[30px] mt-0">CibridoCRM</span>

          {/* Headline em 3 linhas — lg:whitespace-nowrap garante 1 linha por elemento */}
          <div className="mt-3 lg:mt-5">
            <p className="text-xl lg:text-[38px] font-bold leading-tight text-white lg:whitespace-nowrap">
              Te entregamos um Sistema de IA
            </p>
            <p className="text-xl lg:text-[38px] font-bold leading-tight text-white lg:whitespace-nowrap">
              que organiza e acompanha
            </p>
            <p className="text-xl lg:text-[38px] font-bold leading-tight text-[#E91E7B] lg:whitespace-nowrap">
              seu futuro e atual paciente
            </p>
          </div>
          <p className="text-gray-400 text-sm lg:text-xl mt-3 lg:mt-5 leading-relaxed max-w-[480px] mx-auto">
            Desde o primeiro contato até o agendamento, para aumentar o seu faturamento.
          </p>
        </div>
      </div>

      {/* Lado direito — mobile: full width abaixo | desktop: 50% */}
      <div
        className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: '#F8F9FB' }}
      >
        <div className="w-full max-w-sm">

          {/* Abas */}
          <div className="flex bg-white rounded-xl p-1 mb-8 shadow-sm border border-gray-100">
            <button
              onClick={() => switchTab('entrar')}
              className="flex-1 py-2.5 rounded-lg transition-all font-semibold"
              style={{
                fontSize: '16px',
                backgroundColor: tab === 'entrar' ? '#E91E7B' : 'transparent',
                color: tab === 'entrar' ? '#fff' : '#6b7280',
              }}
            >
              Entrar
            </button>
            <button
              onClick={() => switchTab('cadastrar')}
              className="flex-1 py-2.5 rounded-lg transition-all font-semibold"
              style={{
                fontSize: '16px',
                backgroundColor: tab === 'cadastrar' ? '#E91E7B' : 'transparent',
                color: tab === 'cadastrar' ? '#fff' : '#6b7280',
              }}
            >
              Criar conta
            </button>
          </div>

          {tab === 'entrar' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="voce@clinica.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoComplete="email" className="h-12" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password" className="h-12" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">{error}</p>}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#E91E7B] cursor-pointer"
                  />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Lembrar de mim</span>
                </label>
                <a href="/esqueceu-senha" style={{ fontSize: '14px', color: '#6b7280' }} className="hover:text-gray-900 underline underline-offset-4">
                  Esqueceu a senha?
                </a>
              </div>
              <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar no CRM'}
              </Button>
            </form>
          )}

          {tab === 'cadastrar' && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-5 text-center space-y-3">
              <div className="text-3xl">🔒</div>
              <p className="text-sm font-bold text-red-800">Acesso por convite apenas</p>
              <p className="text-sm text-red-700 leading-relaxed">
                O CibridoCRM é exclusivo para clientes da Cíbrido.<br />
                Para obter acesso, fale com nossa equipe:
              </p>
              <a
                href="https://wa.me/5511960341082?text=Olá!%20Quero%20saber%20mais%20sobre%20o%20CibridoCRM."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-2.5 rounded-lg bg-[#E91E7B] text-white text-sm font-bold"
              >
                Falar com a equipe Cíbrido
              </a>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <p className="text-xs text-gray-400 mt-8">© 2026 Cíbrido · Todos os direitos reservados</p>
      </div>
    </div>
  )
}
