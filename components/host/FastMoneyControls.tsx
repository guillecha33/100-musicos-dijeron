'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, Plus, Check } from 'lucide-react'
import type { FastMoneySession, FastMoneyAnswer } from '@/lib/types'
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
}

interface AnswerEntry {
  answer_text: string
  points: number
}

export function FastMoneyControls({ session, gameId, onAction, loading }: FastMoneyControlsProps) {
  const [playerOneAnswers, setPlayerOneAnswers] = useState<AnswerEntry[]>(
    FAST_MONEY_QUESTIONS.map(() => ({ answer_text: '', points: 0 }))
  )
  const [playerTwoAnswers, setPlayerTwoAnswers] = useState<AnswerEntry[]>(
    FAST_MONEY_QUESTIONS.map(() => ({ answer_text: '', points: 0 }))
  )
  const [timeLimitOne, setTimeLimitOne] = useState(20)
  const [timeLimitTwo, setTimeLimitTwo] = useState(25)

  const updateAnswer = (
    setter: React.Dispatch<React.SetStateAction<AnswerEntry[]>>,
    index: number,
    field: keyof AnswerEntry,
    value: string
  ) => {
    setter((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: field === 'points' ? parseInt(value) || 0 : value }
      return next
    })
  }

  const handleSavePlayerOne = async () => {
    const res = await fetch(`/api/fast-money/${gameId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: 1, answers: playerOneAnswers }),
    })
    if (res.ok) {
      await onAction({ type: 'start_fast_money' })
    }
  }

  const handleSavePlayerTwo = async () => {
    const res = await fetch(`/api/fast-money/${gameId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: 2, answers: playerTwoAnswers }),
    })
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
            <Input
              type="number"
              value={timeLimitOne}
              onChange={(e) => setTimeLimitOne(parseInt(e.target.value) || 20)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-body text-xs text-white/40">Tiempo J2 (seg)</label>
            <Input
              type="number"
              value={timeLimitTwo}
              onChange={(e) => setTimeLimitTwo(parseInt(e.target.value) || 25)}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <Button
          variant="neon"
          onClick={() => onAction({ type: 'start_fast_money' })}
          disabled={loading}
          className="w-full gap-2"
        >
          <Zap className="w-4 h-4" />
          Iniciar Dinero Rápido
        </Button>
      </div>
    )
  }

  const isPlayingOne = session.status === 'playing_one'
  const isPlayingTwo = session.status === 'playing_two'
  const isFinished = session.status === 'finished'

  return (
    <div className="rounded-lg border border-neon-blue/30 bg-neon-blue/5 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-neon-blue">
          <Zap className="w-4 h-4" />
          <span className="font-display text-sm tracking-widest uppercase">Dinero Rápido</span>
        </div>
        <span className="font-body text-xs text-white/50 uppercase">
          {isPlayingOne ? 'Jugador 1 respondiendo' : isPlayingTwo ? 'Jugador 2 respondiendo' : 'Terminado'}
        </span>
      </div>

      {/* Player 1 answers */}
      <div className={cn('flex flex-col gap-2', !isPlayingOne && 'opacity-60')}>
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-white/60 font-bold uppercase tracking-wider">Jugador 1</span>
          {isPlayingOne && (
            <Button size="sm" variant="neon" className="h-7 gap-1" onClick={handleSavePlayerOne} disabled={loading}>
              <Check className="w-3 h-3" />
              Guardar J1
            </Button>
          )}
        </div>
        {FAST_MONEY_QUESTIONS.map((q, i) => (
          <div key={i} className="flex gap-1.5 items-center">
            <span className="font-body text-xs text-white/30 w-4 shrink-0">{i + 1}</span>
            <Input
              placeholder={`R${i + 1}...`}
              value={playerOneAnswers[i].answer_text}
              onChange={(e) => updateAnswer(setPlayerOneAnswers, i, 'answer_text', e.target.value)}
              className="h-7 text-xs flex-1"
              disabled={!isPlayingOne}
            />
            <Input
              type="number"
              placeholder="pts"
              value={playerOneAnswers[i].points || ''}
              onChange={(e) => updateAnswer(setPlayerOneAnswers, i, 'points', e.target.value)}
              className="h-7 text-xs w-14"
              disabled={!isPlayingOne}
            />
          </div>
        ))}
      </div>

      {/* Player 2 answers */}
      {(isPlayingTwo || isFinished) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-white/60 font-bold uppercase tracking-wider">Jugador 2</span>
            {isPlayingTwo && (
              <Button size="sm" variant="neon" className="h-7 gap-1" onClick={handleSavePlayerTwo} disabled={loading}>
                <Check className="w-3 h-3" />
                Guardar J2
              </Button>
            )}
          </div>
          {FAST_MONEY_QUESTIONS.map((q, i) => {
            const p1Answer = playerOneAnswers[i]?.answer_text.toLowerCase().trim()
            return (
              <div key={i} className="flex gap-1.5 items-center">
                <span className="font-body text-xs text-white/30 w-4 shrink-0">{i + 1}</span>
                <Input
                  placeholder={`R${i + 1}...`}
                  value={playerTwoAnswers[i].answer_text}
                  onChange={(e) => updateAnswer(setPlayerTwoAnswers, i, 'answer_text', e.target.value)}
                  className="h-7 text-xs flex-1"
                  disabled={!isPlayingTwo}
                />
                <Input
                  type="number"
                  placeholder="pts"
                  value={playerTwoAnswers[i].points || ''}
                  onChange={(e) => updateAnswer(setPlayerTwoAnswers, i, 'points', e.target.value)}
                  className="h-7 text-xs w-14"
                  disabled={!isPlayingTwo}
                />
              </div>
            )
          })}
        </div>
      )}

      {isFinished && (
        <div className="text-center py-2">
          <span className="font-display text-gold text-xl">Total: {session.total_score} pts</span>
          {session.total_score >= 200 && (
            <p className="font-body text-neon-green text-sm mt-1">¡Meta alcanzada! 🎉</p>
          )}
        </div>
      )}
    </div>
  )
}
