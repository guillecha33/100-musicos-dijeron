import { notFound } from 'next/navigation'
import { ScreenClient } from './ScreenClient'

const WORKER = process.env.NEXT_PUBLIC_WORKER_URL ?? ''

interface PageProps {
  params: Promise<{ gameId: string }>
}

export default async function ScreenPage({ params }: PageProps) {
  const { gameId } = await params

  // Solo verifica que la partida existe en KV
  const res = await fetch(`${WORKER}/games/${gameId}`).catch(() => null)
  if (!res?.ok) notFound()

  return <ScreenClient gameId={gameId} />
}
