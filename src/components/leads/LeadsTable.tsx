'use client'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { LeadWithStage, PipelineStage } from '@/types/database'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: '',          label: 'Todos os status' },
  { value: 'active',   label: 'Ativo' },
  { value: 'lost',     label: 'Perdido' },
  { value: 'converted',label: 'Convertido' },
]

const ORIGEM_OPTIONS = [
  { value: '',           label: 'Todas as origens' },
  { value: 'instagram',  label: 'Instagram' },
  { value: 'google',     label: 'Google' },
  { value: 'indicacao',  label: 'Indicação' },
  { value: 'facebook',   label: 'Facebook' },
  { value: 'whatsapp',   label: 'WhatsApp direto' },
  { value: 'outro',      label: 'Outro' },
]

const STATUS_STYLE: Record<string, string> = {
  active:    'bg-green-50 text-green-700',
  lost:      'bg-red-50 text-red-700',
  converted: 'bg-indigo-50 text-indigo-700',
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativo', lost: 'Perdido', converted: 'Convertido',
}

type SortField = 'name' | 'created_at' | 'status'
type SortDir   = 'asc' | 'desc'

interface LeadsTableProps {
  leads: LeadWithStage[]
  stages: PipelineStage[]
}

export default function LeadsTable({ leads, stages }: LeadsTableProps) {
  const [search,      setSearch]      = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterStage,  setFilterStage]  = useState('')
  const [filterOrigem, setFilterOrigem] = useState('')
  const [sortField,   setSortField]   = useState<SortField>('created_at')
  const [sortDir,     setSortDir]     = useState<SortDir>('desc')
  const [showFilters, setShowFilters] = useState(false)

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return leads
      .filter((l) => {
        const matchSearch = !q || l.name.toLowerCase().includes(q) || l.phone.includes(q) || (l.email ?? '').toLowerCase().includes(q)
        const matchStatus = !filterStatus || l.status === filterStatus
        const matchStage  = !filterStage  || l.stage_id === filterStage
        const matchOrigem = !filterOrigem || l.source === filterOrigem
        return matchSearch && matchStatus && matchStage && matchOrigem
      })
      .sort((a, b) => {
        let va: string, vb: string
        if (sortField === 'name')       { va = a.name;       vb = b.name }
        else if (sortField === 'status') { va = a.status;     vb = b.status }
        else                             { va = a.created_at; vb = b.created_at }
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
  }, [leads, search, filterStatus, filterStage, filterOrigem, sortField, sortDir])

  const hasActiveFilters = filterStatus || filterStage || filterOrigem

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="w-3" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 inline ml-0.5" />
      : <ChevronDown className="w-3 h-3 inline ml-0.5" />
  }

  return (
    <div className="space-y-3">
      {/* Barra de busca + botão filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
            showFilters || hasActiveFilters
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          )}
        </button>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
          {/* Status */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg border transition-colors',
                    filterStatus === opt.value
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-white'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Etapa */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Etapa</p>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterStage('')}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-lg border transition-colors',
                  !filterStage ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-white'
                )}
              >
                Todas
              </button>
              {stages.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFilterStage(s.id)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg border transition-colors',
                    filterStage === s.id
                      ? 'text-white border-transparent'
                      : 'border-gray-200 text-gray-600 hover:bg-white'
                  )}
                  style={filterStage === s.id ? { backgroundColor: s.color, borderColor: s.color } : {}}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Origem */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Origem</p>
            <div className="flex gap-1.5 flex-wrap">
              {ORIGEM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterOrigem(opt.value)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg border transition-colors',
                    filterOrigem === opt.value
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-white'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => { setFilterStatus(''); setFilterStage(''); setFilterOrigem('') }}
              className="text-xs text-red-500 hover:text-red-700 self-end"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Contador */}
      <p className="text-xs text-gray-400">
        {filtered.length} lead{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        {hasActiveFilters && <span className="text-indigo-500"> (filtrado)</span>}
      </p>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th
                className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-800 select-none"
                onClick={() => toggleSort('name')}
              >
                Nome <SortIcon field="name" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Contato</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Etapa</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Origem</th>
              <th
                className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-800 select-none"
                onClick={() => toggleSort('status')}
              >
                Status <SortIcon field="status" />
              </th>
              <th
                className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-800 select-none"
                onClick={() => toggleSort('created_at')}
              >
                Cadastrado <SortIcon field="created_at" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  {search || hasActiveFilters ? 'Nenhum lead corresponde aos filtros.' : 'Nenhum lead cadastrado ainda.'}
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/leads/${lead.id}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5 text-sm text-gray-600">
                      <span>{lead.phone}</span>
                      {lead.email && <span className="text-gray-400 text-xs">{lead.email}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {lead.stage ? (
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${lead.stage.color}20`, color: lead.stage.color }}
                      >
                        {lead.stage.name}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize text-sm">{lead.source ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium px-2 py-1 rounded-full', STATUS_STYLE[lead.status])}>
                      {STATUS_LABEL[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
