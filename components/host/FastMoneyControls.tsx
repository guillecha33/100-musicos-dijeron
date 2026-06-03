'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, Check } from 'lucide-react'
import type { FastMoneySession } from '@/lib/types'
import type { ClientEvent, FastMoneyAnswer } from '@/lib/game-events'
import { cn } from '@/lib/utils'

const FAST_MONEY_QUESTIONS = [
  'Menciona algo que no puede faltar en un concierto',
  'Menciona un instrumento que casi todos conocen',
  'Menciona un género musical que se escucha en fiestas',
  'Menciona algo que hace un músico antes de subir al escenario',
  'Nombra algo que los fans hacen en un concierto',
]

interface FastMoneyControlsProps {
  session: FastMoneySession | null
  gameId: string
  onAction: (action: { type: string; [key: string]: unknown }) => Promise<{ success: boolean }>
  loading: boolean
  send?: (event: ClientEvent) => void
}

interface AnswerEntry {
  answer_text: string
  points: number
}

export function FastMoneyControls({ session, onAction, loading, send }: FastMoneyControlsProps) {
  const [p1Answers, setP1Answers] = useState<AnswerEntry[]>(
    FAST_MONEY_QUESTIONS.map(() => ({ answer_text: '', points: 0 })),
  )
  const [p2Answers, setP2Answers] = useState<AnswerEntry[]>(
    FAST_MONEY_QUESTIONS.map(() => ({ answer_text: '', points: 0 })),
  )
  const [timeLimitOne, setTimeLimitOne] = useState(20)
  const [timeLimitTwo, setTimeLimitTwo] = useState(25)

  const update = (
    setter: React.Dispatch<React.SetStateAction<AnswerEntry[]>>,
    index: number,
    field: keyof AnswerEntry,
    value: string,
  ) => {
    setter((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: field === 'points' ? parseInt(value) || 0 : value }
      return next
    })
  }

  const sendViaWs = (event: ClientEvent) => {
    if (send) send(event)
  }

  const handleSaveP1 = () => {
    sendViaWs({ type: 'UPDATE_FAST_MONEY_SCORE', payload: { player: 1, answers: p1Answers as FastMoneyAnswer[] } })
  }

  const handleSaveP2 = () => {
    sendViaWs({ type: 'UPDATE_FAST_MONEY_SCORE', payload: { player: 2, answers: p2Answers as FastMoneyAnswer[] } })
  }

  const p1Texts = p1Answers.map((a) => a.answer_text.trim().toLowerCase()).filter(Boolean)
  const isDuplicateP2 = (index: number) => {
    const text = p2Answers[index].answer_text.trim().toLowerCase()
    return text.length > 0 && p1Texts.includes(text)
  }

  if (!session) {
    return (
      <div className="rounded-lg border border-border bg-bg-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-gold">
          <Zap className="w-4 h-4" />
          <span className="font-display text-sm tracking-widest uppercase">Dinero Rápido Musical</span>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-body text-xs text-white/40">Tiempo J1 (seg)</label>
            <Input type="number" value={timeLimitOne} onChange={(e) => setTimeLimitOne(parseInt(e.target.value) || 20)} className="h-8 text-sm" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-body text-xs text-white/40">Tiempo J2 (seg)</label>
            <Input type="number" value={timeLimitTwo} onChange={(e) => setTimeLimitTwo(parseInt(e.target.value) || 25)} className="h-8 text-sm" />
          </div>
        </div>
        <Button variant="neon" onClick={() => sendViaWs({ type: 'START_FAST_MONEY', payload: { timeLimitOne, timeLimitTwo } })} disabled={loading} className="w-full gap-2">
          <Zap className="w-4 h-4" /> Iniciar Dinero Rápido
        </Button>
      </div>
    )
  }

  const isP1 = session.status === 'playing_one'
  const isP2 = session.status === 'playing_two'
  const isDone = session.status === 'finished'

  return (
    <div className="rounded-lg border border-neon-blue/30 bg-neon-blue/5 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-neon-blue">
          <Zap className="w-4 h-4" />
          <span className="font-display text-sm tracking-widest uppercase">Dinero Rápido</span>
        </div>
        <span className="font-body text-xs text-white/50 uppercase">
          {isP1 ? 'Jugador 1' : isP2 ? 'Jugador 2' : 'Terminado'}
        </span>
      </div>

      {/* Jugador 1 */}
      <div className={cn('flex flex-col gap-2', !isP1 && 'opacity-60')}>
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-white/60 font-bold uppercase tracking-wider">Jugador 1</span>
          {isP1 && (
            <Button size="sm" variant="neon" className="h-7 gap-1" onClick={handleSaveP1} disabled={loading}>
              <Check className="w-3 h-3" /> Guardar J1
            </Button>
          )}
        </div>
        {FAST_MONEY_QUESTIONS.map((_, i) => (
          <div key={i} className="flex gap-1.5 items-center">
            <span className="font-body text-xs text-white/30 w-4 shrink-0">{i + 1}</span>
            <Input placeholder={`R${i + 1}...`} value={p1Answers[i].answer_text} onChange={(e) => update(setP1Answers, i, 'answer_text', e.target.value)} className="h-7 text-xs flex-1" disabled={!isP1} />
            <Input type="number" placeholder="pts" value={p1Answers[i].points || ''} onChange={(e) => update(setP1Answers, i, 'points', e.target.value)} className="h-7 text-xs w-14" disabled={!isP1} />
          </div>
        ))}
      </div>

      {/* Jugador 2 */}
      {(isP2 || isDone) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-white/60 font-bold uppercase tracking-wider">Jugador 2</span>
            {isP2 && (
              <Button size="sm" variant="neon" className="h-7 gap-1" onClick={handleSaveP2} disabled={loading}>
                <Check className="w-3 h-3" /> Guardar J2
              </Button>
            )}
          </div>
          {FAST_MONEY_QUESTIONS.map((_, i) => {
            const isDup = isDuplicateP2(i)
            return (
              <div key={i} className="flex gap-1.5 items-center">
                <span className="font-body text-xs text-white/30 w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 relative">
                  <Input
                    placeholder={`R${i + 1}...`}
                    value={p2Answers[i].answer_text}
                    onChange={(e) => update(setP2Answers, i, 'answer_text', e.target.value)}
                    className={cn('h-7 text-xs w-full', isDup && 'border-strike text-strike focus:ring-strike')}
                    disabled={!isP2}
                  />
                  {isDup && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 font-display text-strike text-xs">✕ DUP</span>
                  )}
                </div>
                <Input type="number" placeholder="pts" value={p2Answers[i].points || ''} onChange={(e) => update(setP2Answers, i, 'points', e.target.value)} className="h-7 text-xs w-14" disabled={!isP2} />
              </div>
            )
          })}
        </div>
      )}

      {isDone && (
        <div className="text-center py-2">
          <span className="font-display text-gold text-xl">Total: {session.total_score} pts</span>
          {session.total_score >= 200 && <p className="font-body text-neon-green text-sm mt-1">¡Meta alcanzada! 🎉</p>}
        </div>
      )}
    </div>
  )
}
