import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 border-brutal-thin px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors sm:text-[11px] focus:outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink",
  {
    variants: {
      variant: {
        default: "bg-accent text-on-accent",
        secondary: "bg-surface text-ink",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "bg-canvas text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
