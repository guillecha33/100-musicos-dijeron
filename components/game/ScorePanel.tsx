'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Game, ActiveTeam } from '@/lib/types'

interface ScorePanelProps {
  game: Game
  size?: 'sm' | 'lg'
}

export function ScorePanel({ game, size = 'lg' }: ScorePanelProps) {
  const isLg = size === 'lg'

  return (
    <div className="flex items-stretch gap-4">
      <TeamScore
        name={game.team_one_name}
        score={game.team_one_score}
        isActive={game.active_team === 'team_one'}
        team="team_one"
        size={size}
      />

      <div className={cn('flex items-center justify-center font-display text-white/30', isLg ? 'text-3xl' : 'text-xl')}>
        VS
      </div>

      <TeamScore
        name={game.team_two_name}
        score={game.team_two_score}
        isActive={game.active_team === 'team_two'}
        team="team_two"
        size={size}
      />
    </div>
  )
}

function TeamScore({
  name,
  score,
  isActive,
  team,
  size,
}: {
  name: string
  score: number
  isActive: boolean
  team: ActiveTeam
  size: 'sm' | 'lg'
}) {
  const isLg = size === 'lg'
  const isTeamOne = team === 'team_one'

  return (
    <motion.div
      animate={isActive ? { scale: 1.03 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex-1 flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-300',
        isActive
          ? isTeamOne
            ? 'border-team-one bg-team-one/10 shadow-[0_0_20px_rgba(0,153,255,0.3)]'
            : 'border-team-two bg-team-two/10 shadow-[0_0_20px_rgba(255,102,0,0.3)]'
          : 'border-border bg-bg-card',
        isLg ? 'py-4 px-6 gap-1' : 'py-2 px-4 gap-0.5'
      )}
    >
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'font-body text-xs font-bold uppercase tracking-widest mb-1',
            isTeamOne ? 'text-team-one' : 'text-team-two'
          )}
        >
          ★ Jugando
        </motion.div>
      )}
      <span
        className={cn(
          'font-body font-bold uppercase tracking-wider truncate max-w-full',
          isActive
            ? isTeamOne ? 'text-team-one' : 'text-team-two'
            : 'text-white/60',
          isLg ? 'text-sm md:text-base' : 'text-xs'
        )}
      >
        {name}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={score}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'backOut' }}
          className={cn(
            'font-display leading-none',
            isActive
              ? isTeamOne ? 'text-team-one' : 'text-team-two'
              : 'text-white/40',
            isLg ? 'text-5xl md:text-6xl' : 'text-3xl'
          )}
          style={isActive ? {
            textShadow: isTeamOne
              ? '0 0 20px rgba(0,153,255,0.6)'
              : '0 0 20px rgba(255,102,0,0.6)',
          } : {}}
        >
          {score}
        </motion.span>
      </AnimatePresence>
      <span className={cn('font-body text-white/30 uppercase tracking-widest', isLg ? 'text-xs' : 'text-[10px]')}>
        pts
      </span>
    </motion.div>
  )
}
