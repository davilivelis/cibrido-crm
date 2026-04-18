'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X } from 'lucide-react'
import Link from 'next/link'

interface Step {
  id: string
  label: string
  description: string
  done: boolean
  href?: string
  cta?: string
}

interface Props {
  totalLeads: number
  totalAppointments: number
  clinicPhone: string | null
}

const DISMISS_KEY = 'cibrido_onboarding_dismissed'

export default function OnboardingChecklist({ totalLeads, totalAppointments, clinicPhone }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === '1')
  }, [])

  const steps: Step[] = [
    {
      id: 'account',
      label: 'Conta criada',
      description: 'Seu acesso ao CibridoCRM está ativo.',
      done: true,
    },
    {
      id: 'profile',
      label: 'Perfil da clínica completo',
      description: 'Adicione o telefone e endereço da sua clínica.',
      done: !!clinicPhone,
      href: '/configuracoes',
      cta: 'Completar perfil',
    },
    {
      id: 'lead',
      label: 'Primeiro paciente cadastrado',
      description: 'Cadastre um lead para acompanhar no funil.',
      done: totalLeads > 0,
      href: '/leads',
      cta: 'Cadastrar paciente',
    },
    {
      id: 'appointment',
      label: 'Primeira consulta agendada',
      description: 'Agende uma consulta pelo módulo Agenda.',
      done: totalAppointments > 0,
      href: '/agenda',
      cta: 'Ir para Agenda',
    },
  ]

  const completedCount = steps.filter((s) => s.done).length
  const allDone = completedCount === steps.length

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  if (dismissed || allDone) return null

  const progressPct = Math.round((completedCount / steps.length) * 100)

  return (
    <div
      className="bg-white"
      style={{
        borderRadius: '12px',
        border: '1px solid #E2E5EA',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
        style={{ borderBottom: collapsed ? 'none' : '1px solid #F3F4F6' }}
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                Configure seu CibridoCRM
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '20px',
                  backgroundColor: completedCount === steps.length - 1 ? '#dcfce7' : '#fef9ec',
                  color: completedCount === steps.length - 1 ? '#16a34a' : '#92400e',
                }}
              >
                {completedCount}/{steps.length} etapas
              </span>
            </div>
            {/* Barra de progresso */}
            <div className="w-full max-w-[240px] h-1.5 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, backgroundColor: '#E91E7B' }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-3 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); handleDismiss() }}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
          {collapsed
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronUp className="w-4 h-4 text-gray-400" />
          }
        </div>
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className="flex flex-col gap-2 p-4 rounded-xl"
              style={{
                backgroundColor: step.done ? '#f0fdf4' : '#FAFAFA',
                border: `1px solid ${step.done ? '#bbf7d0' : '#E2E5EA'}`,
                opacity: step.done ? 0.85 : 1,
              }}
            >
              <div className="flex items-start gap-2">
                {step.done
                  ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
                  : <Circle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#d1d5db' }} />
                }
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: step.done ? '#15803d' : '#111827' }}>
                    {step.label}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', lineHeight: '1.4' }}>
                    {step.description}
                  </p>
                </div>
              </div>
              {!step.done && step.href && step.cta && (
                <Link
                  href={step.href}
                  className="mt-auto inline-block text-center rounded-lg text-sm font-semibold py-1.5 transition-colors"
                  style={{
                    backgroundColor: '#E91E7B',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                >
                  {step.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
