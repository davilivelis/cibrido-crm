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
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>Leads</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '4px' }}>{leads.length} leads cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="w-4 h-4" />
            Importar CSV
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExport}
            disabled={downloading}
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Baixando...' : 'Exportar CSV'}
          </Button>
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
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
