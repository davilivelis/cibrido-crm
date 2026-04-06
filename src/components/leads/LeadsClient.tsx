'use client'

import { useState } from 'react'
import { Plus, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LeadsTable from '@/components/leads/LeadsTable'
import NovoLeadModal from '@/components/leads/NovoLeadModal'
import ImportCSVModal from '@/components/leads/ImportCSVModal'
import { LeadWithStage, PipelineStage } from '@/types/database'

interface LeadsClientProps {
  leads: LeadWithStage[]
  stages: PipelineStage[]
  clinicId: string
}

export default function LeadsClient({ leads, stages, clinicId }: LeadsClientProps) {
  const [modalOpen,     setModalOpen]     = useState(false)
  const [importOpen,    setImportOpen]    = useState(false)
  const [downloading,   setDownloading]   = useState(false)

  async function handleExport() {
    setDownloading(true)
    try {
      const res  = await fetch('/api/leads/export')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10)
      a.href     = url
      a.download = `leads-${date}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-[28px] font-bold text-gray-900">Leads</h1>
          <p className="text-sm lg:text-base text-gray-500 mt-1">{leads.length} leads cadastrados</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importar CSV</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Button
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
            onClick={handleExport}
            disabled={downloading}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{downloading ? 'Baixando...' : 'Exportar CSV'}</span>
            <span className="sm:hidden">{downloading ? '...' : 'Exportar'}</span>
          </Button>
          <Button className="gap-2 flex-1 sm:flex-none" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      <LeadsTable leads={leads} stages={stages} />

      <ImportCSVModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />

      <NovoLeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        stages={stages}
        clinicId={clinicId}
      />
    </div>
  )
}
