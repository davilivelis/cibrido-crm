'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Trash2 } from 'lucide-react'
import { revokeInvite, deleteInvite } from '@/lib/actions/admin'

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  used:     'bg-green-100 text-green-700',
  expired:  'bg-red-100 text-red-700',
  revoked:  'bg-gray-100 text-gray-500',
}
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente', used: 'Usado', expired: 'Expirado', revoked: 'Revogado',
}
const PLAN_LABELS: Record<string, string> = { lite: 'Lite', standard: 'Standard', master: 'Master' }
const ORIGIN_LABELS: Record<string, string> = { manual: 'Manual', asaas_webhook: 'Asaas (auto)' }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ConvitesClient({ invites }: { invites: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function handleRevoke(id: string) {
    if (!confirm('Revogar este convite? Ele não poderá ser usado após isso.')) return
    startTransition(async () => {
      await revokeInvite(id)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir permanentemente este convite da lista? Essa ação não pode ser desfeita.')) return
    startTransition(async () => {
      await deleteInvite(id)
      router.refresh()
    })
  }

  function copyLink(id: string, token: string) {
    const crmUrl = process.env.NEXT_PUBLIC_CRM_URL ?? 'https://crm.cibrido.com.br'
    navigator.clipboard.writeText(`${crmUrl}/convite/${token}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const daysLeft = (expiresAt: string) => {
    const diff = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
    if (diff < 0) return 'Expirado'
    if (diff === 0) return 'Hoje'
    return `${diff} dia${diff !== 1 ? 's' : ''}`
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Convites</h1>
        <p style={{ fontSize: '15px', color: '#6b7280', marginTop: 4 }}>Links de acesso gerados para novas clínicas</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E5EA', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        <table className="w-full min-w-[700px]">
          <thead style={{ background: '#F8F9FB' }}>
            <tr>
              {['Email', 'Plano', 'Origem', 'Status', 'Expira em', 'Ações'].map(h => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invites.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center" style={{ fontSize: 15, color: '#9ca3af' }}>Nenhum convite gerado ainda.</td></tr>
            )}
            {invites.map(inv => {
              const isCopied = copiedId === inv.id
              return (
                <tr key={inv.id} style={{ borderTop: '1px solid #F3F4F6' }} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 py-3.5" style={{ fontSize: 15, fontWeight: 500, color: '#111827' }}>{inv.email}</td>
                  <td className="px-5 py-3.5">
                    <span style={{ fontSize: 13, fontWeight: 600, background: '#f3e8ff', color: '#7e22ce', padding: '3px 10px', borderRadius: 20 }}>
                      {PLAN_LABELS[inv.plan] ?? inv.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 14, color: '#6b7280' }}>{ORIGIN_LABELS[inv.origin] ?? inv.origin}</td>
                  <td className="px-5 py-3.5">
                    <span className={STATUS_STYLES[inv.status]} style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 14, color: inv.status === 'pending' ? '#374151' : '#9ca3af' }}>
                    {daysLeft(inv.expires_at)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2 items-center">
                      {inv.status === 'pending' && (
                        <>
                          <button
                            onClick={() => copyLink(inv.id, inv.token)}
                            className="flex items-center gap-1.5 rounded-lg transition-colors"
                            style={{
                              fontSize: 13, fontWeight: 600, padding: '5px 12px',
                              backgroundColor: isCopied ? '#dcfce7' : '#f1f5f9',
                              color: isCopied ? '#16a34a' : '#475569',
                            }}
                          >
                            {isCopied
                              ? <><Check className="w-3.5 h-3.5" /> Copiado!</>
                              : <><Copy className="w-3.5 h-3.5" /> Copiar link</>
                            }
                          </button>
                          <button
                            onClick={() => handleRevoke(inv.id)}
                            disabled={isPending}
                            className="bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            style={{ fontSize: 13, fontWeight: 600, padding: '5px 12px' }}
                          >
                            Revogar
                          </button>
                        </>
                      )}
                      {inv.status !== 'pending' && (
                        <button
                          onClick={() => handleDelete(inv.id)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Excluir da lista"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
