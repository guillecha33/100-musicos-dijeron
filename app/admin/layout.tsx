import type { Metadata } from 'next'
import Link from 'next/link'
import { Music, Settings } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin — 100 Músicos Dijeron',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border bg-bg-surface/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Music className="w-5 h-5 text-gold" />
            <span className="font-display text-xl text-gold tracking-wide">100 MÚSICOS DIJERON</span>
          </Link>
          <div className="flex items-center gap-2 text-white/50">
            <Settings className="w-4 h-4" />
            <span className="font-body text-sm uppercase tracking-wider">Administrador</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
