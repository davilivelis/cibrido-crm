'use client'

// Tela de Tráfego Pago com botão de nova campanha e edição de status

import { useState } from 'react'
import { Plus, BarChart3, TrendingUp, MousePointerClick, Users, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NovaCampanhaModal from '@/components/trafego/NovaCampanhaModal'
import { updateCampaignMetrics } from '@/lib/actions/campaigns'
import { Campaign } from '@/types/database'

interface TrafegoClientProps {
  campaigns: Campaign[]
}

const PLATFORM_COLORS: Record<string, string> = {
  meta:   'bg-blue-50 text-blue-700',
  google: 'bg-green-50 text-green-700',
  tiktok: 'bg-pink-50 text-pink-700',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  paused: 'bg-yellow-50 text-yellow-700',
  ended:  'bg-muted/60 text-muted-foreground',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativa',
  paused: 'Pausada',
  ended:  'Encerrada',
}

export default function TrafegoClient({ campaigns }: TrafegoClientProps) {
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [editValues,  setEditValues]  = useState<Record<string, string>>({})
  const [savingId,    setSavingId]    = useState<string | null>(null)

  // Totais consolidados
  const totals = campaigns.reduce(
    (acc, c) => ({
      budget:      acc.budget      + (c.budget_monthly ?? 0),
      spent:       acc.spent       + (c.spent_total ?? 0),
      impressions: acc.impressions + (c.impressions ?? 0),
      clicks:      acc.clicks      + (c.clicks ?? 0),
      leads:       acc.leads       + (c.leads_generated ?? 0),
    }),
    { budget: 0, spent: 0, impressions: 0, clicks: 0, leads: 0 }
  )

  const cpl = totals.leads > 0
    ? (totals.spent / totals.leads).toFixed(2)
    : '0.00'

  function startEdit(c: Campaign) {
    setEditingId(c.id)
    setEditValues({
      spent_total:      String(c.spent_total ?? 0),
      impressions:      String(c.impressions ?? 0),
      clicks:           String(c.clicks ?? 0),
      leads_generated:  String(c.leads_generated ?? 0),
      status:           c.status,
    })
  }

  async function saveEdit(campaignId: string) {
    setSavingId(campaignId)
    try {
      await updateCampaignMetrics(campaignId, {
        spent_total:      parseFloat(editValues.spent_total ?? '0') || 0,
        impressions:      parseInt(editValues.impressions ?? '0')   || 0,
        clicks:           parseInt(editValues.clicks ?? '0')        || 0,
        leads_generated:  parseInt(editValues.leads_generated ?? '0') || 0,
        status:           editValues.status as Campaign['status'],
      })
      setEditingId(null)
    } finally {
      setSavingId(null)
    }
  }

  function ev(field: string, value: string) {
    setEditValues((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-[28px] font-bold text-foreground">Tráfego Pago</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">Performance das campanhas</p>
        </div>
        <Button className="gap-2 sm:self-auto self-start" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Nova Campanha
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Verba Mensal',  value: `R$ ${totals.budget.toLocaleString('pt-BR')}`,     icon: BarChart3,         color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Cliques Link',  value: totals.clicks.toLocaleString('pt-BR'),               icon: MousePointerClick, color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Leads Gerados', value: totals.leads,                                        icon: Users,             color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'CPL',           value: `R$ ${cpl}`,                                         icon: TrendingUp,        color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-card p-5 flex items-center gap-4"
              style={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className={`w-11 h-11 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabela de campanhas */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Campanhas</h2>
          <p className="text-xs text-muted-foreground">Clique em ✏️ para editar métricas</p>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground text-sm">Nenhuma campanha cadastrada.</p>
            <p className="text-gray-300 text-xs mt-1">Clique em "Nova Campanha" para começar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-muted/60">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Campanha</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plataforma</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Verba</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Gasto</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Impressões</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Cliques</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Leads</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const isEditing = editingId === c.id
                  const isSaving  = savingId === c.id

                  return (
                    <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-muted/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${PLATFORM_COLORS[c.platform] ?? ''}`}>
                          {c.platform}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {c.budget_monthly ? `R$ ${Number(c.budget_monthly).toLocaleString('pt-BR')}` : '—'}
                      </td>

                      {/* Campos editáveis inline */}
                      {isEditing ? (
                        <>
                          <td className="px-2 py-2">
                            <input
                              type="number" value={editValues.spent_total}
                              onChange={(e) => ev('spent_total', e.target.value)}
                              className="w-24 border border-border rounded px-2 py-1 text-xs text-right"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number" value={editValues.impressions}
                              onChange={(e) => ev('impressions', e.target.value)}
                              className="w-24 border border-border rounded px-2 py-1 text-xs text-right"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number" value={editValues.clicks}
                              onChange={(e) => ev('clicks', e.target.value)}
                              className="w-20 border border-border rounded px-2 py-1 text-xs text-right"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number" value={editValues.leads_generated}
                              onChange={(e) => ev('leads_generated', e.target.value)}
                              className="w-16 border border-border rounded px-2 py-1 text-xs text-right"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <select
                              value={editValues.status}
                              onChange={(e) => ev('status', e.target.value)}
                              className="border border-border rounded px-2 py-1 text-xs"
                            >
                              <option value="active">Ativa</option>
                              <option value="paused">Pausada</option>
                              <option value="ended">Encerrada</option>
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => saveEdit(c.id)}
                                disabled={isSaving}
                              >
                                {isSaving ? '...' : 'Salvar'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                onClick={() => setEditingId(null)}
                                disabled={isSaving}
                              >
                                ✕
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            R$ {Number(c.spent_total ?? 0).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {(c.impressions ?? 0).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {(c.clicks ?? 0).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {c.leads_generated ?? 0}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[c.status] ?? ''}`}>
                              {STATUS_LABELS[c.status] ?? c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => startEdit(c)}
                              className="text-gray-300 hover:text-muted-foreground transition-colors"
                              title="Editar métricas"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NovaCampanhaModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
