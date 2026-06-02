import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium font-body transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gold text-bg-primary hover:bg-gold-light shadow-gold-sm font-bold',
        destructive: 'bg-strike text-white hover:bg-red-600 shadow-strike',
        outline: 'border border-border text-white hover:border-gold hover:text-gold bg-transparent',
        secondary: 'bg-bg-elevated border border-border text-white hover:border-gold-dark',
        ghost: 'hover:bg-bg-elevated text-white',
        neon: 'bg-neon-blue/10 border border-neon-blue text-neon-blue hover:bg-neon-blue/20',
        gold: 'bg-gold text-bg-primary font-bold hover:bg-gold-light shadow-gold',
        team1: 'bg-team-one/20 border border-team-one text-team-one hover:bg-team-one/30',
        team2: 'bg-team-two/20 border border-team-two text-team-two hover:bg-team-two/30',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-md px-8 text-base',
        xl: 'h-14 rounded-md px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
