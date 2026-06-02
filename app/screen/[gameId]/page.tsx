import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ScreenClient } from './ScreenClient'

interface PageProps {
  params: Promise<{ gameId: string }>
}

export default async function ScreenPage({ params }: PageProps) {
  const { gameId } = await params
  const supabase = await createClient()

  // Solo verificamos que el juego existe en la DB (para el 404)
  // El estado real viene del Durable Object vía WebSocket
  const { error } = await supabase
    .from('games')
    .select('id')
    .eq('id', gameId)
    .single()

  if (error) notFound()

  return <ScreenClient gameId={gameId} />
}
