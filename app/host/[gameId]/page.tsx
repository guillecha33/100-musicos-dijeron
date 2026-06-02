import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { HostPanel } from '@/components/host/HostPanel'
import type { Question } from '@/lib/game-events'

interface PageProps {
  params: Promise<{ gameId: string }>
}

export default async function HostPage({ params }: PageProps) {
  const { gameId } = await params
  const supabase = await createClient()

  // Verifica que el juego existe
  const { error } = await supabase
    .from('games')
    .select('id')
    .eq('id', gameId)
    .single()

  if (error) notFound()

  // Carga preguntas activas para el selector del conductor
  const { data: questions } = await supabase
    .from('questions')
    .select('*, answers(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Normaliza las preguntas al tipo que usa el WebSocket
  const normalizedQuestions: Question[] = (questions ?? []).map((q) => ({
    id: q.id,
    text: q.text,
    category: q.category,
    answers: (q.answers ?? [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((a: { id: string; text: string; points: number; position: number }) => ({
        id: a.id,
        text: a.text,
        points: a.points,
        position: a.position,
      })),
  }))

  return <HostPanel gameId={gameId} questions={normalizedQuestions} />
}
