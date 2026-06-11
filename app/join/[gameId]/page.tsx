'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameSocket } from '@/hooks/use-game-socket'
import { Wifi, WifiOff, ArrowLeft } from 'lucide-react'

type PlayerRole = 'team_one' | 'team_two'

type BuzzerState = 'connecting' | 'idle' | 'active' | 'winner' | 'lost'

export default function JoinPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const gameId = params.gameId as string

  // Si viene con ?role= desde la home, usarlo directamente
  const roleParam = searchParams.get('role') as PlayerRole | null
  const [role] = useState<PlayerRole | null>(
    roleParam === 'team_one' || roleParam === 'team_two' ? roleParam : null,
  )

  const { gameState, isConnected, send } = useGameSocket(gameId)

  const teamOneName = gameState?.teamOneName ?? 'Equipo 1'
  const teamTwoName = gameState?.teamTwoName ?? 'Equipo 2'
  const buzzerEnabled = gameState?.buzzerEnabled ?? false
  const buzzerWinner = gameState?.buzzerWinner ?? null

  const handleBuzz = () => {
    if (!role || !buzzerEnabled || buzzerWinner) return
    send({ type: 'BUZZ_IN', payload: { team: role } })
  }

  const buzzerState: BuzzerState = !isConnected
    ? 'connecting'
    : buzzerWinner === role
    ? 'winner'
    : buzzerWinner && buzzerWinner !== role
    ? 'lost'
    : buzzerEnabled
    ? 'active'
    : 'idle'

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <p className="font-body text-white/30">Acceso inválido. Vuelve al inicio y selecciona un equipo.</p>
      </div>
    )
  }

  const teamName = role === 'team_one' ? teamOneName : teamTwoName
  const otherTeamName = role === 'team_one' ? teamTwoName : teamOneName
  const isTeamOne = role === 'team_one'
  const teamColor = isTeamOne ? '#0099ff' : '#ff6600'
  const teamShadow = isTeamOne ? 'rgba(0,153,255,0.5)' : 'rgba(255,102,0,0.5)'

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary select-none overflow-hidden">
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="fixed top-4 left-4 z-10 flex items-center gap-1.5 font-body text-sm text-white/30 hover:text-white/60 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Salir
      </button>

      {/* Connection indicator */}
      <div className="fixed top-4 right-4 z-10 flex items-center gap-1.5">
        {isConnected
          ? <Wifi className="w-4 h-4 text-neon-green" />
          : <WifiOff className="w-4 h-4 text-white/30 animate-pulse" />}
      </div>

      {/* Team header */}
      <div className="text-center pt-12 pb-4 px-6">
        <p className="font-body text-xs text-white/30 uppercase tracking-[0.3em] mb-2">Jugando como</p>
        <h2
          className="font-display text-6xl leading-none"
          style={{ color: teamColor, textShadow: `0 0 30px ${teamShadow}` }}
        >
          {teamName}
        </h2>
      </div>

      {/* Buzzer — fill rest of screen */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        <BuzzerButton state={buzzerState} onPress={handleBuzz} />
        <BuzzerLabel
          state={buzzerState}
          teamName={teamName}
          otherTeamName={otherTeamName}
          teamColor={teamColor}
          winnerName={buzzerWinner ? (buzzerWinner === 'team_one' ? teamOneName : teamTwoName) : null}
        />
      </div>

      {/* Winner full-screen overlay */}
      <AnimatePresence>
        {buzzerWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-20 flex flex-col items-center justify-center"
            style={{
              background: buzzerWinner === role
                ? 'radial-gradient(ellipse at center, rgba(0,255,136,0.15) 0%, rgba(7,7,26,0.97) 70%)'
                : 'radial-gradient(ellipse at center, rgba(255,23,68,0.1) 0%, rgba(7,7,26,0.97) 70%)',
            }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="text-center px-8"
            >
              {buzzerWinner === role ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="font-display text-neon-green text-8xl leading-none"
                    style={{ textShadow: '0 0 60px rgba(0,255,136,1)' }}
                  >
                    ¡TÚ!
                  </motion.div>
                  <p className="font-display text-4xl text-neon-green/80 mt-2 tracking-widest">BUZZEASTE PRIMERO</p>
                  <p className="font-body text-white/40 text-sm mt-4">{teamName} tiene el control</p>
                </>
              ) : (
                <>
                  <div className="font-display text-white/20 text-6xl leading-none">TARDE</div>
                  <p className="font-body text-white/30 text-lg mt-3">
                    {buzzerWinner === 'team_one' ? teamOneName : teamTwoName} fue primero
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Botón buzzer ──────────────────────────────────────────────

function BuzzerButton({ state, onPress }: { state: BuzzerState; onPress: () => void }) {
  const canPress = state === 'active'
  const size = 260

  return (
    <motion.button
      onClick={canPress ? onPress : undefined}
      disabled={!canPress}
      whileTap={canPress ? { scale: 0.88 } : {}}
      className="relative flex items-center justify-center rounded-full focus:outline-none"
      style={{ width: size, height: size }}
      aria-label="Buzzer"
    >
      {/* Pulse ring when active */}
      <AnimatePresence>
        {state === 'active' && (
          <>
            <motion.div
              key="ring1"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-4 border-strike"
            />
            <motion.div
              key="ring2"
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
              className="absolute inset-0 rounded-full border-2 border-strike"
            />
          </>
        )}
        {state === 'winner' && (
          <motion.div
            key="win-ring"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-4 border-neon-green"
          />
        )}
      </AnimatePresence>

      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border-8 transition-colors duration-300"
        style={{
          borderColor: state === 'active' ? 'rgba(255,23,68,0.5)'
            : state === 'winner' ? 'rgba(0,255,136,0.5)'
            : 'rgba(255,255,255,0.08)',
        }}
      />

      {/* Button face */}
      <motion.div
        animate={state === 'active' ? { scale: [1, 1.015, 1] } : {}}
        transition={{ duration: 0.7, repeat: Infinity }}
        className="rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          width: size - 32,
          height: size - 32,
          background: state === 'active'
            ? 'radial-gradient(circle at 35% 30%, #ff4060, #b00020)'
            : state === 'winner'
            ? 'radial-gradient(circle at 35% 30%, #00ff88, #00aa55)'
            : state === 'lost'
            ? 'radial-gradient(circle at 35% 30%, #2a2a3a, #16161f)'
            : 'radial-gradient(circle at 35% 30%, #222230, #12121a)',
          boxShadow: state === 'active'
            ? '0 0 60px rgba(255,23,68,0.8), inset 0 -10px 25px rgba(0,0,0,0.4), inset 0 5px 12px rgba(255,255,255,0.12)'
            : state === 'winner'
            ? '0 0 60px rgba(0,255,136,0.7), inset 0 -10px 25px rgba(0,0,0,0.4)'
            : 'inset 0 -8px 20px rgba(0,0,0,0.6)',
        }}
      />
    </motion.button>
  )
}

// ── Estado del buzzer en texto ────────────────────────────────

function BuzzerLabel({
  state,
  teamName,
  otherTeamName,
  teamColor,
  winnerName,
}: {
  state: BuzzerState
  teamName: string
  otherTeamName: string
  teamColor: string
  winnerName: string | null
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
        className="text-center min-h-[3rem]"
      >
        {state === 'connecting' && (
          <p className="font-body text-white/25 text-base">Conectando...</p>
        )}
        {state === 'idle' && (
          <p className="font-body text-white/25 text-base">Esperando al conductor...</p>
        )}
        {state === 'active' && (
          <motion.p
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="font-display text-strike text-3xl tracking-widest"
            style={{ textShadow: '0 0 20px rgba(255,23,68,0.8)' }}
          >
            ¡PRESIONA AHORA!
          </motion.p>
        )}
        {(state === 'winner' || state === 'lost') && null}
      </motion.div>
    </AnimatePresence>
  )
}
