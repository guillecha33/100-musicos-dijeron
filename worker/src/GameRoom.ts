import type { DurableObjectState } from '@cloudflare/workers-types'
import type { ClientEvent, GameRoomState, ServerEvent } from './types'
import { applyEvent, createInitialState } from './gameLogic'

export interface Env {
  GAME_ROOM: DurableObjectNamespace
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Extensions',
}

export class GameRoom {
  private state: DurableObjectState
  private cachedGameState: GameRoomState | null = null

  constructor(state: DurableObjectState) {
    this.state = state
    // Carga el estado desde storage al iniciar (bloquea la concurrencia hasta terminar)
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<GameRoomState>('gameState')
      if (stored) this.cachedGameState = stored
    })
  }

  // ============================================================
  // HTTP + WebSocket entry point
  // ============================================================
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)

    // Upgrade a WebSocket
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocketUpgrade()
    }

    // POST /init — Next.js llama esto al crear una partida
    if (request.method === 'POST' && url.pathname.endsWith('/init')) {
      const data = await request.json<Partial<GameRoomState>>()
      const current = await this.loadState()
      const newState: GameRoomState = {
        ...current,
        gameId: data.gameId ?? current.gameId,
        roomCode: data.roomCode ?? current.roomCode,
      }
      await this.saveState(newState)
      return new Response(JSON.stringify(newState), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }

    // GET — estado actual via HTTP (debug / polling fallback)
    if (request.method === 'GET') {
      const current = await this.loadState()
      return new Response(JSON.stringify(current), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }

    return new Response('Not found', { status: 404, headers: CORS_HEADERS })
  }

  // ============================================================
  // WebSocket upgrade
  // ============================================================
  private handleWebSocketUpgrade(): Response {
    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)

    // Registra el WebSocket con la hibernatable API
    this.state.acceptWebSocket(server)

    // Envía estado actual al cliente que acaba de conectarse
    const current = this.cachedGameState ?? createInitialState()
    const count = this.state.getWebSockets().length
    const stateWithCount = { ...current, connectedClients: count }
    server.send(this.serialize({ type: 'SYNC_STATE', payload: stateWithCount }))

    return new Response(null, { status: 101, webSocket: client })
  }

  // ============================================================
  // Hibernatable WebSocket handlers
  // ============================================================
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string') return

    let event: ClientEvent
    try {
      event = JSON.parse(message) as ClientEvent
    } catch {
      ws.send(this.serialize({ type: 'ERROR', payload: { message: 'JSON inválido' } }))
      return
    }

    try {
      const current = await this.loadState()
      const next = applyEvent(current, event)
      const withCount: GameRoomState = {
        ...next,
        connectedClients: this.state.getWebSockets().length,
      }
      await this.saveState(withCount)
      this.broadcastAll({ type: 'SYNC_STATE', payload: withCount })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error interno'
      ws.send(this.serialize({ type: 'ERROR', payload: { message: msg } }))
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    _reason: string,
    _wasClean: boolean,
  ): Promise<void> {
    ws.close(code, 'closing')
    // Actualiza el conteo y notifica a los demás
    const count = this.state.getWebSockets().filter((s) => s !== ws).length
    this.broadcastAll({ type: 'CLIENT_COUNT', payload: { count } }, ws)
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    console.error('WebSocket error:', error)
    ws.close(1011, 'WebSocket error')
  }

  // ============================================================
  // Helpers
  // ============================================================
  private async loadState(): Promise<GameRoomState> {
    if (this.cachedGameState) return this.cachedGameState
    const stored = await this.state.storage.get<GameRoomState>('gameState')
    this.cachedGameState = stored ?? createInitialState()
    return this.cachedGameState
  }

  private async saveState(state: GameRoomState): Promise<void> {
    this.cachedGameState = state
    await this.state.storage.put('gameState', state)
  }

  private broadcastAll(event: ServerEvent, exclude?: WebSocket): void {
    const data = this.serialize(event)
    for (const ws of this.state.getWebSockets()) {
      if (ws === exclude) continue
      try {
        ws.send(data)
      } catch {
        // cliente desconectado, ignorar
      }
    }
  }

  private serialize(event: ServerEvent): string {
    return JSON.stringify(event)
  }
}
