'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signUpConfirmed } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

declare global { interface Window { fbq?: (...args: unknown[]) => void } }

interface Props {
  token:     string
  email:     string
  plan:      string
  planLabel: string
}

export default function InviteClient({ token, email, plan, planLabel }: Props) {
  const router   = useRouter()
  const supabase = createClient()

  const [name,     setName]     = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)

    try {
      await signUpConfirmed({ email, password, name })

      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
      if (loginErr) throw new Error('Conta criada! Faça login para continuar.')

      // Marca convite como usado
      await fetch('/api/invites/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      window.fbq?.('track', 'CompleteRegistration')
      router.push('/onboarding')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ativar conta.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ fontSize: '16px' }}>

      {/* Lado esquerdo */}
      <div
        className="relative flex flex-col items-center justify-center w-full lg:w-1/2 lg:shrink-0 py-10 px-6 lg:px-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #2d1a32 100%)' }}
      >
        <img src="/bg-network.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none select-none" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <img src="/logo-cibrido.png" alt="Cíbrido" className="h-16 lg:h-32 w-auto mx-auto -mb-4 lg:-mb-8" />
          <span className="text-white font-bold text-lg lg:text-[30px] mt-0">CibridoCRM</span>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
            <span className="text-yellow-300 text-sm font-bold">✉️ Convite exclusivo</span>
          </div>
          <div className="mt-4">
            <p className="text-xl lg:text-[32px] font-bold leading-tight text-white">Seu acesso foi liberado</p>
            <p className="text-xl lg:text-[32px] font-bold leading-tight text-[#E91E7B]">pela equipe Cíbrido</p>
          </div>
          <div className="mt-4 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
            <p className="text-gray-400 text-sm">Plano ativado</p>
            <p className="text-[#F5A623] font-bold text-lg">{planLabel}</p>
          </div>
        </div>
      </div>

      {/* Lado direito */}
      <div className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-8" style={{ backgroundColor: '#F8F9FB' }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Ative sua conta</h1>
            <p className="text-sm text-gray-500 mt-1">Seu email já está confirmado. Só preencha os dados abaixo.</p>
          </div>

          <form onSubmit={handleActivate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={email} disabled className="h-12 bg-gray-100 text-gray-500" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Seu nome completo</Label>
              <Input id="name" type="text" placeholder="Dr. Carlos Silva"
                value={name} onChange={e => setName(e.target.value)}
                required className="h-12" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Crie sua senha</Label>
              <Input id="password" type="password" placeholder="Mínimo 6 caracteres"
                value={password} onChange={e => setPassword(e.target.value)}
                required minLength={6} className="h-12" />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">{error}</p>}

            <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
              {loading ? 'Ativando...' : 'Ativar minha conta'}
            </Button>
          </form>
        </div>
        <p className="text-xs text-gray-400 mt-8">© 2026 Cíbrido · Todos os direitos reservados</p>
      </div>
    </div>
  )
}
