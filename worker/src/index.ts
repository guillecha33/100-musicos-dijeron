import { GameRoom } from './GameRoom'

export { GameRoom }

export interface Env {
  GAME_ROOM: DurableObjectNamespace
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Extensions',
        },
      })
    }

    // Ruta: /game/:gameId  o  /game/:gameId/...
    const match = url.pathname.match(/^\/game\/([^/]+)(\/.*)?$/)
    if (!match) {
      return new Response(
        JSON.stringify({ error: 'Ruta no encontrada. Usa /game/:gameId/ws' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const gameId = match[1]

    // Obtiene (o crea) el Durable Object stub por nombre = gameId
    const id = env.GAME_ROOM.idFromName(gameId)
    const stub = env.GAME_ROOM.get(id)

    // Delega la request al Durable Object
    return stub.fetch(request)
  },
}
