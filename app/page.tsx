'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Music, Mic2, Radio, Star, Zap, Users, Play, LogIn } from 'lucide-react'

const WORKER = process.env.NEXT_PUBLIC_WORKER_URL ?? ''

export default function HomePage() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode] = useState<'menu' | 'join'>('menu')
  const [joinRole, setJoinRole] = useState<'team_one' | 'team_two' | 'spectator' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchWithTimeout = (url: string, options?: RequestInit, ms = 5000) => {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), ms)
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id))
  }

  const handleCreateGame = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchWithTimeout(`${WORKER}/games`, { method: 'POST' })
      if (!res.ok) throw new Error('Error al crear partida')
      const { game } = await res.json()
      router.push(`/host/${game.id}`)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        setError('No se puede conectar al servidor. ¿Está corriendo pnpm dev:all?')
      } else {
        setError(e instanceof Error ? e.message : 'Error de red')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGame = async () => {
    const code = joinCode.toUpperCase().trim()
    if (!code || code.length !== 6) { setError('Ingresa un código de 6 caracteres'); return }
    if (!joinRole) { setError('Selecciona cómo quieres participar'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetchWithTimeout(`${WORKER}/games?code=${code}`)
      if (!res.ok) { setError('Código no encontrado'); return }
      const { game } = await res.json()
      if (joinRole === 'spectator') {
        router.push(`/screen/${game.id}`)
      } else {
        router.push(`/join/${game.id}?role=${joinRole}`)
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        setError('No se puede conectar al servidor. ¿Está corriendo pnpm dev:all?')
      } else {
        setError('Error de red')
      }
    } finally { setLoading(false) }
  }

  const floatingIcons = [Music, Mic2, Radio, Star, Zap]

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg-primary">
      {/* Fondo animado */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-gold/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-neon-blue/8 rounded-full blur-3xl" />
        {floatingIcons.map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-gold/10"
            style={{ left: `${10 + i * 20}%`, top: `${15 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
          >
            <Icon size={40 + i * 8} />
          </motion.div>
        ))}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.4) 3px,rgba(255,255,255,0.4) 4px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex flex-col items-center gap-10 px-6 max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center gap-3 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.div key={i} animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}>
                <Star className="w-4 h-4 text-gold fill-gold" />
              </motion.div>
            ))}
          </div>
          <motion.h1
            className="font-display text-7xl md:text-8xl text-gold leading-none tracking-wide"
            style={{ textShadow: '0 0 40px rgba(245,197,24,0.6)' }}
            animate={{ textShadow: ['0 0 40px rgba(245,197,24,0.6)','0 0 70px rgba(245,197,24,0.9)','0 0 40px rgba(245,197,24,0.6)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >100</motion.h1>
          <h2 className="font-display text-4xl md:text-5xl text-white leading-none tracking-widest mt-1">MÚSICOS</h2>
          <h3 className="font-display text-5xl md:text-6xl leading-none tracking-widest mt-1" style={{ color: '#00d4ff', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>DIJERON</h3>
          <p className="font-body text-white/40 text-sm mt-4 tracking-wider">El juego de encuestas musicales para tus eventos</p>
        </div>

        {/* Acciones */}
        <AnimatePresence mode="wait">
          {mode === 'menu' ? (
            <motion.div key="menu" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full flex flex-col gap-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreateGame} disabled={loading}
                className="w-full rounded-xl border-2 border-gold bg-gold/10 hover:bg-gold/20 transition-all p-5 flex items-center gap-4 group"
                style={{ boxShadow: '0 0 20px rgba(245,197,24,0.15)' }}
              >
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center group-hover:bg-gold/30 transition-colors">
                  <Play className="w-6 h-6 text-gold fill-gold" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-display text-gold text-xl tracking-wide">{loading ? 'CREANDO...' : 'CREAR PARTIDA'}</p>
                  <p className="font-body text-white/40 text-xs mt-0.5">Como conductor del juego</p>
                </div>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setMode('join')}
                className="w-full rounded-xl border-2 border-neon-blue/50 bg-neon-blue/5 hover:bg-neon-blue/10 transition-all p-5 flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center group-hover:bg-neon-blue/30 transition-colors">
                  <Users className="w-6 h-6 text-neon-blue" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-display text-neon-blue text-xl tracking-wide">UNIRSE A PARTIDA</p>
                  <p className="font-body text-white/40 text-xs mt-0.5">Con código de sala</p>
                </div>
              </motion.button>

              <a href="/admin" className="text-center font-body text-xs text-white/20 hover:text-white/40 transition-colors mt-2">Administrar preguntas →</a>
              {error && <p className="text-sm font-body text-strike text-center">{error}</p>}
            </motion.div>
          ) : (
            <motion.div key="join" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex flex-col gap-4">
              <div className="rounded-xl border-2 border-neon-blue/30 bg-bg-card p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-neon-blue" />
                  <span className="font-display text-neon-blue text-xl tracking-wide">UNIRSE A PARTIDA</span>
                </div>

                {/* Código */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs text-white/40 uppercase tracking-wider">Código de sala</label>
                  <Input
                    placeholder="XXXXXX"
                    value={joinCode}
                    onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError('') }}
                    maxLength={6}
                    className="text-center text-2xl font-display tracking-[0.3em] h-14 border-neon-blue/30 focus:ring-neon-blue"
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
                    autoFocus
                  />
                </div>

                {/* Selección de rol */}
                <div className="flex flex-col gap-2">
                  <label className="font-body text-xs text-white/40 uppercase tracking-wider">¿Cómo participas?</label>
                  <div className="flex flex-col gap-2">
                    {([
                      { value: 'team_one', label: 'EQUIPO 1', desc: 'Jugador del equipo 1', color: '#0099ff' },
                      { value: 'team_two', label: 'EQUIPO 2', desc: 'Jugador del equipo 2', color: '#ff6600' },
                      { value: 'spectator', label: 'ESPECTADOR', desc: 'Solo ver la pantalla', color: '#00d4ff' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setJoinRole(opt.value)}
                        className="flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all"
                        style={{
                          borderColor: joinRole === opt.value ? opt.color : 'rgba(42,42,96,0.8)',
                          background: joinRole === opt.value ? `${opt.color}18` : 'transparent',
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                          style={{
                            borderColor: opt.color,
                            background: joinRole === opt.value ? opt.color : 'transparent',
                          }}
                        >
                          {joinRole === opt.value && <div className="w-2 h-2 rounded-full bg-bg-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-display leading-none" style={{ color: opt.color }}>{opt.label}</p>
                          <p className="font-body text-xs text-white/30 mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm font-body text-strike text-center">{error}</p>}

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => { setMode('menu'); setError(''); setJoinCode(''); setJoinRole(null) }}>
                    Volver
                  </Button>
                  <Button
                    variant="neon"
                    className="flex-1 gap-2"
                    onClick={handleJoinGame}
                    disabled={loading || joinCode.length !== 6 || !joinRole}
                  >
                    <LogIn className="w-4 h-4" />{loading ? 'Buscando...' : 'Unirse'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Marquee inferior */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-8 border-t border-border/30 bg-bg-surface/80">
        <motion.div animate={{ x: [0, -1000] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="flex gap-8 whitespace-nowrap h-full items-center px-4" style={{ width: '200%' }}>
          {[...Array(8)].map((_, i) => (<span key={i} className="font-display text-white/20 tracking-widest text-xs">🎵 100 MÚSICOS DIJERON &nbsp;&nbsp; 🎤 EL JUEGO MUSICAL &nbsp;&nbsp; 🎸 ¿QUÉ DIJO LA ENCUESTA? &nbsp;&nbsp;</span>))}
        </motion.div>
      </div>
    </div>
  )
}
