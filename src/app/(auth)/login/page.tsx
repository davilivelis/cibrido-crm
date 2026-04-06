'use client'

import { useState } from 'react'
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

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [regName,  setRegName]  = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass,  setRegPass]  = useState('')

  function switchTab(t: Tab) { setTab(t); setError(null); setSuccess(null) }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou senha incorretos.'); setLoading(false); return }
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
      router.push('/onboarding'); router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontSize: '16px' }}>

      {/* Lado esquerdo — 50% — fundo escuro, tudo centralizado */}
      <div
        className="relative hidden lg:flex flex-col items-center justify-center w-1/2 shrink-0 px-12 overflow-hidden"
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
          {/* Logo só balões — grande, sem fundo */}
          <img
            src="/logo-cibrido.png"
            alt="Cíbrido"
            className="h-40 w-auto mx-auto"
          />
          <span className="text-white font-bold text-[30px] mt-2">CibridoCRM</span>

          {/* Headline em 3 linhas — whitespace-nowrap garante 1 linha por elemento */}
          <div className="mt-5">
            <p className="text-[38px] font-bold leading-tight text-white whitespace-nowrap">
              Te entregamos um Sistema de IA
            </p>
            <p className="text-[38px] font-bold leading-tight text-white whitespace-nowrap">
              que organiza e acompanha
            </p>
            <p className="text-[38px] font-bold leading-tight text-[#E91E7B] whitespace-nowrap">
              seu futuro e atual paciente
            </p>
          </div>
          <p className="text-gray-400 text-xl mt-5 leading-relaxed max-w-[480px] mx-auto">
            Desde o primeiro contato até o agendamento, para aumentar o seu faturamento.
          </p>
        </div>
      </div>

      {/* Lado direito — 50% — formulário centralizado */}
      <div
        className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: '#F8F9FB' }}
      >
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div style={{ width: 36, height: 36, overflow: 'hidden', borderRadius: 6, flexShrink: 0 }}>
              <img src="/logo.png" alt="CibridoCRM" style={{ width: '36px', height: 'auto', display: 'block' }} />
            </div>
            <span className="font-bold text-gray-900 text-lg">CibridoCRM</span>
          </div>

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
              <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar no CRM'}
              </Button>
            </form>
          )}

          {tab === 'cadastrar' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name">Nome completo</Label>
                <Input id="reg-name" type="text" placeholder="Seu nome"
                  value={regName} onChange={(e) => setRegName(e.target.value)}
                  required className="h-12" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" placeholder="voce@clinica.com"
                  value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                  required className="h-12" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-pass">Senha</Label>
                <Input id="reg-pass" type="password" placeholder="Mínimo 6 caracteres"
                  value={regPass} onChange={(e) => setRegPass(e.target.value)}
                  required minLength={6} className="h-12" />
              </div>
              {error   && <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">{error}</p>}
              {success && <p className="text-sm text-green-700 bg-green-50 px-3 py-2.5 rounded-lg border border-green-100">{success}</p>}
              <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>
          )}
        </div>

        {/* Rodapé */}
        <p className="text-xs text-gray-400 mt-8">© 2026 Cíbrido · Todos os direitos reservados</p>
      </div>
    </div>
  )
}
