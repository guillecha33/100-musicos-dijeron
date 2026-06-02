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
}

export function AnswerRow({ position, text, points, isRevealed, multiplier, isLarge = false }: AnswerRowProps) {
  const finalPoints = points * multiplier

  return (
    <div
      className={cn(
        'relative flex items-center gap-0 rounded-md overflow-hidden border',
        isRevealed
          ? 'border-gold/40 bg-bg-surface'
          : 'border-border bg-bg-card',
        isLarge ? 'h-14 md:h-16' : 'h-11'
      )}
    >
      {/* Position number */}
      <div
        className={cn(
          'flex items-center justify-center font-display text-bg-primary shrink-0',
          isRevealed ? 'bg-gold' : 'bg-border',
          isLarge ? 'w-14 md:w-16 text-2xl' : 'w-11 text-xl'
        )}
        style={{ height: '100%' }}
      >
        {position}
      </div>

      {/* Answer text area */}
      <div className="flex-1 flex items-center px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {isRevealed ? (
            <motion.span
              key="revealed"
              initial={{ opacity: 0, x: -30, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className={cn(
                'font-body font-semibold text-white uppercase tracking-wide truncate',
                isLarge ? 'text-xl md:text-2xl' : 'text-sm'
              )}
            >
              {text}
            </motion.span>
          ) : (
            <motion.div
              key="hidden"
              className="flex gap-1.5 items-center"
            >
              {Array.from({ length: isLarge ? 8 : 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className={cn(
                    'rounded-sm bg-border/50',
                    isLarge ? 'h-4 w-8' : 'h-3 w-6'
                  )}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Points */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className={cn(
              'flex items-center justify-center shrink-0 font-display text-bg-primary',
              multiplier > 1 ? 'bg-neon-pink' : 'bg-gold',
              isLarge ? 'w-20 md:w-24 text-2xl md:text-3xl' : 'w-16 text-lg'
            )}
            style={{ height: '100%' }}
          >
            {finalPoints}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
