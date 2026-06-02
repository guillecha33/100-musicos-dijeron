'use client'

import { useState, useCallback } from 'react'
import type { GameAction } from '@/lib/types'

export function useGameActions(gameId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dispatch = useCallback(async (action: GameAction) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/games/${gameId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al ejecutar la acción')
        return { success: false, error: data.error }
      }
      return { success: true, data }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error de red'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [gameId])

  return { dispatch, loading, error }
}
