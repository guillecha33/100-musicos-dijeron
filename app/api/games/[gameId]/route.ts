import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ gameId: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const { gameId } = await params
  const supabase = await createClient()

  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single()

  if (error || !game) {
    return NextResponse.json({ error: 'Partida no encontrada' }, { status: 404 })
  }

  let currentRound = null
  if (game.current_round_id) {
    const { data } = await supabase
      .from('rounds')
      .select('*, question:questions(*, answers(*))')
      .eq('id', game.current_round_id)
      .single()
    currentRound = data
  }

  return NextResponse.json({ game, currentRound })
}
