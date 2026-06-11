'use client'

import { GameBoard } from '@/components/game/GameBoard'
import { useGameSocket } from '@/hooks/use-game-socket'
import { stateToGame, stateToRound } from '@/lib/game-events'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'

interface ScreenClientProps {
  gameId: string
}

export function ScreenClient({ gameId }: ScreenClientProps) {
  const { gameState, isConnected, status } = useGameSocket(gameId)

  const game = gameState ? stateToGame(gameState) : null
  const currentRound = gameState ? stateToRound(gameState) : null

  if (!gameState) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-bg-primary gap-6">
        <div className="flex flex-col items-center gap-4">
          <p
            className="font-display text-7xl text-gold"
            style={{ textShadow: '0 0 30px rgba(245,197,24,0.5)' }}
          >
            100 MÚSICOS
          </p>
          <p className="font-display text-4xl text-white/40 tracking-widest">DIJERON</p>
        </div>
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-gold animate-spin" />
          <span className="font-body text-white/40 text-sm">
            {status === 'connecting' ? 'Conectando...' : 'Reconectando...'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg-primary">
      <GameBoard
        game={game!}
        currentRound={currentRound}
        roundNumber={gameState.roundNumber}
      />

      {/* Indicador de conexión (esquina, discreto) */}
      <div className="absolute top-2 right-2 z-50" title={isConnected ? 'Conectado' : 'Reconectando'}>
        {isConnected ? (
          <Wifi className="w-3 h-3 text-neon-green opacity-40" />
        ) : (
          <WifiOff className="w-3 h-3 text-strike opacity-60 animate-pulse" />
        )}
      </div>
    </div>
  )
}
