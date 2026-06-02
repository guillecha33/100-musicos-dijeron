import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateGameCode } from '@/lib/game-utils'

export async function POST() {
  const supabase = await createClient()

  // Genera código único
  let code = generateGameCode()
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase.from('games').select('id').eq('code', code).maybeSingle()
    if (!data) break
    code = generateGameCode()
  }

  const { data: game, error } = await supabase
    .from('games')
    .insert({ code })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Inicializa el Durable Object con el gameId y roomCode
  const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL
  if (workerUrl) {
    try {
      await fetch(`${workerUrl}/game/${game.id}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, roomCode: game.code }),
      })
    } catch {
      // No bloqueamos la creación si el Worker no está disponible
      console.error('No se pudo inicializar el Durable Object')
    }
  }

  return NextResponse.json({ game }, { status: 201 })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: game, error } = await supabase
    .from('games')
    .select('id, code, created_at')
    .eq('code', code.toUpperCase())
    .maybeSingle()

  if (error || !game) {
    return NextResponse.json({ error: 'Partida no encontrada' }, { status: 404 })
  }

  return NextResponse.json({ game })
}
