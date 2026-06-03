'use client'

import { useState, useCallback } from 'react'
import { TeamControls } from './TeamControls'
import { RoundControls } from './RoundControls'
import { FastMoneyControls } from './FastMoneyControls'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { GameBoard } from '@/components/game/GameBoard'
import { useGameSocket } from '@/hooks/use-game-socket'
import { useSound } from '@/hooks/use-sound'
import {
  stateToGame,
  stateToRound,
  stateToFastMoney,
  type ClientEvent,
  type Question,
  type RoundMultiplier,
} from '@/lib/game-events'
import type { GameAction } from '@/lib/types'
import { Music, Volume2, VolumeX, RotateCcw, ExternalLink, Wifi, WifiOff, Square } from 'lucide-react'

interface HostPanelProps {
  gameId: string
  questions: Question[]
}

export function HostPanel({ gameId, questions }: HostPanelProps) {
  const { gameState, isConnected, send } = useGameSocket(gameId)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)

  const soundEnabled = gameState?.soundEnabled ?? true
  const sound = useSound(soundEnabled)

  // Convierte el formato legado GameAction → ClientEvent y lo envía por WS
  const handleAction = useCallback(
    async (action: { type: string; [key: string]: unknown }): Promise<{ success: boolean }> => {
      let event: ClientEvent | null = null

      switch (action.type) {
        case 'start_round': {
          const q = questions.find((q) => q.id === action.questionId)
          if (!q) return { success: false }
          event = {
            type: 'START_ROUND',
            payload: { question: q, multiplier: (action.multiplier as RoundMultiplier) ?? 1 },
          }
          sound.playRoundStart()
          break
        }
        case 'reveal_answer':
          event = { type: 'REVEAL_ANSWER', payload: { answerId: action.answerId as string } }
          sound.playReveal()
          break
        case 'add_strike':
          event = { type: 'ADD_STRIKE' }
          sound.playStrike()
          break
        case 'remove_strike':
          event = { type: 'REMOVE_STRIKE' }
          break
        case 'give_control':
          event = { type: 'SET_ACTIVE_TEAM', payload: { team: action.team as 'team_one' | 'team_two' } }
          break
        case 'activate_steal':
          event = { type: 'START_STEAL' }
          sound.playSteal()
          break
        case 'award_points':
          event = { type: 'AWARD_ROUND_POINTS', payload: { team: action.team as 'team_one' | 'team_two' } }
          sound.playAwardPoints()
          break
        case 'next_round':
          event = { type: 'NEXT_ROUND' }
          break
        case 'rename_team':
          event = { type: 'RENAME_TEAM', payload: { team: action.team as 'team_one' | 'team_two', name: action.name as string } }
          break
        case 'toggle_sound':
          event = { type: 'TOGGLE_SOUND' }
          break
        case 'start_fast_money':
          event = { type: 'START_FAST_MONEY' }
          break
        case 'reset_game':
          event = { type: 'RESET_GAME' }
          break
        case 'set_multiplier':
          event = { type: 'SET_MULTIPLIER', payload: { multiplier: action.multiplier as RoundMultiplier } }
          break
      }

      if (event) send(event)
      return { success: true }
    },
    [send, questions, sound],
  )

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setConfirmEnd(false)
      setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    send({ type: 'RESET_GAME' })
    setConfirmReset(false)
    return { success: true }
  }

  const handleEndGame = () => {
    if (!confirmEnd) {
      setConfirmEnd(true)
      setConfirmReset(false)
      setTimeout(() => setConfirmEnd(false), 3000)
      return
    }
    send({ type: 'END_GAME' })
    setConfirmEnd(false)
  }

  // Adaptadores para los componentes de UI
  const game = gameState ? stateToGame(gameState) : null
  const currentRound = gameState ? stateToRound(gameState) : null
  const fastMoney = gameState ? stateToFastMoney(gameState) : null

  if (!gameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary flex-col gap-4">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-white/40 text-sm">Conectando al servidor...</p>
        {!isConnected && (
          <p className="font-body text-xs text-white/20">
            Verifica que <code className="text-gold">NEXT_PUBLIC_WORKER_URL</code> esté configurado
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* SIDEBAR IZQUIERDO */}
      <div className="w-80 shrink-0 flex flex-col border-r border-border bg-bg-surface overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 sticky top-0 bg-bg-surface z-10">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-gold" />
            <span className="font-display text-lg text-gold tracking-wide">CONDUCTOR</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-neon-green" title="Conectado" />
            ) : (
              <WifiOff className="w-4 h-4 text-strike animate-pulse" title="Reconectando..." />
            )}
            <span className={`text-xs font-body ${isConnected ? 'text-neon-green' : 'text-strike'}`}>
              {isConnected ? 'En vivo' : 'Reconectando'}
            </span>
          </div>
        </div>

        {/* Código de sala */}
        <div className="px-4 py-3 border-b border-border/30 bg-bg-card/50">
          <p className="font-body text-xs text-white/40 uppercase tracking-wider">Código de sala</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="font-display text-3xl text-gold tracking-widest"
              style={{ textShadow: '0 0 15px rgba(245,197,24,0.4)' }}
            >
              {gameState.roomCode}
            </span>
            <a
              href={`/screen/${gameId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white/60 transition-colors"
              title="Abrir pantalla en nueva pestaña"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="font-body text-xs text-white/20 mt-0.5">
            {gameState.connectedClients} {gameState.connectedClients === 1 ? 'cliente' : 'clientes'} conectados
          </p>
        </div>

        {/* Equipos */}
        <div className="p-4 border-b border-border/30">
          <TeamControls game={game!} onAction={handleAction} loading={false} />
        </div>

        {/* Ronda */}
        <div className="p-4 flex-1">
          <RoundControls
            game={game!}
            currentRound={currentRound}
            questions={questions}
            onAction={handleAction}
            loading={false}
          />
        </div>

        {/* Dinero rápido */}
        {(gameState.gameStatus === 'fast_money' || gameState.gameStatus === 'finished') && (
          <div className="p-4 border-t border-border/30">
            <FastMoneyControls
              session={fastMoney}
              gameId={gameId}
              onAction={handleAction}
              loading={false}
            />
          </div>
        )}

        {/* Controles inferiores */}
        <div className="p-4 border-t border-border/30 flex flex-col gap-3 sticky bottom-0 bg-bg-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-gold" />
              ) : (
                <VolumeX className="w-4 h-4 text-white/30" />
              )}
              <span className="font-body text-sm text-white/60">Sonidos</span>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={() => send({ type: 'TOGGLE_SOUND' })}
            />
          </div>

          {gameState.gameStatus === 'playing' && (
            <Button
              variant="neon"
              size="sm"
              className="w-full border-neon-blue/50"
              onClick={() => send({ type: 'START_FAST_MONEY' })}
            >
              ⚡ Iniciar Dinero Rápido
            </Button>
          )}

          {gameState.gameStatus !== 'lobby' && gameState.gameStatus !== 'finished' && (
            <Button
              variant={confirmEnd ? 'destructive' : 'ghost'}
              size="sm"
              className={`w-full gap-2 text-xs ${confirmEnd ? '' : 'text-strike/70 hover:text-strike border-strike/20 hover:border-strike/40'}`}
              onClick={handleEndGame}
            >
              <Square className="w-3 h-3" />
              {confirmEnd ? '¿Finalizar partida?' : 'Finalizar partida'}
            </Button>
          )}

          <Button
            variant={confirmReset ? 'destructive' : 'ghost'}
            size="sm"
            className="w-full gap-2 text-xs"
            onClick={handleReset}
          >
            <RotateCcw className="w-3 h-3" />
            {confirmReset ? '¿Confirmar reinicio?' : 'Reiniciar juego'}
          </Button>
        </div>
      </div>

      {/* VISTA PREVIA DE LA PANTALLA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-bg-surface/50">
          <span className="font-body text-xs text-white/40 uppercase tracking-wider">
            Vista previa pantalla
          </span>
          <a
            href={`/screen/${gameId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-body text-neon-blue hover:underline flex items-center gap-1"
          >
            Abrir en TV <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="flex-1 overflow-hidden origin-top scale-90">
          <GameBoard
            game={game!}
            currentRound={currentRound}
            fastMoney={fastMoney}
            roundNumber={gameState.roundNumber}
          />
        </div>
      </div>
    </div>
  )
}
