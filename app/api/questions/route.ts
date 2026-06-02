import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { QuestionFormData } from '@/lib/types'

function validateQuestion(data: QuestionFormData): string | null {
  if (!data.text?.trim()) return 'El texto de la pregunta es requerido'
  if (!data.answers || data.answers.length < 4) return 'Mínimo 4 respuestas'
  if (data.answers.length > 8) return 'Máximo 8 respuestas'
  if (data.answers.some((a) => !a.text?.trim())) return 'Todas las respuestas deben tener texto'
  if (data.answers.some((a) => !a.points || a.points <= 0)) return 'Los puntos deben ser mayores a 0'
  const total = data.answers.reduce((s, a) => s + a.points, 0)
  if (total > 100) return 'La suma de puntos no debe superar 100'
  return null
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select('*, answers(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ questions: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const data: QuestionFormData = await request.json()

  const validationError = validateQuestion(data)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const { data: question, error: qError } = await supabase
    .from('questions')
    .insert({
      text: data.text.trim(),
      category: data.category?.trim() || 'General',
      is_active: data.is_active ?? true,
    })
    .select()
    .single()

  if (qError) return NextResponse.json({ error: qError.message }, { status: 500 })

  const answersToInsert = data.answers.map((a, i) => ({
    question_id: question.id,
    text: a.text.trim(),
    points: a.points,
    position: i + 1,
  }))

  const { error: aError } = await supabase.from('answers').insert(answersToInsert)
  if (aError) {
    // Rollback question
    await supabase.from('questions').delete().eq('id', question.id)
    return NextResponse.json({ error: aError.message }, { status: 500 })
  }

  // Return with answers
  const { data: fullQuestion } = await supabase
    .from('questions')
    .select('*, answers(*)')
    .eq('id', question.id)
    .single()

  return NextResponse.json({ question: fullQuestion }, { status: 201 })
}
