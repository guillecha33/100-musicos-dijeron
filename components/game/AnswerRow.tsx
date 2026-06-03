'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnswerRowProps {
  position: number
  text: string
  points: number
  isRevealed: boolean
  multiplier: 1 | 2 | 3
  isLarge?: boolean
  hostView?: boolean
}

export function AnswerRow({ position, text, points, isRevealed, multiplier, isLarge = false, hostView = false }: AnswerRowProps) {
  const finalPoints = points * multiplier
  const showContent = isRevealed || hostView

  return (
    <div
      className={cn(
        'relative flex items-center gap-0 rounded-md overflow-hidden border',
        isRevealed
          ? 'border-gold/40 bg-bg-surface'
          : hostView
            ? 'border-border/60 bg-bg-card/60'
            : 'border-border bg-bg-card',
        isLarge ? 'h-14 md:h-16' : 'h-11'
      )}
    >
      {/* Position number */}
      <div
        className={cn(
          'flex items-center justify-center font-display shrink-0',
          isRevealed
            ? 'bg-gold text-bg-primary'
            : hostView
              ? 'bg-border/50 text-white/40'
              : 'bg-border text-bg-primary',
          isLarge ? 'w-14 md:w-16 text-2xl' : 'w-11 text-xl'
        )}
        style={{ height: '100%' }}
      >
        {position}
      </div>

      {/* Answer text area */}
      <div className="flex-1 flex items-center px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {showContent ? (
            <motion.span
              key="revealed"
              initial={isRevealed && !hostView ? { opacity: 0, x: -30, filter: 'blur(8px)' } : false}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className={cn(
                'font-body font-semibold uppercase tracking-wide truncate',
                isRevealed ? 'text-white' : 'text-white/50',
                isLarge ? 'text-xl md:text-2xl' : 'text-sm'
              )}
            >
              {text}
            </motion.span>
          ) : (
            <motion.div key="hidden" className="flex gap-1.5 items-center">
              {Array.from({ length: isLarge ? 8 : 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className={cn('rounded-sm bg-border/50', isLarge ? 'h-4 w-8' : 'h-3 w-6')}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Points */}
      <div
        className={cn(
          'flex items-center justify-center shrink-0 font-display',
          isRevealed
            ? cn('text-bg-primary', multiplier > 1 ? 'bg-neon-pink' : 'bg-gold')
            : hostView
              ? 'text-white/40 bg-border/30'
              : 'hidden',
          isLarge ? 'w-20 md:w-24 text-2xl md:text-3xl' : 'w-16 text-lg'
        )}
        style={{ height: '100%' }}
      >
        {showContent ? finalPoints : null}
      </div>
    </div>
  )
}
