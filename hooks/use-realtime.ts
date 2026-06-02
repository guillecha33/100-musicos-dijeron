'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Game, Round, FastMoneySession } from '@/lib/types'

interface UseRealtimeGameOptions {
  gameId: string
  initialGame?: Game | null
  initialRound?: Round | null
  initialFastMoney?: FastMoneySession | null
}

export function useRealtimeGame({
  gameId,
  initialGame = null,
  initialRound = null,
  initialFastMoney = null,
}: UseRealtimeGameOptions) {
  const [game, setGame] = useState<Game | null>(initialGame)
  const [currentRound, setCurrentRound] = useState<Round | null>(initialRound)
  const [fastMoney, setFastMoney] = useState<FastMoneySession | null>(initialFastMoney)
  const [isConnected, setIsConnected] = useState(false)

  const fetchFullRound = useCallback(async (roundId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('rounds')
      .select('*, question:questions(*, answers(*))')
      .eq('id', roundId)
      .single()
    if (data) setCurrentRound(data as Round)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`game-room-${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        async (payload) => {
          const updated = payload.new as Game
          setGame(updated)
          if (updated.current_round_id) {
            await fetchFullRound(updated.current_round_id)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rounds', filter: `game_id=eq.${gameId}` },
        async (payload) => {
          if (payload.eventType === 'DELETE') return
          await fetchFullRound((payload.new as Round).id)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fast_money_sessions', filter: `game_id=eq.${gameId}` },
        (payload) => {
          if (payload.eventType !== 'DELETE') {
            setFastMoney(payload.new as FastMoneySession)
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, fetchFullRound])

  return { game, currentRound, fastMoney, isConnected }
}
