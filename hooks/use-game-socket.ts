'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import type { GameRoomState, ClientEvent, ServerEvent } from '@/lib/game-events'

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL ?? ''

function getWsUrl(gameId: string): string {
  return (
    WORKER_URL.replace(/^https?:\/\//, (p) =>
      p.startsWith('https') ? 'wss://' : 'ws://',
    ) + `/game/${gameId}/ws`
  )
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export function useGameSocket(gameId: string) {
  const [gameState, setGameState] = useState<GameRoomState | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  const connect = useCallback(() => {
    if (!mountedRef.current || !WORKER_URL) return

    const url = getWsUrl(gameId)
    const ws = new WebSocket(url)
    wsRef.current = ws
    setStatus('connecting')

    ws.onopen = () => {
      if (!mountedRef.current) return
      retryCountRef.current = 0
      setStatus('connected')
      // Notifica al servidor que nos unimos
      ws.send(JSON.stringify({ type: 'JOIN_GAME' } satisfies ClientEvent))
    }

    ws.onmessage = (event) => {
      if (!mountedRef.current) return
      try {
        const msg: ServerEvent = JSON.parse(event.data as string)
        if (msg.type === 'SYNC_STATE') {
          setGameState(msg.payload)
        }
        // CLIENT_COUNT y ERROR se ignoran silenciosamente en el cliente
      } catch {
        // JSON malformado — ignorar
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setStatus('disconnected')
      wsRef.current = null
      // Backoff exponencial: 1s, 2s, 4s, 8s, máx 30s
      const delay = Math.min(1000 * 2 ** retryCountRef.current, 30_000)
      retryCountRef.current += 1
      retryRef.current = setTimeout(connect, delay)
    }

    ws.onerror = () => {
      setStatus('error')
      ws.close()
    }
  }, [gameId])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      if (retryRef.current) clearTimeout(retryRef.current)
      wsRef.current?.close(1000, 'Component unmounted')
    }
  }, [connect])

  const send = useCallback((event: ClientEvent) => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event))
    }
  }, [])

  const isConnected = status === 'connected'

  return { gameState, status, isConnected, send }
}
