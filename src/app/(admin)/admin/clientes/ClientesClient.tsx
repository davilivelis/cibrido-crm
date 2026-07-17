'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toggleClientAccess, createInvite } from '@/lib/actions/admin'

const PLAN_LABELS: Record<string, string> = { lite: 'Lite', standard: 'Standard', master: 'Master', trial: 'Trial' }
// Preços de tabela (mesmos do modal de convite) — base do MRR
const PLAN_PRICES: Record<string, number> = { lite: 497, standard: 897, master: 1497 }
const STATUS_STYLES: Record<string, string> = {
  trial:     'bg-yellow-100 text-yellow-700',
  active:    'bg-green-100 text-green-700',
  blocked:   'bg-red-100 text-red-700',
  cancelled: 'bg-muted text-muted-foreground',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ClientesClient({ clients }: { clients: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePlan, setInvitePlan] = useState('standard')
  const [inviteDays, setInviteDays] = useState('7')
  const [generatedLink, setGeneratedLink] = useState('')
  const [creating, setCreating] = useState(false)

  const stats = {
    total:    clients.length,
    trial:    clients.filter(c => c.subscriptions?.[0]?.status === 'trial').length,
    active:   clients.filter(c => c.subscriptions?.[0]?.status === 'active').length,
    blocked:  clients.filter(c => !c.is_active).length,
    // MRR = soma dos planos com assinatura ativa
    mrr: clients.reduce((acc, c) => {
      const sub = c.subscriptions?.[0]
      return sub?.status === 'active' ? acc + (PLAN_PRICES[sub.plan] ?? 0) : acc
    }, 0),
  }

  function fmtActivity(iso: string | null | undefined): string {
    if (!iso) return 'sem uso'
    const diffH = (Date.now() - new Date(iso).getTime()) / 3600_000
    if (diffH < 1)  return 'agora há pouco'
    if (diffH < 24) return `há ${Math.floor(diffH)}h`
    const d = Math.floor(diffH / 24)
    return d === 1 ? 'ontem' : `há ${d} dias`
  }

  function handleToggle(clinicId: string, current: boolean) {
    startTransition(async () => {
      await toggleClientAccess(clinicId, !current)
      router.refresh()
    })
  }

  async function handleCreateInvite() {
    if (!inviteEmail) return
    setCreating(true)
    try {
      const { link } = await createInvite({ email: inviteEmail, plan: invitePlan, validityDays: Number(inviteDays) })
      setGeneratedLink(link)
    } finally {
      setCreating(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(generatedLink)
  }

  function closeModal() {
    setShowModal(false); setGeneratedLink(''); setInviteEmail('')
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}>Clientes</h1>
          <p style={{ fontSize: '15px', color: 'var(--muted-foreground)', marginTop: 4 }}>Clínicas com acesso ao CRM Livelis</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-lime text-[#131500] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#a8e000] transition-colors"
        >
          + Novo Convite
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total',      value: stats.total,   color: '#4d6b00' },
          { label: 'Em trial',   value: stats.trial,   color: '#d97706' },
          { label: 'Ativos',     value: stats.active,  color: '#16a34a' },
          { label: 'Bloqueados', value: stats.blocked, color: '#dc2626' },
          { label: 'MRR',        value: `R$ ${stats.mrr.toLocaleString('pt-BR')}`, color: '#4d6b00' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table className="w-full">
          <thead style={{ background: 'var(--muted)' }}>
            <tr>
              {['Clínica', 'Responsável', 'Plano', 'Status', 'Leads', 'Última atividade', 'Desde', 'Ações'].map(h => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-12 text-center" style={{ fontSize: 15, color: 'var(--muted-foreground)' }}>Nenhuma clínica cadastrada ainda.</td></tr>
            )}
            {clients.map(c => {
              const sub    = c.subscriptions?.[0]
              const owner  = c.users?.find((u: { role: string }) => u.role === 'owner') ?? c.users?.[0]
              const status = sub?.status ?? (c.is_active ? 'active' : 'blocked')
              return (
                <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3.5" style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>{c.name}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 15, color: 'var(--foreground)' }}>{owner?.name ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span style={{ fontSize: 13, fontWeight: 600, background: '#f3e8ff', color: '#7e22ce', padding: '3px 10px', borderRadius: 20 }}>
                      {PLAN_LABELS[sub?.plan ?? 'trial']}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`${STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground'}`} style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                      {status === 'trial' ? 'Trial' : status === 'active' ? 'Ativo' : status === 'blocked' ? 'Bloqueado' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
                    {c.usage?.leads_count ?? 0}
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
                    {fmtActivity(c.usage?.last_activity)}
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2 items-center">
                      <Link
                        href={`/admin/clientes/${c.id}`}
                        className="px-3 py-1.5 rounded-lg transition-colors bg-muted text-muted-foreground hover:bg-slate-200"
                        style={{ fontSize: 13, fontWeight: 600 }}
                      >
                        Ver detalhes
                      </Link>
                      <button
                        onClick={() => handleToggle(c.id, c.is_active)}
                        disabled={isPending}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          c.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                        style={{ fontSize: 13, fontWeight: 600 }}
                      >
                        {c.is_active ? 'Bloquear' : 'Liberar'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Convite */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card p-7 w-full max-w-md" style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>Gerar convite de acesso</h2>
            <p style={{ fontSize: 14, color: 'var(--muted-foreground)', marginBottom: 24 }}>O dentista receberá um link único para criar a conta.</p>

            {!generatedLink ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email do dentista</label>
                  <input type="email" placeholder="dr.carlos@clinica.com" value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Plano contratado</label>
                  <select value={invitePlan} onChange={e => setInvitePlan(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-card">
                    <option value="lite">Cibri-Lite — R$497/mês</option>
                    <option value="standard">Cibri-Standard — R$897/mês</option>
                    <option value="master">Cibri-Master — R$1.497/mês</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Validade do convite</label>
                  <select value={inviteDays} onChange={e => setInviteDays(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-card">
                    <option value="3">3 dias</option>
                    <option value="7">7 dias</option>
                    <option value="15">15 dias</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={closeModal} className="flex-1 bg-muted text-foreground py-2.5 rounded-lg text-sm font-bold">Cancelar</button>
                  <button onClick={handleCreateInvite} disabled={creating || !inviteEmail}
                    className="flex-1 bg-brand-lime text-[#131500] py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">
                    {creating ? 'Gerando...' : 'Gerar link'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-bold text-sm mb-1">✅ Link gerado com sucesso!</p>
                  <p className="text-green-600 text-xs">Envie pelo WhatsApp para <strong>{inviteEmail}</strong></p>
                </div>
                <div className="bg-muted/60 border border-border rounded-lg p-3 text-xs text-muted-foreground break-all font-mono">
                  {generatedLink}
                </div>
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 bg-muted text-foreground py-2.5 rounded-lg text-sm font-bold">Fechar</button>
                  <button onClick={copyLink} className="flex-1 bg-brand-lime text-[#131500] py-2.5 rounded-lg text-sm font-bold">
                    Copiar link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
