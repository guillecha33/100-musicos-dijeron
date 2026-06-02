import type { Env } from '../types'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: CORS })

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ── POST /games — crea una nueva partida ──────────────────────
export async function createGame(request: Request, env: Env): Promise<Response> {
  // Genera código único
  let code = generateCode()
  for (let i = 0; i < 5; i++) {
    const existing = await env.GAME_CODES.get(`code:${code}`)
    if (!existing) break
    code = generateCode()
  }

  const gameId = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  // KV: code → gameId  y  gameId → metadata
  await Promise.all([
    env.GAME_CODES.put(`code:${code}`, gameId, { expirationTtl: 60 * 60 * 24 * 7 }), // 7 días
    env.GAME_CODES.put(`game:${gameId}`, JSON.stringify({ code, createdAt }), {
      expirationTtl: 60 * 60 * 24 * 7,
    }),
  ])

  // Inicializa el Durable Object con gameId y roomCode
  const doId = env.GAME_ROOM.idFromName(gameId)
  const stub = env.GAME_ROOM.get(doId)
  await stub.fetch(new Request(`https://worker/game/${gameId}/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, roomCode: code }),
  }))

  return json({ game: { id: gameId, code, createdAt } }, 201)
}

// ── GET /games?code=XXXXXX — busca partida por código ─────────
export async function getGameByCode(searchParams: URLSearchParams, env: Env): Promise<Response> {
  const code = searchParams.get('code')?.toUpperCase()
  if (!code) return json({ error: 'Parámetro code requerido' }, 400)

  const gameId = await env.GAME_CODES.get(`code:${code}`)
  if (!gameId) return json({ error: 'Partida no encontrada' }, 404)

  const meta = await env.GAME_CODES.get(`game:${gameId}`)
  const { createdAt } = meta ? JSON.parse(meta) : {}

  return json({ game: { id: gameId, code, createdAt } })
}

// ── GET /games/:gameId — verifica que una partida existe ───────
export async function getGameById(gameId: string, env: Env): Promise<Response> {
  const meta = await env.GAME_CODES.get(`game:${gameId}`)
  if (!meta) return json({ error: 'Partida no encontrada' }, 404)

  const { code, createdAt } = JSON.parse(meta)
  return json({ game: { id: gameId, code, createdAt } })
}
