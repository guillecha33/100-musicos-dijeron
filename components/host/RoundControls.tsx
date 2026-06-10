'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { AnswerRow } from '@/components/game/AnswerRow'
import { Eye, SkipForward, Swords, Trophy, AlertTriangle, Zap, Radio } from 'lucide-react'
import type { Game, Round, Question, RoundMultiplier, ActiveTeam } from '@/lib/types'
import { getMultiplierLabel, getRoundStatusLabel } from '@/lib/game-utils'
import { cn } from '@/lib/utils'

interface RoundControlsProps {
  game: Game
  currentRound: Round | null
  questions: Question[]
  onAction: (action: { type: string; [key: string]: unknown }) => Promise<{ success: boolean }>
  loading: boolean
  buzzerEnabled: boolean
  buzzerWinner: ActiveTeam
  onEnableBuzzer: () => void
  onResetBuzzer: () => void
}

export function RoundControls({ game, currentRound, questions, onAction, loading, buzzerEnabled, buzzerWinner, onEnableBuzzer, onResetBuzzer }: RoundControlsProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string>('')
  const [showPreview, setShowPreview] = useState(true)

  // Auto-select multiplier based on upcoming round number
  const nextRound = (game.round_number ?? 0) + 1
  const autoMultiplier: RoundMultiplier = nextRound === 3 ? 2 : nextRound === 4 ? 3 : 1
  const [multiplier, setMultiplier] = useState<RoundMultiplier>(autoMultiplier)

  useEffect(() => {
    setMultiplier(autoMultiplier)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.round_number])

  const isTiebreaker = nextRound === 5 && game.team_one_score === game.team_two_score

  const previewQuestion = questions.find((q) => q.id === selectedQuestion)
  const previewAnswers = previewQuestion ? [...(previewQuestion.answers ?? [])].sort((a, b) => a.position - b.position) : []

  const answers = currentRound?.question?.answers ?? []
  const sortedAnswers = [...answers].sort((a, b) => a.position - b.position)
  const revealedIds = currentRound?.revealed_answer_ids ?? []
  const allRevealed = answers.length > 0 && answers.every((a) => revealedIds.includes(a.id))

  const handleStartRound = async () => {
    if (!selectedQuestion) return
    await onAction({ type: 'start_round', questionId: selectedQuestion, multiplier })
    setSelectedQuestion('')
  }

  const MULTIPLIERS: RoundMultiplier[] = [1, 2, 3]

  return (
    <div className="flex flex-col gap-4">
      {/* === NO ACTIVE ROUND - Show round selector === */}
      {!currentRound || currentRound.status === 'finished' ? (
        <div className="rounded-lg border border-border bg-bg-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm text-gold tracking-widest uppercase">Nueva Ronda</span>
            <span className="font-body text-xs text-white/30">Ronda {nextRound}</span>
          </div>

          {/* Tiebreaker notice */}
          {isTiebreaker && (
            <div className="flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-3 py-2">
              <Zap className="w-3.5 h-3.5 text-gold shrink-0" />
              <p className="font-body text-xs text-gold leading-tight">
                <span className="font-bold">CARA A CARA</span> — Empate detectado. El equipo que acierte la respuesta #1 gana el control.
              </p>
            </div>
          )}

          {/* Question selector */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs text-white/50 uppercase tracking-wider">Pregunta</label>
            <select
              value={selectedQuestion}
              onChange={(e) => setSelectedQuestion(e.target.value)}
              className="w-full rounded-md border border-border bg-bg-surface px-3 py-2 text-sm font-body text-white focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="">— Seleccionar pregunta —</option>
              {questions.filter((q) => q.is_active).map((q) => (
                <option key={q.id} value={q.id}>
                  {q.text}
                </option>
              ))}
            </select>
          </div>

          {/* Answer preview */}
          {previewQuestion && (
            <div className="flex flex-col gap-1.5">
              <button
                className="flex items-center justify-between font-body text-xs text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors"
                onClick={() => setShowPreview((v) => !v)}
              >
                <span>Respuestas ({previewAnswers.length})</span>
                <span>{showPreview ? '▲' : '▼'}</span>
              </button>
              {showPreview && (
                <div className="flex flex-col gap-1 rounded-md border border-border/40 bg-bg-elevated p-2">
                  {previewAnswers.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-2 py-1 rounded bg-bg-surface/60">
                      <span className="font-body text-xs text-white/80">{a.position}. {a.text}</span>
                      <span className="font-display text-sm text-gold ml-2 shrink-0">{a.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Multiplier */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs text-white/50 uppercase tracking-wider">Multiplicador</label>
            <div className="flex gap-2">
              {MULTIPLIERS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMultiplier(m)}
                  className={cn(
                    'flex-1 py-2 rounded-md border font-display text-lg transition-all',
                    multiplier === m
                      ? m === 1
                        ? 'border-gold bg-gold/20 text-gold'
                        : m === 2
                        ? 'border-neon-blue bg-neon-blue/20 text-neon-blue'
                        : 'border-neon-pink bg-neon-pink/20 text-neon-pink'
                      : 'border-border bg-bg-surface text-white/40 hover:border-white/30'
                  )}
                >
                  ×{m}
                  <span className="block text-xs font-body font-normal opacity-70">{getMultiplierLabel(m)}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={handleStartRound}
            disabled={!selectedQuestion || loading}
          >
            <Swords className="w-4 h-4" />
            Iniciar Ronda
          </Button>
        </div>
      ) : (
        /* === ACTIVE ROUND - Show answer controls === */
        <div className="flex flex-col gap-3">
          {/* Round info */}
          <div className="flex items-center justify-between px-3 py-2 rounded-md bg-bg-card border border-border">
            <div>
              <span className="font-body text-xs text-white/40 uppercase">Estado</span>
              <p className="font-body text-sm font-bold" style={{
                color: currentRound.status === 'playing' ? '#00ff88'
                  : currentRound.status === 'steal' ? '#ff0080'
                  : currentRound.status === 'face_off' ? '#f5c518'
                  : '#8888cc'
              }}>
                {getRoundStatusLabel(currentRound.status)}
              </p>
            </div>
            <div className="text-right">
              <span className="font-body text-xs text-white/40 uppercase">En juego</span>
              <p className="font-display text-xl text-gold">
                {currentRound.round_points * currentRound.multiplier}
              </p>
            </div>
          </div>

          {/* Question text */}
          <div className="px-3 py-2 rounded-md bg-bg-elevated border border-border/50">
            <p className="font-body text-sm text-white/70 line-clamp-2">
              {currentRound.question?.text}
            </p>
          </div>

          {/* Answer list with reveal buttons */}
          <div className="flex flex-col gap-1.5">
            <span className="font-body text-xs text-white/40 uppercase tracking-wider">Respuestas (todas visibles al conductor)</span>
            {sortedAnswers.map((answer) => {
              const isRevealed = revealedIds.includes(answer.id)
              return (
                <div key={answer.id} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <AnswerRow
                      position={answer.position}
                      text={answer.text}
                      points={answer.points}
                      isRevealed={isRevealed}
                      multiplier={currentRound.multiplier}
                      hostView
                    />
                  </div>
                  {!isRevealed && (
                    <Button
                      size="sm"
                      variant="neon"
                      className="h-11 shrink-0 gap-1"
                      onClick={() => onAction({ type: 'reveal_answer', answerId: answer.id })}
                      disabled={loading}
                    >
                      <Eye className="w-3 h-3" />
                      Revelar
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Buzzer section — visible during face_off */}
          {currentRound.status === 'face_off' && (
            <div className="rounded-md border border-strike/30 bg-strike/5 p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-strike" />
                <span className="font-body text-xs text-white/60 uppercase tracking-wider">Buzzer</span>
              </div>

              {buzzerWinner ? (
                <div className="flex items-center justify-between">
                  <p className="font-body text-sm text-neon-green font-bold">
                    ¡{buzzerWinner === 'team_one' ? game.team_one_name : game.team_two_name} presionó!
                  </p>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={onResetBuzzer}>
                    Resetear
                  </Button>
                </div>
              ) : buzzerEnabled ? (
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs text-strike animate-pulse">Esperando buzzer...</p>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-white/40" onClick={onResetBuzzer}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <button
                  onClick={onEnableBuzzer}
                  className="w-full rounded-md py-3 flex items-center justify-center gap-3 border-2 border-strike/50 bg-strike/10 hover:bg-strike/20 active:scale-[0.97] transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-strike flex items-center justify-center" style={{ boxShadow: '0 0 12px rgba(255,23,68,0.7)' }} />
                  <span className="font-display text-strike text-lg tracking-widest">ACTIVAR BUZZER</span>
                </button>
              )}
            </div>
          )}

          {/* Round action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {currentRound.status === 'face_off' && (
              <>
                <Button
                  variant="team1"
                  onClick={() => onAction({ type: 'give_control', team: 'team_one' })}
                  disabled={loading}
                  className="col-span-1"
                >
                  Control → E1
                </Button>
                <Button
                  variant="team2"
                  onClick={() => onAction({ type: 'give_control', team: 'team_two' })}
                  disabled={loading}
                  className="col-span-1"
                >
                  Control → E2
                </Button>
              </>
            )}

            {currentRound.status === 'playing' && game.strikes >= 3 && (
              <Button
                variant="neon"
                onClick={() => onAction({ type: 'activate_steal' })}
                disabled={loading}
                className="col-span-2 border-neon-pink text-neon-pink bg-neon-pink/10 hover:bg-neon-pink/20"
              >
                <AlertTriangle className="w-4 h-4" />
                Activar Robo
              </Button>
            )}

            {(currentRound.status === 'playing' || currentRound.status === 'steal') && (
              <>
                <Button
                  variant="team1"
                  onClick={() => onAction({ type: 'award_points', team: 'team_one' })}
                  disabled={loading}
                  className="gap-1"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Pts → E1
                </Button>
                <Button
                  variant="team2"
                  onClick={() => onAction({ type: 'award_points', team: 'team_two' })}
                  disabled={loading}
                  className="gap-1"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Pts → E2
                </Button>
              </>
            )}

            {currentRound.status !== 'finished' && (
              <Button
                variant="secondary"
                onClick={() => onAction({ type: 'next_round' })}
                disabled={loading}
                className="col-span-2 gap-1"
              >
                <SkipForward className="w-4 h-4" />
                Siguiente Ronda
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
