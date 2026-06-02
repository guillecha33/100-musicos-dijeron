'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, GripVertical, Save, X } from 'lucide-react'
import type { Question, Answer, QuestionFormData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface QuestionFormProps {
  question?: Question & { answers: Answer[] }
  onSubmit: (data: QuestionFormData) => Promise<void>
  onCancel: () => void
}

interface AnswerField {
  id: string
  text: string
  points: number
  position: number
}

export function QuestionForm({ question, onSubmit, onCancel }: QuestionFormProps) {
  const [text, setText] = useState(question?.text ?? '')
  const [category, setCategory] = useState(question?.category ?? 'General')
  const [isActive, setIsActive] = useState(question?.is_active ?? true)
  const [answers, setAnswers] = useState<AnswerField[]>(
    question?.answers.length
      ? question.answers
          .sort((a, b) => a.position - b.position)
          .map((a) => ({ id: a.id, text: a.text, points: a.points, position: a.position }))
      : [
          { id: '1', text: '', points: 0, position: 1 },
          { id: '2', text: '', points: 0, position: 2 },
          { id: '3', text: '', points: 0, position: 3 },
          { id: '4', text: '', points: 0, position: 4 },
        ]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPoints = answers.reduce((s, a) => s + (a.points || 0), 0)

  const addAnswer = () => {
    if (answers.length >= 8) return
    setAnswers((prev) => [
      ...prev,
      { id: Date.now().toString(), text: '', points: 0, position: prev.length + 1 },
    ])
  }

  const removeAnswer = (id: string) => {
    if (answers.length <= 4) return
    setAnswers((prev) =>
      prev
        .filter((a) => a.id !== id)
        .map((a, i) => ({ ...a, position: i + 1 }))
    )
  }

  const updateAnswer = (id: string, field: keyof AnswerField, value: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, [field]: field === 'points' ? Math.max(0, parseInt(value) || 0) : value }
          : a
      )
    )
  }

  const validate = (): string | null => {
    if (!text.trim()) return 'El texto de la pregunta es requerido'
    if (answers.length < 4) return 'Mínimo 4 respuestas'
    if (answers.length > 8) return 'Máximo 8 respuestas'
    if (answers.some((a) => !a.text.trim())) return 'Todas las respuestas deben tener texto'
    if (answers.some((a) => a.points <= 0)) return 'Todos los puntos deben ser mayores a 0'
    if (totalPoints > 100) return 'La suma de puntos no debe superar 100'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setLoading(true)
    setError(null)
    try {
      await onSubmit({
        text: text.trim(),
        category: category.trim() || 'General',
        is_active: isActive,
        answers: answers.map((a, i) => ({
          text: a.text.trim(),
          points: a.points,
          position: i + 1,
        })),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const CATEGORIES = ['General', 'Instrumentos', 'Géneros', 'Conciertos', 'Artistas', 'Historia', 'Cultura']

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Question text */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="text">Pregunta *</Label>
        <Textarea
          id="text"
          placeholder="Menciona algo que no puede faltar en un concierto..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="text-sm resize-none"
          rows={3}
        />
      </div>

      {/* Category + Active */}
      <div className="flex gap-4 items-start">
        <div className="flex flex-col gap-2 flex-1">
          <Label htmlFor="category">Categoría</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-surface px-3 py-2 text-sm font-body text-white focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <Label>Activa</Label>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>

      {/* Answers */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Respuestas ({answers.length}/8)</Label>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-body text-xs',
                totalPoints > 100 ? 'text-strike' : totalPoints === 100 ? 'text-neon-green' : 'text-white/40'
              )}
            >
              Total: {totalPoints}/100 pts
            </span>
          </div>
        </div>

        <AnimatePresence>
          {answers.map((answer, i) => (
            <motion.div
              key={answer.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 items-center"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded bg-bg-elevated border border-border font-display text-sm text-white/40 shrink-0">
                {i + 1}
              </div>
              <Input
                placeholder={`Respuesta ${i + 1}...`}
                value={answer.text}
                onChange={(e) => updateAnswer(answer.id, 'text', e.target.value)}
                className="flex-1 h-9 text-sm"
              />
              <div className="flex items-center gap-1 shrink-0">
                <Input
                  type="number"
                  placeholder="pts"
                  value={answer.points || ''}
                  onChange={(e) => updateAnswer(answer.id, 'points', e.target.value)}
                  className="w-16 h-9 text-sm text-center"
                  min={1}
                  max={100}
                />
                <button
                  type="button"
                  onClick={() => removeAnswer(answer.id)}
                  disabled={answers.length <= 4}
                  className="p-1.5 rounded text-white/30 hover:text-strike disabled:opacity-20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {answers.length < 8 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAnswer}
            className="gap-2 self-start"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar respuesta
          </Button>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm font-body text-strike bg-strike/10 rounded-md px-3 py-2 border border-strike/30"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          <X className="w-4 h-4" />
          Cancelar
        </Button>
        <Button type="submit" variant="gold" disabled={loading} className="flex-1 gap-2">
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : question ? 'Actualizar pregunta' : 'Crear pregunta'}
        </Button>
      </div>
    </form>
  )
}
