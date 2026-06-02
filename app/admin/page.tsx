import { QuestionList } from '@/components/admin/QuestionList'
import type { Question } from '@/lib/game-events'

const WORKER = process.env.NEXT_PUBLIC_WORKER_URL ?? ''

export default async function AdminPage() {
  let questions: Question[] = []

  try {
    const res = await fetch(`${WORKER}/questions`)
    if (res.ok) {
      const data = await res.json()
      questions = data.questions ?? []
    }
  } catch {
    // Worker no disponible — muestra lista vacía
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl text-gold tracking-wide">PREGUNTAS</h1>
        <p className="font-body text-white/40 text-sm mt-1">
          Gestiona el banco de preguntas. Entre 4 y 8 respuestas, suma máxima de 100 puntos.
        </p>
      </div>
      <QuestionList questions={questions} workerUrl={WORKER} />
    </div>
  )
}
