'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { getRoundStatusLabel, getMultiplierLabel } from '@/lib/game-utils'
import type { Round } from '@/lib/types'

interface RoundStatusProps {
  round: Round | null
  roundNumber?: number
}

const STATUS_COLORS: Record<string, string> = {
  face_off: '#f5c518',
  playing: '#00ff88',
  steal: '#ff0080',
  finished: '#8888cc',
}

export function RoundStatus({ round, roundNumber = 1 }: RoundStatusProps) {
  if (!round) return null

  const color = STATUS_COLORS[round.status] ?? '#ffffff'
  const label = getRoundStatusLabel(round.status)
  const multiplierLabel = getMultiplierLabel(round.multiplier)
  const isSpecial = round.multiplier > 1

  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={round.status}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border"
          style={{ borderColor: color, backgroundColor: `${color}15` }}
        >
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="font-display text-sm tracking-widest" style={{ color }}>
            {label}
          </span>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-bg-card">
        <span className="font-body text-xs text-white/50 uppercase tracking-wider">Ronda</span>
        <span className="font-display text-sm text-white">{roundNumber}</span>
      </div>

      {isSpecial && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-neon-pink bg-neon-pink/10"
        >
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="font-display text-neon-pink text-sm"
          >
            ✕{round.multiplier} {multiplierLabel}
          </motion.span>
        </motion.div>
      )}

      {round.round_points > 0 && (
        <motion.div
          key={round.round_points}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold bg-gold/10"
        >
          <span className="font-body text-xs text-white/50 uppercase tracking-wider">En juego</span>
          <span className="font-display text-gold text-sm">{round.round_points * round.multiplier}</span>
        </motion.div>
      )}
    </div>
  )
}
