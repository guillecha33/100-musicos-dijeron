'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StrikeDisplay } from '@/components/game/StrikeDisplay'
import { Users, Edit2, Check, Plus, Minus } from 'lucide-react'
import type { Game, ActiveTeam } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TeamControlsProps {
  game: Game
  onAction: (action: { type: string; [key: string]: unknown }) => Promise<{ success: boolean }>
  loading: boolean
}

export function TeamControls({ game, onAction, loading }: TeamControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-gold">
        <Users className="w-4 h-4" />
        <span className="font-display text-sm tracking-widest uppercase">Equipos</span>
      </div>

      <TeamCard
        team="team_one"
        name={game.team_one_name}
        score={game.team_one_score}
        isActive={game.active_team === 'team_one'}
        onAction={onAction}
        loading={loading}
      />
      <TeamCard
        team="team_two"
        name={game.team_two_name}
        score={game.team_two_score}
        isActive={game.active_team === 'team_two'}
        onAction={onAction}
        loading={loading}
      />

      {/* Strikes section */}
      <div className="rounded-lg border border-border bg-bg-card p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-white/50 uppercase tracking-wider">Strikes ({game.strikes}/3)</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onAction({ type: 'add_strike' })}
              disabled={loading || game.strikes >= 3}
              className="h-7 text-xs gap-1"
            >
              <Plus className="w-3 h-3" /> Strike
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction({ type: 'remove_strike' })}
              disabled={loading || game.strikes <= 0}
              className="h-7 text-xs"
            >
              <Minus className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <StrikeDisplay strikes={game.strikes} size="sm" />
      </div>
    </div>
  )
}

function TeamCard({
  team,
  name,
  score,
  isActive,
  onAction,
  loading,
}: {
  team: NonNullable<ActiveTeam>
  name: string
  score: number
  isActive: boolean
  onAction: (action: { type: string; [key: string]: unknown }) => Promise<{ success: boolean }>
  loading: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const isTeamOne = team === 'team_one'

  const handleRename = async () => {
    if (editName.trim() && editName !== name) {
      await onAction({ type: 'rename_team', team, name: editName.trim() })
    }
    setEditing(false)
  }

  return (
    <motion.div
      animate={isActive ? { borderColor: isTeamOne ? '#0099ff' : '#ff6600' } : { borderColor: '#2a2a60' }}
      className={cn(
        'rounded-lg border p-3 transition-all duration-300',
        isActive
          ? isTeamOne ? 'bg-team-one/5' : 'bg-team-two/5'
          : 'bg-bg-card'
      )}
    >
      {/* Name + score row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {editing ? (
          <div className="flex gap-1.5 flex-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-7 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRename}>
              <Check className="w-3 h-3 text-gold" />
            </Button>
          </div>
        ) : (
          <>
            <span className={cn('font-body font-bold text-sm truncate', isTeamOne ? 'text-team-one' : 'text-team-two')}>
              {name}
            </span>
            <button onClick={() => { setEditName(name); setEditing(true) }}>
              <Edit2 className="w-3 h-3 text-white/30 hover:text-white/60 transition-colors" />
            </button>
          </>
        )}
        <span className={cn('font-display text-2xl shrink-0', isTeamOne ? 'text-team-one' : 'text-team-two')}>
          {score}
        </span>
      </div>

      {/* Control buttons */}
      <div className="flex gap-1.5 flex-wrap">
        <Button
          size="sm"
          variant={isTeamOne ? 'team1' : 'team2'}
          className="h-7 text-xs flex-1"
          onClick={() => onAction({ type: 'give_control', team })}
          disabled={loading || isActive}
        >
          {isActive ? '★ Jugando' : 'Dar Control'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs flex-1 border-gold/40 text-gold hover:bg-gold/10"
          onClick={() => onAction({ type: 'award_points', team })}
          disabled={loading}
        >
          + Puntos
        </Button>
      </div>
    </motion.div>
  )
}
