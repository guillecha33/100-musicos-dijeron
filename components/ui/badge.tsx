import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-body transition-colors',
  {
    variants: {
      variant: {
        default: 'border-gold/30 bg-gold/10 text-gold',
        secondary: 'border-border bg-bg-elevated text-white/70',
        destructive: 'border-strike/30 bg-strike/10 text-strike',
        neon: 'border-neon-blue/30 bg-neon-blue/10 text-neon-blue',
        success: 'border-neon-green/30 bg-neon-green/10 text-neon-green',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
