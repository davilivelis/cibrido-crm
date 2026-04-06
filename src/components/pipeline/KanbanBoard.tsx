'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Phone } from 'lucide-react'
import { Lead, PipelineStage } from '@/types/database'
import { updateLeadStage } from '@/lib/actions/leads'
import LeadCardModal from '@/components/pipeline/LeadCardModal'
import { cn } from '@/lib/utils'

// ── Card individual (arrastável) ────────────────────────────
function LeadCard({
  lead,
  isBeingDragged,
  onClick,
}: {
  lead: Lead
  isBeingDragged?: boolean
  onClick: (lead: Lead) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { lead, type: 'lead' },
  })

  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && onClick(lead)}
      className={cn(
        'bg-white rounded-xl border p-4 select-none cursor-grab transition-all duration-150',
        'border-[#E2E5EA] shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
        isDragging || isBeingDragged
          ? 'opacity-40 cursor-grabbing'
          : 'hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:border-[#C5CAD3]'
      )}
    >
      <p className="text-sm font-semibold text-gray-900 mb-2">{lead.name}</p>
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Phone className="w-3 h-3" />
        {lead.phone}
      </div>
      {lead.source && (
        <span className="mt-2.5 inline-block text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
          {lead.source}
        </span>
      )}
    </div>
  )
}

// ── Coluna droppable ──────────────────────────────────────────
function KanbanColumn({
  stage,
  leads,
  activeId,
  onCardClick,
}: {
  stage: PipelineStage
  leads: Lead[]
  activeId: string | null
  onCardClick: (lead: Lead) => void
}) {
  // useDroppable faz a coluna inteira ser um alvo de drop (inclusive quando vazia)
  const { setNodeRef, isOver } = useDroppable({ id: stage.id, data: { type: 'column', stageId: stage.id } })

  return (
    <div className="flex-shrink-0 min-w-[280px] snap-start">
      {/* Header da coluna — estilo Trello */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-t-xl mb-0"
        style={{ backgroundColor: `${stage.color}18` }}
      >
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
        <span className="text-sm font-semibold text-gray-800 truncate flex-1">{stage.name}</span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 text-white"
          style={{ backgroundColor: stage.color }}
        >
          {leads.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'min-h-[200px] rounded-b-xl p-2.5 transition-colors',
          isOver
            ? 'bg-indigo-50 border-2 border-dashed border-indigo-300'
            : 'bg-[#F1F3F5]'
        )}
      >
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                isBeingDragged={lead.id === activeId}
                onClick={onCardClick}
              />
            ))}
          </div>
        </SortableContext>

        {leads.length === 0 && !isOver && (
          <p className="text-xs text-gray-300 text-center pt-6">Solte aqui</p>
        )}
      </div>
    </div>
  )
}

// ── Board principal ──────────────────────────────────────────
interface KanbanBoardProps {
  stages: PipelineStage[]
  leads: Lead[]
}

export default function KanbanBoard({ stages, leads: initialLeads }: KanbanBoardProps) {
  const [leads,        setLeads]        = useState(initialLeads)
  const [activeId,     setActiveId]     = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 8 } })
  )

  const activeLead      = activeId ? leads.find((l) => l.id === activeId) : null
  const stageIdsByLead  = Object.fromEntries(leads.map((l) => [l.id, l.stage_id]))

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
    setSelectedLead(null)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const leadId    = active.id as string
    const overId    = over.id   as string

    // Determina o stage alvo:
    // 1. Se soltou sobre uma coluna (useDroppable) → over.data.current.stageId
    // 2. Se soltou sobre um card (useSortable) → pega o stage_id do card
    let targetStageId: string | null =
      (over.data.current?.type === 'column')
        ? (over.data.current.stageId as string)
        : (stageIdsByLead[overId] ?? null)

    // Fallback: verifica se o overId é um stage.id diretamente
    if (!targetStageId) {
      const matchedStage = stages.find((s) => s.id === overId)
      if (matchedStage) targetStageId = matchedStage.id
    }

    const currentStageId = stageIdsByLead[leadId]
    if (!targetStageId || targetStageId === currentStageId) return

    // Atualiza visualmente de imediato (optimistic)
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage_id: targetStageId } : l))
    )

    // Persiste no banco em background
    startTransition(async () => {
      await updateLeadStage(leadId, targetStageId)
    })
  }

  function handleModalStageChange(leadId: string, stageId: string | null) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage_id: stageId } : l)))
    setSelectedLead((prev) => prev?.id === leadId ? { ...prev, stage_id: stageId } : prev)
  }

  const leadsByStage = stages.reduce<Record<string, Lead[]>>((acc, stage) => {
    acc[stage.id] = leads.filter((l) => l.stage_id === stage.id)
    return acc
  }, {})

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id] ?? []}
              activeId={activeId}
              onCardClick={setSelectedLead}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
          {activeLead ? (
            <div className="bg-white rounded-xl border border-indigo-200 shadow-lg p-3 w-60 rotate-1 cursor-grabbing">
              <p className="text-sm font-medium text-gray-900">{activeLead.name}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <Phone className="w-3 h-3" />
                {activeLead.phone}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedLead && (
        <LeadCardModal
          lead={selectedLead}
          stages={stages}
          onClose={() => setSelectedLead(null)}
          onStageChange={handleModalStageChange}
        />
      )}
    </>
  )
}
