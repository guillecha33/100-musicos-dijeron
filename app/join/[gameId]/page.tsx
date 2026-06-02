import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Music, Monitor, Shield } from 'lucide-react'
import type { Game } from '@/lib/types'

interface PageProps {
  params: Promise<{ gameId: string }>
}

export default async function JoinPage({ params }: PageProps) {
  const { gameId } = await params
  const supabase = await createClient()

  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single()

  if (error || !game) notFound()

  const g = game as Game

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary p-6">
      <div className="max-w-sm w-full flex flex-col gap-6 text-center">
        {/* Logo */}
        <div>
          <h1 className="font-display text-5xl text-gold" style={{ textShadow: '0 0 30px rgba(245,197,24,0.5)' }}>
            100 MÚSICOS
          </h1>
          <p className="font-display text-3xl text-white/60 tracking-widest">DIJERON</p>
        </div>

        {/* Room code */}
        <div className="rounded-xl border-2 border-border bg-bg-card p-4">
          <p className="font-body text-xs text-white/40 uppercase tracking-widest mb-1">Código de sala</p>
          <p className="font-display text-5xl text-gold tracking-widest">{g.code}</p>
          <p className="font-body text-xs text-white/30 mt-1">
            {g.team_one_name} vs {g.team_two_name}
          </p>
        </div>

        {/* Join options */}
        <div className="flex flex-col gap-3">
          <p className="font-body text-sm text-white/40">¿Cómo deseas participar?</p>

          <Link
            href={`/screen/${gameId}`}
            className="flex items-center gap-4 rounded-xl border-2 border-neon-blue/40 bg-neon-blue/5 hover:bg-neon-blue/10 transition-all p-4 text-left"
          >
            <Monitor className="w-8 h-8 text-neon-blue shrink-0" />
            <div>
              <p className="font-display text-neon-blue text-lg">VER PANTALLA</p>
              <p className="font-body text-xs text-white/40">Pantalla principal del juego</p>
            </div>
          </Link>

          <Link
            href={`/host/${gameId}`}
            className="flex items-center gap-4 rounded-xl border-2 border-gold/40 bg-gold/5 hover:bg-gold/10 transition-all p-4 text-left"
          >
            <Shield className="w-8 h-8 text-gold shrink-0" />
            <div>
              <p className="font-display text-gold text-lg">PANEL CONDUCTOR</p>
              <p className="font-body text-xs text-white/40">Control total de la partida</p>
            </div>
          </Link>
        </div>

        <Link href="/" className="font-body text-xs text-white/20 hover:text-white/40 transition-colors">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}
