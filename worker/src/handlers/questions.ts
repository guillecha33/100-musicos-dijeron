import type { Env, Question, Answer } from '../types'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS })
}

function err(message: string, status = 400) {
  return json({ error: message }, status)
}

// ── Validación ────────────────────────────────────────────────
function validate(body: {
  text?: string
  category?: string
  answers?: { text: string; points: number }[]
}): string | null {
  if (!body.text?.trim()) return 'El texto de la pregunta es requerido'
  if (!body.answers || body.answers.length < 4 || body.answers.length > 8) return 'Se requieren entre 4 y 8 respuestas'
  if (body.answers.some((a) => !a.text?.trim())) return 'Todas las respuestas necesitan texto'
  if (body.answers.some((a) => !a.points || a.points <= 0)) return 'Los puntos deben ser mayores a 0'
  const total = body.answers.reduce((s, a) => s + a.points, 0)
  if (total > 100) return 'La suma de puntos no puede superar 100'
  return null
}

// ── GET /questions ────────────────────────────────────────────
export async function getQuestions(env: Env): Promise<Response> {
  const qs = await env.DB.prepare(
    'SELECT id, text, category, is_active FROM questions ORDER BY created_at DESC',
  ).all<{ id: string; text: string; category: string; is_active: number }>()

  if (!qs.results.length) return json({ questions: [] })

  const ids = qs.results.map((q) => `'${q.id}'`).join(',')
  const answers = await env.DB.prepare(
    `SELECT id, question_id, text, points, position FROM answers WHERE question_id IN (${ids}) ORDER BY position ASC`,
  ).all<Answer & { question_id: string }>()

  const answersByQuestion = answers.results.reduce<Record<string, Answer[]>>((acc, a) => {
    if (!acc[a.question_id]) acc[a.question_id] = []
    acc[a.question_id].push({ id: a.id, text: a.text, points: a.points, position: a.position })
    return acc
  }, {})

  const questions: Question[] = qs.results.map((q) => ({
    id: q.id,
    text: q.text,
    category: q.category,
    is_active: q.is_active === 1,
    answers: answersByQuestion[q.id] ?? [],
  }))

  return json({ questions })
}

// ── POST /questions ───────────────────────────────────────────
export async function createQuestion(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{
    text: string
    category?: string
    is_active?: boolean
    answers: { text: string; points: number }[]
  }>()

  const validErr = validate(body)
  if (validErr) return err(validErr)

  const qId = crypto.randomUUID()
  await env.DB.prepare(
    'INSERT INTO questions (id, text, category, is_active) VALUES (?, ?, ?, ?)',
  )
    .bind(qId, body.text.trim(), body.category?.trim() || 'General', body.is_active !== false ? 1 : 0)
    .run()

  const stmts = body.answers.map((a, i) =>
    env.DB.prepare(
      'INSERT INTO answers (id, question_id, text, points, position) VALUES (?, ?, ?, ?, ?)',
    ).bind(crypto.randomUUID(), qId, a.text.trim(), a.points, i + 1),
  )
  await env.DB.batch(stmts)

  const question = await getQuestionById(env, qId)
  return json({ question }, 201)
}

// ── PATCH /questions/:id ──────────────────────────────────────
export async function updateQuestion(request: Request, env: Env, id: string): Promise<Response> {
  const body = await request.json<{
    text: string
    category?: string
    is_active?: boolean
    answers: { text: string; points: number }[]
  }>()

  const validErr = validate(body)
  if (validErr) return err(validErr)

  await env.DB.prepare(
    'UPDATE questions SET text = ?, category = ?, is_active = ?, updated_at = ? WHERE id = ?',
  )
    .bind(body.text.trim(), body.category?.trim() || 'General', body.is_active !== false ? 1 : 0, new Date().toISOString(), id)
    .run()

  // Reemplaza respuestas
  await env.DB.prepare('DELETE FROM answers WHERE question_id = ?').bind(id).run()

  const stmts = body.answers.map((a, i) =>
    env.DB.prepare(
      'INSERT INTO answers (id, question_id, text, points, position) VALUES (?, ?, ?, ?, ?)',
    ).bind(crypto.randomUUID(), id, a.text.trim(), a.points, i + 1),
  )
  await env.DB.batch(stmts)

  const question = await getQuestionById(env, id)
  return json({ question })
}

// ── DELETE /questions/:id ─────────────────────────────────────
export async function deleteQuestion(env: Env, id: string): Promise<Response> {
  await env.DB.prepare('DELETE FROM questions WHERE id = ?').bind(id).run()
  return json({ success: true })
}

// ── Helper ────────────────────────────────────────────────────
async function getQuestionById(env: Env, id: string): Promise<Question | null> {
  const q = await env.DB.prepare('SELECT * FROM questions WHERE id = ?')
    .bind(id)
    .first<{ id: string; text: string; category: string; is_active: number }>()
  if (!q) return null

  const answers = await env.DB.prepare(
    'SELECT id, text, points, position FROM answers WHERE question_id = ? ORDER BY position ASC',
  )
    .bind(id)
    .all<Answer>()

  return {
    id: q.id,
    text: q.text,
    category: q.category,
    is_active: q.is_active === 1,
    answers: answers.results,
  }
}
