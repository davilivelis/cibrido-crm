'use client'

import { useState } from 'react'
import { User, Lock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateUserName, updateUserPassword } from '@/lib/actions/profile'
import { User as UserType } from '@/types/database'

interface PerfilClientProps {
  user: UserType
}

const roleLabels: Record<string, string> = {
  owner:     'Proprietário',
  gestor:    'Gestor',
  atendente: 'Atendente',
}

export default function PerfilClient({ user }: PerfilClientProps) {
  // --- Nome ---
  const [name,        setName]        = useState(user.name)
  const [savingName,  setSavingName]  = useState(false)
  const [nameOk,      setNameOk]      = useState(false)
  const [nameError,   setNameError]   = useState<string | null>(null)

  // --- Senha ---
  const [newPwd,      setNewPwd]      = useState('')
  const [confirmPwd,  setConfirmPwd]  = useState('')
  const [savingPwd,   setSavingPwd]   = useState(false)
  const [pwdOk,       setPwdOk]       = useState(false)
  const [pwdError,    setPwdError]    = useState<string | null>(null)

  async function handleSaveName() {
    setNameError(null)
    setNameOk(false)
    setSavingName(true)
    try {
      await updateUserName(name)
      setNameOk(true)
      setTimeout(() => setNameOk(false), 3000)
    } catch (e) {
      setNameError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSavingName(false)
    }
  }

  async function handleSavePwd() {
    setPwdError(null)
    setPwdOk(false)

    if (newPwd.length < 6) {
      setPwdError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (newPwd !== confirmPwd) {
      setPwdError('As senhas não coincidem.')
      return
    }

    setSavingPwd(true)
    try {
      await updateUserPassword(newPwd)
      setPwdOk(true)
      setNewPwd('')
      setConfirmPwd('')
      setTimeout(() => setPwdOk(false), 3000)
    } catch (e) {
      setPwdError(e instanceof Error ? e.message : 'Erro ao trocar senha')
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">

      {/* Cabeçalho do perfil */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow"
            style={{ background: 'linear-gradient(135deg, #E91E7B, #7B2D8E)' }}
          >
            <span className="text-white font-bold text-lg">
              {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white mt-1 inline-block"
              style={{ backgroundColor: '#E91E7B' }}
            >
              {roleLabels[user.role] ?? user.role}
            </span>
          </div>
        </div>

        {/* Seção: alterar nome */}
        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4" style={{ color: '#E91E7B' }} />
            <h2 className="text-sm font-semibold text-gray-800">Alterar nome</h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome exibido</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="h-10"
              />
            </div>

            {nameError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{nameError}</p>
            )}
            {nameOk && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                Nome atualizado com sucesso!
              </div>
            )}

            <Button
              onClick={handleSaveName}
              disabled={savingName || !name.trim() || name.trim() === user.name}
              size="sm"
              className="h-9"
            >
              {savingName ? 'Salvando...' : 'Salvar nome'}
            </Button>
          </div>
        </div>
      </div>

      {/* Seção: trocar senha */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4" style={{ color: '#E91E7B' }} />
          <h2 className="text-sm font-semibold text-gray-800">Trocar senha</h2>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nova senha</Label>
            <Input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Confirmar nova senha</Label>
            <Input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Repita a senha"
              className="h-10"
            />
          </div>

          {pwdError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pwdError}</p>
          )}
          {pwdOk && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              Senha alterada com sucesso!
            </div>
          )}

          <Button
            onClick={handleSavePwd}
            disabled={savingPwd || !newPwd || !confirmPwd}
            size="sm"
            className="h-9"
          >
            {savingPwd ? 'Salvando...' : 'Alterar senha'}
          </Button>
        </div>
      </div>

    </div>
  )
}
