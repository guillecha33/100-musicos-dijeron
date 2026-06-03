'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { FastMoneySession, FastMoneyAnswer } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FastMoneyBoardProps {
  session: FastMoneySession
  questions: string[]
  isScreen?: boolean
}

function Countdown({ limitSeconds, active }: { limitSeconds: number; active: boolean }) {
  const [timeLeft, setTimeLeft] = useState(limitSeconds)

  useEffect(() => {
    setTimeLeft(limitSeconds)
  }, [limitSeconds])

  useEffect(() => {
    if (!active || timeLeft <= 0) return
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, active])

  const isUrgent = timeLeft <= 5
  const isWarning = timeLeft <= 10 && !isUrgent

  return (
    <motion.div
      key={limitSeconds}
      className={cn(
        'font-display text-7xl leading-none tabular-nums',
        isUrgent ? 'text-strike' : isWarning ? 'text-gold' : 'text-neon-green',
      )}
      animate={isUrgent ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 0.4, repeat: isUrgent ? Infinity : 0 }}
      style={{
        textShadow: isUrgent
          ? '0 0 30px rgba(255,23,68,1)'
          : isWarning
          ? '0 0 20px rgba(245,197,24,0.8)'
          : '0 0 20px rgba(0,255,136,0.6)',
      }}
    >
      {timeLeft}
    </motion.div>
  )
}

export function FastMoneyBoard({ session, questions, isScreen = false }: FastMoneyBoardProps) {
  const playerOneAnswers = session.player_one_answers ?? []
  const playerTwoAnswers = session.player_two_answers ?? []
  const totalScore = session.total_score
  const target = 200

  const isPlayingOne = session.status === 'playing_one'
  const isPlayingTwo = session.status === 'playing_two'
  const isActive = isPlayingOne || isPlayingTwo

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
      <div className="text-center mb-2">
        <h2 className="font-display text-gold text-4xl tracking-widest" style={{ textShadow: '0 0 20px rgba(245,197,24,0.6)' }}>
          DINERO RÁPIDO MUSICAL
        </h2>

        {/* Countdown timer */}
        {isScreen && isActive && (
          <div className="flex flex-col items-center mt-3 mb-1">
            <span className="font-body text-xs text-white/30 uppercase tracking-widest mb-1">
              {isPlayingOne ? 'Jugador 1' : 'Jugador 2'}
            </span>
            <Countdown
              limitSeconds={isPlayingOne ? session.time_limit_one : session.time_limit_two}
              active={isActive}
            />
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="font-body text-white/50 text-sm uppercase tracking-widest">Meta: 200 pts</span>
          <motion.span
            key={totalScore}
            initial={{ scale: 1.3, color: '#f5c518' }}
            animate={{ scale: 1, color: totalScore >= 200 ? '#00ff88' : '#f5c518' }}
            className="font-display text-3xl"
            style={{ textShadow: '0 0 15px rgba(245,197,24,0.5)' }}
          >
            {totalScore} pts
          </motion.span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 w-full bg-bg-elevated rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((totalScore / target) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
            className={cn('h-full rounded-full', totalScore >= 200 ? 'bg-neon-green' : 'bg-gold')}
            style={{ boxShadow: totalScore >= 200 ? '0 0 10px rgba(0,255,136,0.6)' : '0 0 10px rgba(245,197,24,0.6)' }}
          />
        </div>
      </div>

      {/* Questions grid */}
      <div className="flex flex-col gap-2">
        {questions.map((q, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
            {/* Player 1 answer */}
            <AnswerCell
              answer={playerOneAnswers[i]}
              revealed={session.status !== 'playing_one'}
              label={`J1`}
              align="right"
              isScreen={isScreen}
            />

            {/* Question */}
            <div className={cn('px-4 py-2 rounded-md border border-border bg-bg-card text-center', isScreen ? 'text-sm' : 'text-xs')}>
              <span className="font-body text-white/60 text-xs">P{i + 1}</span>
              <p className="font-body text-white/80 text-xs leading-tight mt-0.5 line-clamp-2">{q}</p>
            </div>

            {/* Player 2 answer */}
            <AnswerCell
              answer={playerTwoAnswers[i]}
              revealed={session.status === 'finished'}
              label={`J2`}
              align="left"
              isScreen={isScreen}
            />
          </div>
        ))}
      </div>

      {/* Victory animation */}
      <AnimatePresence>
        {session.status === 'finished' && totalScore >= 200 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="font-display text-neon-green text-5xl"
              style={{ textShadow: '0 0 30px rgba(0,255,136,0.8)' }}
            >
              ¡GANARON!
            </motion.div>
            <p className="font-body text-white/60 mt-2">{totalScore} puntos — Meta superada</p>
          </motion.div>
        )}
        {session.status === 'finished' && totalScore < 200 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <div className="font-display text-white/40 text-3xl">Faltan {200 - totalScore} puntos</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AnswerCell({
  answer,
  revealed,
  label,
  align,
  isScreen,
}: {
  answer: FastMoneyAnswer | undefined
  revealed: boolean
  label: string
  align: 'left' | 'right'
  isScreen: boolean
}) {
  const hasAnswer = Boolean(answer?.answer_text)

  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 rounded-md border px-3 py-2',
        hasAnswer && revealed ? 'border-gold/40 bg-bg-surface' : 'border-border bg-bg-card',
        align === 'right' ? 'items-end text-right' : 'items-start text-left'
      )}
    >
      <span className={cn('font-body text-white/30 uppercase tracking-widest', isScreen ? 'text-xs' : 'text-[10px]')}>{label}</span>
      <AnimatePresence mode="wait">
        {revealed && hasAnswer ? (
          <motion.span
            key="revealed"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('font-body font-semibold text-white', isScreen ? 'text-base' : 'text-sm')}
          >
            {answer!.answer_text}
          </motion.span>
        ) : (
          <span className={cn('font-body text-white/20', isScreen ? 'text-base' : 'text-sm')}>
            {revealed ? '—' : '???'}
          </span>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {revealed && hasAnswer && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display text-gold text-xl"
          >
            {answer!.points}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
