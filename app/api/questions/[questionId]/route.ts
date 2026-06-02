import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { QuestionFormData } from '@/lib/types'

interface Params {
  params: Promise<{ questionId: string }>
}

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

export async function PATCH(request: Request, { params }: Params) {
  const { questionId } = await params
  const supabase = await createClient()
  const data: QuestionFormData = await request.json()

  const validationError = validateQuestion(data)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const { error: qError } = await supabase
    .from('questions')
    .update({
      text: data.text.trim(),
      category: data.category?.trim() || 'General',
      is_active: data.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', questionId)

  if (qError) return NextResponse.json({ error: qError.message }, { status: 500 })

  // Delete old answers and re-insert
  await supabase.from('answers').delete().eq('question_id', questionId)

  const answersToInsert = data.answers.map((a, i) => ({
    question_id: questionId,
    text: a.text.trim(),
    points: a.points,
    position: i + 1,
  }))

  const { error: aError } = await supabase.from('answers').insert(answersToInsert)
  if (aError) return NextResponse.json({ error: aError.message }, { status: 500 })

  const { data: fullQuestion } = await supabase
    .from('questions')
    .select('*, answers(*)')
    .eq('id', questionId)
    .single()

  return NextResponse.json({ question: fullQuestion })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { questionId } = await params
  const supabase = await createClient()

  const { error } = await supabase.from('questions').delete().eq('id', questionId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
