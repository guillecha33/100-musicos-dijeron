'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QuestionForm } from './QuestionForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Edit2, Trash2, Plus, Search, ChevronDown, ChevronUp, Music } from 'lucide-react'
import type { Question, Answer } from '@/lib/game-events'
import type { QuestionFormData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface QuestionListProps {
  questions: Question[]
  workerUrl: string
}

export function QuestionList({ questions: initialQuestions, workerUrl }: QuestionListProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = questions.filter(
    (q) =>
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      q.category.toLowerCase().includes(search.toLowerCase()),
  )

  const handleCreate = async (data: QuestionFormData) => {
    const res = await fetch(`${workerUrl}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al crear pregunta')
    const { question } = await res.json()
    setQuestions((prev) => [question, ...prev])
    setShowForm(false)
  }

  const handleUpdate = async (id: string, data: QuestionFormData) => {
    const res = await fetch(`${workerUrl}/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al actualizar pregunta')
    const { question } = await res.json()
    setQuestions((prev) => prev.map((q) => (q.id === id ? question : q)))
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (deletingId !== id) {
      setDeletingId(id)
      setTimeout(() => setDeletingId(null), 3000)
      return
    }
    await fetch(`${workerUrl}/questions/${id}`, { method: 'DELETE' })
    setQuestions((prev) => prev.filter((q) => q.id !== id))
    setDeletingId(null)
  }

  const handleToggleActive = async (q: Question) => {
    const res = await fetch(`${workerUrl}/questions/${q.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: q.text, category: q.category, is_active: !q.is_active, answers: q.answers }),
    })
    if (!res.ok) return
    const { question } = await res.json()
    setQuestions((prev) => prev.map((existing) => (existing.id === q.id ? question : existing)))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input placeholder="Buscar preguntas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="gold" size="sm" onClick={() => setShowForm(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Nueva pregunta
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-sm font-body">
        <span className="text-white/40">{questions.length} totales</span>
        <span className="text-neon-green">{questions.filter((q) => q.is_active).length} activas</span>
        <span className="text-white/30">{questions.filter((q) => !q.is_active).length} inactivas</span>
      </div>

      {/* Formulario nueva pregunta */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="rounded-lg border border-gold/30 bg-gold/5 p-4 overflow-hidden">
            <h3 className="font-display text-gold text-lg mb-4">Nueva Pregunta</h3>
            <QuestionForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="font-body text-white/30">No se encontraron preguntas</p>
          </div>
        )}

        <AnimatePresence>
          {filtered.map((question) => (
            <motion.div key={question.id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className={cn('rounded-lg border bg-bg-card overflow-hidden transition-colors duration-200', question.is_active ? 'border-border' : 'border-border/30 opacity-60')}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => handleToggleActive(question)}
                  className={cn('w-3 h-3 rounded-full border-2 shrink-0 transition-colors', question.is_active ? 'bg-neon-green border-neon-green' : 'bg-transparent border-border')}
                  title={question.is_active ? 'Desactivar' : 'Activar'}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-white truncate">{question.text}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-xs">{question.category}</Badge>
                    <span className="font-body text-xs text-white/30">{question.answers.length} respuestas</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setExpandedId(expandedId === question.id ? null : question.id)}>
                    {expandedId === question.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(question.id)}>
                    <Edit2 className="w-3.5 h-3.5 text-gold/60 hover:text-gold" />
                  </Button>
                  <Button size="icon" variant={deletingId === question.id ? 'destructive' : 'ghost'} className="h-7 w-7" onClick={() => handleDelete(question.id)} title={deletingId === question.id ? '¿Confirmar?' : 'Eliminar'}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === question.id && editingId !== question.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/30 px-4 py-3 bg-bg-surface/50">
                    <div className="flex flex-col gap-1.5">
                      {question.answers.sort((a, b) => a.position - b.position).map((answer) => (
                        <div key={answer.id} className="flex items-center gap-3 text-sm">
                          <span className="w-5 h-5 flex items-center justify-center rounded bg-bg-elevated border border-border font-display text-xs text-white/40 shrink-0">{answer.position}</span>
                          <span className="flex-1 font-body text-white/70">{answer.text}</span>
                          <span className="font-display text-gold text-sm shrink-0">{answer.points}</span>
                        </div>
                      ))}
                      <div className="flex justify-between mt-1 pt-1 border-t border-border/20">
                        <span className="font-body text-xs text-white/30">Total</span>
                        <span className="font-display text-xs text-white/50">{question.answers.reduce((s, a) => s + a.points, 0)} pts</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {editingId === question.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gold/30 bg-gold/5 px-4 py-4">
                    <QuestionForm
                      question={{ ...question, answers: question.answers as Answer[] }}
                      onSubmit={(data) => handleUpdate(question.id, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
