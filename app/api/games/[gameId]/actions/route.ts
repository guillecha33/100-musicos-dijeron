import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { GameAction, ActiveTeam } from '@/lib/types'

interface Params {
  params: Promise<{ gameId: string }>
}

export async function POST(request: Request, { params }: Params) {
  const { gameId } = await params
  const supabase = await createClient()
  const action = (await request.json()) as GameAction

  // Fetch current game state
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single()

  if (gameError || !game) {
    return NextResponse.json({ error: 'Partida no encontrada' }, { status: 404 })
  }

  // Fetch current round if it exists
  let currentRound = null
  if (game.current_round_id) {
    const { data } = await supabase
      .from('rounds')
      .select('*, question:questions(*, answers(*))')
      .eq('id', game.current_round_id)
      .single()
    currentRound = data
  }

  try {
    switch (action.type) {
      case 'start_round': {
        // Finish previous round if any
        if (currentRound && currentRound.status !== 'finished') {
          await supabase
            .from('rounds')
            .update({ status: 'finished', updated_at: new Date().toISOString() })
            .eq('id', currentRound.id)
        }

        const { data: newRound, error } = await supabase
          .from('rounds')
          .insert({
            game_id: gameId,
            question_id: action.questionId,
            multiplier: action.multiplier ?? 1,
            status: 'face_off',
            controlling_team: null,
            revealed_answer_ids: [],
            round_points: 0,
            winner_team: null,
          })
          .select()
          .single()

        if (error) throw error

        await supabase
          .from('games')
          .update({
            current_round_id: newRound.id,
            strikes: 0,
            active_team: null,
            status: 'playing',
            updated_at: new Date().toISOString(),
          })
          .eq('id', gameId)

        return NextResponse.json({ success: true, round: newRound })
      }

      case 'reveal_answer': {
        if (!currentRound) return NextResponse.json({ error: 'No hay ronda activa' }, { status: 400 })

        const revealedIds: string[] = currentRound.revealed_answer_ids ?? []
        if (revealedIds.includes(action.answerId)) {
          return NextResponse.json({ error: 'Respuesta ya revelada' }, { status: 400 })
        }

        // Get the answer points
        const answer = currentRound.question?.answers?.find((a: { id: string }) => a.id === action.answerId)
        const points = answer?.points ?? 0
        const newRevealedIds = [...revealedIds, action.answerId]
        const newRoundPoints = currentRound.round_points + points

        const { error } = await supabase
          .from('rounds')
          .update({
            revealed_answer_ids: newRevealedIds,
            round_points: newRoundPoints,
            status: currentRound.status === 'face_off' ? 'playing' : currentRound.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentRound.id)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'add_strike': {
        if (!currentRound) return NextResponse.json({ error: 'No hay ronda activa' }, { status: 400 })
        const newStrikes = Math.min(3, game.strikes + 1)

        await supabase
          .from('games')
          .update({ strikes: newStrikes, updated_at: new Date().toISOString() })
          .eq('id', gameId)

        // Auto-activate steal if 3 strikes reached
        if (newStrikes >= 3 && currentRound.status === 'playing') {
          await supabase
            .from('rounds')
            .update({ status: 'steal', updated_at: new Date().toISOString() })
            .eq('id', currentRound.id)
        }

        return NextResponse.json({ success: true, strikes: newStrikes })
      }

      case 'remove_strike': {
        const newStrikes = Math.max(0, game.strikes - 1)
        await supabase
          .from('games')
          .update({ strikes: newStrikes, updated_at: new Date().toISOString() })
          .eq('id', gameId)

        // If we had auto-activated steal, go back to playing
        if (currentRound?.status === 'steal') {
          await supabase
            .from('rounds')
            .update({ status: 'playing', updated_at: new Date().toISOString() })
            .eq('id', currentRound.id)
        }
        return NextResponse.json({ success: true })
      }

      case 'give_control': {
        const { team } = action
        await supabase
          .from('games')
          .update({ active_team: team, updated_at: new Date().toISOString() })
          .eq('id', gameId)

        if (currentRound) {
          await supabase
            .from('rounds')
            .update({
              controlling_team: team,
              status: 'playing',
              updated_at: new Date().toISOString(),
            })
            .eq('id', currentRound.id)
        }
        return NextResponse.json({ success: true })
      }

      case 'activate_steal': {
        if (!currentRound) return NextResponse.json({ error: 'No hay ronda activa' }, { status: 400 })

        // Switch active team
        const stealTeam: ActiveTeam = game.active_team === 'team_one' ? 'team_two' : 'team_one'

        await supabase
          .from('rounds')
          .update({ status: 'steal', controlling_team: stealTeam, updated_at: new Date().toISOString() })
          .eq('id', currentRound.id)

        await supabase
          .from('games')
          .update({ active_team: stealTeam, updated_at: new Date().toISOString() })
          .eq('id', gameId)

        return NextResponse.json({ success: true })
      }

      case 'award_points': {
        if (!currentRound) return NextResponse.json({ error: 'No hay ronda activa' }, { status: 400 })

        const { team } = action
        const pointsToAward = currentRound.round_points * (currentRound.multiplier ?? 1)
        const scoreField = team === 'team_one' ? 'team_one_score' : 'team_two_score'
        const currentScore = team === 'team_one' ? game.team_one_score : game.team_two_score
        const newScore = currentScore + pointsToAward

        // Finish round
        await supabase
          .from('rounds')
          .update({
            status: 'finished',
            winner_team: team,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentRound.id)

        // Check if game is over (300+ points)
        const newStatus = newScore >= 300 ? 'finished' : game.status

        await supabase
          .from('games')
          .update({
            [scoreField]: newScore,
            strikes: 0,
            active_team: null,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', gameId)

        return NextResponse.json({ success: true, pointsAwarded: pointsToAward, newScore })
      }

      case 'next_round': {
        if (currentRound && currentRound.status !== 'finished') {
          await supabase
            .from('rounds')
            .update({ status: 'finished', updated_at: new Date().toISOString() })
            .eq('id', currentRound.id)
        }

        await supabase
          .from('games')
          .update({
            current_round_id: null,
            strikes: 0,
            active_team: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', gameId)

        return NextResponse.json({ success: true })
      }

      case 'rename_team': {
        const { team, name } = action
        const field = team === 'team_one' ? 'team_one_name' : 'team_two_name'

        await supabase
          .from('games')
          .update({ [field]: name, updated_at: new Date().toISOString() })
          .eq('id', gameId)

        return NextResponse.json({ success: true })
      }

      case 'toggle_sound': {
        await supabase
          .from('games')
          .update({ sound_enabled: !game.sound_enabled, updated_at: new Date().toISOString() })
          .eq('id', gameId)

        return NextResponse.json({ success: true })
      }

      case 'start_fast_money': {
        // Create fast money session
        const { data: session, error } = await supabase
          .from('fast_money_sessions')
          .insert({
            game_id: gameId,
            player_one_answers: [],
            player_two_answers: [],
            total_score: 0,
            status: 'playing_one',
            time_limit_one: 20,
            time_limit_two: 25,
          })
          .select()
          .single()

        if (error) throw error

        await supabase
          .from('games')
          .update({ status: 'fast_money', updated_at: new Date().toISOString() })
          .eq('id', gameId)

        return NextResponse.json({ success: true, session })
      }

      case 'reset_game': {
        // Finish all rounds for this game
        await supabase
          .from('rounds')
          .update({ status: 'finished' })
          .eq('game_id', gameId)

        // Delete fast money sessions
        await supabase
          .from('fast_money_sessions')
          .delete()
          .eq('game_id', gameId)

        // Reset game
        await supabase
          .from('games')
          .update({
            status: 'lobby',
            current_round_id: null,
            team_one_score: 0,
            team_two_score: 0,
            strikes: 0,
            active_team: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', gameId)

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
