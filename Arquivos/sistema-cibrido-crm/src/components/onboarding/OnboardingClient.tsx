'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateClinic } from '@/lib/actions/clinic'

interface OnboardingClientProps {
  userName:   string
  clinicId:   string
  clinicName: string
  userId?:    string
  userEmail?: string
}

export default function OnboardingClient({ userName }: OnboardingClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [done,   setDone]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [name,   setName]   = useState('')
  const [phone,  setPhone]  = useState('')

  const firstName = userName.split(' ')[0]

  function goToDashboard() { router.push('/dashboard') }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    startTransition(async () => {
      try {
        await updateClinic({ name: name.trim(), phone: phone.trim(), email: '', address: '' })
        setDone(true)
      } catch {
        goToDashboard()
      } finally {
        setSaving(false)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FB' }}>
      <div className="w-full max-w-md px-6">

        {!done ? (
          <>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <Image
                src="/logo.png"
                alt="CibridoCRM"
                width={120}
                height={40}
                style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
                priority
              />
              <span className="font-bold text-gray-900 text-lg">CibridoCRM</span>
            </div>

            <p className="text-sm font-medium mb-1" style={{ color: '#E91E7B' }}>
              Bem-vindo, {firstName}! 👋
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Configure sua clínica</h1>
            <p className="text-gray-400 text-sm mb-8">Leva menos de 1 minuto</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome da clínica *</Label>
                <Input
                  id="name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Clínica Sorriso Perfeito"
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">WhatsApp / Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="h-12"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={goToDashboard} className="text-gray-400 px-4">
                  Pular
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 h-12 gap-2 font-semibold">
                  {saving ? 'Salvando...' : 'Concluir'}
                  {!saving && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #E91E7B, #7B2D8E)' }}
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tudo pronto!</h1>
            <p className="text-gray-500 text-sm mb-8">
              <strong style={{ color: '#1E2A3A' }}>{name}</strong> está configurada.
            </p>
            <Button onClick={goToDashboard} className="w-full h-12 font-semibold gap-2">
              Ir para o Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
