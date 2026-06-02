import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '100 Músicos Dijeron',
  description: 'El juego de encuestas musicales estilo Family Feud para eventos en vivo',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎵</text></svg>",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-bg-primary text-white font-body antialiased">
        {children}
      </body>
    </html>
  )
}
