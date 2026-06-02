import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { FastMoneyAnswer } from '@/lib/types'

interface Params {
  params: Promise<{ gameId: string }>
}

export async function PATCH(request: Request, { params }: Params) {
  const { gameId } = await params
  const supabase = await createClient()
  const { player, answers }: { player: 1 | 2; answers: FastMoneyAnswer[] } = await request.json()

  // Get the active fast money session
  const { data: session, error: sError } = await supabase
    .from('fast_money_sessions')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (sError || !session) {
    return NextResponse.json({ error: 'No hay sesión de dinero rápido activa' }, { status: 404 })
  }

  const playerField = player === 1 ? 'player_one_answers' : 'player_two_answers'
  const newAnswers = answers.map((a) => ({
    answer_text: a.answer_text?.trim() ?? '',
    points: a.points ?? 0,
  }))

  // Calculate total from both players
  const p1Answers: FastMoneyAnswer[] = player === 1 ? newAnswers : (session.player_one_answers ?? [])
  const p2Answers: FastMoneyAnswer[] = player === 2 ? newAnswers : (session.player_two_answers ?? [])
  const p1Total = p1Answers.reduce((s, a) => s + (a.points ?? 0), 0)
  const p2Total = p2Answers.reduce((s, a) => s + (a.points ?? 0), 0)
  const totalScore = p1Total + p2Total

  // Determine next status
  const newStatus = player === 1 ? 'playing_two' : 'finished'

  const { error } = await supabase
    .from('fast_money_sessions')
    .update({
      [playerField]: newAnswers,
      total_score: totalScore,
      status: newStatus,
    })
    .eq('id', session.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, totalScore, status: newStatus })
}
