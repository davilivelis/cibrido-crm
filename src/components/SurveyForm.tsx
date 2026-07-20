'use client'

import { useState, useTransition } from 'react'
import { Star, CheckCircle2 } from 'lucide-react'
import { submitSurvey } from '@/lib/actions/surveys'

function Stars({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className="w-8 h-8"
              style={{
                fill: (hover || value) >= n ? 'var(--primary)' : 'transparent',
                color: (hover || value) >= n ? 'var(--primary)' : 'var(--border)',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export function SurveyForm({
  token,
  clinicName,
  firstName,
}: {
  token: string
  clinicName: string
  firstName: string
}) {
  const [reception, setReception] = useState(0)
  const [professional, setProfessional] = useState(0)
  const [comment, setComment] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit() {
    if (!reception && !professional) {
      setError('Dê pelo menos uma nota 🙂')
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await submitSurvey({ token, reception, professional, comment })
      if (res.ok) setDone(true)
      else setError(res.error ?? 'Não foi possível enviar. Tente de novo.')
    })
  }

  if (done) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: 'var(--primary-strong)' }} />
        <h1 className="text-xl font-bold text-foreground">Obrigado{firstName ? `, ${firstName}` : ''}! 💚</h1>
        <p className="text-sm text-muted-foreground">
          Sua avaliação ajuda a {clinicName} a melhorar cada vez mais.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground">Como foi seu atendimento?</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {firstName ? `${firstName}, sua` : 'Sua'} opinião leva 30 segundos e vale muito.
        </p>
      </div>

      <Stars label="Atendimento do profissional" value={professional} onChange={setProfessional} />
      <Stars label="Atendimento da recepção" value={reception} onChange={setReception} />

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Quer deixar um comentário? (opcional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Conte pra gente como foi…"
          className="w-full rounded-lg border border-input bg-background text-foreground p-3 text-sm resize-y"
        />
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="w-full py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {pending ? 'Enviando…' : 'Enviar avaliação'}
      </button>
    </div>
  )
}
