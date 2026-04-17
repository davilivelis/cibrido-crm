'use client'

// Modal de importação de leads via CSV
// Suporta separador vírgula ou ponto-e-vírgula (padrão Excel pt-BR)
// Colunas esperadas: nome, telefone, email, origem, observações
// As duas primeiras colunas (nome + telefone) são obrigatórias

import { useState, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { importLeads } from '@/lib/actions/leads'

interface ImportCSVModalProps {
  open: boolean
  onClose: () => void
}

interface ParsedRow {
  name: string
  phone: string
  email: string
  source: string
  notes: string
  valid: boolean    // false se nome ou telefone estiverem vazios
}

// Detecta o separador predominante na primeira linha do CSV
function detectSep(line: string): ',' | ';' {
  const commas     = (line.match(/,/g)   ?? []).length
  const semicolons = (line.match(/;/g)   ?? []).length
  return semicolons >= commas ? ';' : ','
}

// Remove aspas em volta de valores CSV e escapa corretamente
function stripQuotes(val: string): string {
  const v = val.trim()
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1).replace(/""/g, '"')
  return v
}

// Parseia o texto do CSV e retorna as linhas mapeadas
function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []   // precisa de header + ao menos 1 linha

  const sep = detectSep(lines[0])
  // Ignora a linha de cabeçalho (primeira linha)
  return lines.slice(1).map((line) => {
    const cols = line.split(sep).map(stripQuotes)
    const name  = cols[0] ?? ''
    const phone = cols[1] ?? ''
    return {
      name,
      phone,
      email:  cols[2] ?? '',
      source: cols[3] ?? '',
      notes:  cols[4] ?? '',
      valid:  Boolean(name.trim() && phone.trim()),
    }
  })
}

export default function ImportCSVModal({ open, onClose }: ImportCSVModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rows,       setRows]       = useState<ParsedRow[]>([])
  const [fileName,   setFileName]   = useState<string | null>(null)
  const [importing,  setImporting]  = useState(false)
  const [imported,   setImported]   = useState<number | null>(null)
  const [error,      setError]      = useState<string | null>(null)

  function reset() {
    setRows([])
    setFileName(null)
    setImported(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setImported(null)
    setFileName(file.name)

    const text = await file.text()
    const parsed = parseCSV(text)

    if (parsed.length === 0) {
      setError('Arquivo vazio ou sem dados após o cabeçalho.')
      setRows([])
      return
    }

    setRows(parsed)
  }

  async function handleImport() {
    const valid = rows.filter((r) => r.valid)
    if (valid.length === 0) return

    setImporting(true)
    setError(null)
    try {
      const count = await importLeads(valid.map((r) => ({
        name:   r.name,
        phone:  r.phone,
        email:  r.email  || undefined,
        source: r.source || undefined,
        notes:  r.notes  || undefined,
      })))
      setImported(count)
      setRows([])
      setFileName(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao importar')
    } finally {
      setImporting(false)
    }
  }

  const validCount   = rows.filter((r) =>  r.valid).length
  const invalidCount = rows.filter((r) => !r.valid).length

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar leads via CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* Instruções do formato */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700">Formato esperado (1ª linha = cabeçalho):</p>
            <p className="font-mono text-[11px] text-gray-500">
              nome ; telefone ; email ; origem ; observações
            </p>
            <p>Separador: vírgula ou ponto-e-vírgula. Nome e telefone são obrigatórios.</p>
          </div>

          {/* Upload */}
          {!fileName && !imported && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-[#E91E7B]/40 hover:bg-pink-50/30 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Clique para selecionar o arquivo</p>
                <p className="text-xs text-gray-400 mt-0.5">Apenas arquivos .csv</p>
              </div>
            </button>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFile}
          />

          {/* Arquivo selecionado — preview */}
          {fileName && rows.length > 0 && !imported && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-medium truncate max-w-[200px]">{fileName}</span>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Resumo */}
              <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1.5 rounded-full font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {validCount} prontos para importar
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1.5 rounded-full font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {invalidCount} sem nome/telefone (serão ignorados)
                  </span>
                )}
              </div>

              {/* Preview — primeiras 5 linhas */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-3 py-2 text-left">Nome</th>
                      <th className="px-3 py-2 text-left">Telefone</th>
                      <th className="px-3 py-2 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((r, i) => (
                      <tr
                        key={i}
                        className={`border-t border-gray-50 ${!r.valid ? 'opacity-40' : ''}`}
                      >
                        <td className="px-3 py-2 text-gray-800 truncate max-w-[120px]">
                          {r.name || <span className="italic text-gray-400">vazio</span>}
                        </td>
                        <td className="px-3 py-2 text-gray-600">{r.phone || '—'}</td>
                        <td className="px-3 py-2 text-gray-500 truncate max-w-[120px]">{r.email || '—'}</td>
                      </tr>
                    ))}
                    {rows.length > 5 && (
                      <tr className="border-t border-gray-50">
                        <td colSpan={3} className="px-3 py-2 text-gray-400 italic text-center">
                          +{rows.length - 5} linhas adicionais
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sucesso */}
          {imported !== null && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #E91E7B, #7B2D8E)' }}
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{imported} leads importados!</p>
                <p className="text-sm text-gray-500 mt-0.5">Já aparecem na lista de leads.</p>
              </div>
              <Button onClick={handleClose} size="sm">Fechar</Button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Ações */}
          {rows.length > 0 && !imported && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClose} disabled={importing}>
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing || validCount === 0}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {importing ? 'Importando...' : `Importar ${validCount} leads`}
              </Button>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
