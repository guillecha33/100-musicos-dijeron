import { GameRoom } from './GameRoom'
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from './handlers/questions'
import { createGame, getGameByCode, getGameById } from './handlers/games'
import type { Env } from './types'

export { GameRoom }

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Extensions',
}

function notFound() {
  return new Response(JSON.stringify({ error: 'Ruta no encontrada' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // ── /questions ──────────────────────────────────────────
    if (path === '/questions') {
      if (method === 'GET') return getQuestions(env)
      if (method === 'POST') return createQuestion(request, env)
    }

    const questionMatch = path.match(/^\/questions\/([^/]+)$/)
    if (questionMatch) {
      const [, id] = questionMatch
      if (method === 'PATCH') return updateQuestion(request, env, id)
      if (method === 'DELETE') return deleteQuestion(env, id)
    }

    // ── /games ──────────────────────────────────────────────
    if (path === '/games') {
      if (method === 'POST') return createGame(request, env)
      if (method === 'GET') return getGameByCode(url.searchParams, env)
    }

    const gameIdMatch = path.match(/^\/games\/([^/]+)$/)
    if (gameIdMatch) {
      const [, gameId] = gameIdMatch
      if (method === 'GET') return getGameById(gameId, env)
    }

    // ── /game/:gameId/...  (Durable Object — WS + HTTP) ─────
    const gameRoomMatch = path.match(/^\/game\/([^/]+)(\/.*)?$/)
    if (gameRoomMatch) {
      const [, gameId] = gameRoomMatch
      const id = env.GAME_ROOM.idFromName(gameId)
      const stub = env.GAME_ROOM.get(id)
      return stub.fetch(request)
    }

    return notFound()
  },
}
