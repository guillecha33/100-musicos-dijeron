import { notFound } from 'next/navigation'
import { HostPanel } from '@/components/host/HostPanel'
import type { Question } from '@/lib/game-events'

const WORKER = process.env.NEXT_PUBLIC_WORKER_URL ?? ''

interface PageProps {
  params: Promise<{ gameId: string }>
}

export default async function HostPage({ params }: PageProps) {
  const { gameId } = await params

  // Verifica que el juego existe en KV
  const gameRes = await fetch(`${WORKER}/games/${gameId}`).catch(() => null)
  if (!gameRes?.ok) notFound()

  // Carga preguntas activas desde D1 vía Worker
  const qRes = await fetch(`${WORKER}/questions`).catch(() => null)
  const { questions = [] } = qRes?.ok ? await qRes.json() : {}

  const activeQuestions: Question[] = (questions as Question[]).filter((q) => q.is_active)

  return <HostPanel gameId={gameId} questions={activeQuestions} />
}
