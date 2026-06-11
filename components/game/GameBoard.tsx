'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { AnswerRow } from './AnswerRow'
import { StrikeDisplay } from './StrikeDisplay'
import { ScorePanel } from './ScorePanel'
import { RoundStatus } from './RoundStatus'
import type { Game, Round, Answer } from '@/lib/types'
import { Music, Mic2 } from 'lucide-react'

interface GameBoardProps {
  game: Game
  currentRound: Round | null
  roundNumber?: number
}

export function GameBoard({ game, currentRound, roundNumber = 1 }: GameBoardProps) {
  const answers: Answer[] = currentRound?.question?.answers ?? []
  const sortedAnswers = [...answers].sort((a, b) => a.position - b.position)

  const [showStrikeFlash, setShowStrikeFlash] = useState(false)
  const prevStrikes = useRef(game.strikes)

  useEffect(() => {
    if (game.strikes > prevStrikes.current) {
      setShowStrikeFlash(true)
      const timer = setTimeout(() => setShowStrikeFlash(false), 1000)
      prevStrikes.current = game.strikes
      return () => clearTimeout(timer)
    }
    prevStrikes.current = game.strikes
  }, [game.strikes])

  return (
    <div className="relative flex flex-col h-full w-full bg-bg-primary overflow-hidden select-none">
      {/* Winner overlay */}
      <AnimatePresence>
        {game.status === 'finished' && game.winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[90] flex flex-col items-center justify-center bg-bg-primary/97 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.6, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 18 }}
              className="text-center px-8"
            >
              {game.winner === 'tie' ? (
                <>
                  <p className="font-body text-white/40 text-sm uppercase tracking-[0.3em] mb-4">EMPATE</p>
                  <h2
                    className="font-display text-7xl text-gold leading-none"
                    style={{ textShadow: '0 0 60px rgba(245,197,24,0.9)' }}
                  >
                    EMPATE
                  </h2>
                </>
              ) : (
                <>
                  <p className="font-body text-white/40 text-sm uppercase tracking-[0.3em] mb-4">
                    ¡GANADORES!
                  </p>
                  <motion.h2
                    animate={{ textShadow: ['0 0 40px rgba(245,197,24,0.6)', '0 0 80px rgba(245,197,24,1)', '0 0 40px rgba(245,197,24,0.6)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="font-display text-6xl md:text-8xl text-gold leading-none break-words max-w-2xl"
                  >
                    {game.winner === 'team_one' ? game.team_one_name : game.team_two_name}
                  </motion.h2>
                </>
              )}
              <div className="mt-10 flex gap-12 justify-center">
                <div className="text-center">
                  <p className="font-body text-white/30 text-xs uppercase tracking-widest mb-1">{game.team_one_name}</p>
                  <p className="font-display text-4xl text-white/60">{game.team_one_score}</p>
                </div>
                <div className="text-center">
                  <p className="font-body text-white/30 text-xs uppercase tracking-widest mb-1">{game.team_two_name}</p>
                  <p className="font-display text-4xl text-white/60">{game.team_two_score}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strike flash overlay */}
      <AnimatePresence>
        {showStrikeFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-strike/25 backdrop-blur-sm"
          >
            <motion.span
              initial={{ scale: 0.3, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="font-display text-[30vw] text-strike leading-none select-none"
              style={{ textShadow: '0 0 120px rgba(255,23,68,1), 0 0 40px rgba(255,23,68,0.8)' }}
            >
              X
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)',
        }}
      />

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
          >
            <Music className="w-8 h-8 text-gold" />
          </motion.div>
          <div>
            <h1
              className="font-display text-4xl md:text-5xl text-gold leading-none tracking-wide"
              style={{ textShadow: '0 0 30px rgba(245,197,24,0.5)' }}
            >
              100 MÚSICOS
            </h1>
            <p className="font-display text-2xl md:text-3xl text-white/70 leading-none tracking-widest -mt-1">
              DIJERON
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <RoundStatus round={currentRound} roundNumber={roundNumber} />
        </div>
      </header>

      {/* MAIN GAME */}
      <AnimatePresence mode="wait">
        <motion.div
            key="main-game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col gap-0 overflow-hidden"
          >
            {/* QUESTION */}
            <div className="relative px-8 py-5 border-b border-border/30">
              <AnimatePresence mode="wait">
                {currentRound?.question ? (
                  <motion.div
                    key={currentRound.question_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <Mic2 className="w-4 h-4 text-gold/60" />
                      <span className="font-body text-xs text-gold/60 uppercase tracking-widest">
                        {currentRound.question.category}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-white leading-tight">
                      {currentRound.question.text}
                    </h2>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-question"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4"
                  >
                    <p className="font-display text-3xl text-white/20 tracking-widest">
                      {game.status === 'lobby' ? 'ESPERANDO PARTIDA...' : 'SELECCIONA UNA PREGUNTA'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ANSWER BOARD */}
            <div className="flex-1 px-8 py-4 flex flex-col gap-2.5 justify-center">
              {currentRound ? (
                sortedAnswers.map((answer) => (
                  <AnswerRow
                    key={answer.id}
                    position={answer.position}
                    text={answer.text}
                    points={answer.points}
                    isRevealed={currentRound.revealed_answer_ids.includes(answer.id)}
                    multiplier={currentRound.multiplier}
                    isLarge
                  />
                ))
              ) : (
                // Empty board placeholder
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-md border border-border/30 bg-bg-card/30 flex items-center"
                  >
                    <div className="w-16 h-full bg-border/20 flex items-center justify-center font-display text-2xl text-border/30">
                      {i + 1}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
      </AnimatePresence>

      {/* FOOTER: Scores & Strikes */}
      <footer className="relative z-10 flex items-center gap-4 px-8 py-4 border-t border-border/50 bg-bg-surface/80 backdrop-blur">
        <div className="flex-1">
          <ScorePanel game={game} size="lg" />
        </div>
        <div className="flex flex-col items-center gap-1 px-6">
          <span className="font-body text-xs text-white/30 uppercase tracking-widest">Strikes</span>
          <StrikeDisplay strikes={game.strikes} size="sm" />
        </div>
      </footer>
    </div>
  )
}
