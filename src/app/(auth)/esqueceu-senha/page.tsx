'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function EsqueceuSenhaPage() {
  const supabase = createClient()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://crm.cibrido.com.br/auth/callback?next=/redefinir-senha',
    })

    if (error) {
      setError('Não foi possível enviar o email. Verifique o endereço e tente novamente.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#F8F9FB' }}>
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <img src="/logo-cibrido.png" alt="Cíbrido" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Recuperar senha</h1>
          <p className="text-sm text-gray-500 mt-1">
            Informe seu email e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <p className="text-green-800 font-semibold text-sm">Email enviado!</p>
            <p className="text-green-700 text-sm mt-1">
              Verifique sua caixa de entrada e clique no link para redefinir sua senha.
            </p>
            <a
              href="/login"
              className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4"
            >
              Voltar para o login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@clinica.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </Button>

            <div className="text-center">
              <a
                href="/login"
                className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4"
              >
                Voltar para o login
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
