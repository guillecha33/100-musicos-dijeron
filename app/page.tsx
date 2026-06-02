'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Music, Mic2, Radio, Star, Zap, Users, Play, LogIn } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode] = useState<'menu' | 'join'>('menu')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateGame = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/games', { method: 'POST' })
      if (!res.ok) throw new Error('Error al crear partida')
      const { game } = await res.json()
      router.push(`/host/${game.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de red')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGame = async () => {
    const code = joinCode.toUpperCase().trim()
    if (!code || code.length !== 6) {
      setError('Ingresa un código de 6 caracteres')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/games?code=${code}`)
      if (!res.ok) {
        setError('Código de sala no encontrado')
        return
      }
      const { game } = await res.json()
      router.push(`/screen/${game.id}`)
    } catch {
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }

  const floatingIcons = [Music, Mic2, Radio, Star, Zap]

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg-primary">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient spheres */}
        <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-gold/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-neon-blue/8 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/2 w-60 h-60 bg-neon-pink/5 rounded-full blur-3xl" />

        {/* Floating music icons */}
        {floatingIcons.map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-gold/10"
            style={{
              left: `${10 + i * 20}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, i % 2 === 0 ? 10 : -10, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.8,
            }}
          >
            <Icon size={40 + i * 8} />
          </motion.div>
        ))}

        {/* Scanlines */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 4px)',
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-10 px-6 max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center">
          {/* Stars decoration */}
          <div className="flex justify-center gap-3 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              >
                <Star className="w-4 h-4 text-gold fill-gold" />
              </motion.div>
            ))}
          </div>

          <motion.h1
            className="font-display text-7xl md:text-8xl text-gold leading-none tracking-wide"
            style={{ textShadow: '0 0 40px rgba(245,197,24,0.6), 0 0 80px rgba(245,197,24,0.2)' }}
            animate={{ textShadow: [
              '0 0 40px rgba(245,197,24,0.6), 0 0 80px rgba(245,197,24,0.2)',
              '0 0 60px rgba(245,197,24,0.8), 0 0 100px rgba(245,197,24,0.3)',
              '0 0 40px rgba(245,197,24,0.6), 0 0 80px rgba(245,197,24,0.2)',
            ]}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            100
          </motion.h1>
          <h2 className="font-display text-4xl md:text-5xl text-white leading-none tracking-widest mt-1">
            MÚSICOS
          </h2>
          <h3
            className="font-display text-5xl md:text-6xl leading-none tracking-widest mt-1"
            style={{ color: '#00d4ff', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}
          >
            DIJERON
          </h3>

          <p className="font-body text-white/40 text-sm mt-4 tracking-wider">
            El juego de encuestas musicales para tus eventos
          </p>
        </div>

        {/* Action cards */}
        <AnimatePresence mode="wait">
          {mode === 'menu' ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col gap-4"
            >
              {/* Create game */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateGame}
                disabled={loading}
                className="w-full rounded-xl border-2 border-gold bg-gold/10 hover:bg-gold/20 transition-all duration-300 p-5 flex items-center gap-4 group"
                style={{ boxShadow: '0 0 20px rgba(245,197,24,0.15)' }}
              >
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center group-hover:bg-gold/30 transition-colors">
                  <Play className="w-6 h-6 text-gold fill-gold" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-display text-gold text-xl tracking-wide">CREAR PARTIDA</p>
                  <p className="font-body text-white/40 text-xs mt-0.5">Como conductor del juego</p>
                </div>
              </motion.button>

              {/* Join game */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('join')}
                className="w-full rounded-xl border-2 border-neon-blue/50 bg-neon-blue/5 hover:bg-neon-blue/10 transition-all duration-300 p-5 flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center group-hover:bg-neon-blue/30 transition-colors">
                  <Users className="w-6 h-6 text-neon-blue" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-display text-neon-blue text-xl tracking-wide">UNIRSE A PARTIDA</p>
                  <p className="font-body text-white/40 text-xs mt-0.5">Con código de sala</p>
                </div>
              </motion.button>

              {/* Admin link */}
              <a
                href="/admin"
                className="text-center font-body text-xs text-white/20 hover:text-white/40 transition-colors mt-2"
              >
                Administrar preguntas →
              </a>
            </motion.div>
          ) : (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col gap-4"
            >
              <div className="rounded-xl border-2 border-neon-blue/30 bg-bg-card p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-neon-blue" />
                  <span className="font-display text-neon-blue text-xl tracking-wide">CÓDIGO DE SALA</span>
                </div>

                <Input
                  placeholder="XXXXXX"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase())
                    setError('')
                  }}
                  maxLength={6}
                  className="text-center text-2xl font-display tracking-[0.3em] h-14 border-neon-blue/30 focus:ring-neon-blue"
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
                  autoFocus
                />

                {error && (
                  <p className="text-sm font-body text-strike text-center">{error}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setMode('menu'); setError(''); setJoinCode('') }}
                  >
                    Volver
                  </Button>
                  <Button
                    variant="neon"
                    className="flex-1 gap-2"
                    onClick={handleJoinGame}
                    disabled={loading || joinCode.length !== 6}
                  >
                    <LogIn className="w-4 h-4" />
                    {loading ? 'Buscando...' : 'Unirse'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && mode === 'menu' && (
          <p className="text-sm font-body text-strike">{error}</p>
        )}
      </motion.div>

      {/* Bottom marquee */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-8 border-t border-border/30 bg-bg-surface/80">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex gap-8 whitespace-nowrap h-full items-center px-4"
          style={{ width: '200%' }}
        >
          {[...Array(8)].map((_, i) => (
            <span key={i} className="font-display text-white/20 tracking-widest text-xs">
              🎵 100 MÚSICOS DIJERON &nbsp;&nbsp; 🎤 EL JUEGO MUSICAL &nbsp;&nbsp; 🎸 ¿QUÉ DIJO LA ENCUESTA? &nbsp;&nbsp;
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
