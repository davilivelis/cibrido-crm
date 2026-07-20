'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Settings2, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { saveStages } from '@/lib/actions/stages'

interface Stage { id: string; name: string }

export default function StageManager({ stages }: { stages: Stage[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<Stage[]>([])
  const [deleted, setDeleted] = useState<string[]>([])
  const [added, setAdded] = useState<string[]>([])
  const [pending, startTransition] = useTransition()

  function openModal() {
    setRows(stages.map((s) => ({ id: s.id, name: s.name })))
    setDeleted([])
    setAdded([])
    setOpen(true)
  }

  function rename(i: number, name: string) {
    setRows((r) => r.map((s, idx) => (idx === i ? { ...s, name } : s)))
  }
  function move(i: number, dir: -1 | 1) {
    setRows((r) => {
      const j = i + dir
      if (j < 0 || j >= r.length) return r
      const c = [...r]
      ;[c[i], c[j]] = [c[j], c[i]]
      return c
    })
  }
  function removeRow(i: number) {
    setRows((r) => {
      setDeleted((d) => [...d, r[i].id])
      return r.filter((_, idx) => idx !== i)
    })
  }

  function save() {
    startTransition(async () => {
      const res = await saveStages({
        existing: rows,
        added: added.filter((n) => n.trim()),
        deletedIds: deleted,
      })
      if (res.ok) {
        toast.success('Etapas do funil salvas!')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error ?? 'Erro ao salvar')
      }
    })
  }

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center gap-2 text-sm font-semibold px-3.5 py-2 rounded-lg border border-border text-foreground hover:border-primary transition-colors"
      >
        <Settings2 className="w-4 h-4" />
        Editar etapas
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-base font-bold text-foreground">Etapas do funil</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Nomeie do jeito do seu negócio. Ex.: clínica “Consulta Marcada”, agência “Proposta Enviada”.
              </p>
            </div>

            <div className="space-y-2">
              {rows.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground disabled:opacity-30 hover:text-foreground">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="text-muted-foreground disabled:opacity-30 hover:text-foreground">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    value={s.name}
                    onChange={(e) => rename(i, e.target.value)}
                    className="flex-1 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm"
                  />
                  <button onClick={() => removeRow(i)} className="w-8 h-8 flex items-center justify-center rounded-lg text-destructive hover:bg-destructive/10" aria-label="Remover etapa">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {added.map((name, i) => (
                <div key={`new-${i}`} className="flex items-center gap-2">
                  <span className="w-8 text-center text-xs text-primary-strong font-bold">nova</span>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setAdded((a) => a.map((n, idx) => (idx === i ? e.target.value : n)))}
                    placeholder="Nome da etapa"
                    className="flex-1 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm"
                  />
                  <button onClick={() => setAdded((a) => a.filter((_, idx) => idx !== i))} className="w-8 h-8 flex items-center justify-center rounded-lg text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAdded((a) => [...a, ''])}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-strong hover:opacity-80"
            >
              <Plus className="w-4 h-4" /> Adicionar etapa
            </button>

            <div className="flex gap-2 pt-2">
              <button onClick={save} disabled={pending} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50">
                {pending ? 'Salvando…' : 'Salvar etapas'}
              </button>
              <button onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-muted">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
