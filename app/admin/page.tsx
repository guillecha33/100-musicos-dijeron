import { createClient } from '@/lib/supabase/server'
import { QuestionList } from '@/components/admin/QuestionList'
import type { Question, Answer } from '@/lib/types'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: questions, error } = await supabase
    .from('questions')
    .select('*, answers(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-strike">Error al cargar preguntas: {error.message}</p>
        <p className="font-body text-white/40 text-sm mt-2">Verifica la configuración de Supabase</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl text-gold tracking-wide">PREGUNTAS</h1>
        <p className="font-body text-white/40 text-sm mt-1">
          Gestiona el banco de preguntas del juego. Cada pregunta debe tener entre 4 y 8 respuestas con una suma de puntos máxima de 100.
        </p>
      </div>

      <QuestionList questions={(questions ?? []) as (Question & { answers: Answer[] })[]} />
    </div>
  )
}
