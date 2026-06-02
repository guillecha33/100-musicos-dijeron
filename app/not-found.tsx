import Link from 'next/link'
import { Music } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary gap-6 text-center px-6">
      <Music className="w-16 h-16 text-gold/30" />
      <div>
        <h1 className="font-display text-8xl text-gold/40">404</h1>
        <p className="font-display text-2xl text-white/30 mt-2">PÁGINA NO ENCONTRADA</p>
        <p className="font-body text-sm text-white/20 mt-2">
          La sala que buscas no existe o el código es incorrecto.
        </p>
      </div>
      <Link
        href="/"
        className="font-body text-sm text-gold hover:underline transition-all"
      >
        ← Volver al inicio
      </Link>
    </div>
  )
}
