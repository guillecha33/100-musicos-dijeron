'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StrikeDisplayProps {
  strikes: number
  maxStrikes?: number
  size?: 'sm' | 'lg'
}

export function StrikeDisplay({ strikes, maxStrikes = 3, size = 'lg' }: StrikeDisplayProps) {
  return (
    <div className="flex items-center gap-3 justify-center">
      {Array.from({ length: maxStrikes }).map((_, i) => (
        <StrikeMark key={i} active={i < strikes} size={size} index={i} />
      ))}
    </div>
  )
}

function StrikeMark({ active, size, index }: { active: boolean; size: 'sm' | 'lg'; index: number }) {
  const isLg = size === 'lg'

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded border-2',
        active ? 'border-strike bg-strike/10' : 'border-border/40 bg-bg-card/50',
        isLg ? 'w-16 h-16 md:w-20 md:h-20' : 'w-10 h-10'
      )}
    >
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.2, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0px rgba(255,23,68,0)',
                  '0 0 30px rgba(255,23,68,0.8)',
                  '0 0 10px rgba(255,23,68,0.4)',
                ],
              }}
              transition={{ duration: 0.5, times: [0, 0.3, 1] }}
              className="absolute inset-0 rounded"
            />
            <span
              className={cn(
                'font-display text-strike relative z-10 leading-none',
                isLg ? 'text-5xl md:text-6xl' : 'text-3xl'
              )}
              style={{ textShadow: '0 0 20px rgba(255,23,68,0.8)' }}
            >
              X
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {!active && (
        <span
          className={cn(
            'font-display text-border/30 leading-none',
            isLg ? 'text-4xl md:text-5xl' : 'text-2xl'
          )}
        >
          X
        </span>
      )}
    </div>
  )
}
